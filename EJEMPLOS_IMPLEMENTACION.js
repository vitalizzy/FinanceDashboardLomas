// ============================================================================
// EJEMPLOS DE IMPLEMENTACIÓN DE MEJORAS
// ============================================================================

// ============================================================================
// 1. ALMACENAMIENTO PERSISTENTE DE ESTADO
// ============================================================================
// Archivo: js/core/storage.js

export class StorageManager {
    constructor({ key = 'dashboardState', storageType = localStorage } = {}) {
        this.key = key;
        this.storage = storageType;
    }

    saveState(state) {
        try {
            const serializable = {
                filters: {
                    current: state.filters.current,
                    dateRange: {
                        start: state.filters.dateRange.start?.toISOString(),
                        end: state.filters.dateRange.end?.toISOString()
                    },
                    categories: Array.from(state.filters.categories),
                    months: Array.from(state.filters.months),
                    searchQuery: state.filters.searchQuery
                },
                sortOrders: Object.fromEntries(state.sortOrders) // Map → Object
            };
            this.storage.setItem(this.key, JSON.stringify(serializable));
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
    }

    loadState() {
        try {
            const data = this.storage.getItem(this.key);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            return {
                filters: {
                    ...parsed.filters,
                    dateRange: {
                        start: parsed.filters.dateRange.start ? new Date(parsed.filters.dateRange.start) : null,
                        end: parsed.filters.dateRange.end ? new Date(parsed.filters.dateRange.end) : null
                    },
                    categories: new Set(parsed.filters.categories),
                    months: new Set(parsed.filters.months)
                },
                sortOrders: new Map(Object.entries(parsed.sortOrders))
            };
        } catch (error) {
            console.warn('Failed to load state:', error);
            return null;
        }
    }

    clear() {
        try {
            this.storage.removeItem(this.key);
        } catch (error) {
            console.warn('Failed to clear state:', error);
        }
    }
}

// Uso en DashboardApp.init():
// const storageManager = new StorageManager();
// const savedState = storageManager.loadState();
// if (savedState) {
//     AppState.restoreState(savedState);
// }
// ... después de updateDashboard():
// storageManager.saveState(AppState);


// ============================================================================
// 2. VALIDACIÓN DE DATOS TSV
// ============================================================================
// Mejoras en: js/services/DataService.js

const REQUIRED_COLUMNS = [
    'F. Operativa',
    'Concepto',
    'Ingresos',
    'Gastos',
    'Categoría',
    'Saldo'
];

export class DataService {
    _validateTSVStructure(rawRows, headers) {
        // Verificar que existan todas las columnas requeridas
        const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
            throw new AppError(
                `Columnas faltantes en TSV: ${missingColumns.join(', ')}`,
                'DATA_VALIDATION',
                'TSV structure invalid'
            );
        }
    }

    _validateRow(row, index) {
        // Validar fecha
        const date = parseDate(row['F. Operativa']);
        if (!date) {
            console.warn(`Row ${index}: Invalid date "${row['F. Operativa']}"`);
        }

        // Validar montos
        const ingresos = parseAmount(row.Ingresos || '0');
        const gastos = parseAmount(row.Gastos || '0');
        
        if (isNaN(ingresos) || isNaN(gastos)) {
            console.warn(`Row ${index}: Invalid amount - Ingresos: ${row.Ingresos}, Gastos: ${row.Gastos}`);
        }

        // Validar que no ambos sean positivos
        if (ingresos > 0 && gastos > 0) {
            console.warn(`Row ${index}: Both Ingresos and Gastos are positive (should be mutually exclusive)`);
        }
    }

    async loadFinancialData() {
        const response = await fetch(this.dataUrl);

        if (!response.ok) {
            throw new AppError(
                APP_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
                'NETWORK',
                `HTTP ${response.status}`
            );
        }

        const tsvText = await response.text();
        const lines = tsvText.split('\n');
        const headers = lines[0].split('\t').map(h => h.trim());

        // Validar estructura
        this._validateTSVStructure([], headers);

        const rawRows = parseTSV(tsvText);

        if (!rawRows || rawRows.length === 0) {
            throw new AppError(
                APP_CONFIG.ERROR_MESSAGES.NO_DATA,
                'DATA',
                'TSV file is empty'
            );
        }

        // Validar cada fila
        rawRows.forEach((row, index) => this._validateRow(row, index + 1));

        const normalized = this._normalizeData(rawRows);
        const ordered = this._sortByDateDesc(normalized);
        const lastUpdate = ordered.length ? parseDate(ordered[0]['F. Operativa']) : null;

        return { data: ordered, lastUpdate };
    }
}


// ============================================================================
// 3. MEMOIZACIÓN EN FILTERMANAGER
// ============================================================================
// Mejoras en: js/managers/FilterManager.js

export class FilterManager {
    constructor({ state = AppState, selectors = {} } = {}) {
        this.state = state;
        this.selectors = { ...DEFAULT_SELECTORS, ...selectors };
        this._memoCache = new Map();
        this._cacheKey = null;
    }

    _generateCacheKey() {
        const filters = this.state.filters;
        return JSON.stringify({
            current: filters.current,
            categories: Array.from(filters.categories).sort().join(','),
            months: Array.from(filters.months).sort().join(','),
            dateRange: `${filters.dateRange.start?.getTime()}-${filters.dateRange.end?.getTime()}`,
            searchQuery: filters.searchQuery,
            columnFilters: Array.from(filters.columnFilters.values()).map(([k, v]) => `${k}:${v}`).join('|')
        });
    }

    getFilteredData() {
        const cacheKey = this._generateCacheKey();
        
        // Devolver resultado en caché si existe
        if (this._memoCache.has(cacheKey)) {
            return this._memoCache.get(cacheKey);
        }

        // Calcular resultado
        const result = this._computeFilteredData();
        
        // Guardar en caché (máximo 10 estados)
        if (this._memoCache.size > 10) {
            const firstKey = this._memoCache.keys().next().value;
            this._memoCache.delete(firstKey);
        }
        this._memoCache.set(cacheKey, result);

        return result;
    }

    _computeFilteredData() {
        // Lógica de filtrado existente
        let data = this.state.data.raw;

        // Aplicar filtros confirmados y pendientes
        const categories = new Set([
            ...this.state.filters.categories,
            ...this.state.filters.pendingCategories
        ]);

        if (categories.size > 0) {
            data = data.filter(row => categories.has(row.Categoría));
        }

        // ... resto de la lógica de filtrado ...

        return data;
    }

    clearCache() {
        this._memoCache.clear();
    }
}


// ============================================================================
// 4. BANNER DE ERRORES MEJORADO
// ============================================================================
// Archivo: js/components/feedback/ErrorBanner.js

export class ErrorBanner {
    constructor({ containerId = 'error-banner' } = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            // Crear contenedor si no existe
            this.container = document.createElement('div');
            this.container.id = containerId;
            this.container.className = 'error-banner-container';
            document.body.insertBefore(this.container, document.body.firstChild);
        }
    }

    show(message, type = 'error', duration = 5000) {
        const banner = document.createElement('div');
        banner.className = `error-banner error-banner--${type}`;
        banner.setAttribute('role', 'alert');
        banner.setAttribute('aria-live', 'assertive');
        
        const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        
        banner.innerHTML = `
            <span class="error-banner__icon">${icon}</span>
            <span class="error-banner__message">${this._escapeHtml(message)}</span>
            <button class="error-banner__close" aria-label="Cerrar" onclick="this.parentElement.remove()">✕</button>
        `;
        
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

    clear() {
        this.container.innerHTML = '';
    }
}

// CSS para agregar a main.css:
/*
.error-banner-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 400px;
}

.error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 6px;
    animation: slideIn 0.3s ease-out;
}

.error-banner--error {
    background: #fee;
    border: 1px solid #fcc;
    color: #c33;
}

.error-banner--warning {
    background: #ffeaa7;
    border: 1px solid #ffc0a0;
    color: #ff6b00;
}

.error-banner--info {
    background: #d1ecf1;
    border: 1px solid #bee5eb;
    color: #0c5460;
}

.error-banner__close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    margin-left: auto;
    padding: 0;
}

@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width: 640px) {
    .error-banner-container {
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
*/


// ============================================================================
// 5. EXPORTACIÓN CSV
// ============================================================================
// Archivo: js/core/csvExport.js

export class CSVExporter {
    static exportTableToCSV(tableId, filename = 'export.csv') {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`Table with id "${tableId}" not found`);
            return;
        }

        const csv = this._tableToCSV(table);
        this._downloadCSV(csv, filename);
    }

    static exportDataToCSV(data, columns, filename = 'export.csv') {
        const headers = columns.map(col => `"${col}"`).join(',');
        const rows = data.map(row => 
            columns.map(col => {
                const value = row[col];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        );

        const csv = [headers, ...rows].join('\n');
        this._downloadCSV(csv, filename);
    }

    static _tableToCSV(table) {
        const rows = [];
        
        // Headers
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        rows.push(headers.map(h => `"${h}"`).join(','));

        // Body rows
        table.querySelectorAll('tbody tr').forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('td')).map(td => {
                const text = td.textContent.trim();
                return text.includes(',') ? `"${text}"` : text;
            });
            rows.push(cells.join(','));
        });

        return rows.join('\n');
    }

    static _downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Uso en globalActions:
// import { CSVExporter } from '../core/csvExport.js';
// 
// export function handleExportToCSV() {
//     const timestamp = new Date().toLocaleString('es-ES');
//     CSVExporter.exportDataToCSV(
//         AppState.data.filtered,
//         ['F. Operativa', 'Concepto', 'Importe', 'Categoría', 'Tipo'],
//         `transacciones-${new Date().toISOString().split('T')[0]}.csv`
//     );
// }


// ============================================================================
// 6. ARIA LABELS Y ACCESIBILIDAD (EJEMPLOS)
// ============================================================================

// Ejemplo en FilterPanel.js:
// <button 
//     class="btn-apply-filters"
//     aria-label="Aplicar filtros seleccionados"
//     onclick="applyFilters()"
// >
//     Aplicar Filtros
// </button>

// Ejemplo en Dropdown.js:
// <select 
//     class="dropdown-filter"
//     aria-label="Filtrar por categoría"
//     aria-describedby="category-help"
//     onchange="handleCategoryChange(this.value)"
// >
//     <option value="">-- Todas las categorías --</option>
// </select>
// <small id="category-help">Selecciona una o más categorías para filtrar</small>

// Ejemplo en SearchBox.js:
// <input 
//     type="search"
//     class="search-input"
//     placeholder="Buscar en transacciones"
//     aria-label="Buscar transacciones por concepto"
//     aria-controls="all-transactions-table"
// />


// ============================================================================
// 7. LOGGING MEJORADO
// ============================================================================
// Archivo: js/core/logger.js

export class Logger {
    static LOG_LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };

    static currentLevel = Logger.LOG_LEVELS.INFO;

    static setLevel(level) {
        Logger.currentLevel = level;
    }

    static debug(message, data = null) {
        if (Logger.currentLevel <= Logger.LOG_LEVELS.DEBUG) {
            console.log(`🔍 [DEBUG] ${message}`, data);
        }
    }

    static info(message, data = null) {
        if (Logger.currentLevel <= Logger.LOG_LEVELS.INFO) {
            console.log(`ℹ️ [INFO] ${message}`, data);
        }
    }

    static warn(message, data = null) {
        if (Logger.currentLevel <= Logger.LOG_LEVELS.WARN) {
            console.warn(`⚠️ [WARN] ${message}`, data);
        }
    }

    static error(message, error = null) {
        if (Logger.currentLevel <= Logger.LOG_LEVELS.ERROR) {
            console.error(`❌ [ERROR] ${message}`, error);
        }
    }

    static group(groupName) {
        console.group(groupName);
    }

    static groupEnd() {
        console.groupEnd();
    }
}

// Uso:
// Logger.setLevel(Logger.LOG_LEVELS.DEBUG);
// Logger.debug('FilterManager initialized', { filters: AppState.filters });
// Logger.info('Data loaded', { rows: data.length });
