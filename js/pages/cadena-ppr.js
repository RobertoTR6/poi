import { setupCrudController } from '../modules/crud.js';

export function init() {
    setupCrudController({
        // --- 1. Configuración Básica de la Colección ---
        collection: 'cadenasPPR',
        getId: item => item.id,
        
        // --- 2. IDs de los Elementos del DOM ---
        // Referencias a los IDs definidos en index.html para esta página específica.
        tableBodyId: 'tablePPR',
        searchInputId: 'searchPPR',
        downloadBtnId: 'btnDescargarPPR',
        importBtnId: 'btnImportarPPR',
        fileImporterId: 'file-importer-ppr',
        paginationContainerId: 'pagination-ppr', // Activa la funcionalidad de paginación
        
        // OMITIMOS intencionadamente createBtnId, modalId, etc., porque esta página no tiene creación/edición individual.

        // --- 3. Función de Renderizado ---
        /**
         * Dibuja TODAS las celdas (<td>) de una fila de la tabla para un registro de Cadena PPR.
         * Esta función tiene ahora la responsabilidad completa sobre el contenido de la fila.
         */
        renderRow: (item) => `
            <td>${item.categoriaCodigo || ''}</td>
            <td>${item.categoriaNombre || ''}</td>
            <td>${item.productoCodigo || ''}</td>
            <td>${item.productoNombre || ''}</td>
            <td>${item.actividadCodigo || ''}</td>
            <td>${item.actividadNombre || ''}</td>
            <td>${item.subproductoCodigo || ''}</td>
            <td>${item.subproductoNombre || ''}</td>
            <td>${item.traz ? 'Sí' : 'No'}</td>
        `,
        // OMITIMOS fillForm, readForm y onBeforeOpenModal porque no hay modal.

        // --- 4. Configuración de Exportación (Descarga de Plantilla) ---
        /**
         * Define cómo se generará el archivo Excel de plantilla/exportación.
         */
        csvConfig: {
            filename: 'plantilla_cadena_ppr.xlsx',
            headers: 'CategoriaCodigo,CategoriaNombre,ProductoCodigo,ProductoNombre,ActividadCodigo,ActividadNombre,SubproductoCodigo,SubproductoNombre,Trazador',
            formatRow: (item) => [
                item.categoriaCodigo,
                item.categoriaNombre,
                item.productoCodigo,
                item.productoNombre,
                item.actividadCodigo,
                item.actividadNombre,
                item.subproductoCodigo,
                item.subproductoNombre,
                item.traz ? 'Si' : 'No' // Se exporta texto legible para el usuario
            ]
        },

        // --- 5. Configuración de Importación (Carga Masiva) ---
        /**
         * Define cómo se procesará un archivo Excel importado.
         */
        importConfig: {
            // La clave única para identificar si un registro ya existe y debe ser actualizado.
            uniqueKey: 'subproductoCodigo',
            
            // Define qué columnas del Excel deben tratarse como booleanos.
            booleanFields: ['traz'],
            
            // Mapea las columnas del Excel a las propiedades del objeto en la base de datos.
            headers: {
                'CategoriaCodigo': 'categoriaCodigo',
                'CategoriaNombre': 'categoriaNombre',
                'ProductoCodigo': 'productoCodigo',
                'ProductoNombre': 'productoNombre',
                'ActividadCodigo': 'actividadCodigo',
                'ActividadNombre': 'actividadNombre',
                'SubproductoCodigo': 'subproductoCodigo',
                'SubproductoNombre': 'subproductoNombre',
                'Trazador': 'traz' // El valor de esta columna ('Si', 'No', etc.) se convertirá a true/false
            }
        }
    });
}