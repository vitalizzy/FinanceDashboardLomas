/**
 * Lightweight dropdown controller that standardises change handling.
 */
export class Dropdown {
    constructor({ elementId, onChange, initialValue }) {
        this.elementId = elementId;
        this.onChange = onChange;
        this.initialValue = initialValue;
    }

    init() {
        const element = document.getElementById(this.elementId);
        if (!element) return;

        if (this.initialValue !== undefined) {
            element.value = this.initialValue;
        }

        element.addEventListener('change', event => {
            if (typeof this.onChange === 'function') {
                this.onChange(event.target.value, event);
            }
        });

        return element;
    }
}
