import { AppState } from '../state.js';
import { APP_CONFIG } from '../config.js';

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

        panel.classList.toggle('visible', hasActiveFilters);

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
        badge.innerHTML = `
            <span>${text}</span>
            <span class="remove">×</span>
        `;
        badge.querySelector('.remove').addEventListener('click', onRemove);
        return badge;
    }
}
