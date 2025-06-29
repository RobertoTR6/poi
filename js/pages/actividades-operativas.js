import { dataService } from '../modules/data.js';

let allActividades = [];
let editMode = false;
let currentEditingId = null;
let activeChainData = [];

// --- CAMBIO CLAVE: MODIFICAMOS RENDERACTIVIDADES PARA QUE GENERE INPUTS ---
async function renderActividades(container) {
    if (!container) return;
    const searchTerm = document.getElementById('searchAO')?.value.toLowerCase() || '';
    const filteredData = allActividades.filter(ao => {
        const aoNombre = (ao.fuenteCadena?.subproductoNombre || ao.fuenteCadena?.actividadNombre || '').toLowerCase();
        return ao.codigo.toLowerCase().includes(searchTerm) || aoNombre.includes(searchTerm);
    });
    if (filteredData.length === 0) {
        container.innerHTML = '<p>No se encontraron actividades operativas.</p>';
        return;
    }
    const html = filteredData.map(ao => {
        const totalProgramado = Object.values(ao.programado).reduce((sum, val) => sum + Number(val), 0);
        const aoNombre = ao.fuenteCadena?.subproductoNombre || ao.fuenteCadena?.actividadNombre || 'Nombre no disponible';
        
        // --- CAMBIO CLAVE: GENERAMOS LOS INPUTS EN LUGAR DE TEXTO ESTÁTICO ---
        const monthInputsHTML = Object.entries(ao.programado).map(([key, value]) => `
            <td>
                <input type="number" class="programado-input" data-month="${key}" value="${value || 0}" min="0">
            </td>
        `).join('');

        return `
            <div class="ao-item" data-id="${ao.id}">
                <div class="ao-header">
                    <button class="ao-toggle-btn"><i class="fas fa-plus"></i></button>
                    <span class="ao-codigo">${ao.codigo}</span>
                    <span class="ao-nombre">${aoNombre}</span>
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
                            <tr>
                                <td>Programado</td>
                                ${monthInputsHTML} <!-- Aquí usamos la nueva variable con los inputs -->
                                <td class="total-programado">${totalProgramado}</td>
                            </tr>
                        </tbody>
                    </table>
                    <!-- --- CAMBIO CLAVE: AÑADIMOS EL BOTÓN DE GUARDAR --- -->
                    <div class="programacion-footer">
                        <button class="btn btn-primary btn-save-programacion">Guardar Programación</button>
                    </div>
                </div>
            </div>`;
    }).join('');
    container.innerHTML = html;
}

// ... El resto de funciones (populate, openModal, etc.) no necesitan cambios y se mantienen igual.
function populateCategorias(form) { const [categoriaSelect, productoSelect, actividadSelect, subproductoSelect] = [form.elements.categoria, form.elements.producto, form.elements.actividad, form.elements.fuenteCadenaId]; [categoriaSelect, productoSelect, actividadSelect, subproductoSelect].forEach(sel => sel.innerHTML = '<option value="">Seleccione...</option>'); const uniqueCategories = [...new Map(activeChainData.map(item => [item.categoriaCodigo, {codigo: item.categoriaCodigo, nombre: item.categoriaNombre}])).values()]; uniqueCategories.forEach(cat => categoriaSelect.add(new Option(`${cat.codigo} - ${cat.nombre}`, cat.codigo))); }
function populateProductos(form) { const [productoSelect, actividadSelect, subproductoSelect] = [form.elements.producto, form.elements.actividad, form.elements.fuenteCadenaId]; productoSelect.innerHTML = '<option value="">Seleccione...</option>'; actividadSelect.innerHTML = '<option value="">Seleccione...</option>'; subproductoSelect.innerHTML = '<option value="">Seleccione...</option>'; const selectedCategoria = form.elements.categoria.value; if (!selectedCategoria) return; const filtered = activeChainData.filter(item => item.categoriaCodigo === selectedCategoria); const uniqueProducts = [...new Map(filtered.map(item => [item.productoCodigo, {codigo: item.productoCodigo, nombre: item.productoNombre}])).values()]; uniqueProducts.forEach(prod => productoSelect.add(new Option(`${prod.codigo} - ${prod.nombre}`, prod.codigo))); }
function populateActividades(form) { const [actividadSelect, subproductoSelect] = [form.elements.actividad, form.elements.fuenteCadenaId]; actividadSelect.innerHTML = '<option value="">Seleccione...</option>'; subproductoSelect.innerHTML = '<option value="">Seleccione...</option>'; const [selectedCategoria, selectedProducto] = [form.elements.categoria.value, form.elements.producto.value]; if (!selectedProducto) return; const filtered = activeChainData.filter(item => item.categoriaCodigo === selectedCategoria && item.productoCodigo === selectedProducto); const uniqueActividades = [...new Map(filtered.map(item => [item.actividadCodigo, {codigo: item.actividadCodigo, nombre: item.actividadNombre}])).values()]; uniqueActividades.forEach(act => actividadSelect.add(new Option(`${act.codigo} - ${act.nombre}`, act.codigo))); }
function populateSubproductos(form) { const subproductoSelect = form.elements.fuenteCadenaId; subproductoSelect.innerHTML = '<option value="">Seleccione...</option>'; const selectedActividad = form.elements.actividad.value; if (!selectedActividad) return; const filtered = activeChainData.filter(item => item.actividadCodigo === selectedActividad); filtered.forEach(item => subproductoSelect.add(new Option(item.subproductoNombre || item.actividadNombre, item.id))); }
async function openModalFor(form, modal, id = null) {
    form.reset();
    document.getElementById('fieldset-fuente-datos').disabled = true;
    if (id) {
        editMode = true; currentEditingId = id;
        document.getElementById('modalAOTitle').textContent = 'Modificar Actividad Operativa';
        const ao = allActividades.find(a => a.id === id);
        if (ao) {
            form.elements.codigo.value = ao.codigo; form.elements.accionEstrategicaId.value = ao.accionEstrategicaId; form.elements.unidadMedidaId.value = ao.unidadMedidaId;
            const radio = ao.pertenecePrograma ? form.elements.pertenecePrograma[0] : form.elements.pertenecePrograma[1];
            radio.checked = true;
            const sourceCollection = ao.pertenecePrograma ? 'cadenasPPR' : 'cadenas9001';
            activeChainData = await dataService.getAll(sourceCollection);
            document.getElementById('fieldset-fuente-datos').disabled = false;
            populateCategorias(form); form.elements.categoria.value = ao.fuenteCadena.categoriaCodigo;
            populateProductos(form); form.elements.producto.value = ao.fuenteCadena.productoCodigo;
            populateActividades(form); form.elements.actividad.value = ao.fuenteCadena.actividadCodigo;
            populateSubproductos(form); form.elements.fuenteCadenaId.value = ao.fuenteCadenaId;
        }
    } else {
        editMode = false; currentEditingId = null;
        document.getElementById('modalAOTitle').textContent = 'Registrar Actividad Operativa';
        const nextId = (await dataService.getAll('actividadesOperativas')).length + 759;
        form.elements.codigo.value = `AOI${nextId}`;
    }
    modal.style.display = 'flex';
}
async function loadAndRender(container) {
    const [actividades, ppr, c9001, aeis, um] = await Promise.all([
        dataService.getAll('actividadesOperativas'), dataService.getAll('cadenasPPR'), dataService.getAll('cadenas9001'),
        dataService.getAll('aeis'), dataService.getAll('unidadesDeMedida')
    ]);
    allActividades = actividades.map(ao => ({ ...ao, accionEstrategica: aeis.find(a => a.id === ao.accionEstrategicaId), unidadMedida: um.find(u => u.id === ao.unidadMedidaId), fuenteCadena: ao.pertenecePrograma ? ppr.find(p => p.id === ao.fuenteCadenaId) : c9001.find(c => c.id === ao.fuenteCadenaId) }));
    await renderActividades(container);
}

export async function init() {
    const container = document.getElementById('actividades-operativas-container');
    const modal = document.getElementById('modal-actividad-operativa');
    const form = document.getElementById('form-actividad-operativa');
    const btnNuevaAO = document.getElementById('btnNuevaAO');
    const searchInput = document.getElementById('searchAO');
    const umSelect = form.elements.unidadMedidaId;
    const aeiSelect = form.elements.accionEstrategicaId;
    const unidadesMedida = await dataService.getAll('unidadesDeMedida');
    const aeis = await dataService.getAll('aeis');
    aeiSelect.innerHTML = '<option value="">Seleccione...</option>';
    aeis.forEach(aei => aeiSelect.add(new Option(`${aei.codigo} - ${aei.nombre}`, aei.id)));
    umSelect.innerHTML = '<option value="">Seleccione...</option>';
    unidadesMedida.forEach(um => umSelect.add(new Option(`${um.codigo} - ${um.nombre}`, um.id)));
    
    await loadAndRender(container);
    searchInput.addEventListener('input', () => renderActividades(container));
    btnNuevaAO.addEventListener('click', () => openModalFor(form, modal, null));
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
    
    form.elements.pertenecePrograma.forEach(radio => {
        radio.addEventListener('change', async () => {
            const source = radio.value === 'si' ? 'cadenasPPR' : 'cadenas9001';
            activeChainData = await dataService.getAll(source);
            populateCategorias(form);
            document.getElementById('fieldset-fuente-datos').disabled = false;
        });
    });

    form.elements.categoria.addEventListener('change', () => populateProductos(form));
    form.elements.producto.addEventListener('change', () => populateActividades(form));
    form.elements.actividad.addEventListener('change', () => populateSubproductos(form));
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            if (!form.checkValidity()) {
                alert('Por favor, complete todos los campos requeridos.'); return;
            }
            const originalItem = editMode ? allActividades.find(a => a.id === currentEditingId) : null;
            const programadoData = originalItem 
                ? originalItem.programado 
                : { ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, set: 0, oct: 0, nov: 0, dic: 0 };
            const newAO = {
                id: editMode ? currentEditingId : `aoi-${Date.now()}`,
                codigo: form.elements.codigo.value,
                accionEstrategicaId: form.elements.accionEstrategicaId.value,
                pertenecePrograma: form.elements.pertenecePrograma.value === 'si',
                fuenteCadenaId: form.elements.fuenteCadenaId.value,
                unidadMedidaId: form.elements.unidadMedidaId.value,
                programado: programadoData
            };
            if (editMode) { await dataService.update('actividadesOperativas', newAO); } 
            else { await dataService.add('actividadesOperativas', newAO); }
            modal.style.display = 'none';
            await loadAndRender(container);
        } catch (error) { console.error('Error al guardar la actividad operativa:', error); alert('Ocurrió un error inesperado al guardar.'); }
    });
    
    // --- CAMBIO CLAVE: MODIFICAMOS EL LISTENER DEL CONTENEDOR PARA AÑADIR LA LÓGICA DE GUARDADO ---
    container.addEventListener('click', async (e) => {
        
        // Acción de guardar programación
        if (e.target.closest('.btn-save-programacion')) {
            const aoItem = e.target.closest('.ao-item');
            const id = aoItem?.dataset.id;
            if (!id) return;
            
            const originalAO = allActividades.find(a => a.id === id);
            if (!originalAO) return;

            const newProgramado = { ...originalAO.programado }; // Copiamos el objeto original
            const inputs = aoItem.querySelectorAll('.programado-input');

            inputs.forEach(input => {
                const month = input.dataset.month;
                const value = parseInt(input.value, 10) || 0; // Si está vacío o no es un número, usamos 0
                if (newProgramado.hasOwnProperty(month)) {
                    newProgramado[month] = value;
                }
            });

            // Creamos el objeto actualizado
            const updatedAO = { ...originalAO, programado: newProgramado };
            
            await dataService.update('actividadesOperativas', updatedAO);
            
            alert('Programación guardada exitosamente.');
            // Volvemos a cargar y renderizar para actualizar el total
            await loadAndRender(container); 
            return;
        }

        // Acciones de modificar y eliminar
        if (e.target.closest('.btn-modify-ao')) { const id = e.target.closest('.ao-item')?.dataset.id; if (id) openModalFor(form, modal, id); return; }
        if (e.target.closest('.btn-delete-ao')) {
            const id = e.target.closest('.ao-item')?.dataset.id;
            if (id && confirm('¿Está seguro de eliminar esta Actividad Operativa?')) {
                await dataService.delete('actividadesOperativas', id);
                await loadAndRender(container);
            } return;
        }

        // Acción de abrir/cerrar acordeón
        const header = e.target.closest('.ao-header');
        if (header) {
            const aoItem = header.closest('.ao-item');
            aoItem.classList.toggle('open');
            header.querySelector('.ao-toggle-btn i').classList.toggle('fa-plus');
            header.querySelector('.ao-toggle-btn i').classList.toggle('fa-minus');
        }
    });
}