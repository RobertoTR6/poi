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
    // Si no hay usuario, redirigir inmediatamente a la página de login
    window.location.href = 'login.html';
} else {
    // Si hay un usuario, iniciar la aplicación principal
    main();
}

/**
 * Función principal que orquesta toda la aplicación.
 */
async function main() {
    /**
     * Función helper para mostrar los datos del usuario en la cabecera.
     * Es más eficiente llamarla una sola vez aquí que en cada renderizado de tabla.
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
        // Selecciona todos los contenedores de perfil (uno por cada página) y les inyecta el HTML.
        document.querySelectorAll('.user-profile').forEach(p => p.innerHTML = userProfileHTML);
    };

    // Es crucial inicializar el servicio de datos primero para que los datos estén listos
    await dataService.init();

    // Mostramos la información del perfil del usuario una sola vez al cargar la aplicación.
    displayUserProfile(currentUser);

    // --- 3. Mapear los IDs de las páginas a sus funciones de inicialización ---
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
    
    /**
     * Activa una página: la muestra y ejecuta su lógica de inicialización si es la primera vez.
     * @param {string} pageId - El ID del elemento <main> de la página a mostrar.
     */
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
    // Usaremos delegación de eventos en el contenedor principal de la app para manejar clics.
    document.querySelector('.app-container').addEventListener('click', (e) => {
        const userProfile = e.target.closest('.user-profile');
        
        // Primero, manejamos el clic en el botón de logout, ya que es la acción más específica.
        if (e.target.closest('.logoutBtn')) {
            logout();
            return; // Detiene la ejecución aquí.
        }

        // Ahora, manejamos la visibilidad del menú desplegable.
        const dropdown = document.querySelector('.user-dropdown');
        
        if (userProfile) {
            // Si el clic fue DENTRO del área del perfil, activamos/desactivamos el menú.
            userProfile.classList.toggle('open');
            dropdown?.classList.toggle('active');
        } else {
            // Si el clic fue en CUALQUIER OTRO LADO, cerramos el menú.
            document.querySelector('.user-profile')?.classList.remove('open');
            dropdown?.classList.remove('active');
        }
    });
}