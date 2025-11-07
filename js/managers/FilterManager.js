import { AppState } from '../state.js';
import { APP_CONFIG } from '../config.js';
import { parseDate } from '../utils.js';

const DEFAULT_SELECTORS = {
    periodFilter: 'filter-select'
};

/**
 * Encapsulates filter logic so it can be reused by multiple UI surfaces.
 */
export class FilterManager {
    constructor({ state = AppState, selectors = {} } = {}) {
        this.state = state;
        this.selectors = { ...DEFAULT_SELECTORS, ...selectors };
    }

    clearAllFilters() {
        this.state.clearCategories(false);
        this.state.clearCategories(true);
        this.state.clearMonths(false);
        this.state.clearMonths(true);
        this.state.setDateRange(null, null);
        this.state.setSearchQuery('');
        this.state.filters.current = APP_CONFIG.DEFAULT_FILTER;
    }

    applyPendingSelections() {
        this.state.confirmPendingCategories();
        this.state.confirmPendingMonths();
    }

    clearPendingSelections() {
        this.state.clearCategories(true);
        this.state.clearCategories(false);
        this.state.clearMonths(true);
        this.state.clearMonths(false);
    }

    hasPendingSelections() {
        return this.state.filters.pendingCategories.size > 0 || this.state.filters.pendingMonths.size > 0;
    }

    toggleCategory(category, isPending = false) {
        this.state.toggleCategory(category, isPending);
    }

    toggleMonth(month, isPending = false) {
        this.state.toggleMonth(month, isPending);
    }

    setDateRange(start, end) {
        this.state.setDateRange(start, end);
    }

    setSearchQuery(query) {
        this.state.setSearchQuery(query);
    }

    setPeriodFilter(value) {
        this.state.filters.current = value;
    }

    getFilteredData() {
        let dataset = this.state.data.financial;
        const isDateRangeActive = this.state.filters.dateRange.start || this.state.filters.dateRange.end;

        const filterSelect = document.getElementById(this.selectors.periodFilter);
        if (filterSelect) {
            filterSelect.disabled = Boolean(isDateRangeActive);
        }

        dataset = this._applyPeriodFilter(dataset, isDateRangeActive);
        dataset = this._applyCategoryFilter(dataset);
        dataset = this._applyMonthFilter(dataset);
        dataset = this._applySearchFilter(dataset);

        return dataset;
    }

    _applyPeriodFilter(data, isDateRangeActive) {
        if (isDateRangeActive) {
            return data.filter(item => {
                const itemDate = parseDate(item['F. Operativa']);
                if (!itemDate) return false;
                const startCheck = !this.state.filters.dateRange.start || itemDate >= this.state.filters.dateRange.start;
                const endCheck = !this.state.filters.dateRange.end || itemDate <= this.state.filters.dateRange.end;
                return startCheck && endCheck;
            });
        }

        if (this.state.filters.current === 'all') {
            return data;
        }

        const currentDate = new Date();

        return data.filter(item => {
            const itemDate = parseDate(item['F. Operativa']);
            if (!itemDate) return false;

            switch (this.state.filters.current) {
                case 'current_month':
                    return itemDate.getFullYear() === currentDate.getFullYear() && itemDate.getMonth() === currentDate.getMonth();
                case 'current_year':
                    return itemDate.getFullYear() === currentDate.getFullYear();
                case 'last_3_months':
                    return itemDate >= new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
                case 'last_6_months':
                    return itemDate >= new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
                case 'last_12_months':
                    return itemDate >= new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, 1);
                default:
                    return true;
            }
        });
    }

    _applyCategoryFilter(data) {
        if (this.state.filters.categories.size === 0) {
            return data;
        }

        return data.filter(item => {
            const category = item.Categoria || 'Sin categoría';
            return this.state.filters.categories.has(category);
        });
    }

    _applyMonthFilter(data) {
        if (this.state.filters.months.size === 0) {
            return data;
        }

        return data.filter(item => {
            const itemDate = parseDate(item['F. Operativa']);
            if (!itemDate || Number.isNaN(itemDate.getTime())) return false;
            const itemMonthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
            return this.state.filters.months.has(itemMonthKey);
        });
    }

    _applySearchFilter(data) {
        if (!this.state.filters.searchQuery) {
            return data;
        }

        return data.filter(item => {
            const concepto = (item['Concepto Publico'] || item['Concepto Público'] || item.Concepto || '').toLowerCase();
            return concepto.includes(this.state.filters.searchQuery);
        });
    }
}
