import { setupCrudController } from '../modules/crud.js';

export function init() {
    setupCrudController({
        collection: 'unidades',
        getId: item => item.id,
        tableBodyId: 'tableUnidad',
        searchInputId: 'searchUnidad',
        createBtnId: 'btnNuevoUnidad',
        downloadBtnId: 'downloadUnidad',
        importBtnId: 'btnImportarUnidad',
        fileImporterId: 'file-importer-unidad',
        modalId: 'modal-unidad',
        formId: 'form-unidad',
        modalTitleId: 'modalUnidadTitle',
        modalTitles: { create: 'Registrar Unidad', edit: 'Modificar Unidad' },
        paginationContainerId: 'pagination-unidad',
        uniqueField: 'codigo',

        renderRow: (item) => `
            <td>${item.codigo}</td>
            <td>${item.nombre}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-modify" title="Modificar"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn btn-danger btn-delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        `,

        fillForm: (form, item) => {
            form.elements.codigo.value = item.codigo;
            form.elements.nombre.value = item.nombre;
        },

        readForm: (form) => ({
            codigo: form.elements.codigo.value.trim(),
            nombre: form.elements.nombre.value.trim()
        }),

        csvConfig: {
            filename: 'unidades_plantilla.xlsx',
            headers: 'Código,Nombre',
            formatRow: item => [item.codigo, item.nombre]
        },

        importConfig: {
            uniqueKey: 'codigo',
            headers: { 'Código': 'codigo', 'Nombre': 'nombre' }
        }
    });
}