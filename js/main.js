/**
 * ============================================================================
 * FINANCE DASHBOARD LOMAS - MAIN APPLICATION
 * ============================================================================
 */

import { APP_CONFIG } from './config.js';
import { AppState } from './state.js';
import { translate } from './i18n.js';
import { ErrorHandler, AppError } from './errors.js';
import { parseTSV, parseDate, parseAmount, debounce } from './utils.js';
import { formatCurrency } from './formatters.js';
import { allTransactionsTable } from './AllTransactionsTable.js';
import { topMovementsTable } from './TopMovementsTable.js';
import { categorySummaryTable } from './CategorySummaryTable.js';

// Registry for chart instances
window._charts = window._charts || {};

/**
 * ============================================================================
 * INICIALIZACIÓN
 * ============================================================================
 */
async function init() {
    try {
        showLoading(true);
        
        // Cargar colores de gráficos
        AppState.loadChartColors();
        
        // Cargar datos
        const data = await loadFinancialData();
        AppState.setFinancialData(data);
        
        // Configurar UI
        setupEventListeners();
        setupLanguage();
        
        // Renderizar dashboard
        updateDashboard();
        
        showLoading(false);
        
    } catch (error) {
        ErrorHandler.handle(error);
        showLoading(false);
    }
}

/**
 * ============================================================================
 * CARGA DE DATOS
 * ============================================================================
 */
async function loadFinancialData() {
    try {
        const response = await fetch(APP_CONFIG.DATA_URL);
        
        if (!response.ok) {
            throw new AppError(
                APP_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
                'NETWORK',
                `HTTP ${response.status}`
            );
        }
        
        const tsvText = await response.text();
        const data = parseTSV(tsvText);
        
        if (!data || data.length === 0) {
            throw new AppError(
                APP_CONFIG.ERROR_MESSAGES.NO_DATA,
                'DATA',
                'TSV file is empty'
            );
        }
        
        // Calcular campos derivados
        data.forEach(item => {
            const ingresos = parseAmount(item.Ingresos || '0');
            const gastos = parseAmount(item.Gastos || '0');
            item.Importe = ingresos > 0 ? ingresos : -gastos;
            item.Tipo = ingresos > 0 ? 'Ingreso' : 'Gasto';
        });
        
        // Ordenar por fecha descendente
        data.sort((a, b) => {
            const dateA = parseDate(a['F. Operativa']);
            const dateB = parseDate(b['F. Operativa']);
            return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });
        
        // Actualizar fecha de última actualización
        updateLastUpdateDate(data);
        
        return data;
        
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(
            APP_CONFIG.ERROR_MESSAGES.LOAD_FAILED,
            'LOAD',
            error.message
        );
    }
}

/**
 * ============================================================================
 * EVENT LISTENERS
 * ============================================================================
 */
function setupEventListeners() {
    // Filtro de período
    document.getElementById('filter-select')?.addEventListener('change', (e) => {
        AppState.updateFilter('period', e.target.value);
        updateDashboard();
    });
    
    // Filtros de fecha
    document.getElementById('start-date-select')?.addEventListener('change', (e) => {
        const value = e.target.value;
        const startDate = value ? new Date(value + '-01') : null;
        AppState.setDateRange(startDate, AppState.filters.dateRange.end);
        updateDashboard();
    });
    
    document.getElementById('end-date-select')?.addEventListener('change', (e) => {
        const value = e.target.value;
        const endDate = value ? new Date(value + '-01') : null;
        const lastDay = endDate ? new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0) : null;
        AppState.setDateRange(AppState.filters.dateRange.start, lastDay);
        updateDashboard();
    });
    
    // Búsqueda
    const searchInput = document.getElementById('transaction-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            AppState.setSearchQuery(e.target.value.toLowerCase());
            updateDashboard();
        }, APP_CONFIG.SEARCH_DEBOUNCE_DELAY));
    }
    
    // Selector de idioma
    document.getElementById('language-select')?.addEventListener('change', (e) => {
        AppState.setLanguage(e.target.value);
        updateLanguage();
        updateDashboard();
    });
}

/**
 * ============================================================================
 * ACTUALIZACIÓN DEL DASHBOARD
 * ============================================================================
 */
function updateDashboard() {
    const filteredData = getFilteredData();
    AppState.data.filtered = filteredData;
    
    // Actualizar KPIs
    updateKPIs(filteredData);
    
    // Actualizar gráficos
    updateCharts(filteredData);
    
    // Actualizar tablas
    updateTables(filteredData);
    
    // Actualizar panel de filtros activos
    updateActiveFiltersPanel();
}

function getFilteredData() {
    let data = AppState.data.financial;
    const isDateRangeActive = AppState.filters.dateRange.start || AppState.filters.dateRange.end;
    
    document.getElementById('filter-select').disabled = isDateRangeActive;
    
    if (isDateRangeActive) {
        data = data.filter(item => {
            const itemDate = parseDate(item['F. Operativa']);
            if (!itemDate) return false;
            const startCheck = !AppState.filters.dateRange.start || itemDate >= AppState.filters.dateRange.start;
            const endCheck = !AppState.filters.dateRange.end || itemDate <= AppState.filters.dateRange.end;
            return startCheck && endCheck;
        });
    } else if (AppState.filters.current !== 'all') {
        const currentDate = new Date();
        data = data.filter(item => {
            const itemDate = parseDate(item['F. Operativa']);
            if (!itemDate) return false;
            
            switch (AppState.filters.current) {
                case 'current_month':
                    return itemDate.getFullYear() === currentDate.getFullYear() && 
                           itemDate.getMonth() === currentDate.getMonth();
                case 'current_year':
                    return itemDate.getFullYear() === currentDate.getFullYear();
                case 'last_3_months': {
                    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
                    return itemDate >= targetDate;
                }
                case 'last_6_months': {
                    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
                    return itemDate >= targetDate;
                }
                case 'last_12_months': {
                    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, 1);
                    return itemDate >= targetDate;
                }
                default: return true;
            }
        });
    }
    
    if (AppState.filters.categories.size > 0) {
        data = data.filter(item => {
            const category = item.Categoria || 'Sin categoría';
            return AppState.filters.categories.has(category);
        });
    }
    
    if (AppState.filters.months.size > 0) {
        data = data.filter(item => {
            const itemDate = parseDate(item['F. Operativa']);
            if (!itemDate || isNaN(itemDate.getTime())) return false;
            const itemMonthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
            return AppState.filters.months.has(itemMonthKey);
        });
    }
    
    if (AppState.filters.searchQuery) {
        data = data.filter(item => {
            const concepto = (item['Concepto Publico'] || '').toLowerCase();
            return concepto.includes(AppState.filters.searchQuery);
        });
    }
    
    return data;
}

function updateKPIs(data) {
    const summary = {
        totalIngresos: 0,
        totalGastos: 0,
        totalPerHome: 0,
        saldoFinal: 0,
        transacciones: data.length
    };
    
    data.forEach(item => {
        summary.totalGastos += parseAmount(item.Gastos || '0');
        summary.totalIngresos += parseAmount(item.Ingresos || '0');
        summary.totalPerHome += parseAmount(item['per Home'] || '0');
    });
    
    if (AppState.data.financial.length > 0) {
        summary.saldoFinal = parseAmount(AppState.data.financial[0]['Saldo'] || '0');
    }
    
    document.getElementById('total-ingresos').textContent = formatCurrency(summary.totalIngresos);
    document.getElementById('total-gastos').textContent = formatCurrency(summary.totalGastos);
    document.getElementById('total-per-home').textContent = formatCurrency(summary.totalPerHome);
    document.getElementById('saldo-final').textContent = formatCurrency(summary.saldoFinal);
    document.getElementById('total-transacciones').textContent = summary.transacciones.toLocaleString('es-ES');
}

function updateTables(data) {
    // Tabla de todas las transacciones
    allTransactionsTable.render(data);
    
    // Tabla de top movimientos
    const topMovements = getTopMovements(data);
    topMovementsTable.render(topMovements);
    
    // Tabla de resumen por categorías
    const categoryStats = getCategoryStats(data);
    const totalGastos = data.reduce((sum, item) => sum + parseAmount(item.Gastos || '0'), 0);
    categorySummaryTable.render(categoryStats, totalGastos);
}

function getCategoryStats(data) {
    const stats = {};
    
    data.forEach(item => {
        const gastos = parseAmount(item.Gastos || '0');
        if (gastos > 0) {
            const category = item.Categoria || 'Sin categoría';
            if (!stats[category]) {
                stats[category] = { count: 0, total: 0 };
            }
            stats[category].count++;
            stats[category].total += gastos;
        }
    });
    
    return stats;
}

function getTopMovements(data) {
    const categoryTotals = {};
    
    data.forEach(item => {
        const category = item.Categoria || 'Sin categoría';
        const ingresos = parseAmount(item.Ingresos || '0');
        const gastos = parseAmount(item.Gastos || '0');
        const absoluteValue = Math.abs(ingresos > 0 ? ingresos : -gastos);
        
        if (!categoryTotals[category]) {
            categoryTotals[category] = { total: 0, movements: [] };
        }
        categoryTotals[category].total += absoluteValue;
        categoryTotals[category].movements.push({
            ...item,
            amount: ingresos > 0 ? ingresos : -gastos,
            absoluteValue
        });
    });
    
    const top5Categories = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b.total - a.total)
        .slice(0, 5);
    
    const topMovements = top5Categories.map(([category, data]) => {
        return data.movements.sort((a, b) => b.absoluteValue - a.absoluteValue)[0];
    });
    
    topMovements.sort((a, b) => b.absoluteValue - a.absoluteValue);
    
    return topMovements;
}

function updateCharts(data) {
    // Aquí irían las funciones de actualización de gráficos
    // Por brevedad, lo dejo como referencia
    console.log('Charts update pending implementation');
}

/**
 * ============================================================================
 * FUNCIONES DE UI
 * ============================================================================
 */
function updateActiveFiltersPanel() {
    const panel = document.getElementById('active-filters');
    const badgesContainer = document.getElementById('filter-badges');
    const clearFiltersFab = document.getElementById('clear-filters-fab');
    
    if (!panel || !badgesContainer) return;
    
    badgesContainer.innerHTML = '';
    
    let hasFilters = false;
    
    // Filtros de categoría
    AppState.filters.categories.forEach(cat => {
        hasFilters = true;
        const badge = createFilterBadge(`📁 ${cat}`, () => {
            AppState.removeCategory(cat);
            updateDashboard();
        });
        badgesContainer.appendChild(badge);
    });
    
    // Filtros de mes
    AppState.filters.months.forEach(month => {
        hasFilters = true;
        const badge = createFilterBadge(`📅 ${month}`, () => {
            AppState.filters.months.delete(month);
            updateDashboard();
        });
        badgesContainer.appendChild(badge);
    });
    
    // Mostrar/ocultar panel
    panel.classList.toggle('visible', hasFilters);
    
    // Mostrar/ocultar FAB
    if (clearFiltersFab) {
        clearFiltersFab.style.display = hasFilters ? 'flex' : 'none';
    }
}

function createFilterBadge(text, onRemove) {
    const badge = document.createElement('div');
    badge.className = 'filter-badge';
    badge.innerHTML = `
        <span>${text}</span>
        <span class="remove">×</span>
    `;
    badge.querySelector('.remove').addEventListener('click', onRemove);
    return badge;
}

function showLoading(show) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = show ? 'block' : 'none';
    }
}

function updateLastUpdateDate(data) {
    if (!data || data.length === 0) return;
    
    const lastDate = parseDate(data[0]['F. Operativa']);
    if (lastDate) {
        const dateStr = lastDate.toLocaleDateString(APP_CONFIG.DATE_FORMAT_LOCALE, APP_CONFIG.DATE_FORMAT_OPTIONS);
        const container = document.getElementById('last-update-date');
        if (container) {
            container.innerHTML = `<strong>${translate('last_update', AppState.language)}</strong> ${dateStr}`;
        }
    }
}

/**
 * ============================================================================
 * INTERNACIONALIZACIÓN
 * ============================================================================
 */
function setupLanguage() {
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.value = AppState.language;
    }
    updateLanguage();
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = translate(key, AppState.language);
        
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translated;
        } else {
            el.textContent = translated;
        }
    });
}

/**
 * ============================================================================
 * FUNCIONES GLOBALES (para onclick handlers)
 * ============================================================================
 */
window.clearAllFilters = () => {
    AppState.resetAllFilters();
    document.getElementById('start-date-select').value = '';
    document.getElementById('end-date-select').value = '';
    document.getElementById('transaction-search').value = '';
    document.getElementById('filter-select').value = APP_CONFIG.DEFAULT_FILTER;
    updateDashboard();
};

window.selectPendingCategory = (event, category) => {
    event.stopPropagation();
    AppState.toggleCategory(category, true);
    updateDashboard();
    showConfirmCancelButtons();
};

window.applyPendingSelection = () => {
    AppState.confirmPendingCategories();
    AppState.confirmPendingMonths();
    hideConfirmCancelButtons();
    updateDashboard();
};

window.clearPendingSelection = () => {
    AppState.clearCategories(true);
    AppState.clearMonths(true);
    hideConfirmCancelButtons();
    updateDashboard();
};

function showConfirmCancelButtons() {
    document.getElementById('fab-confirm').style.display = 'flex';
    document.getElementById('fab-cancel').style.display = 'flex';
}

function hideConfirmCancelButtons() {
    document.getElementById('fab-confirm').style.display = 'none';
    document.getElementById('fab-cancel').style.display = 'none';
}

window.exportToCSV = () => {
    const data = AppState.data.filtered;
    if (!data || data.length === 0) {
        alert(translate('no_data_export', AppState.language));
        return;
    }
    
    // Implementación de exportación CSV
    console.log('CSV export pending implementation');
};

/**
 * ============================================================================
 * INICIO DE LA APLICACIÓN
 * ============================================================================
 */
document.addEventListener('DOMContentLoaded', init);
