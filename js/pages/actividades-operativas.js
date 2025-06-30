import { dataService } from '../modules/data.js';
import { notifications } from '../modules/notifications.js';

let allActividades = [];
let editMode = false;
let currentEditingId = null;
let activeChainData = [];

// =======================================================
// LÓGICA DE RENDERIZADO Y VISUALIZACIÓN
// =======================================================

/**
 * Renderiza la lista de actividades operativas en el contenedor principal.
 * @param {HTMLElement} container El elemento donde se renderizará la lista.
 */
async function renderActividades(container) {
    if (!container) return;
    const searchTerm = document.getElementById('searchAO')?.value.toLowerCase() || '';
    
    const filteredData = allActividades.filter(ao => {
        // El nombre a buscar ahora prioriza el nombre manual, luego el de subproducto, y finalmente el de actividad.
        const aoNombre = (ao.nombreActividad || ao.fuenteCadena?.subproductoNombre || ao.fuenteCadena?.actividadNombre || '').toLowerCase();
        return ao.codigo.toLowerCase().includes(searchTerm) || aoNombre.includes(searchTerm);
    });

    if (filteredData.length === 0) {
        container.innerHTML = '<p>No se encontraron actividades operativas.</p>';
        return;
    }

    const html = filteredData.map(ao => {
        const totalProgramado = Object.values(ao.programado || {}).reduce((sum, val) => sum + Number(val), 0);
        const aoNombre = ao.nombreActividad || ao.fuenteCadena?.subproductoNombre || ao.fuenteCadena?.actividadNombre || 'Nombre no disponible';
        let trazadorHtml = '';
        if (ao.pertenecePrograma && typeof ao.fuenteCadena?.traz !== 'undefined') {
            const esTrazador = ao.fuenteCadena.traz;
            const texto = esTrazador ? 'Trazador' : 'No Trazador';
            const claseCss = esTrazador ? 'trazador' : 'no-trazador';
            trazadorHtml = `<span class="ao-status-tag ${claseCss}">${texto}</span>`;
        }
        const monthInputsHTML = Object.entries(ao.programado || {}).map(([key, value]) => `
            <td><input type="number" class="programado-input" data-month="${key}" value="${value || 0}" min="0"></td>
        `).join('');

        return `
            <div class="ao-item" data-id="${ao.id}">
                <div class="ao-header">
                    <button class="ao-toggle-btn"><i class="fas fa-plus"></i></button>
                    <span class="ao-codigo">${ao.codigo}</span>
                    <span class="ao-nombre">${aoNombre}</span>
                    ${trazadorHtml}
                    <span class="ao-unidad-medida">${ao.unidadMedida?.nombre || ''}</span>
                    <div class="ao-actions">
                        <button class="btn-modify-ao"><i class="fas fa-pencil-alt"></i> Modificar</button>
                        <button class="btn-delete-ao"><i class="fas fa-trash-alt"></i> Eliminar</button>
                    </div>
                </div>
                <div class="ao-body">
                    <table>
                        <thead>
                            <tr><th>Mes</th><th>ENE</th><th>FEB</th><th>MAR</th><th>ABR</th><th>MAY</th><th>JUN</th><th>JUL</th><th>AGO</th><th>SET</th><th>OCT</th><th>NOV</th><th>DIC</th><th>TOTAL</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Programado</td>${monthInputsHTML}<td class="total-programado">${totalProgramado}</td></tr>
                        </tbody>
                    </table>
                    <div class="programacion-footer">
                        <button class="btn btn-primary btn-save-programacion">Guardar Programación</button>
                    </div>
                </div>
            </div>`;
    }).join('');
    container.innerHTML = html;
}

/**
 * Carga todos los datos necesarios y luego renderiza la vista.
 * @param {HTMLElement} container El elemento donde se renderizará la lista.
 */
async function loadAndRender(container) {
    const [actividades, ppr, c9001, aeis, um] = await Promise.all([
        dataService.getAll('actividadesOperativas'), dataService.getAll('cadenasPPR'), dataService.getAll('cadenas9001'),
        dataService.getAll('aeis'), dataService.getAll('unidadesDeMedida')
    ]);
    const pprMap = new Map(ppr.map(p => [p.id, p]));
    const c9001Map = new Map(c9001.map(c => [c.id, c]));
    allActividades = actividades.map(ao => ({
        ...ao,
        accionEstrategica: aeis.find(a => a.id === ao.accionEstrategicaId),
        unidadMedida: um.find(u => u.id === ao.unidadMedidaId),
        fuenteCadena: ao.pertenecePrograma ? pprMap.get(ao.fuenteCadenaId) : c9001Map.get(ao.fuenteCadenaId)
    }));
    await renderActividades(container);
}

// =======================================================
// LÓGICA DEL MODAL Y FORMULARIO
// =======================================================

// --- Funciones Helper para popular selects en cascada ---
function populateCategorias(form, data) { const [sel, p, a] = [form.elements.categoria, form.elements.producto, form.elements.actividad]; [sel, p, a].forEach(s => s.innerHTML = '<option value="">Seleccione...</option>'); const unique = [...new Map(data.map(item => [item.categoriaCodigo, {codigo: item.categoriaCodigo, nombre: item.categoriaNombre}])).values()]; unique.forEach(cat => sel.add(new Option(`${cat.codigo} - ${cat.nombre}`, cat.codigo))); }
function populateProductos(form, data) { const [sel, a] = [form.elements.producto, form.elements.actividad]; [sel, a].forEach(s => s.innerHTML = '<option value="">Seleccione...</option>'); const cat = form.elements.categoria.value; if (!cat) return; const filtered = data.filter(item => item.categoriaCodigo === cat); const unique = [...new Map(filtered.map(item => [item.productoCodigo, {codigo: item.productoCodigo, nombre: item.productoNombre}])).values()]; unique.forEach(prod => sel.add(new Option(`${prod.codigo} - ${prod.nombre}`, prod.codigo))); }
function populateActividades(form, data) { const sel = form.elements.actividad; sel.innerHTML = '<option value="">Seleccione...</option>'; const [cat, prod] = [form.elements.categoria.value, form.elements.producto.value]; if (!prod) return; const filtered = data.filter(item => item.categoriaCodigo === cat && item.productoCodigo === prod); const unique = [...new Map(filtered.map(item => [item.actividadCodigo, {codigo: item.actividadCodigo, nombre: item.actividadNombre}])).values()]; unique.forEach(act => sel.add(new Option(`${act.codigo} - ${act.nombre}`, act.codigo))); }
function populateSubproductos(form, data) { const sel = form.elements.fuenteCadenaId; sel.innerHTML = '<option value="">Seleccione...</option>'; const act = form.elements.actividad.value; if (!act) return; const filtered = data.filter(item => item.actividadCodigo === act); filtered.forEach(item => sel.add(new Option(item.subproductoNombre || item.actividadNombre, item.id))); }

/**
 * Alterna la visibilidad y el estado (required/disabled) entre el select y el input de texto.
 * @param {boolean} isProgramaPresupuestal True si se debe mostrar el select, false para el input.
 */
function toggleSubproductoInput(isProgramaPresupuestal) {
    const subproductoSelect = document.getElementById('ao-actividad-operativa-select');
    const subproductoInput = document.getElementById('ao-actividad-operativa-input');

    subproductoSelect.style.display = isProgramaPresupuestal ? 'block' : 'none';
    subproductoSelect.disabled = !isProgramaPresupuestal;
    subproductoSelect.required = isProgramaPresupuestal;

    subproductoInput.style.display = isProgramaPresupuestal ? 'none' : 'block';
    subproductoInput.disabled = isProgramaPresupuestal;
    subproductoInput.required = !isProgramaPresupuestal;
}

/**
 * Abre y configura el modal para crear una nueva actividad o editar una existente.
 * @param {HTMLFormElement} form El formulario del modal.
 * @param {HTMLElement} modal El elemento del modal.
 * @param {string|null} id El ID del item a editar, o null para crear.
 */
async function openModalFor(form, modal, id = null) {
    form.reset();
    document.getElementById('fieldset-fuente-datos').disabled = true;

    if (id) { // --- MODO EDICIÓN ---
        editMode = true; currentEditingId = id;
        document.getElementById('modalAOTitle').textContent = 'Modificar Actividad Operativa';
        const ao = allActividades.find(a => a.id === id);
        if (ao) {
            form.elements.codigo.value = ao.codigo;
            form.elements.accionEstrategicaId.value = ao.accionEstrategicaId;
            form.elements.unidadMedidaId.value = ao.unidadMedidaId;
            
            const radio = ao.pertenecePrograma ? form.elements.pertenecePrograma[0] : form.elements.pertenecePrograma[1];
            radio.checked = true;
            
            toggleSubproductoInput(ao.pertenecePrograma);

            const sourceCollection = ao.pertenecePrograma ? 'cadenasPPR' : 'cadenas9001';
            activeChainData = await dataService.getAll(sourceCollection);
            document.getElementById('fieldset-fuente-datos').disabled = false;
            
            populateCategorias(form, activeChainData);
            form.elements.categoria.value = ao.fuenteCadena.categoriaCodigo;
            populateProductos(form, activeChainData);
            form.elements.producto.value = ao.fuenteCadena.productoCodigo;
            populateActividades(form, activeChainData);
            form.elements.actividad.value = ao.fuenteCadena.actividadCodigo;

            if (ao.pertenecePrograma) {
                populateSubproductos(form, activeChainData);
                form.elements.fuenteCadenaId.value = ao.fuenteCadenaId;
            } else {
                form.elements.nombreActividad.value = ao.nombreActividad || ao.fuenteCadena.actividadNombre;
            }
        }
    } else { // --- MODO CREACIÓN ---
        editMode = false; currentEditingId = null;
        document.getElementById('modalAOTitle').textContent = 'Registrar Actividad Operativa';
        const allAOs = await dataService.getAll('actividadesOperativas');
        const nextIdNumber = allAOs.length > 0 ? Math.max(...allAOs.map(ao => parseInt(ao.codigo.replace('AOI', ''), 10) || 0)) + 1 : 760;
        form.elements.codigo.value = `AOI${String(nextIdNumber).padStart(4, '0')}`;
        
        form.elements.pertenecePrograma[1].checked = true; // "No" por defecto
        toggleSubproductoInput(false);
    }
    modal.style.display = 'flex';
}


// =======================================================
// INICIALIZACIÓN Y LISTENERS DE EVENTOS
// =======================================================
export async function init() {
    const container = document.getElementById('actividades-operativas-container');
    const modal = document.getElementById('modal-actividad-operativa');
    const form = document.getElementById('form-actividad-operativa');
    const btnNuevaAO = document.getElementById('btnNuevaAO');
    const searchInput = document.getElementById('searchAO');
    
    // Poblar selects iniciales del modal una sola vez
    const [aeiSelect, umSelect] = [form.elements.accionEstrategicaId, form.elements.unidadMedidaId];
    const [aeis, unidadesMedida] = await Promise.all([dataService.getAll('aeis'), dataService.getAll('unidadesDeMedida')]);
    if (aeiSelect) { aeiSelect.innerHTML = '<option value="">Seleccione...</option>'; aeis.forEach(aei => aeiSelect.add(new Option(`${aei.codigo} - ${aei.nombre}`, aei.id))); }
    if (umSelect) { umSelect.innerHTML = '<option value="">Seleccione...</option>'; unidadesMedida.forEach(um => umSelect.add(new Option(`${um.codigo} - ${um.nombre}`, um.id))); }
    
    await loadAndRender(container);
    
    // --- LISTENERS PRINCIPALES ---
    searchInput.addEventListener('input', () => renderActividades(container));
    btnNuevaAO.addEventListener('click', () => openModalFor(form, modal, null));
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
    
    // Listener para los radio buttons
    form.elements.pertenecePrograma.forEach(radio => {
        radio.addEventListener('change', async () => {
            const esPrograma = radio.value === 'si';
            toggleSubproductoInput(esPrograma);
            const source = esPrograma ? 'cadenasPPR' : 'cadenas9001';
            activeChainData = await dataService.getAll(source);
            populateCategorias(form, activeChainData);
            document.getElementById('fieldset-fuente-datos').disabled = false;
        });
    });

    // Listeners para los selects en cascada
    form.elements.categoria.addEventListener('change', () => populateProductos(form, activeChainData));
    form.elements.producto.addEventListener('change', () => populateActividades(form, activeChainData));
    form.elements.actividad.addEventListener('change', () => {
        if (form.elements.pertenecePrograma.value === 'si') {
            populateSubproductos(form, activeChainData);
        }
    });

    // Listener para el SUBMIT del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            if (!form.checkValidity()) {
                form.reportValidity(); // Muestra validaciones nativas del navegador
                notifications.showToast('Por favor, complete todos los campos requeridos.', 'error');
                return;
            }
            
            const pertenecePrograma = form.elements.pertenecePrograma.value === 'si';
            const programadoData = editMode
                ? (allActividades.find(a => a.id === currentEditingId)?.programado || {})
                : { ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, set: 0, oct: 0, nov: 0, dic: 0 };
            
            const newAO = {
                id: editMode ? currentEditingId : `aoi-${Date.now()}`,
                codigo: form.elements.codigo.value,
                accionEstrategicaId: form.elements.accionEstrategicaId.value,
                unidadMedidaId: form.elements.unidadMedidaId.value,
                pertenecePrograma,
                programado: programadoData,
                fuenteCadenaId: null,
                nombreActividad: null
            };

            if (pertenecePrograma) {
                newAO.fuenteCadenaId = form.elements.fuenteCadenaId.value;
            } else {
                const idActividad = activeChainData.find(c => c.actividadCodigo === form.elements.actividad.value)?.id;
                newAO.fuenteCadenaId = idActividad;
                newAO.nombreActividad = form.elements.nombreActividad.value.trim();
            }

            if (editMode) { await dataService.update('actividadesOperativas', newAO); } 
            else { await dataService.add('actividadesOperativas', newAO); }
            
            notifications.showToast('Actividad Operativa guardada exitosamente.', 'success');
            modal.style.display = 'none';
            await loadAndRender(container);
        } catch (error) { 
            console.error('Error al guardar la actividad operativa:', error);
            notifications.showToast('Ocurrió un error inesperado al guardar.', 'error'); 
        }
    });

    // Listeners delegados en el contenedor de actividades
    container.addEventListener('click', async (e) => {
        const aoItem = e.target.closest('.ao-item');
        const id = aoItem?.dataset.id;

        if (e.target.closest('.btn-save-programacion')) {
            if (!id) return;
            const originalAO = await dataService.getById('actividadesOperativas', id);
            if (!originalAO) return;
            const newProgramado = { ...originalAO.programado };
            aoItem.querySelectorAll('.programado-input').forEach(input => {
                newProgramado[input.dataset.month] = parseInt(input.value, 10) || 0;
            });
            await dataService.update('actividadesOperativas', { ...originalAO, programado: newProgramado });
            notifications.showToast('Programación guardada exitosamente.', 'success');
            await loadAndRender(container); 
        }
        else if (e.target.closest('.btn-modify-ao')) {
            if (id) openModalFor(form, modal, id);
        }
        else if (e.target.closest('.btn-delete-ao')) {
            if (id && await notifications.showConfirm('Confirmar Eliminación', '¿Está seguro de eliminar esta Actividad Operativa?')) {
                await dataService.delete('actividadesOperativas', id);
                notifications.showToast('Actividad eliminada.', 'info');
                await loadAndRender(container);
            }
        }
        else if (e.target.closest('.ao-header')) {
            aoItem.classList.toggle('open');
            const icon = aoItem.querySelector('.ao-toggle-btn i');
            icon.classList.toggle('fa-plus');
            icon.classList.toggle('fa-minus');
        }
    });
}