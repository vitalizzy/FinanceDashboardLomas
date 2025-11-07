/**
 * Coordinates start/end date filtering widgets.
 */
export class DateRangePicker {
    constructor({ startId, endId, onChange }) {
        this.startId = startId;
        this.endId = endId;
        this.onChange = onChange;
    }

    init() {
        const startInput = document.getElementById(this.startId);
        const endInput = document.getElementById(this.endId);

        if (startInput) {
            startInput.addEventListener('change', event => {
                this._handleStartChange(event.target.value);
            });
        }

        if (endInput) {
            endInput.addEventListener('change', event => {
                this._handleEndChange(event.target.value);
            });
        }

        return { startInput, endInput };
    }

    _handleStartChange(value) {
        const startDate = value ? new Date(`${value}-01`) : null;
        if (typeof this.onChange === 'function') {
            this.onChange({ startDate });
        }
    }

    _handleEndChange(value) {
        const endDate = value ? new Date(`${value}-01`) : null;
        const lastDay = endDate ? new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0) : null;
        if (typeof this.onChange === 'function') {
            this.onChange({ endDate: lastDay });
        }
    }
}
