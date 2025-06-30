import { setupCrudController } from '../modules/crud.js';

export function init() {
    setupCrudController({
        collection: 'unidadesDeMedida', getId: item => item.id,
        tableBodyId: 'tableMedida', searchInputId: 'searchMedida', createBtnId: 'btnNuevoMedida',
        downloadBtnId: 'downloadMedida', importBtnId: 'btnImportarMedida', fileImporterId: 'file-importer-unidad-medida',
        modalId: 'modal-medida', formId: 'form-medida', modalTitleId: 'modalMedidaTitle',
        modalTitles: { create: 'Registrar U.M.', edit: 'Modificar U.M.' },
        paginationContainerId: 'pagination-unidad-medida',
        uniqueField: 'codigo',

        renderRow: (item) => `
            <td>${item.codigo}</td>
            <td>${item.nombre}</td>
            <td><button class="btn btn-info btn-modify" title="Modificar"><i class="fas fa-pencil-alt"></i></button><button class="btn btn-danger btn-delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button></td>
        `,

        fillForm: (form, item) => { form.elements.codigo.value = item.codigo; form.elements.nombre.value = item.nombre; },
        readForm: (form) => ({ 
            codigo: form.elements.codigo.value.trim(), 
            nombre: form.elements.nombre.value.trim() 
        }),
        csvConfig: { filename: 'unidades_medida_plantilla.xlsx', headers: 'Código,Nombre', formatRow: item => [item.codigo, item.nombre] },
        importConfig: { uniqueKey: 'codigo', headers: { 'Código': 'codigo', 'Nombre': 'nombre' } }
    });
}