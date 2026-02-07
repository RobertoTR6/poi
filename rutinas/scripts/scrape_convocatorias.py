
import os
import sys
import logging
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Add script directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from convocatorias.config import BUSQUEDAS
from convocatorias.scraper import extraer_convocatorias_cas, extraer_convocatorias_perutrabajos
from convocatorias.deduplication import eliminar_duplicados_ia, normalizar_remuneraciones_ia

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ConvocatoriasScraper")

# Load Environment Variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local'))

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

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

def run_scraping():
    all_data = []
    
    for busqueda in BUSQUEDAS:
        cat = busqueda['categoria']
        dep = busqueda['departamento']
        nom = busqueda['nombre_dep']
        
        logger.info(f"🔍 Searching: {cat} in {nom}")
        
        cas_data = extraer_convocatorias_cas(cat, dep, nom)
        all_data.extend(cas_data)
        
        peru_data = extraer_convocatorias_perutrabajos(cat, dep, nom)
        all_data.extend(peru_data)
        
    if not all_data:
        logger.warning("No data found.")
        return

    # Convert to DataFrame for processing
    df = pd.DataFrame(all_data)
    
    # Deduplicate
    logger.info(f"Processing {len(df)} records for deduplication...")
    df_clean = eliminar_duplicados_ia(df)
    
    # Normalize Salaries
    df_clean = normalizar_remuneraciones_ia(df_clean)
    
    logger.info(f"Saving {len(df_clean)} unique records...")

    if not supabase:
        logger.info("⚠️  DRY RUN MODE: Supabase not configured. Skipping DB save.")
        logger.info("🔎  First 3 records found:")
        for i, row in df_clean.head(3).iterrows():
             logger.info(f"   [{i+1}] {row['Cargo']} at {row['Organización']} - {row['Enlace']}")
        return
    
    # Save to Supabase
    count = 0
    for _, row in df_clean.iterrows():
        try:
            # Check existing (simple check by link)
            existing = supabase.table('convocatorias').select('id').eq('link', row['Enlace']).execute()
            if existing.data:
                continue

            record = {
                'fuente': row['Fuente'],
                'organizacion': row['Organización'],
                'cargo': row['Cargo'],
                'remuneracion_numerica': row['Remuneración_Numerica'],
                'categoria_salarial': row['Categoria_Salarial'],
                'ubicacion': row['Ubicación'],
                'fecha_fin': row['Fecha_Fin'] if row['Fecha_Fin'] != 'N/A' else None,
                'link': row['Enlace'],
                'es_nueva': True,
                'categoria_busqueda': row['Categoría_Búsqueda'],
                'fecha_registro': datetime.now().isoformat()
            }
            
            supabase.table('convocatorias').insert(record).execute()
            count += 1
        except Exception as e:
            logger.error(f"Error saving record: {e}")
            
    logger.info(f"[SUCCESS] Successfully inserted {count} new records.")

if __name__ == "__main__":
    run_scraping()
