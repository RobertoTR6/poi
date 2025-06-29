/**
 * menuStructure define la jerarquía completa del menú de navegación.
 */
const menuStructure = {
    configuracion: { 
        name: 'Configuración', 
        icon: 'fa-cogs', 
        sub: { 'page-registro-unidad': 'Registro de Unidad', 'page-registro-subunidad': 'Registro de Subunidad', 'page-registro-centro-costo': 'Registro de Centros de Costo', 'page-registro-usuario': 'Registro de Usuarios' } 
    },
    planeamiento: { 
        name: 'Planeamiento', 
        icon: 'fa-tasks', 
        sub: { 'page-actividades-operativas': 'Actividades Operativas','page-cadena-ppr': 'Cadena PPR','page-cadenas-9001': 'Cadenas 9001/9002', 'page-registro-oei': 'Objetivos Estratégicos (OEI)', 'page-registro-aei': 'Acciones Estratégicas (AEI)', 'page-registro-unidad-medida': 'Unidades de Medida' } 
    },
    cmn: { name: 'CMN', icon: 'fa-notes-medical', sub: {} },
    evaluacion: { name: 'Evaluación', icon: 'fa-clipboard-check', sub: {} },
};

/**
 * Construye y maneja el menú de navegación lateral.
 * @param {object} currentUser - El objeto del usuario actual.
 * @param {function} activatePageCallback - La función a llamar al hacer clic en un enlace.
 * @returns {string|null} - El ID de la primera página disponible.
 */
export function buildNav(currentUser, activatePageCallback) {
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!sidebarNav) return null;

    let firstAvailablePage = null;
    let menuHTML = '<ul>';

    for (const moduleId in menuStructure) {
        if (currentUser.permisos[moduleId]) {
            const module = menuStructure[moduleId];
            const subPages = Object.keys(module.sub);
            if (!firstAvailablePage && subPages.length > 0) {
                firstAvailablePage = subPages[0];
            }
            menuHTML += `<li><a href="#" class="module-toggle"><i class="fas ${module.icon}"></i> ${module.name} <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="submenu">`;
            for (const pageId in module.sub) {
                 menuHTML += `<li><a href="#" data-page="${pageId}">${module.sub[pageId]}</a></li>`;
            }
            menuHTML += '</ul></li>';
        }
    }
    menuHTML += '</ul>';
    sidebarNav.innerHTML = menuHTML;

    // --- ¡INICIO DE LA CORRECCIÓN! ---
    // Event listener mejorado con lógica de acordeón.
    sidebarNav.addEventListener('click', (e) => {
        e.preventDefault();
        const link = e.target.closest('a');
        if (!link) return;

        if (link.classList.contains('module-toggle')) {
            const clickedModule = link;
            
            // Cerrar todos los demás módulos que no sean el que se acaba de clickear.
            document.querySelectorAll('.module-toggle').forEach(otherModule => {
                if (otherModule !== clickedModule) {
                    otherModule.classList.remove('open');
                }
            });

            // Abrir o cerrar el módulo clickeado.
            clickedModule.classList.toggle('open');
            
        } else if (link.dataset.page) {
            activatePageCallback(link.dataset.page);
        }
    });
    // --- FIN DE LA CORRECCIÓN ---

    return firstAvailablePage;
}