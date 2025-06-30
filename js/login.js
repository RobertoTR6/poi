// --- START OF FILE js/login.js (MODIFICADO) ---

import { dataService } from './modules/data.js';

// En una página standalone como el login, es buena idea iniciar el servicio de datos
// para que pueda cargar la base de datos (desde localStorage o JSON) mientras el usuario interactúa.
// La función init() internamente se asegura de no hacer el trabajo dos veces.
dataService.init();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // La función del evento 'submit' ahora es async porque debe esperar
    // a que `dataService` le devuelva los usuarios.
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // 1. Obtiene TODOS los usuarios desde la fuente de datos central (localStorage)
            const allUsers = await dataService.getAll('users');

            // 2. Busca al usuario en la lista obtenida (en lugar de la antigua USERS_DB)
            const foundUser = allUsers.find(user => user.usuario === username && user.clave === password);
    
            if (foundUser) {
                // El usuario es válido, guardamos sus datos y redirigimos
                localStorage.setItem('currentUser', JSON.stringify(foundUser));
                window.location.href = 'index.html';
            } else {
                // Usuario o clave no encontrados
                errorMessage.textContent = 'Usuario o clave incorrectos.';
            }
        } catch (error) {
            // Manejo de error por si algo falla al leer la base de datos
            console.error("Error durante el proceso de login:", error);
            errorMessage.textContent = 'Ocurrió un error al verificar las credenciales.';
        }
    });
});