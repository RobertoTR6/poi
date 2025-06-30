import { setupCrudController } from '../modules/crud.js';
import { dataService } from '../modules/data.js';

const menuStructure = {
    configuracion: { name: 'Configuración' },
    planeamiento: { name: 'Planeamiento' },
    cmn: { name: 'CMN' },
    evaluacion: { name: 'Evaluación' },
};

export function init() {
    setupCrudController({
        collection: 'users',
        getId: item => item.id,
        tableBodyId: 'tableUsuario',
        searchInputId: 'searchUsuario',
        createBtnId: 'btnNuevoUsuario',
        downloadBtnId: 'downloadUsuario',
        importBtnId: 'btnImportarUsuario',
        fileImporterId: 'file-importer-usuario',
        modalId: 'modal-usuario',
        formId: 'form-usuario',
        modalTitleId: 'modalUsuarioTitle',
        modalTitles: { create: 'Registrar Usuario', edit: 'Modificar Usuario' },
        paginationContainerId: 'pagination-usuario',
        uniqueField: 'usuario',

        renderRow: async (item) => {
            const cc = await dataService.getCentroDeCostoPorCodigo(item.centroCostoCodigo);
            const permStr = Object.keys(item.permisos || {}).filter(p => item.permisos[p]).map(p => `${p.charAt(0).toUpperCase()}:${item.permisos[p].charAt(0).toUpperCase()}`).join(', ');
            return `
                <td>${item.nombre}</td>
                <td>${item.usuario}</td>
                <td>${cc?.nombre ?? 'N/A'}</td>
                <td>${permStr}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-modify" title="Modificar"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-danger btn-delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
        },

        onBeforeOpenModal: async (form) => {
            const permCont = form.querySelector('#permissions-container-usuario');
            permCont.innerHTML = '';
            Object.keys(menuStructure).forEach(modId => {
                permCont.innerHTML += `<div class="permission-module"><div class="module-name"><input type="checkbox" id="check-${modId}" name="${modId}"><label for="check-${modId}">${menuStructure[modId].name}</label></div><div class="permission-options"><label><input type="radio" name="perm-${modId}" value="editar" disabled> Editar</label><label><input type="radio" name="perm-${modId}" value="visualizar" disabled> Visualizar</label></div></div>`;
                const check = form.querySelector(`#check-${modId}`);
                check.onchange = () => form.querySelectorAll(`input[name="perm-${modId}"]`).forEach(r => r.disabled = !check.checked);
            });
            const uSel = form.elements.unidad, sSel = form.elements.subunidad, cSel = form.elements.centroCostoCodigo;
            uSel.innerHTML = '<option value="">Seleccione...</option>';
            (await dataService.getAll('unidades')).forEach(u => uSel.add(new Option(`${u.codigo} - ${u.nombre}`, u.codigo)));
            uSel.onchange = async () => { sSel.innerHTML='<option value="">Seleccione...</option>'; if(uSel.value) (await dataService.getSubunidadesPorUnidad(uSel.value)).forEach(s => sSel.add(new Option(`${s.codigo} - ${s.nombre}`, s.codigo))); await sSel.onchange(); };
            sSel.onchange = async () => { cSel.innerHTML='<option value="">Seleccione...</option>'; if(sSel.value) (await dataService.getCentrosDeCostoPorSubunidad(sSel.value)).forEach(c => cSel.add(new Option(`${c.codigo} - ${c.nombre}`, c.codigo))); };
        },

        fillForm: async (form, item) => {
            Object.keys(item.permisos || {}).forEach(modId => { const check = form.querySelector(`#check-${modId}`); if (check && item.permisos[modId]) { check.checked = true; check.dispatchEvent(new Event('change')); const radio = form.querySelector(`input[name="perm-${modId}"][value="${item.permisos[modId]}"]`); if(radio) radio.checked = true; } });
            const cc = await dataService.getCentroDeCostoPorCodigo(item.centroCostoCodigo);
            if(cc) { const s = await dataService.getSubunidadPorCodigo(cc.subunidadCodigo); if(s) { form.elements.unidad.value = s.unidadCodigo; await form.elements.unidad.onchange(); form.elements.subunidad.value = s.codigo; await form.elements.subunidad.onchange(); form.elements.centroCostoCodigo.value = cc.codigo; } }
            form.elements.nombre.value = item.nombre; form.elements.usuario.value = item.usuario; form.elements.clave.value = ""; form.elements.clave.placeholder = 'Dejar en blanco para no cambiar';
        },

        // --- FUNCIÓN readForm CORREGIDA Y SIMPLIFICADA ---
        // Esta es la versión correcta y simplificada que no maneja la ID.
        readForm: (form) => {
            const permisos = {};
            Object.keys(menuStructure).forEach(modId => {
                const check = form.querySelector(`#check-${modId}`);
                permisos[modId] = check?.checked ? (form.querySelector(`input[name="perm-${modId}"]:checked`)?.value || 'visualizar') : null;
            });

            const data = {
                nombre: form.elements.nombre.value.trim(),
                usuario: form.elements.usuario.value.trim(),
                centroCostoCodigo: form.elements.centroCostoCodigo.value,
                permisos
            };

            // Solo añadimos la clave al objeto de datos si el usuario escribió algo,
            // de lo contrario, no se modifica la clave existente al editar.
            const clave = form.elements.clave.value;
            if (clave) {
                data.clave = clave;
            }

            return data;
        },

        csvConfig: { 
            filename: 'usuarios_plantilla.xlsx',
            headers: 'Nombre,Usuario,Clave,CodigoCentroCosto',
            formatRow: (item) => [item.nombre, item.usuario, '', item.centroCostoCodigo]
        },

        importConfig: {
            uniqueKey: 'usuario',
            headers: {
                'Nombre': 'nombre',
                'Usuario': 'usuario',
                'Clave': 'clave',
                'CodigoCentroCosto': 'centroCostoCodigo'
            }
        }
    });
}