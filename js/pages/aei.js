import { setupCrudController } from '../modules/crud.js';
import { dataService } from '../modules/data.js';

export function init() {
    setupCrudController({
        collection: 'aeis', getId: item => item.id,
        tableBodyId: 'tableAei', searchInputId: 'searchAei', createBtnId: 'btnNuevoAei',
        downloadBtnId: 'downloadAei', importBtnId: 'btnImportarAei', fileImporterId: 'file-importer-aei',
        modalId: 'modal-aei', formId: 'form-aei', modalTitleId: 'modalAeiTitle',
        modalTitles: { create: 'Registrar AEI', edit: 'Modificar AEI' },
        paginationContainerId: 'pagination-aei',
        
        renderRow: async (item) => {
            const oei = await dataService.getOeiPorCodigo(item.oeiCodigo);
            return `
                <td>${oei?.nombre ?? 'N/A'}</td>
                <td>${item.codigo}</td>
                <td>${item.nombre}</td>
                <td><button class="btn btn-info btn-modify" title="Modificar"><i class="fas fa-pencil-alt"></i></button><button class="btn btn-danger btn-delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button></td>
            `;
        },
        onBeforeOpenModal: async (form) => { const sel = form.elements.oeiCodigo; sel.innerHTML = '<option value="">Seleccione...</option>'; (await dataService.getAll('oeis')).forEach(o => sel.add(new Option(`${o.codigo} - ${o.nombre}`, o.codigo))); },
        fillForm: (form, item) => { form.elements.oeiCodigo.value = item.oeiCodigo; form.elements.codigo.value = item.codigo; form.elements.nombre.value = item.nombre; },
        readForm: (form, item) => ({ id: item?.id, oeiCodigo: form.elements.oeiCodigo.value, codigo: form.elements.codigo.value.trim(), nombre: form.elements.nombre.value.trim() }),
        csvConfig: { filename: 'acciones_estrategicas_plantilla.xlsx', headers: 'CodigoOEI,Codigo,Denominacion', formatRow: (item) => [item.oeiCodigo, item.codigo, item.nombre] },
        importConfig: { uniqueKey: 'codigo', headers: { 'CodigoOEI': 'oeiCodigo', 'Codigo': 'codigo', 'Denominacion': 'nombre' } }
    });
}