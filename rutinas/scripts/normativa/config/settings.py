
# Configuraciones de URLs para scraping
GOB_BASE_URL = (
    "https://www.gob.pe/busquedas?"
    "contenido[]=normas&contenido[]=noticias&contenido[]=publicaciones"
    "&desde={desde_fecha}"  # Placeholder para formatear
    "&hasta={hasta_fecha}"
    "&institucion[]=mef&institucion[]=ceplan&institucion[]=pcm"
    "&institucion[]=sis&institucion[]=fissal&institucion[]=inei"
    "&sheet=1&sort_by=recent"
    "&tipo_norma[]=12-directivas&tipo_norma[]=18-resoluciones"
    "&tipo_noticia[]=3-comunicado&tipo_publicacion[]=22-publicaciones&tipo_publicacion[]=31-informes"
)

EL_PERUANO_URL_TEMPLATE = "https://busquedas.elperuano.pe/?start=0&tipoDispositivo={tipo}&entidad={entidad}&tipoPublicacion=NL&fechaFin={fecha_fin}&fechaIni={fecha_ini}"

EL_PERUANO_PARAMS = [
    {'tipo': 'DECRETO+DE+URGENCIA', 'entidad': ''},
    {'tipo': 'LEY', 'entidad': ''},
    {'tipo': '', 'entidad': '2066'},
    {'tipo': '', 'entidad': '2075'},
    {'tipo': '', 'entidad': '2069'},
    {'tipo': '', 'entidad': '2025'},
    {'tipo': '', 'entidad': '2070'},
    {'tipo': '', 'entidad': '1551'},
    {'tipo': '', 'entidad': '8918'},
    {'tipo': '', 'entidad': '2081'},
    {'tipo': '', 'entidad': '2082'},
    {'tipo': '', 'entidad': '9112'}, # riego
    {'tipo': '', 'entidad': '1959'},
    {'tipo': '', 'entidad': '1982'},
    {'tipo': '', 'entidad': '2016'}, # indeci
]
