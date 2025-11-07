import { APP_CONFIG } from '../core/config.js';
import { AppState } from '../core/state.js';
import { translate } from '../core/i18n.js';
import { initSecurityListeners } from '../core/security.js';
import { DataService } from '../services/DataService.js';
import { ErrorHandler } from '../core/errors.js';
import { FilterManager } from '../managers/FilterManager.js';
import { TableManager } from '../managers/TableManager.js';
import { ChartManager } from '../managers/ChartManager.js';
import { KpiManager } from '../managers/KpiManager.js';
import { FilterPanel } from '../components/filters/FilterPanel.js';
import { Dropdown } from '../components/filters/Dropdown.js';
import { DateRangePicker } from '../components/filters/DateRangePicker.js';
import { SearchBox } from '../components/filters/SearchBox.js';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay.js';
import { LastUpdateBanner } from '../components/feedback/LastUpdateBanner.js';

/**
 * High-level orchestrator that wires together services and UI components.
 */
export class DashboardApp {
    constructor({
        dataService = new DataService(),
        filterManager = new FilterManager(),
        tableManager = new TableManager(),
        chartManager = new ChartManager(),
        kpiManager = new KpiManager(),
        filterPanel = new FilterPanel(),
        loadingOverlay = new LoadingOverlay(),
        lastUpdateBanner = new LastUpdateBanner()
    } = {}) {
        this.dataService = dataService;
        this.filterManager = filterManager;
        this.tableManager = tableManager;
        this.chartManager = chartManager;
        this.kpiManager = kpiManager;
        this.filterPanel = filterPanel;
        this.loadingOverlay = loadingOverlay;
        this.lastUpdateBanner = lastUpdateBanner;
    }

    async init() {
        try {
            this.loadingOverlay.show();

            AppState.loadChartColors();

            const { data, lastUpdate } = await this.dataService.loadFinancialData();
            AppState.setFinancialData(data);
            this.lastUpdateBanner.render(lastUpdate);

            this._setupLanguage();
            this._registerUiInteractions();
            this._registerGlobalListeners();

            this.updateDashboard();
        } catch (error) {
            console.error('❌ Initialization error:', error);
            throw error;
        } finally {
            this.loadingOverlay.hide();
        }
    }

    updateDashboard() {
        try {
            const filteredData = this.filterManager.getFilteredData();
            AppState.data.filtered = filteredData;

            this.kpiManager.render(filteredData);
            this.chartManager.renderAll(filteredData);
            this.tableManager.renderAll(filteredData);
            this.filterPanel.render();
        } catch (error) {
            console.error('❌ Dashboard update error:', error);
            ErrorHandler.handle(error);
        }
    }

    handleClearAllFilters() {
        this.filterManager.clearAllFilters();
        this._resetFilterInputs();
        this.filterPanel.hidePendingControls();
        this.updateDashboard();
    }

    handleSelectPendingCategory(event, category) {
        if (event && typeof event.stopPropagation === 'function') {
            event.stopPropagation();
        }
        this.filterManager.toggleCategory(category, true);
        this.filterPanel.togglePendingControls(this.filterManager.hasPendingSelections());
        this.updateDashboard();
    }

    handleSelectPendingMonth(event, monthKey) {
        if (event && typeof event.stopPropagation === 'function') {
            event.stopPropagation();
        }
        this.filterManager.toggleMonth(monthKey, true);
        this.filterPanel.togglePendingControls(this.filterManager.hasPendingSelections());
        this.updateDashboard();
    }

    handleApplyPendingSelection() {
        this.filterManager.applyPendingSelections();
        this.filterPanel.hidePendingControls();
        this.updateDashboard();
    }

    handleClearPendingSelection() {
        this.filterManager.clearPendingSelections();
        this.filterPanel.hidePendingControls();
        this.updateDashboard();
    }

    handleExportToCSV() {
        const data = AppState.data.filtered;
        if (!data || data.length === 0) {
            alert(translate('no_data_export', AppState.language));
            return;
        }

        console.log('CSV export pending implementation');
    }

    _registerUiInteractions() {
        const periodDropdown = new Dropdown({
            elementId: 'filter-select',
            initialValue: AppState.filters.current,
            onChange: value => {
                this.filterManager.setPeriodFilter(value);
                this.updateDashboard();
            }
        });
        periodDropdown.init();

        const datePicker = new DateRangePicker({
            startId: 'start-date-select',
            endId: 'end-date-select',
            onChange: ({ startDate, endDate }) => {
                const currentRange = AppState.filters.dateRange;
                const nextStart = startDate !== undefined ? startDate : currentRange.start;
                const nextEnd = endDate !== undefined ? endDate : currentRange.end;
                this.filterManager.setDateRange(nextStart, nextEnd);
                this.updateDashboard();
            }
        });
        datePicker.init();

        const searchBox = new SearchBox({
            elementId: 'transaction-search',
            delay: APP_CONFIG.SEARCH_DEBOUNCE_DELAY,
            onChange: value => {
                this.filterManager.setSearchQuery(value.toLowerCase());
                this.updateDashboard();
            }
        });
        searchBox.init();

        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', event => {
                AppState.setLanguage(event.target.value);
                this._updateLanguageText();
                this.updateDashboard();
            });
        }

    initSecurityListeners();
    }

    _registerGlobalListeners() {
        document.addEventListener('filters:updated', () => {
            this.updateDashboard();
        });

        document.addEventListener('click', event => {
            const isDropdown = event.target.closest('.column-filter-dropdown');
            const isTrigger = event.target.closest('.th-search-icon');
            if (!isDropdown && !isTrigger) {
                document.querySelectorAll('.column-filter-dropdown').forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });
    }

    _resetFilterInputs() {
        const startDateEl = document.getElementById('start-date-select');
        const endDateEl = document.getElementById('end-date-select');
        const searchEl = document.getElementById('transaction-search');
        const filterEl = document.getElementById('filter-select');

        if (startDateEl) startDateEl.value = '';
        if (endDateEl) endDateEl.value = '';
        if (searchEl) searchEl.value = '';
        if (filterEl) filterEl.value = APP_CONFIG.DEFAULT_FILTER;
    }

    _setupLanguage() {
        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.value = AppState.language;
        }
        this._updateLanguageText();
    }

    _updateLanguageText() {
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
}
