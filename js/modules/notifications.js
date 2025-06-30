// --- NUEVO ARCHIVO: js/modules/notifications.js ---

/**
 * Módulo para mostrar notificaciones "toast" y diálogos de confirmación.
 */
export const notifications = {
    /**
     * Muestra una notificación toast que desaparece automáticamente.
     * @param {string} message El mensaje a mostrar.
     * @param {string} type 'success', 'error', o 'info'.
     * @param {number} duration Duración en milisegundos.
     */
    showToast(message, type = 'info', duration = 3500) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle'
        };
        const icon = icons[type] || 'fa-info-circle';

        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <button class="toast-close-btn">×</button>
        `;

        container.appendChild(toast);

        // Animación de entrada
        setTimeout(() => toast.classList.add('show'), 10);

        const timer = setTimeout(() => {
            toast.classList.remove('show');
            // Espera a que la animación de salida termine antes de remover
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);

        toast.querySelector('.toast-close-btn').addEventListener('click', () => {
            clearTimeout(timer);
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        });
    },

    /**
     * Muestra un diálogo de confirmación modal.
     * @param {string} title Título del diálogo.
     * @param {string} message Mensaje de confirmación.
     * @returns {Promise<boolean>} Resuelve a `true` si se confirma, `false` si se cancela.
     */
    showConfirm(title, message) {
        return new Promise(resolve => {
            // Elimina cualquier diálogo de confirmación anterior para evitar duplicados
            document.getElementById('confirm-overlay')?.remove();

            const overlay = document.createElement('div');
            overlay.id = 'confirm-overlay';
            overlay.className = 'modal-overlay';
            overlay.style.display = 'flex';

            overlay.innerHTML = `
                <div class="modal-content" style="max-width: 450px;">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button id="confirm-close-btn" class="close-modal-btn">×</button>
                    </div>
                    <div class="modal-body" style="text-align: center; padding-top: 2rem; padding-bottom: 2rem;">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer" style="justify-content: center; display: flex; gap: 1rem;">
                        <button id="confirm-cancel-btn" class="btn btn-secondary">Cancelar</button>
                        <button id="confirm-ok-btn" class="btn btn-danger">Confirmar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const btnOk = document.getElementById('confirm-ok-btn');
            const btnCancel = document.getElementById('confirm-cancel-btn');
            const btnClose = document.getElementById('confirm-close-btn');

            const closeDialog = (value) => {
                overlay.remove();
                resolve(value);
            };

            btnOk.onclick = () => closeDialog(true);
            btnCancel.onclick = () => closeDialog(false);
            btnClose.onclick = () => closeDialog(false);
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    closeDialog(false);
                }
            };
        });
    }
};