import os
import sqlite3
import pandas as pd
from supabase import create_client, Client
import sys
from dotenv import load_dotenv

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env file or input them manually.")
    SUPABASE_URL = input("Enter Supabase URL: ")
    SUPABASE_KEY = input("Enter Supabase Anon Key: ")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase URL and Key are required.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Adjust path based on where script is run. Assuming run from 'rutinas' root or 'rutinas/scripts'.
# We need to find ../Normativa/backend/normativas.db relative to APPs/rutinas
# API list_dir showed APPs/Normativa and APPs/Rutinas are siblings.
# So from rutinas/scripts, it is ../../Normativa/backend/normativas.db
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../Normativa/backend/normativas.db"))

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    print(f"Reading from {DB_PATH}...")
    try:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query("SELECT * FROM normativas", conn)
        conn.close()
    except Exception as e:
        print(f"Error reading SQLite DB: {e}")
        return

    print(f"Found {len(df)} records. Preparing to upload to 'normativas' table...")
    
    # Convert dates to ISO format if needed
    if 'fecha_publicacion' in df.columns:
        df['fecha_publicacion'] = pd.to_datetime(df['fecha_publicacion']).dt.strftime('%Y-%m-%d')
    
    # Replace NaN with None for SQL null
    df = df.where(pd.notnull(df), None)
    
    records = df.to_dict(orient='records')
    
    # Upload in batches
    BATCH_SIZE = 100
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i+BATCH_SIZE]
        try:
            # Upsert by ID if it exists, or just insert. 
            # Note: If IDs conflict with existing Supabase IDs (auto-inc), might be an issue.
            # But we want to preserve history. Supabase identity column can be overridden if configured, 
            # or we can omit ID to let Supabase generate new ones.
            # For migration, keeping IDs is good if we want to validata.
            # Let's try upserting.
            response = supabase.table('normativas').upsert(batch).execute()
            print(f"Uploaded batch {i//BATCH_SIZE + 1}/{(len(records)//BATCH_SIZE) + 1}")
        except Exception as e:
            print(f"Error uploading batch {i}: {e}")

    print("Migration complete!")

if __name__ == "__main__":
    migrate()
