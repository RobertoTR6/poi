from abc import ABC, abstractmethod
import logging

class BaseScraper(ABC):
    """
    Clase base abstracta para todos los scrapers.
    Define una interfaz común que deben implementar.
    """
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(self.__class__.__name__)

    @abstractmethod
    def scrape(self, fecha_ini: str) -> list[dict]:
        """
        Método principal de scraping.
        
        Args:
            fecha_ini (str): La fecha de inicio en formato 'YYYY-MM-DD'.
        
        Returns:
            list[dict]: Una lista de diccionarios con los datos extraídos.
        """
        pass
