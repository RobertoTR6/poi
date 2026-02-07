import re
import logging
from datetime import datetime

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

from ..config.settings import GOB_BASE_URL
from ..utils.fechas import formatear_fecha_gob
from .base import BaseScraper

class GobPeScraper(BaseScraper):
    """Scraper para el portal de búsqueda de Gob.pe."""

    MAX_PAGES = 50

    def __init__(self):
        super().__init__("Gob.pe")

    def scrape(self, fecha_ini: str) -> list[dict]:
        self.logger.info(f"Iniciando scraping para Gob.pe con fecha: {fecha_ini}")
        datos = []
        
        fecha_dt = datetime.strptime(fecha_ini, "%Y-%m-%d")
        fecha_url = fecha_dt.strftime("%d-%m-%Y")
        fecha_fin_url = "31-12-2030" # O la que sea necesaria
        
        # Formatear la URL con la fecha
        url_base = GOB_BASE_URL.format(desde_fecha=fecha_url, hasta_fecha=fecha_fin_url)
        url_base = re.sub(r'sheet=\d+', "sheet=1", url_base)

        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
        
        driver = None
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            page = 1
            while page <= self.MAX_PAGES:
                url_page = re.sub(r'sheet=\d+', f"sheet={page}", url_base)
                driver.get(url_page)
                
                try:
                    WebDriverWait(driver, 15).until(
                        EC.presence_of_element_located((By.TAG_NAME, "article"))
                    )
                except TimeoutException:
                    break
                
                soup = BeautifulSoup(driver.page_source, "html.parser")
                articulos = soup.find_all("article")
                
                if not articulos:
                    break

                for art in articulos:
                    datos.append(self._parse_article(art))
                
                page += 1

        except Exception as e:
            self.logger.error(f"Error en scraping Gob.pe: {e}")
        finally:
            if driver:
                driver.quit()

        return datos

    def _parse_article(self, art: BeautifulSoup) -> dict:
        fecha_pub = "N/A"
        if time_elem := art.find("time"):
            fecha_texto = time_elem.get_text(strip=True)
            fecha_pub = formatear_fecha_gob(fecha_texto)

        entidad = "N/A"
        if h4 := art.find("h4", class_="text-base"):
            entidad = h4.get_text(strip=True)

        norma, link_acceso = "N/A", "#"
        if h3 := art.find("h3"):
            if a := h3.find("a", class_="track-ga-click"):
                norma = a.get_text(strip=True)
                link_acceso = a.get("href", "#")
                if link_acceso and not link_acceso.startswith("http"):
                    link_acceso = "https://www.gob.pe" + link_acceso
        
        descripcion = "N/A"
        if desc := art.find("p", {"id": lambda x: x and x.endswith("-description")}):
            descripcion = desc.get_text(strip=True)

        return {
            "Entidad": entidad,
            "Normas Legales": norma,
            "Descripción": descripcion,
            "Link Acceso": link_acceso,
            "Fecha Publicación": fecha_pub
        }
