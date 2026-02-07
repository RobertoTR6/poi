import re
import logging
from urllib.parse import urlparse

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

from ..config.settings import EL_PERUANO_URL_TEMPLATE, EL_PERUANO_PARAMS
from ..utils.fechas import formatear_fecha_peruano
from .base import BaseScraper

class ElPeruanoScraper(BaseScraper):
    """Scraper para el portal de Normas Legales de El Peruano."""
    
    BASE_URL = "https://busquedas.elperuano.pe"

    def __init__(self):
        super().__init__("El Peruano")

    def _parse_card(self, card_soup):
        """Extrae la información de una única tarjeta de resultado."""
        try:
            entidad_el = card_soup.find("h6", class_="card-title")
            entidad = entidad_el.get_text(strip=True) if entidad_el else "N/A"
            
            sub_title_elements = card_soup.find_all("h6", class_="card-sub-title")
            sub_title = " ".join(el.get_text(strip=True) for el in sub_title_elements)
            
            descripcion, link_acceso = "N/A", "#"
            for body_div in card_soup.find_all("div", class_="card-body"):
                if "text-center" not in body_div.get("class", []):
                    a_desc = body_div.find("a", class_="nav-link")
                    if a_desc:
                        descripcion = a_desc.get_text(strip=True)
                        link_acceso = a_desc.get("href", "#")
                        if link_acceso and not link_acceso.startswith("http"):
                            link_acceso = self.BASE_URL + link_acceso
                    else:
                        descripcion = body_div.get_text(strip=True)
                    break

            fecha_raw = ""
            fecha_pub = "N/A"
            for footer in card_soup.find_all("div", class_="card-footer"):
                span = footer.find("span", class_="float-end")
                if span:
                    match = re.search(r"(\d{2}\.\d{2}\.\d{4})", span.get_text(strip=True))
                    if match:
                        fecha_raw = match.group(1)
                        break
            
            if fecha_raw:
                fecha_pub = formatear_fecha_peruano(fecha_raw)

            return {
                "Entidad": entidad, "Normas Legales": sub_title,
                "Descripción": descripcion, "Link Acceso": link_acceso,
                "Fecha Publicación": fecha_pub
            }
        except Exception as e:
            self.logger.error(f"Error parseando una tarjeta: {e}")
            return None

    def scrape(self, fecha_ini: str) -> list[dict]:
        self.logger.info(f"Iniciando scraping para El Peruano con fecha: {fecha_ini}")
        fecha_fin = "20301231"
        fecha_ini_str = fecha_ini.replace("-", "")

        urls = [
            EL_PERUANO_URL_TEMPLATE.format(
                tipo=param['tipo'],
                entidad=param['entidad'],
                fecha_fin=fecha_fin,
                fecha_ini=fecha_ini_str
            ) for param in EL_PERUANO_PARAMS
        ]
        
        datos = []
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
        
        driver = None
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            
            for i, url in enumerate(urls):
                self.logger.info(f"Procesando URL {i+1}/{len(urls)}")
                try:
                    driver.get(url)
                    WebDriverWait(driver, 15).until(
                        EC.presence_of_element_located((By.CLASS_NAME, "card"))
                    )
                except TimeoutException:
                    continue
                
                soup = BeautifulSoup(driver.page_source, "html.parser")
                cards = soup.find_all("div", class_="card")
                
                for card in cards:
                    parsed_data = self._parse_card(card)
                    if parsed_data:
                        datos.append(parsed_data)
        
        except Exception as e:
            self.logger.error(f"Error en scraping El Peruano: {e}")
        finally:
            if driver:
                driver.quit()
        
        return datos
