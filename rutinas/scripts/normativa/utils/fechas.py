from datetime import datetime

# Meses en español
MESES = {
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
    'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
    'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
}

def formatear_fecha_gob(fecha_texto: str) -> str:
    texto = fecha_texto.replace("Publicado:", "").strip().split(" - ")[0]
    partes = texto.split(" de ")
    if len(partes) == 3:
        dia, mes_txt, anio = partes
        mes = MESES.get(mes_txt.lower(), "00")
        return f"{int(dia):02d}-{mes}-{anio}"
    return fecha_texto

def formatear_fecha_peruano(texto: str) -> str:
    try:
        # Convertir la cadena de fecha en formato "dd.mm.yyyy" a un objeto datetime
        fecha = datetime.strptime(texto, "%d.%m.%Y")
        # Devolver la fecha en formato "dd-mm-yyyy"
        return fecha.strftime("%d-%m-%Y")
    except ValueError:
        # En caso de error en el formato, retornar el texto original
        return texto
