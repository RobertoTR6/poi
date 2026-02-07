
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from .config import HEADERS

def normalizar_ubicacion(ubicacion):
    """Normaliza el nombre de la ubicación"""
    if not ubicacion or ubicacion == "N/A":
        return ubicacion
    return str(ubicacion).strip().title()

def extraer_datos_convocatoria_cas(article, categoria_busqueda='', departamento_busqueda=''):
    try:
        titulo_element = article.find('h4').find('a')
        titulo = titulo_element.get_text(strip=True) if titulo_element else "N/A"
        enlace = titulo_element.get('href') if titulo_element else "N/A"
        
        organizacion = titulo.split(':')[0].strip() if ':' in titulo else "N/A"
        cargo = titulo.split(':')[1].strip() if ':' in titulo else titulo
        
        li_elements = article.find_all('li')
        ubicacion = "N/A"
        remuneracion = "N/A"
        fecha_fin = "N/A"
        
        for li in li_elements:
            texto = li.get_text(strip=True)
            if "Donde:" in texto:
                ubicacion = normalizar_ubicacion(texto.replace("Donde:", "").strip())
            elif "Remuneración:" in texto:
                remuneracion = texto.replace("Remuneración:", "").strip()
            elif "Finaliza el:" in texto:
                fecha_fin = texto.replace("Finaliza el:", "").strip()
        
        return {
            'Fuente': 'ConvocatoriasCAS',
            'Categoría_Búsqueda': categoria_busqueda,
            'Departamento_Búsqueda': departamento_busqueda,
            'Organización': organizacion,
            'Cargo': cargo,
            'Ubicación': ubicacion,
            'Remuneración': remuneracion,
            'Fecha_Fin': fecha_fin,
            'Enlace': enlace,
            'Es_Nueva': True
        }
    except Exception as e:
        print(f"Error extracting CAS: {e}")
        return None

def extraer_convocatorias_cas(categoria, departamento, nombre_dep, max_pages=3):
    base_url = "https://www.convocatoriascas.com/buscar-trabajo.php"
    params = {'q': categoria, 'dep': departamento, 'sort': '1-fechapublicacion', 'page': 1}
    convocatorias = []
    
    for page in range(1, max_pages + 1):
        params['page'] = page
        try:
            response = requests.get(base_url, params=params, headers=HEADERS)
            if response.status_code != 200: break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            articles = soup.find_all('article', class_='card')
            
            if not articles: break
            
            for article in articles:
                data = extraer_datos_convocatoria_cas(article, categoria, nombre_dep)
                if data: convocatorias.append(data)
        except Exception as e:
            print(f"Error extracting page {page}: {e}")
            break
            
    return convocatorias

def extraer_datos_convocatoria_perutrabajos(article, categoria_busqueda='', departamento_busqueda=''):
    try:
        organizacion_element = article.find('h3')
        organizacion = organizacion_element.get_text(strip=True) if organizacion_element else "N/A"
        
        cargo_element = article.find('strong')
        cargo = cargo_element.get_text(strip=True) if cargo_element else "N/A"
        
        grupo_div = article.find('div', class_='puesto__grupo')
        ubicacion = "N/A"
        remuneracion = "N/A"
        fecha_fin = "N/A"
        
        if grupo_div:
            paragrafos = grupo_div.find_all('p')
            for p in paragrafos:
                texto = p.get_text(strip=True)
                if p.find('i', class_='icon-location'):
                    ubicacion = normalizar_ubicacion(texto)
                elif p.find('i', class_='icon-moneda'):
                    remuneracion = texto
                elif p.find('i', class_='icon-calendario'):
                    fecha_fin = texto.replace('Finaliza el ', '').strip()
        
        enlace_element = article.find('a')
        enlace = enlace_element.get('href') if enlace_element else "N/A"
        
        return {
            'Fuente': 'PeruTrabajos',
            'Categoría_Búsqueda': categoria_busqueda,
            'Departamento_Búsqueda': departamento_busqueda,
            'Organización': organizacion,
            'Cargo': cargo,
            'Ubicación': ubicacion,
            'Remuneración': remuneracion,
            'Fecha_Fin': fecha_fin,
            'Enlace': enlace,
            'Es_Nueva': True
        }
    except Exception:
        return None

def extraer_convocatorias_perutrabajos(categoria, departamento, nombre_dep, max_pages=3):
    base_url = "https://www.perutrabajos.com/buscar-empleo.php"
    params = {'q': categoria, 'dep': departamento}
    convocatorias = []
    
    for page in range(1, max_pages + 1):
        if page > 1: params['page'] = page
        try:
            response = requests.get(base_url, params=params, headers=HEADERS)
            if response.status_code != 200: break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            articles = soup.find_all('article', class_='puesto')
            
            if not articles: break
            
            for article in articles:
                data = extraer_datos_convocatoria_perutrabajos(article, categoria, nombre_dep)
                if data: convocatorias.append(data)
        except Exception:
            break
            
    return convocatorias
