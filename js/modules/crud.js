// js/modules/crud.js

import { dataService } from './data.js';
// Importa el nuevo módulo de notificaciones
import { notifications } from './notifications.js';

/**
 * Controlador CRUD genérico, flexible y reutilizable para todas las páginas de gestión.
 * Configura todos los listeners de eventos para los elementos que existen en cada página específica.
 */
export function setupCrudController(config) {
    // --- 1. Desestructuración de la Configuración ---
    const { 
        collection, getId, tableBodyId, searchInputId, createBtnId, downloadBtnId, 
        importBtnId, fileImporterId, importConfig,
        modalId, formId, modalTitleId, modalTitles, 
        renderRow, fillForm, readForm, onBeforeOpenModal, csvConfig, filterFn,
        paginationContainerId,
        uniqueField
    } = config;
    const ITEMS_PER_PAGE = 25;

    // --- 2. Referencias a los Elementos del DOM ---
    const page = document.getElementById(tableBodyId)?.closest('.page-content');
    if (!page) { 
        console.error("CRUD Error Fatal: No se pudo encontrar el contenedor principal para la tabla:", tableBodyId); 
        return; 
    }
    const tableBody = page.querySelector(`#${tableBodyId}`);
    const searchInput = page.querySelector(`#${searchInputId}`);
    if (!tableBody || !searchInput) {
        console.error("CRUD Error Fatal: Faltan 'tableBody' o 'searchInput' en la página:", page.id);
        return;
    }
    const createBtn = createBtnId ? page.querySelector(`#${createBtnId}`) : null;
    const downloadBtn = downloadBtnId ? page.querySelector(`#${downloadBtnId}`) : null;
    const importBtn = importBtnId ? page.querySelector(`#${importBtnId}`) : null;
    const fileImporter = fileImporterId ? page.querySelector(`#${fileImporterId}`) : null;
    const modal = modalId ? document.getElementById(modalId) : null;
    const form = formId && modal ? modal.querySelector(`#${formId}`) : null;
    const modalTitle = modalTitleId && modal ? modal.querySelector(`#${modalTitleId}`) : null;
    const closeBtns = modal ? modal.querySelectorAll('.close-modal-btn') : [];
    const paginationContainer = paginationContainerId ? page.querySelector(`#${paginationContainerId}`) : null;

    // --- 3. Funciones Helper y de Estado Interno ---
    let currentlyEditingId = null;
    let localDataCache = [];
    let filteredDataCache = [];
    let currentPage = 1;

    const openModal = () => { if (modal) modal.style.display = 'flex'; };
    const closeModal = () => { if (modal) { modal.style.display = 'none'; currentlyEditingId = null; if (form) form.reset(); } };

    const handleImport = async (file) => {
        if (!file || !importConfig?.headers || !importConfig?.uniqueKey) { 
            notifications.showToast("Error de configuración: La importación necesita 'headers' y 'uniqueKey'.", 'error'); 
            return; 
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result), workbook = XLSX.read(data, { type: 'array' }), worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                if (jsonData.length === 0) { 
                    notifications.showToast("El archivo Excel está vacío.", 'info'); 
                    return; 
                }
                const uniqueKey = importConfig.uniqueKey, existingItems = await dataService.getAll(collection), existingItemsMap = new Map(existingItems.map(item => [String(item[uniqueKey]), item]));
                const headerMapping = Object.fromEntries(Object.entries(importConfig.headers).map(([k, v]) => [k.toLowerCase().trim(), v])), booleanFields = new Set(importConfig.booleanFields || []);
                let itemsAdded = 0, itemsUpdated = 0;
                for (const row of jsonData) {
                    const newItem = {};
                    for (const rawHeader in row) {
                        const normalizedHeader = rawHeader.toLowerCase().trim();
                        if (headerMapping[normalizedHeader]) { const modelKey = headerMapping[normalizedHeader]; let value = row[rawHeader]; if (booleanFields.has(modelKey)) { value = ['si', 'sí', 'yes', 'true', '1'].includes(String(value).toLowerCase().trim()); } newItem[modelKey] = value; }
                    }
                    const uniqueValue = String(newItem[uniqueKey]);
                    if (!uniqueValue) continue;
                    const existingItem = existingItemsMap.get(uniqueValue);
                    if (existingItem) { newItem.id = existingItem.id; await dataService.update(collection, newItem); itemsUpdated++; } 
                    else { await dataService.add(collection, newItem); itemsAdded++; }
                }
                notifications.showToast(`Importación completada: ${itemsAdded} nuevos, ${itemsUpdated} actualizados.`, 'success');
                localDataCache = [];
                await renderTable();
            } catch (error) { 
                console.error(`[${collection}] Error al importar:`, error); 
                notifications.showToast("Ocurrió un error crítico al procesar el archivo.", 'error'); 
            } 
            finally { if (fileImporter) fileImporter.value = ''; }
        };
        reader.readAsArrayBuffer(file);
    };

    const renderPagination = () => {
        if (!paginationContainer) return;
        const totalItems = filteredDataCache.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;
        paginationContainer.innerHTML = `<button id="prev-page" title="Anterior" ${currentPage === 1 ? 'disabled' : ''}>«</button> <span class="page-info">Pág ${currentPage} de ${totalPages}</span> <button id="next-page" title="Siguiente" ${currentPage === totalPages ? 'disabled' : ''}>»</button>`;
    };

    const renderTable = async () => {
        if (localDataCache.length === 0) localDataCache = await dataService.getAll(collection);
        const query = searchInput.value.toLowerCase();
        const defaultFilter = (item, q) => Object.values(item).some(val => String(val).toLowerCase().includes(q));
        const activeFilter = filterFn || defaultFilter;
        filteredDataCache = query ? localDataCache.filter(item => activeFilter(item, query)) : [...localDataCache];
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE, endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedData = filteredDataCache.slice(startIndex, endIndex);

        tableBody.innerHTML = '';
        const rowsHTML = await Promise.all(paginatedData.map(async item => {
            const rowContent = await renderRow(item);
            return `<tr data-id="${getId(item)}">${rowContent}</tr>`;
        }));
        tableBody.innerHTML = rowsHTML.join('');
        renderPagination();
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const requiredFields = Array.from(form.querySelectorAll('[required]'));
        if (requiredFields.some(field => !field.value.trim())) { 
            notifications.showToast('Por favor, complete todos los campos requeridos.', 'error'); 
            return; 
        }

        const dataFromForm = readForm(form); 

        if (uniqueField) {
            const allItems = await dataService.getAll(collection);
            const uniqueValue = String(dataFromForm[uniqueField]).trim().toLowerCase();

            const isDuplicate = allItems.some(item =>
                String(item[uniqueField]).trim().toLowerCase() === uniqueValue &&
                item.id !== currentlyEditingId
            );

            if (isDuplicate) {
                notifications.showToast(`Error: Ya existe otro registro con el valor "${dataFromForm[uniqueField]}".`, 'error');
                return;
            }
        }

        if (currentlyEditingId) {
            const originalItem = await dataService.getById(collection, currentlyEditingId);
            const updatedItem = { ...originalItem, ...dataFromForm, id: currentlyEditingId };
            await dataService.update(collection, updatedItem);
            notifications.showToast('Registro actualizado exitosamente.', 'success');
        } else {
            await dataService.add(collection, dataFromForm);
            notifications.showToast('Registro guardado exitosamente.', 'success');
        }
        
        closeModal(); 
        localDataCache = []; 
        await renderTable();
    };
    
    // --- 4. Asignación de Event Listeners ---
    searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });

    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const totalPages = Math.ceil(filteredDataCache.length / ITEMS_PER_PAGE);
            let pageChanged = false;
            if (target.id === 'prev-page' && currentPage > 1) { currentPage--; pageChanged = true; } 
            else if (target.id === 'next-page' && currentPage < totalPages) { currentPage++; pageChanged = true; }
            if (pageChanged) renderTable();
        });
    }

    if (importBtn && fileImporter) { importBtn.addEventListener('click', () => fileImporter.click()); fileImporter.addEventListener('change', (e) => e.target.files.length && handleImport(e.target.files[0])); }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const dataToExport = await dataService.getAll(collection);
            if(dataToExport.length === 0){ 
                notifications.showToast("No hay datos para exportar.", 'info'); 
                return; 
            }
            const headers = csvConfig.headers.split(',');
            const formattedData = await Promise.all(dataToExport.map(async (item) => { const rowArray = await csvConfig.formatRow(item); let rowObject = {}; headers.forEach((header, index) => { rowObject[header] = rowArray[index] ?? ''; }); return rowObject; }));
            const worksheet = XLSX.utils.json_to_sheet(formattedData); const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Registros"); XLSX.writeFile(workbook, csvConfig.filename || 'exportacion.xlsx');
        });
    }

    if (createBtn) { createBtn.addEventListener('click', async () => { currentlyEditingId = null; if (modalTitle) modalTitle.textContent = modalTitles.create; if(form) form.reset(); if (onBeforeOpenModal) await onBeforeOpenModal(form, null); openModal(); }); }
    
    if (modal) { 
        tableBody.addEventListener('click', async (e) => {
            const button = e.target.closest('button');
            const id = button?.closest('tr[data-id]')?.dataset.id;
            if (!id) return;
            if (button.classList.contains('btn-modify')) {
                currentlyEditingId = id;
                const item = await dataService.getById(collection, id);
                if (!item || !form || !modalTitle) return;
                modalTitle.textContent = modalTitles.edit; form.reset();
                if (onBeforeOpenModal) await onBeforeOpenModal(form, item);
                if(fillForm) await fillForm(form, item);
                openModal();
            } else if (button.classList.contains('btn-delete')) {
                const item = await dataService.getById(collection, id);
                
                const confirmed = await notifications.showConfirm(
                    'Confirmar Eliminación', 
                    `¿Está seguro de que desea eliminar "${item.nombre || item.codigo || item.id}"?`
                );
                
                if (confirmed) {
                    await dataService.delete(collection, id);
                    notifications.showToast('Registro eliminado.', 'success');
                    localDataCache = [];
                    // Solución al bug de paginación
                    const query = searchInput.value.toLowerCase();
                    const defaultFilter = (item, q) => Object.values(item).some(val => String(val).toLowerCase().includes(q));
                    const activeFilter = filterFn || defaultFilter;
                    const remainingItems = (await dataService.getAll(collection)).filter(item => activeFilter(item, query));
                    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                    if (startIndex >= remainingItems.length && currentPage > 1) {
                        currentPage--;
                    }
                    await renderTable();
                }
            }
        });
        if (form) form.addEventListener('submit', handleFormSubmit);
        closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    }

    // --- 5. Carga Inicial ---
    renderTable();
}