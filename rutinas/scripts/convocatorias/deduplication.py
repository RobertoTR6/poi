
import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fuzzywuzzy import fuzz

def eliminar_duplicados_ia(df):
    """
    Elimina duplicados usando IA: combinación de similitud de texto y criterios específicos
    """
    if df.empty:
        return df
    
    print("    🔍 Analizando similitudes con TF-IDF...")
    
    # Crear texto combinado para cada convocatoria
    df['texto_completo'] = (
        df['Organización'].fillna('') + ' ' +
        df['Cargo'].fillna('') + ' ' +
        df['Requisitos'].fillna('') + ' ' +
        df['Ubicación'].fillna('')
    )
    
    # Vectorización TF-IDF
    vectorizer = TfidfVectorizer(
        stop_words=None,
        max_features=1000,
        ngram_range=(1, 2),
        lowercase=True
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform(df['texto_completo'])
        similarity_matrix = cosine_similarity(tfidf_matrix)
    except:
        print("    ⚠️ Error en TF-IDF, usando método alternativo...")
        return df.drop_duplicates(subset=['Organización', 'Cargo'], keep='first')
    
    # Detectar duplicados con múltiples criterios
    duplicados_indices = set()
    umbral_similitud = 0.7  # 70% de similitud
    
    print("    🎯 Detectando duplicados por similitud...")
    
    for i in range(len(df)):
        if i in duplicados_indices:
            continue
            
        for j in range(i + 1, len(df)):
            if j in duplicados_indices:
                continue
            
            # Criterio 1: Similitud de texto global
            similitud_global = similarity_matrix[i][j]
            
            # Criterio 2: Similitud específica de organización y cargo
            org_similar = fuzz.ratio(str(df.iloc[i]['Organización']).lower(), str(df.iloc[j]['Organización']).lower())
            cargo_similar = fuzz.ratio(str(df.iloc[i]['Cargo']).lower(), str(df.iloc[j]['Cargo']).lower())
            
            # Criterio 3: Misma remuneración y ubicación
            misma_remuneracion = (
                df.iloc[i]['Remuneración'] == df.iloc[j]['Remuneración'] and 
                pd.notna(df.iloc[i]['Remuneración']) and 
                df.iloc[i]['Remuneración'] != 'N/A'
            )
            misma_ubicacion = (
                df.iloc[i]['Ubicación'] == df.iloc[j]['Ubicación'] and 
                pd.notna(df.iloc[i]['Ubicación'])
            )
            
            # Decisión de duplicado basada en múltiples criterios
            es_duplicado = (
                (similitud_global > umbral_similitud) or
                (org_similar > 85 and cargo_similar > 80) or
                (org_similar > 90 and misma_remuneracion and misma_ubicacion)
            )
            
            if es_duplicado:
                # Mantener el registro de ConvocatoriasCAS si hay conflicto
                if (df.iloc[i]['Fuente'] == 'ConvocatoriasCAS' and 
                    df.iloc[j]['Fuente'] == 'PeruTrabajos'):
                    duplicados_indices.add(j)
                elif (df.iloc[j]['Fuente'] == 'ConvocatoriasCAS' and 
                    df.iloc[i]['Fuente'] == 'PeruTrabajos'):
                    duplicados_indices.add(i)
                    break
                else:
                    # Si son de la misma fuente, mantener el primero
                    duplicados_indices.add(j)
    
    print(f"    🎯 Duplicados detectados por IA: {len(duplicados_indices)}")
    
    # Crear DataFrame sin duplicados
    indices_mantener = [i for i in range(len(df)) if i not in duplicados_indices]
    df_sin_duplicados = df.iloc[indices_mantener].copy()
    
    # Limpiar columna temporal
    df_sin_duplicados = df_sin_duplicados.drop('texto_completo', axis=1)
    
    return df_sin_duplicados.reset_index(drop=True)

def normalizar_remuneraciones_ia(df):
    """
    Normaliza las remuneraciones usando lógica simple para extraer números
    """
    print("    🔍 Analizando patrones de remuneración...")
    
    df['Remuneración_Numerica'] = 0.0
    
    for idx, row in df.iterrows():
        remuneracion_texto = str(row['Remuneración']).lower().strip()
        
        if remuneracion_texto in ['n/a', 'nan', '', '---', 'no especificado']:
            continue
            
        # Extraer el primer número grande encontrado (suponiendo sueldo mensual)
        # Buscar patrones como "S/ 2,500" o "2500 soles"
        numeros = re.findall(r'(\d+(?:,\d{3})*(?:\.\d{2})?)', remuneracion_texto)
        
        valor_final = 0
        if numeros:
            # Tomar el mayor número encontrado que tenga sentido para un sueldo (>500)
            candidatos = []
            for n in numeros:
                try:
                    val = float(n.replace(',', ''))
                    if val > 500 and val < 50000: # Rango razonable
                        candidatos.append(val)
                except:
                    pass
            
            if candidatos:
                valor_final = max(candidatos)
        
        df.at[idx, 'Remuneración_Numerica'] = valor_final
        
        # Categoría Salarial
        cat = 'N/A'
        if valor_final == 0: cat = 'A Tratar / No especificado'
        elif valor_final < 1500: cat = 'Menos de S/ 1,500'
        elif valor_final < 3000: cat = 'S/ 1,500 - S/ 3,000'
        elif valor_final < 6000: cat = 'S/ 3,000 - S/ 6,000'
        elif valor_final < 10000: cat = 'S/ 6,000 - S/ 10,000'
        else: cat = 'Más de S/ 10,000'
        
        df.at[idx, 'Categoria_Salarial'] = cat

    return df
