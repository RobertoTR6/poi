import { setupCrudController } from '../modules/crud.js';
import { dataService } from '../modules/data.js';

export function init() {
    setupCrudController({
        collection: 'centrosDeCosto',
        getId: item => item.id,
        tableBodyId: 'tableCosto',
        searchInputId: 'searchCosto',
        createBtnId: 'btnNuevoCosto',
        downloadBtnId: 'downloadCosto',
        importBtnId: 'btnImportarCosto',
        fileImporterId: 'file-importer-centro-costo',
        modalId: 'modal-centro-costo',
        formId: 'form-centro-costo',
        modalTitleId: 'modalCostoTitle',
        modalTitles: { create: 'Registrar Centro de Costo', edit: 'Modificar Centro de Costo' },
        paginationContainerId: 'pagination-centro-costo',
        uniqueField: 'codigo',

        renderRow: async (item) => {
            const s = await dataService.getSubunidadPorCodigo(item.subunidadCodigo);
            const u = s ? await dataService.getUnidadPorCodigo(s.unidadCodigo) : null;
            return `
                <td>${u?.nombre ?? 'N/A'}</td>
                <td>${s?.nombre ?? 'N/A'}</td>
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
        onBeforeOpenModal: async (form) => {
            const uSel = form.elements.unidad;
            const sSel = form.elements.subunidadCodigo;
            uSel.innerHTML = '<option value="">Seleccione...</option>';
            const unidades = await dataService.getAll('unidades');
            unidades.forEach(u => uSel.add(new Option(`${u.codigo} - ${u.nombre}`, u.codigo)));
            uSel.onchange = async () => {
                sSel.innerHTML = '<option value="">Seleccione...</option>';
                if (uSel.value) {
                    const subunidades = await dataService.getSubunidadesPorUnidad(uSel.value);
                    subunidades.forEach(s => sSel.add(new Option(`${s.codigo} - ${s.nombre}`, s.codigo)));
                }
            };
        },
        fillForm: async (form, item) => {
            const s = await dataService.getSubunidadPorCodigo(item.subunidadCodigo);
            if (s) {
                form.elements.unidad.value = s.unidadCodigo;
                await form.elements.unidad.onchange(); 
                form.elements.subunidadCodigo.value = item.subunidadCodigo;
            }
            form.elements.codigo.value = item.codigo;
            form.elements.nombre.value = item.nombre;
        },
        readForm: (form) => ({
            subunidadCodigo: form.elements.subunidadCodigo.value,
            codigo: form.elements.codigo.value.trim(),
            nombre: form.elements.nombre.value.trim()
        }),
        csvConfig: { 
            filename: 'centros_costo_plantilla.xlsx', 
            headers: 'CodigoSubunidad,Codigo,Nombre', 
            formatRow: (item) => [item.subunidadCodigo, item.codigo, item.nombre]
        },
        importConfig: {
            uniqueKey: 'codigo',
            headers: { 'CodigoSubunidad': 'subunidadCodigo', 'Codigo': 'codigo', 'Nombre': 'nombre' }
        }
    });
}