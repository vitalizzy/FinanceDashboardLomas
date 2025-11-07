/**
 * ============================================================================
 * MANEJO DE ERRORES
 * ============================================================================
 */

export class AppError extends Error {
    constructor(message, type = 'GENERAL', details = null) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

export const ErrorHandler = {
    log(error) {
        const errorInfo = {
            type: error.type || 'UNKNOWN',
            message: error.message,
            details: error.details,
            timestamp: error.timestamp || new Date().toISOString(),
            stack: error.stack
        };
        console.error('[AppError]', errorInfo);
    },
    
    showToUser(error, elementId = 'error') {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv) {
            errorDiv.innerHTML = `
                <strong>Error:</strong> ${error.message}
                ${error.details ? `<br><small>${error.details}</small>` : ''}
            `;
            errorDiv.style.display = 'block';
        }
    },
    
    handle(error, showUser = true) {
        this.log(error);
        if (showUser) {
            this.showToUser(error);
        }
    }
};
