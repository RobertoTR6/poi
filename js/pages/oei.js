import { setupCrudController } from '../modules/crud.js';
import { dataService } from '../modules/data.js';

export function init() {
    setupCrudController({
        collection: 'oeis', getId: item => item.id,
        tableBodyId: 'tableOei', searchInputId: 'searchOei', createBtnId: 'btnNuevoOei',
        downloadBtnId: 'downloadOei', importBtnId: 'btnImportarOei', fileImporterId: 'file-importer-oei',
        modalId: 'modal-oei', formId: 'form-oei', modalTitleId: 'modalOeiTitle',
        modalTitles: { create: 'Registrar OEI', edit: 'Modificar OEI' },
        paginationContainerId: 'pagination-oei',
        uniqueField: 'codigo',
        
        renderRow: async (item) => {
            const plan = await dataService.getPlanPorId(item.planId);
            return `
                <td>${plan?.nombre ?? 'N/A'}</td>
                <td>${item.codigo}</td>
                <td>${item.nombre}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-modify" title="Modificar"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-danger btn-delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
        },
        onBeforeOpenModal: async (form) => { const sel = form.elements.planId; sel.innerHTML = '<option value="">Seleccione...</option>'; (await dataService.getAll('planes')).forEach(p => sel.add(new Option(p.nombre, p.id))); },
        fillForm: (form, item) => { form.elements.planId.value = item.planId; form.elements.codigo.value = item.codigo; form.elements.nombre.value = item.nombre; },
        readForm: (form) => ({  
            planId: form.elements.planId.value, 
            codigo: form.elements.codigo.value.trim(), 
            nombre: form.elements.nombre.value.trim()
        }),
        csvConfig: { filename: 'objetivos_estrategicos_plantilla.xlsx', headers: 'PlanID,Codigo,Denominacion', formatRow: (item) => [item.planId, item.codigo, item.nombre] },
        importConfig: { uniqueKey: 'codigo', headers: { 'PlanID': 'planId', 'Codigo': 'codigo', 'Denominacion': 'nombre' } }
    });
}