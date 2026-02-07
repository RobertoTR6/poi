import os
import glob
import pandas as pd
from supabase import create_client, Client
import sys
from dotenv import load_dotenv

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    SUPABASE_URL = input("Enter Supabase URL: ")
    SUPABASE_KEY = input("Enter Supabase Anon Key: ")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase URL and Key are required.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Path to Convocatorias data
# From rutinas/scripts -> ../../Convocatorias/datos
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../Convocatorias/datos"))

def get_latest_file():
    pattern = os.path.join(DATA_DIR, "convocatorias_multiples_sin_duplicados_*.xlsx")
    files = glob.glob(pattern)
    if not files:
        return None
    return max(files, key=os.path.getctime)

def migrate():
    latest_file = get_latest_file()
    if not latest_file:
        print(f"No data files found in {DATA_DIR}")
        return

    print(f"Reading from {latest_file}...")
    try:
        df = pd.read_excel(latest_file, sheet_name='Sin_Duplicados')
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    print(f"Found {len(df)} records. Preparing to upload to 'convocatorias' table...")

    # Normalize columns to match Supabase schema
    # Schema: fuente, organizacion, cargo, remuneracion_numerica, categoria_salarial, ubicacion, fecha_fin, link, es_nueva, categoria_busqueda
    # Excel columns might differ.
    
    # Mapping based on previous analysis of data.py
    # 'Remuneración_Numerica' -> remuneracion_numerica
    # 'Categoria_Salarial' -> categoria_salarial
    # 'Ubicación' -> ubicacion
    # 'Fecha_Fin' -> fecha_fin
    # 'Organización' -> organizacion
    # 'Categoría_Búsqueda' -> categoria_busqueda
    # 'Fuente' -> fuente
    # 'Cargo' -> cargo
    # 'Link' -> link
    # 'Es_Nueva' -> es_nueva
    
    column_map = {
        'Fuente': 'fuente',
        'Organización': 'organizacion',
        'Cargo': 'cargo',
        'Remuneración_Numerica': 'remuneracion_numerica',
        'Categoria_Salarial': 'categoria_salarial',
        'Ubicación': 'ubicacion',
        'Fecha_Fin': 'fecha_fin',
        'Link': 'link',
        'Es_Nueva': 'es_nueva',
        'Categoría_Búsqueda': 'categoria_busqueda'
    }
    
    # Rename columns
    df = df.rename(columns=column_map)
    
    # Keep only relevant columns
    available_cols = [c for c in column_map.values() if c in df.columns]
    df = df[available_cols]

    # Handle dates
    if 'fecha_fin' in df.columns:
        df['fecha_fin'] = pd.to_datetime(df['fecha_fin'], errors='coerce').dt.strftime('%Y-%m-%d')
    
    # Handle NaNs
    df = df.where(pd.notnull(df), None)
    
    records = df.to_dict(orient='records')
    
    # Upload
    BATCH_SIZE = 100
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i+BATCH_SIZE]
        try:
            # We don't have IDs in Excel usually, so just insert.
            response = supabase.table('convocatorias').upsert(batch, on_conflict='link').execute() # Assuming Link is unique? Or just insert?
            # If no unique constraint, better to just insert or truncate first.
            # But let's assume 'link' or similar might be unique. Actually, convocatorias might allow duplicates?
            # Safer to insert. But `upsert` without `on_conflict` needs primary key.
            # If we don't provide ID, it inserts.
            response = supabase.table('convocatorias').insert(batch).execute()
            print(f"Uploaded batch {i//BATCH_SIZE + 1}/{(len(records)//BATCH_SIZE) + 1}")
        except Exception as e:
            print(f"Error uploading batch {i}: {e}")

    print("Migration complete!")

if __name__ == "__main__":
    migrate()
