/**
 * ============================================================================
 * EJEMPLO DE INTEGRACIÓN - Iconos SVG en Componentes
 * ============================================================================
 * 
 * Este archivo muestra cómo integrar el sistema de iconos en los componentes
 * existentes de la aplicación, reemplazando emojis por SVG profesionales.
 */

// ============================================================================
// 1. EN MAIN.JS - Inicializar IconManager
// ============================================================================

import { iconManager, ICON_NAMES } from './core/icons.js';

// Precargar iconos críticos al iniciar
async function preloadCriticalIcons() {
    try {
        await iconManager.preloadIcons([
            ICON_NAMES.DOWNLOAD,
            ICON_NAMES.FILTER,
            ICON_NAMES.SEARCH,
            ICON_NAMES.CHART_LINE,
            ICON_NAMES.CHART_BAR,
            ICON_NAMES.ALERT_TRIANGLE,
            ICON_NAMES.INFO,
            ICON_NAMES.LOADER,
            ICON_NAMES.CHECK,
            ICON_NAMES.CLOSE
        ]);
        console.log('✓ Icons preloaded');
    } catch (error) {
        console.warn('Warning: Could not preload icons', error);
    }
}

// Ejecutar al DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    await preloadCriticalIcons();
    // ... resto del init
});


// ============================================================================
// 2. EN ERROR BANNER - Mostrar errores con iconos
// ============================================================================

export class ErrorBanner {
    constructor({ containerId = 'error-banner' } = {}) {
        this.container = document.getElementById(containerId);
    }

    show(message, type = 'error', duration = 5000) {
        const banner = document.createElement('div');
        banner.className = `error-banner error-banner--${type}`;
        banner.setAttribute('role', 'alert');
        banner.setAttribute('aria-live', 'assertive');
        
        // Mapear tipo de error a icono
        const iconMap = {
            error: 'alert-triangle',
            warning: 'alert-circle',
            info: 'info',
            success: 'check'
        };

        const iconName = iconMap[type];
        const iconImg = window.iconManager.createIconImg(iconName, {
            className: `error-banner__icon icon-${type}`,
            width: 20,
            height: 20,
            alt: type
        });
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'error-banner__message';
        messageSpan.textContent = this._escapeHtml(message);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'error-banner__close';
        closeBtn.setAttribute('aria-label', 'Cerrar');
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.cursor = 'pointer';
        
        // Icono de cerrar
        const closeIcon = window.iconManager.createIconImg(
            window.ICON_NAMES.CLOSE,
            {
                width: 18,
                height: 18,
                alt: 'Cerrar'
            }
        );
        closeBtn.appendChild(closeIcon);
        closeBtn.onclick = () => banner.remove();

        banner.appendChild(iconImg);
        banner.appendChild(messageSpan);
        banner.appendChild(closeBtn);

        this.container.appendChild(banner);

        if (duration > 0) {
            setTimeout(() => banner.remove(), duration);
        }

        return banner;
    }

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}


// ============================================================================
// 3. EN FILTER PANEL - Iconos en filtros
// ============================================================================

export class FilterPanel {
    render() {
        const activeFiltersDiv = document.getElementById('active-filters');
        
        if (!AppState.filters.categories.size && 
            !AppState.filters.months.size && 
            !AppState.filters.searchQuery) {
            activeFiltersDiv.style.display = 'none';
            return;
        }

        activeFiltersDiv.style.display = 'block';
        let html = '<strong style="font-size: 13px;">Filtros activos:</strong> ';

        // Categorías con icono
        AppState.filters.categories.forEach(cat => {
            const filterIcon = window.iconManager.getIconHTML(
                window.ICON_NAMES.FILTER,
                { 
                    className: 'badge-icon',
                    width: 14,
                    height: 14,
                    alt: 'Filtro'
                }
            );
            html += `<span class="badge badge-category">${filterIcon} ${cat}</span> `;
        });

        // Meses con icono de calendario
        AppState.filters.months.forEach(month => {
            const calendarIcon = window.iconManager.getIconHTML(
                window.ICON_NAMES.CALENDAR,
                { 
                    className: 'badge-icon',
                    width: 14,
                    height: 14,
                    alt: 'Mes'
                }
            );
            html += `<span class="badge badge-month">${calendarIcon} ${month}</span> `;
        });

        // Query de búsqueda con icono
        if (AppState.filters.searchQuery) {
            const searchIcon = window.iconManager.getIconHTML(
                window.ICON_NAMES.SEARCH,
                { 
                    className: 'badge-icon',
                    width: 14,
                    height: 14,
                    alt: 'Búsqueda'
                }
            );
            html += `<span class="badge badge-search">${searchIcon} "${AppState.filters.searchQuery}"</span>`;
        }

        activeFiltersDiv.innerHTML = html;
    }
}


// ============================================================================
// 4. EN TABLE MANAGER - Iconos en acciones de tabla
// ============================================================================

export class AllTransactionsTable extends BaseTable {
    render(data) {
        // ... código existente ...

        // En las columnas de acciones, usar iconos SVG
        const actionsColumn = {
            header: 'Acciones',
            key: 'actions',
            render: (row) => {
                const container = document.createElement('div');
                container.className = 'table-actions';

                // Botón editar con icono
                const editBtn = document.createElement('button');
                editBtn.className = 'btn btn-sm btn-edit';
                editBtn.title = 'Editar';
                const editIcon = window.iconManager.createIconImg(
                    window.ICON_NAMES.EDIT,
                    { className: 'table-icon', width: 16, height: 16, alt: 'Editar' }
                );
                editBtn.appendChild(editIcon);
                container.appendChild(editBtn);

                // Botón eliminar con icono
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-sm btn-delete';
                deleteBtn.title = 'Eliminar';
                const deleteIcon = window.iconManager.createIconImg(
                    window.ICON_NAMES.TRASH,
                    { className: 'table-icon', width: 16, height: 16, alt: 'Eliminar' }
                );
                deleteBtn.appendChild(deleteIcon);
                container.appendChild(deleteBtn);

                return container;
            }
        };
    }
}


// ============================================================================
// 5. EN DASHBOARD APP - Título con icono
// ============================================================================

export class DashboardApp {
    _renderHeader() {
        const headerDiv = document.querySelector('.dashboard-header');
        
        const titleSection = document.createElement('div');
        titleSection.style.display = 'flex';
        titleSection.style.alignItems = 'center';
        titleSection.style.gap = '12px';

        // Icono del dashboard
        const dashboardIcon = window.iconManager.createIconImg(
            window.ICON_NAMES.CHART_BAR,
            {
                className: 'header-icon',
                width: 32,
                height: 32,
                alt: 'Dashboard'
            }
        );

        const titleH1 = document.createElement('h1');
        titleH1.className = 'dashboard-title';
        titleH1.textContent = 'Movimientos Bancarios';

        titleSection.appendChild(dashboardIcon);
        titleSection.appendChild(titleH1);

        headerDiv.appendChild(titleSection);
    }
}


// ============================================================================
// 6. EN INDEX.HTML - Actualizar botones y elementos
// ============================================================================

// ANTES (con emojis):
/*
<button class="btn btn-primary" onclick="handleExportToCSV()">📥 Exportar CSV</button>
<button class="btn btn-secondary" onclick="handleClearAllFilters()">🗑️ Limpiar filtros</button>
<button class="btn btn-settings" onclick="toggleDarkMode()">🌙 Dark Mode</button>
*/

// DESPUÉS (con iconos SVG):
/*
<button class="btn btn-primary" onclick="handleExportToCSV()">
    <img src="assets/icons/download.svg" class="btn-icon" alt="Descargar" />
    Exportar CSV
</button>

<button class="btn btn-secondary" onclick="handleClearAllFilters()">
    <img src="assets/icons/trash.svg" class="btn-icon" alt="Limpiar" />
    Limpiar filtros
</button>

<button class="btn btn-settings" onclick="toggleDarkMode()">
    <img src="assets/icons/moon.svg" class="btn-icon theme-icon" alt="Dark Mode" />
    Dark Mode
</button>
*/

// HELPER: Función para crear botones con iconos
function createButtonWithIcon(label, iconName, className = '', onClick = null) {
    const button = document.createElement('button');
    button.className = `btn ${className}`;
    
    const icon = window.iconManager.createIconImg(iconName, {
        className: 'btn-icon',
        width: 18,
        height: 18,
        alt: label
    });
    
    button.appendChild(icon);
    button.appendChild(document.createTextNode(' ' + label));
    
    if (onClick) button.onclick = onClick;
    
    return button;
}

// Uso:
/*
const exportBtn = createButtonWithIcon(
    'Exportar CSV',
    'download',
    'btn-primary',
    handleExportToCSV
);
container.appendChild(exportBtn);
*/


// ============================================================================
// 7. CSS PARA INTEGRACIÓN
// ============================================================================

// Agregar a assets/styles/main.css:

/*
.btn-icon {
    display: inline-block;
    margin-right: 8px;
    width: 18px;
    height: 18px;
    vertical-align: middle;
}

.btn-icon:last-child {
    margin-right: 0;
}

.header-icon {
    display: inline-block;
    margin-right: 12px;
    vertical-align: middle;
}

.table-icon {
    width: 16px;
    height: 16px;
    cursor: pointer;
    transition: opacity 0.2s;
}

.table-icon:hover {
    opacity: 0.7;
}

.badge-icon {
    display: inline-block;
    margin-right: 4px;
    vertical-align: middle;
}

.table-actions {
    display: flex;
    gap: 8px;
}

.table-actions .btn {
    padding: 4px 8px;
    display: flex;
    align-items: center;
}

.error-banner__icon {
    flex-shrink: 0;
}

.theme-icon {
    transition: transform 0.3s;
}

.theme-icon:hover {
    transform: rotate(20deg);
}
*/


// ============================================================================
// 8. UTILIDAD: Generador de botones dinámicos
// ============================================================================

export class IconButtonFactory {
    static createButton(options = {}) {
        const {
            label = '',
            iconName = null,
            className = '',
            onClick = null,
            size = 'md' // 'sm', 'md', 'lg'
        } = options;

        const button = document.createElement('button');
        button.className = `btn btn-${size} ${className}`;
        
        if (onClick) button.onclick = onClick;

        if (iconName) {
            const iconWidth = size === 'sm' ? 16 : size === 'lg' ? 24 : 18;
            const icon = window.iconManager.createIconImg(iconName, {
                className: 'btn-icon',
                width: iconWidth,
                height: iconWidth,
                alt: label
            });
            button.appendChild(icon);
        }

        if (label) {
            button.appendChild(document.createTextNode(label));
        }

        return button;
    }
}

// Uso:
/*
const deleteBtn = IconButtonFactory.createButton({
    label: 'Eliminar',
    iconName: 'trash',
    className: 'btn-danger',
    size: 'sm',
    onClick: () => deleteItem()
});
*/


// ============================================================================
// 9. PASOS DE INTEGRACIÓN
// ============================================================================

/*
LISTA DE VERIFICACIÓN:

[ ] 1. Importar icons.js en main.js
[ ] 2. Llamar preloadCriticalIcons() en DOMContentLoaded
[ ] 3. Actualizar ErrorBanner para usar iconos
[ ] 4. Actualizar FilterPanel para usar iconos
[ ] 5. Actualizar TablesManager para usar iconos en acciones
[ ] 6. Actualizar DashboardApp header con icono
[ ] 7. Reemplazar emojis en index.html con <img src="assets/icons/...">
[ ] 8. Agregar CSS de iconos a main.css
[ ] 9. Testar en navegador
   - Verificar iconos cargan correctamente
   - Verificar responsive en móvil
   - Verificar dark mode
   - Verificar accesibilidad (alt text)
[ ] 10. Commit a git
[ ] 11. Deployment
*/
