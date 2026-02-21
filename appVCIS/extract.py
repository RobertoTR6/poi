import pandas as pd
import json
import os

df = pd.read_excel('herramienta de monitoreo final.xlsx', sheet_name='Herramienta de Monitoreo', header=8)
res = []
current_comp = ''
for _, row in df.iterrows():
    val0 = row.iloc[0]
    val1 = row.iloc[1]
    
    if pd.notna(val0) and isinstance(val0, str) and len(val0.strip()) > 5:
        if 'Línea de' in val0 or 'Aspectos Generales' in val0:
            current_comp = val0.strip()
    
    if pd.notna(val1) and str(val1).strip().isdigit():
        res.append({
            'componente': current_comp,
            'numero': int(val1),
            'verificador': str(row.iloc[2]).strip(),
            'fuente_auditable': str(row.iloc[3]).strip(),
            'especificaciones': str(row.iloc[4]).strip()
        })

os.makedirs('src/lib', exist_ok=True)
with open('src/lib/verificadores.js', 'w', encoding='utf-8') as f:
    f.write('export const VERIFICADORES = ')
    json.dump(res, f, indent=2, ensure_ascii=False)
    f.write(';\n')
