/**
 * Controls visibility of the loading overlay.
 */
export class LoadingOverlay {
    constructor({ elementId = 'loading' } = {}) {
        this.elementId = elementId;
    }

    show() {
        this._toggle(true);
    }

    hide() {
        this._toggle(false);
    }

    _toggle(visible) {
        const el = document.getElementById(this.elementId);
        if (el) {
            el.style.display = visible ? 'block' : 'none';
        }
    }
}
