"""
Clasificador de normativas por categorías basado en palabras clave - VERSIÓN MEJORADA
"""

CATEGORIAS_KEYWORDS = {
    # Categorías de actos administrativos específicos (ALTA PRIORIDAD)
    'Designación': [
        'designa como', 'designar como', 'designación de', 'designación del',
        'designan como', 'designan en', 'designan al', 'designan a', 'designan',
        'nombra como', 'nombramiento de', 'nombramiento del', 'nombran',
        'encarga las funciones', 'encargatura de', 'encargar funciones',
        'encargan funciones', 'encargan las funciones',
        'designa en el cargo', 'designa como representante', 'designa en representación',
        'designa en la', 'designa al servidor', 'designa a la servidora'
    ],
    'Renuncia': [
        'acepta renuncia', 'aceptar renuncia', 'aceptan renuncia',
        'da por concluida', 'dar por concluida', 'dar por concluido', 
        'concluye funciones', 'cese de', 'cesar en el cargo',
        'acepta la renuncia', 'dan por concluida'
    ],
    'Autorización de Viaje': [
        'autoriza viaje', 'autorización de viaje', 'autorizan viaje',
        'comisión de servicio', 'comisión de servicios',
        'viaje oficial', 'viaje en comisión',
        'pasaje y viático', 'pasajes y viáticos',
        'autorizan el viaje', 'autoriza el viaje'
    ],
    'Aprobación de Directiva': [
        'aprueba directiva', 'aprobación de directiva', 'aprueban directiva',
        'aprueba lineamiento', 'aprobación de lineamiento',
        'aprueba procedimiento', 'aprobación de procedimiento',
        'aprueba protocolo', 'aprobación de protocolo',
        'aprueba la directiva', 'modificación de directiva',
        'modifica directiva'
    ],
    'Aprobación de Reglamento': [
        'aprueba reglamento', 'aprobación de reglamento', 'aprueban reglamento',
        'aprueba el reglamento', 'modificación de reglamento',
        'modifica reglamento', 'modifica el reglamento',
        'modifican reglamento', 'modifican el reglamento'
    ],
    'Modificación de Estatuto': [
        'modifica estatuto', 'modificación de estatuto',
        'modifica el estatuto', 'modifican estatuto',
        'modifica reglamento interno', 'modificación del estatuto'
    ],
    'Conformación de Comisión': [
        'conforma comisión', 'conformación de comisión',
        'conforma comité', 'conformación de comité',
        'conforma grupo de trabajo', 'conformación de grupo',
        'constituye comisión', 'constitución de comisión'
    ],
    'Reconformación': [
        'reconforma comisión', 'reconformación de comisión',
        'reconforma comité', 'reconformación de comité',
        'reconforma grupo de trabajo', 'reconforma equipo'
    ],
    'Contratación': [
        'contrata los servicios', 'contratación de servicios',
        'contrato administrativo de servicios', 'contrato cas',
        'locación de servicios', 'servicio de consultoría',
        'servicio de tercero'
    ],
    'Presupuesto': [
        'crédito presupuestario', 'crédito suplementario',
        'transferencia presupuestal', 'transferencia de partida',
        'modificación presupuestal', 'modificación presupuestaria',
        'asignación presupuestal', 'asignación presupuestaria'
    ],
    'Aprobación de Documentos': [
        'aprueba plan', 'aprobación de plan', 'aprueban plan',
        'aprueba manual', 'aprobación de manual',
        'aprueba el plan', 'aprueban el plan'
    ],
    'Ratificación': [
        'ratifica acuerdo', 'ratificación de', 'ratifican acuerdo',
        'ratifica convenio', 'ratificación de acuerdo',
        'ratificación de convenio', 'ratifica el acuerdo'
    ],
    'Aprobación de Tarifas': [
        'aprueba tarifa', 'aprobación de tarifa', 'aprueban tarifa',
        'fija tarifa', 'fijación de tarifa', 'fijan tarifa',
        'aprueba las tarifas', 'fija las tarifas'
    ],
    'Autorización de Funcionamiento': [
        'autoriza funcionamiento', 'autorización de funcionamiento',
        'autorizan funcionamiento', 'autoriza el funcionamiento'
    ],
    'Licencia': [
        'autoriza licencia', 'autorización de licencia',
        'licencia con goce', 'licencia sin goce',
        'goce de vacaciones', 'uso de vacaciones'
    ],
    
    # Nuevas categorías para documentos informativos
    'Informes y Reportes': [
        'informe técnico', 'informe anual', 'informe mensual',
        'reporte de', 'report -', 'daily report',
        'informe de gestión', 'informe estadístico'
    ],
    'Estadísticas y Análisis': [
        'estadísticas de', 'estadística de',
        'análisis de', 'estudio de',
        'características económicas', 'indicadores',
        'percepción ciudadana'
    ],
    'Publicaciones': [
        'materiales del curso', 'presentación sobre',
        'publicación de', 'documento de trabajo',
        'perú:', 'peru:'
    ],
    
    # Categorías genéricas por tipo de norma (BAJA PRIORIDAD - solo si no hay match específico)
    'Decretos': [
        'decreto supremo', 'decreto de urgencia',
        'decreto legislativo'
    ],
    'Leyes': [
        'ley n°', 'ley n.°', 'ley nº'
    ],
    
    'Otros': []  # Categoría por defecto
}

def clasificar_normativa(titulo: str, descripcion: str = "") -> str:
    """
    Clasifica una normativa según palabras clave en el título y descripción
    
    Args:
        titulo: Título o norma legal
        descripcion: Descripción de la normativa
        
    Returns:
        Nombre de la categoría
    """
    # Convertir a minúsculas para búsqueda case-insensitive
    texto_completo = f"{descripcion} {titulo}".lower()  # Priorizar descripción
    descripcion_lower = descripcion.lower()
    titulo_lower = titulo.lower()
    
    # IMPORTANTE: Buscar primero en categorías ESPECÍFICAS
    # Esto asegura que "Resolución que designa..." se clasifique como "Designación" y NO como "Resoluciones"
    categorias_especificas = [
        'Designación', 'Renuncia', 'Autorización de Viaje',
        'Aprobación de Directiva', 'Aprobación de Reglamento', 
        'Modificación de Estatuto', 'Conformación de Comisión',
        'Reconformación', 'Contratación', 'Presupuesto',
        'Aprobación de Documentos', 'Ratificación', 
        'Aprobación de Tarifas', 'Autorización de Funcionamiento',
        'Licencia', 'Informes y Reportes', 'Estadísticas y Análisis', 
        'Publicaciones'
    ]
    
    categorias_genericas = ['Decretos', 'Leyes']
    
    # Primero buscar en DESCRIPCIÓN (más específica)
    for categoria in categorias_especificas:
        keywords = CATEGORIAS_KEYWORDS.get(categoria, [])
        for keyword in keywords:
            if keyword.lower() in descripcion_lower:
                return categoria
    
    # Si no hay match en descripción, buscar en texto completo
    for categoria in categorias_especificas:
        keywords = CATEGORIAS_KEYWORDS.get(categoria, [])
        for keyword in keywords:
            if keyword.lower() in texto_completo:
                return categoria
    
    # Luego buscar en categorías genéricas (solo Decretos y Leyes)
    for categoria in categorias_genericas:
        keywords = CATEGORIAS_KEYWORDS.get(categoria, [])
        for keyword in keywords:
            if keyword.lower() in texto_completo:
                return categoria
    
    # NUNCA clasificar como "Resoluciones" genérica
    # Si no hay match específico, clasificar como "Otros"
    return 'Otros'

def obtener_categorias_disponibles():
    """Retorna lista de categorías disponibles"""
    return list(CATEGORIAS_KEYWORDS.keys())
