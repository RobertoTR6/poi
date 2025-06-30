// CONTENIDO DEL NUEVO ARCHIVO: js/pages/cadenas-9001.js

import { setupCrudController } from '../modules/crud.js';

export function init() {
    setupCrudController({
        // --- 1. Colección ---
        collection: 'cadenas9001', // La nueva colección en la BD
        getId: item => item.id,
        
        // --- 2. IDs del DOM (deben coincidir con el HTML que acabamos de crear) ---
        tableBodyId: 'table9001',
        searchInputId: 'search9001',
        downloadBtnId: 'btnDescargar9001',
        importBtnId: 'btnImportar9001',
        fileImporterId: 'file-importer-9001',
        paginationContainerId: 'pagination-9001',
        
        // --- 3. Función de Renderizado (con los 6 campos que pediste) ---
        renderRow: (item) => `
            <td>${item.categoriaCodigo || ''}</td>
            <td>${item.categoriaNombre || ''}</td>
            <td>${item.productoCodigo || ''}</td>
            <td>${item.productoNombre || ''}</td>
            <td>${item.actividadCodigo || ''}</td>
            <td>${item.actividadNombre || ''}</td>
        `,

        // --- 4. Configuración de Exportación (Descarga de Plantilla) ---
        csvConfig: {
            filename: 'plantilla_cadenas_9001_9002.xlsx',
            headers: 'CategoriaCodigo,CategoriaNombre,ProductoCodigo,ProductoNombre,ActividadCodigo,ActividadNombre',
            formatRow: (item) => [
                item.categoriaCodigo,
                item.categoriaNombre,
                item.productoCodigo,
                item.productoNombre,
                item.actividadCodigo,
                item.actividadNombre,
            ]
        },

        // --- 5. Configuración de Importación (Carga Masiva) ---
        importConfig: {
            // Usaremos el código de actividad como clave única para actualizar registros existentes
            uniqueKey: 'actividadCodigo', 
            
            // Esta sección no tiene campos booleanos, así que no necesitamos `booleanFields`.
            
            // Mapea las columnas del Excel a las propiedades del objeto en la BD.
            headers: {
                'CategoriaCodigo': 'categoriaCodigo',
                'CategoriaNombre': 'categoriaNombre',
                'ProductoCodigo': 'productoCodigo',
                'ProductoNombre': 'productoNombre',
                'ActividadCodigo': 'actividadCodigo',
                'ActividadNombre': 'actividadNombre'
            }
        }
    });
}