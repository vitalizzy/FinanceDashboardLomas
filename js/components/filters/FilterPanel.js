import { AppState } from '../../core/state.js';
import { APP_CONFIG } from '../../core/config.js';
import { translate } from '../../core/i18n.js';

const DEFAULT_CONFIG = {
    panelId: 'active-filters',
    badgesId: 'filter-badges',
    clearFabId: 'clear-filters-fab',
    confirmButtons: [
        'top-confirm-icon',
        'cat-confirm-icon',
        'monthly-confirm-icon',
        'expenses-confirm-icon',
        'all-confirm-icon'
    ],
    cancelButtons: [
        'top-cancel-icon',
        'cat-cancel-icon',
        'monthly-cancel-icon',
        'expenses-cancel-icon',
        'all-cancel-icon'
    ],
    fabConfirmId: 'fab-confirm',
    fabCancelId: 'fab-cancel'
};

/**
 * Manages the visual representation of active filters.
 */
export class FilterPanel {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    render() {
        const panel = document.getElementById(this.config.panelId);
        const badgesContainer = document.getElementById(this.config.badgesId);
        const clearFiltersFab = document.getElementById(this.config.clearFabId);
        const clearAllButton = panel ? panel.querySelector('.clear-all-btn') : null;

        if (!panel || !badgesContainer) return;

        badgesContainer.innerHTML = '';

        let hasActiveFilters = false;
        const hasCustomPeriod = AppState.filters.current !== APP_CONFIG.DEFAULT_FILTER;
        const hasCustomRange = AppState.filters.dateRange.start !== null || AppState.filters.dateRange.end !== null;

        if (hasCustomPeriod || hasCustomRange) {
            hasActiveFilters = true;
        }

        AppState.filters.categories.forEach(category => {
            hasActiveFilters = true;
            const badge = this._createBadge(`📁 ${category}`, () => {
                AppState.removeCategory(category);
                document.dispatchEvent(new CustomEvent('filters:updated'));
            });
            badgesContainer.appendChild(badge);
        });

        AppState.filters.months.forEach(month => {
            hasActiveFilters = true;
            const badge = this._createBadge(`📅 ${month}`, () => {
                AppState.filters.months.delete(month);
                document.dispatchEvent(new CustomEvent('filters:updated'));
            });
            badgesContainer.appendChild(badge);
        });

        AppState.filters.columnFilters.forEach((filter, columnKey) => {
            hasActiveFilters = true;
            const label = filter?.labelKey ? translate(filter.labelKey, AppState.language) : columnKey;
            const badge = this._createBadge(`🔎 ${label}: ${filter?.value || ''}`, () => {
                AppState.removeColumnFilter(columnKey);
                document.dispatchEvent(new CustomEvent('filters:updated'));
                document.dispatchEvent(new CustomEvent('filters:pending-updated'));
            });
            badgesContainer.appendChild(badge);
        });

        panel.hidden = !hasActiveFilters;
        panel.classList.toggle('visible', hasActiveFilters);

        if (clearAllButton) {
            clearAllButton.style.display = hasActiveFilters ? 'inline-flex' : 'none';
            clearAllButton.disabled = !hasActiveFilters;
        }

        if (clearFiltersFab) {
            clearFiltersFab.style.display = hasActiveFilters ? 'flex' : 'none';
        }
    }

    togglePendingControls(visible) {
        const display = visible ? 'inline-flex' : 'none';
        const disabled = !visible;

        [...this.config.confirmButtons, ...this.config.cancelButtons]
            .map(id => document.getElementById(id))
            .filter(Boolean)
            .forEach(button => {
                button.style.display = display;
                if (this.config.confirmButtons.includes(button.id)) {
                    button.disabled = disabled;
                }
            });

        const fabConfirm = document.getElementById(this.config.fabConfirmId);
        const fabCancel = document.getElementById(this.config.fabCancelId);

        if (fabConfirm) fabConfirm.style.display = visible ? 'flex' : 'none';
        if (fabCancel) fabCancel.style.display = visible ? 'flex' : 'none';
    }

    hidePendingControls() {
        this.togglePendingControls(false);
    }

    _createBadge(text, onRemove) {
        const badge = document.createElement('div');
        badge.className = 'filter-badge';
        const label = document.createElement('span');
        label.textContent = text;
        const remove = document.createElement('span');
        remove.className = 'remove';
        remove.textContent = '×';
        remove.addEventListener('click', onRemove);
        badge.append(label, remove);
        return badge;
    }
}
