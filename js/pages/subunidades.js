import { setupCrudController } from '../modules/crud.js';
import { dataService } from '../modules/data.js';

export function init() {
    setupCrudController({
        collection: 'subunidades',
        getId: item => item.id,
        tableBodyId: 'tableSubunidad',
        searchInputId: 'searchSubunidad',
        createBtnId: 'btnNuevoSubunidad',
        downloadBtnId: 'downloadSubunidad',
        importBtnId: 'btnImportarSubunidad',
        fileImporterId: 'file-importer-subunidad',
        modalId: 'modal-subunidad',
        formId: 'form-subunidad',
        modalTitleId: 'modalSubunidadTitle',
        modalTitles: { create: 'Registrar Subunidad', edit: 'Modificar Subunidad' },
        uniqueField: 'codigo',

        // --- ESTA ES LA FUNCIÓN CORREGIDA ---
        renderRow: async (item) => {
            const u = await dataService.getUnidadPorCodigo(item.unidadCodigo);
            return `
                <td>${u?.nombre ?? 'Unidad no encontrada'}</td>
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
        // --- FIN DE LA CORRECCIÓN ---

        onBeforeOpenModal: async (form) => {
            const sel = form.elements.unidadCodigo;
            sel.innerHTML = '<option value="">Seleccione...</option>';
            const unidades = await dataService.getAll('unidades');
            unidades.forEach(u => sel.add(new Option(`${u.codigo} - ${u.nombre}`, u.codigo)));
        },

        fillForm: (form, item) => {
            form.elements.unidadCodigo.value = item.unidadCodigo;
            form.elements.codigo.value = item.codigo;
            form.elements.nombre.value = item.nombre;
        },

        readForm: (form) => ({
            unidadCodigo: form.elements.unidadCodigo.value,
            codigo: form.elements.codigo.value.trim(),
            nombre: form.elements.nombre.value.trim()
        }),

        csvConfig: {
            filename: 'subunidades_plantilla.xlsx',
            headers: 'CodigoUnidad,Codigo,Nombre',
            formatRow: (item) => [item.unidadCodigo, item.codigo, item.nombre]
        },

        importConfig: {
            uniqueKey: 'codigo',
            headers: {
                'CodigoUnidad': 'unidadCodigo',
                'Codigo': 'codigo',
                'Nombre': 'nombre'
            }
        }
    });
}