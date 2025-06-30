import { getCurrentUser, logout } from './modules/auth.js';
import { buildNav } from './modules/nav.js';
import { dataService } from './modules/data.js';

// --- 1. Importar todos los inicializadores de cada página ---
import { init as initUnidades } from './pages/unidades.js';
import { init as initSubunidades } from './pages/subunidades.js';
import { init as initCentroCosto } from './pages/centro-costo.js';
import { init as initUsuarios } from './pages/usuarios.js';
import { init as initUnidadMedida } from './pages/unidad-medida.js';
import { init as initOei } from './pages/oei.js';
import { init as initAei } from './pages/aei.js';
import { init as initCadenaPPR } from './pages/cadena-ppr.js';
import { init as initCadenas9001 } from './pages/cadenas-9001.js';
import { init as initActividadesOperativas } from './pages/actividades-operativas.js';

// --- 2. Verificar la sesión del usuario al cargar el script ---
const currentUser = getCurrentUser();
if (!currentUser) {
    window.location.href = 'login.html';
} else {
    main();
}

/**
 * Función principal que orquesta toda la aplicación.
 */
async function main() {
    /**
     * Función helper para mostrar los datos del usuario en la cabecera.
     * @param {object} user - El objeto del usuario actual.
     */
    const displayUserProfile = (user) => {
        const userProfileHTML = `
            <span>${user.nombre}</span>
            <i class="fas fa-user-circle"></i>
            <div class="user-dropdown">
                <button class="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
            </div>
        `;
        document.querySelectorAll('.user-profile').forEach(p => p.innerHTML = userProfileHTML);
    };

    await dataService.init();
    displayUserProfile(currentUser);

    const pageControllers = {
        'page-registro-unidad': initUnidades,
        'page-registro-subunidad': initSubunidades,
        'page-registro-centro-costo': initCentroCosto,
        'page-registro-usuario': initUsuarios,
        'page-registro-unidad-medida': initUnidadMedida,
        'page-registro-oei': initOei,
        'page-registro-aei': initAei,
        'page-cadena-ppr': initCadenaPPR,
        'page-cadenas-9001': initCadenas9001,
        'page-actividades-operativas': initActividadesOperativas,
    };
    
    const activatePage = (pageId) => {
        if (!pageId || !pageControllers[pageId]) {
            console.error(`Error: No se encontró un controlador para la página '${pageId}'.`);
            return;
        }
        document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        targetPage.classList.add('active');
        if (!targetPage.dataset.initialized) {
            pageControllers[pageId]();
            targetPage.dataset.initialized = 'true';
        }
        document.querySelectorAll('.sidebar-nav .submenu li').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }
    };

    // --- INICIO DE LA SECCIÓN DE DEPURACIÓN ---

    // 1. Mensaje en consola para verificar el objeto de permisos.
    console.log("Verificando permisos del usuario antes de construir el menú:", currentUser.permisos);

    // 2. Alerta de seguridad si el objeto de permisos no existe o está vacío.
    if (!currentUser.permisos || Object.keys(currentUser.permisos).length === 0) {
        alert(
            "¡ALERTA DE DEPURACIÓN!\n\nEl usuario actual NO tiene un objeto de 'permisos' válido. " +
            "Esto es la causa más probable de que el menú no se muestre correctamente.\n\n" +
            "SOLUCIÓN: Por favor, borre los datos de la aplicación del 'Local Storage' de su navegador y vuelva a iniciar sesión."
        );
    }

    // --- FIN DE LA SECCIÓN DE DEPURACIÓN ---

    // --- 5. Construir la navegación y obtener la primera página disponible ---
    const firstPage = buildNav(currentUser, activatePage);

    if (firstPage) {
        const firstLink = document.querySelector(`.submenu a[data-page="${firstPage}"]`);
        if (firstLink) {
            const submenu = firstLink.closest('.submenu');
            if (submenu && submenu.previousElementSibling?.classList.contains('module-toggle')) {
                 submenu.previousElementSibling.classList.add('open');
            }
        }
        activatePage(firstPage);
    }
    
    // --- 6. Añadir un listener global para la UI del perfil y el logout ---
    document.querySelector('.app-container').addEventListener('click', (e) => {
        const userProfile = e.target.closest('.user-profile');
        if (e.target.closest('.logoutBtn')) {
            logout();
            return;
        }
        const dropdown = document.querySelector('.user-dropdown');
        if (userProfile) {
            userProfile.classList.toggle('open');
            dropdown?.classList.toggle('active');
        } else {
            document.querySelector('.user-profile')?.classList.remove('open');
            dropdown?.classList.remove('active');
        }
    });
}