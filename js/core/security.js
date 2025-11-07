/**
 * ============================================================================
 * MÓDULO DE SEGURIDAD - Gestión de columna protegida
 * ============================================================================
 */

import { translate } from './i18n.js';
import { AppState } from './state.js';

// Hash SHA-256 de la contraseña (usar console.log(await sha256('tu_contraseña')) para generar nuevo)
const PASSWORD_HASH = 'ad13b54afdc157f7e506ced0df9a4d70f2f19b2fd8ba9d4d419e996c96d64061';

/**
 * Calcula SHA-256 de un mensaje y retorna hexadecimal
 */
export async function sha256(message) {
    if (message == null) return '';
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Muestra un modal para ingresar contraseña
 * @param {string} message - Mensaje a mostrar
 * @returns {Promise<string|null>} La contraseña ingresada o null si se cancela
 */
export function showPasswordModal(message) {
    return new Promise(resolve => {
        // Overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(0,0,0,0.35)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '2000';

        // Modal
        const modal = document.createElement('div');
        modal.style.background = 'white';
        modal.style.padding = '18px';
        modal.style.borderRadius = '8px';
        modal.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
        modal.style.width = '320px';
        modal.style.maxWidth = '90%';
        modal.style.fontFamily = 'inherit';

        const title = document.createElement('div');
        title.textContent = message || 'Introduce la contraseña';
        title.style.marginBottom = '8px';
        title.style.fontWeight = '600';

        const input = document.createElement('input');
        input.type = 'password';
        input.style.width = '100%';
        input.style.padding = '10px';
        input.style.marginBottom = '12px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '6px';
        input.autocomplete = 'new-password';

        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.justifyContent = 'flex-end';
        buttons.style.gap = '8px';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = translate('cancel', AppState.language);
        cancelBtn.style.padding = '8px 12px';
        cancelBtn.style.background = '#f1f1f1';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.cursor = 'pointer';

        const okBtn = document.createElement('button');
        okBtn.textContent = translate('accept', AppState.language);
        okBtn.style.padding = '8px 12px';
        okBtn.style.background = 'var(--color-balance)';
        okBtn.style.color = 'white';
        okBtn.style.border = 'none';
        okBtn.style.borderRadius = '6px';
        okBtn.style.cursor = 'pointer';

        buttons.appendChild(cancelBtn);
        buttons.appendChild(okBtn);

        modal.appendChild(title);
        modal.appendChild(input);
        modal.appendChild(buttons);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Focus en el input
        setTimeout(() => input.focus(), 50);

        function cleanup() {
            overlay.remove();
        }

        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(null);
        });

        okBtn.addEventListener('click', () => {
            const val = input.value;
            cleanup();
            resolve(val);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve(null);
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                okBtn.click();
            } else if (e.key === 'Escape') {
                cancelBtn.click();
            }
        });
    });
}

/**
 * Alterna la visibilidad de la columna secreta (Concepto)
 */
export async function toggleSecretColumn() {
    const tableContainer = document.getElementById('all-transactions-table');
    const icon = document.getElementById('toggle-secret-col');

    if (!tableContainer || !icon) return;

    if (AppState.ui.secretColumnVisible) {
        // Si ya está visible, ocultarla
        tableContainer.classList.remove('show-secret-col');
        AppState.ui.secretColumnVisible = false;
        icon.style.opacity = '0.6';
        icon.textContent = '🔒';
    } else {
        // Pedir contraseña en modal
        const pass = await showPasswordModal(translate('enter_password_concept', AppState.language));
        if (pass === null) return; // Usuario canceló

        const hashedPass = await sha256(pass);
        console.log('[Security] Hash ingresado:', hashedPass);
        console.log('[Security] Hash esperado:', PASSWORD_HASH);

        // Validar comparando el hash
        if (hashedPass === PASSWORD_HASH) {
            tableContainer.classList.add('show-secret-col');
            AppState.ui.secretColumnVisible = true;
            icon.style.opacity = '1';
            icon.textContent = '🔓';
        } else {
            alert(translate('incorrect_password', AppState.language));
        }
    }
}

/**
 * Inicializa el event listener para el botón de toggle
 */
export function initSecurityListeners() {
    const toggleBtn = document.getElementById('toggle-secret-col');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSecretColumn);
    }
}
