import { debounce } from '../../core/utils.js';

/**
 * Standard debounced search behaviour.
 */
export class SearchBox {
    constructor({ elementId, onChange, delay = 250 }) {
        this.elementId = elementId;
        this.onChange = onChange;
        this.delay = delay;
    }

    init() {
        const input = document.getElementById(this.elementId);
        if (!input) return;

        const handler = debounce(value => {
            if (typeof this.onChange === 'function') {
                this.onChange(value);
            }
        }, this.delay);

        input.addEventListener('input', event => handler(event.target.value));
        return input;
    }
}
