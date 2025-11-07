import { translate } from '../../core/i18n.js';
import { AppState } from '../../core/state.js';
import { APP_CONFIG } from '../../core/config.js';

/**
 * Displays the timestamp of the latest record loaded.
 */
export class LastUpdateBanner {
    constructor({ elementId = 'last-update-date' } = {}) {
        this.elementId = elementId;
    }

    render(date) {
        if (!date) return;
        const element = document.getElementById(this.elementId);
        if (!element) return;

        const formatted = date.toLocaleDateString(APP_CONFIG.DATE_FORMAT_LOCALE, APP_CONFIG.DATE_FORMAT_OPTIONS);
        element.innerHTML = `<strong>${translate('last_update', AppState.language)}</strong> ${formatted}`;
    }
}
