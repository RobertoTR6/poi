
import os
import sys
import logging
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# Add script directory to path to allow relative imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from normativa.scrapers.el_peruano import ElPeruanoScraper
from normativa.scrapers.gob_pe import GobPeScraper
from normativa.utils.clasificador import clasificar_normativa

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("NormativaScraper")

# Load Environment Variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local'))

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role Key for writing

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.warning("⚠️  Supabase credentials not found. Running in DRY RUN mode.")
    # sys.exit(1)

# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase: {e}")

def save_to_supabase(data: list[dict]):
    if not supabase:
        logger.info("⚠️  DRY RUN MODE: Supabase not configured. Skipping DB save.")
        logger.info(f"🔎  Found {len(data)} records. Printing firs 3:")
        for i, item in enumerate(data[:3]):
             logger.info(f"   [{i+1}] {item.get('Normas Legales', 'N/A')} - {item.get('Link Acceso', '#')}")
        return

    count_new = 0
    for item in data:
        try:
            # Check for duplicates (Simple check by Link or Title+Entity)
            # Efficient way: Hash or Composite Key. For now, we query. 
            # In a high-volume scenario, we'd fetch all hashes first.
            
            # Cleaning data
            link = item.get('Link Acceso', '#')
            norma = item.get('Normas Legales', 'N/A')
            entidad = item.get('Entidad', 'N/A')
            
            # Simple interaction - optimization: upsert if unique constraint exists
            # We will use select to check existence to avoid constraint violations if not set
            
            existing = supabase.table('normativas').select('id').eq('link_acceso', link).execute()
            
            if existing.data:
                continue

            # Classify
            categoria = clasificar_normativa(norma, item.get('Descripción', ''))
            
            # Determine Tipo Norma (Simple Heuristic)
            tipo = 'Otro'
            norma_lower = norma.lower()
            if 'decreto' in norma_lower: tipo = 'Decreto'
            elif 'ley' in norma_lower: tipo = 'Ley'
            elif 'resolución' in norma_lower: tipo = 'Resolución'

            # Parse Date
            fecha_pub = None
            date_str = item.get('Fecha Publicación')
            if date_str and date_str != 'N/A':
                try:
                    fecha_pub = datetime.strptime(date_str, '%d-%m-%Y').strftime('%Y-%m-%d')
                except ValueError:
                    pass

            db_record = {
                'entidad': entidad,
                'norma_legal': norma,
                'descripcion': item.get('Descripción', 'N/A'),
                'fecha_publicacion': fecha_pub,
                'link_acceso': link,
                'tipo_norma': tipo,
                'area_tematica': 'General',
                'categoria': categoria,
                'categoria_antiguedad': 'Reciente',
                'fecha_registro': datetime.now().isoformat()
            }
            
            supabase.table('normativas').insert(db_record).execute()
            count_new += 1
            
        except Exception as e:
            logger.error(f"Error saving item {item}: {e}")
            continue

    logger.info(f"[SUCCESS] Saved {count_new} new records.")

def main():
    logger.info("[START] Starting Normativa Scraping Job...")
    
    # Calculate date range (e.g., last 7 days)
    today = datetime.now()
    fecha_ini = (today - timedelta(days=7)).strftime("%Y-%m-%d")
    
    scrapers = [ElPeruanoScraper(), GobPeScraper()]
    
    all_data = []
    for scraper in scrapers:
        try:
            logger.info(f"Running {scraper.name}...")
            data = scraper.scrape(fecha_ini)
            logger.info(f"Found {len(data)} items in {scraper.name}")
            all_data.extend(data)
        except Exception as e:
            logger.error(f"Error running {scraper.name}: {e}")

    logger.info(f"Total items found: {len(all_data)}")
    save_to_supabase(all_data)
    logger.info("[DONE] Scraping Job Completed.")

if __name__ == "__main__":
    main()
