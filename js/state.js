/**
 * ============================================================================
 * GESTIÓN DE ESTADO CENTRALIZADA
 * ============================================================================
 */

import { APP_CONFIG } from './config.js';

export const AppState = {
    // Datos
    data: {
        financial: [],
        filtered: []
    },
    
    // Idioma
    language: localStorage.getItem(APP_CONFIG.STORAGE_KEYS.LANGUAGE) || 'es',
    
    // Filtros
    filters: {
        current: APP_CONFIG.DEFAULT_FILTER,
        categories: new Set(),
        pendingCategories: new Set(),
        months: new Set(),
        pendingMonths: new Set(),
        dateRange: {
            start: null,
            end: null
        },
        searchQuery: ''
    },
    
    // UI State
    ui: {
        currentPage: 1,
        itemsPerPage: APP_CONFIG.DEFAULT_ITEMS_PER_PAGE,
        sortColumn: APP_CONFIG.DEFAULT_SORT_COLUMN,
        sortDirection: APP_CONFIG.DEFAULT_SORT_DIRECTION,
        topMovementsSortColumn: null,
        topMovementsSortDirection: 'asc',
        categorySummarySortColumn: null,
        categorySummarySortDirection: 'asc'
    },
    
    // Colores de los gráficos
    chartColors: {},
    
    // Métodos
    setFinancialData(data) {
        this.data.financial = data;
    },
    
    setLanguage(lang) {
        this.language = lang;
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.LANGUAGE, lang);
    },
    
    updateFilter(filterType, value) {
        this.filters.current = value;
    },
    
    addCategory(category, isPending = false) {
        const targetSet = isPending ? this.filters.pendingCategories : this.filters.categories;
        targetSet.add(category);
    },
    
    removeCategory(category, isPending = false) {
        const targetSet = isPending ? this.filters.pendingCategories : this.filters.categories;
        targetSet.delete(category);
    },
    
    toggleCategory(category, isPending = false) {
        const targetSet = isPending ? this.filters.pendingCategories : this.filters.categories;
        if (targetSet.has(category)) {
            targetSet.delete(category);
        } else {
            targetSet.add(category);
        }
    },
    
    clearCategories(isPending = false) {
        const targetSet = isPending ? this.filters.pendingCategories : this.filters.categories;
        targetSet.clear();
    },
    
    confirmPendingCategories() {
        this.filters.categories = new Set(this.filters.pendingCategories);
        this.filters.pendingCategories.clear();
    },
    
    addMonth(month, isPending = false) {
        const targetSet = isPending ? this.filters.pendingMonths : this.filters.months;
        targetSet.add(month);
    },
    
    toggleMonth(month, isPending = false) {
        const targetSet = isPending ? this.filters.pendingMonths : this.filters.months;
        if (targetSet.has(month)) {
            targetSet.delete(month);
        } else {
            targetSet.add(month);
        }
    },
    
    clearMonths(isPending = false) {
        const targetSet = isPending ? this.filters.pendingMonths : this.filters.months;
        targetSet.clear();
    },
    
    confirmPendingMonths() {
        this.filters.months = new Set(this.filters.pendingMonths);
        this.filters.pendingMonths.clear();
    },
    
    setDateRange(start, end) {
        this.filters.dateRange.start = start;
        this.filters.dateRange.end = end;
    },
    
    setSearchQuery(query) {
        this.filters.searchQuery = query;
    },
    
    resetAllFilters() {
        this.filters.current = APP_CONFIG.DEFAULT_FILTER;
        this.filters.categories.clear();
        this.filters.pendingCategories.clear();
        this.filters.months.clear();
        this.filters.pendingMonths.clear();
        this.filters.dateRange.start = null;
        this.filters.dateRange.end = null;
        this.filters.searchQuery = '';
        this.ui.currentPage = 1;
    },
    
    setSortColumn(column, direction = null) {
        if (this.ui.sortColumn === column && direction === null) {
            this.ui.sortDirection = this.ui.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.ui.sortColumn = column;
            this.ui.sortDirection = direction || 'asc';
        }
    },
    
    setPage(page) {
        this.ui.currentPage = page;
    },
    
    loadChartColors() {
        const styles = getComputedStyle(document.documentElement);
        this.chartColors.ingresos = styles.getPropertyValue(APP_CONFIG.CHART_COLORS.INCOME).trim();
        this.chartColors.gastos = styles.getPropertyValue(APP_CONFIG.CHART_COLORS.EXPENSES).trim();
        this.chartColors.perHome = styles.getPropertyValue(APP_CONFIG.CHART_COLORS.PER_HOME).trim();
        this.chartColors.saldoMinimo = styles.getPropertyValue(APP_CONFIG.CHART_COLORS.SALDO_MINIMO).trim();
        this.chartColors.balance = styles.getPropertyValue(APP_CONFIG.CHART_COLORS.BALANCE).trim();
    }
};
