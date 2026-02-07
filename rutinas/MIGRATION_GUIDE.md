# Guía de Migración y Ejecución

Sigue estos pasos para poner en marcha la aplicación unificada **RutinasApp**.

## 1. Configuración de Supabase
1. Ingresa a [Supabase](https://supabase.com/) y crea un nuevo proyecto.
2. Ve al **SQL Editor** y ejecuta el contenido del archivo `supabase/schema.sql` (ubicado en este proyecto).
3. Ve a **Project Settings > API** y copia:
   - `Project URL`
   - `anon public` key

## 2. Configuración de Variables de Entorno
Crea un archivo `.env.local` en la carpeta `rutinas` con el siguiente contenido:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## 3. Migración de Datos (Opcional)
Si deseas importar tus datos existentes de Normativa y Convocatorias:

1. Abre una terminal en la carpeta `rutinas`.
2. Instala las dependencias de los scripts:
   ```bash
   pip install -r scripts/requirements.txt
   ```
3. Ejecuta los scripts de migración (asegúrate de tener el archivo `.env.local` o ingresa las credenciales cuando se te pida):
   ```bash
   python scripts/migrate_normativa.py
   python scripts/migrate_convocatorias.py
   ```

## 4. Ejecutar la Aplicación
1. En la terminal (carpeta `rutinas`), asegúrate de que las dependencias de Node estén instaladas (si no lo hiciste antes):
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Notas
- El módulo de **Normativa** leerá de la tabla `normativas`.
- El módulo de **Convocatorias** leerá de la tabla `convocatorias`.
- Si no realizas la migración, las tablas estarán vacías y verás "No se encontraron resultados".
