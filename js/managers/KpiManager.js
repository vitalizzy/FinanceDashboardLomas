import { parseAmount } from '../core/utils.js';
import { formatCurrency } from '../core/formatters.js';
import { AppState } from '../core/state.js';

/**
 * Responsible for updating the KPI summary tiles.
 */
export class KpiManager {
    constructor({ selectors } = {}) {
        this.selectors = Object.assign({
            ingresos: 'total-ingresos',
            gastos: 'total-gastos',
            perHome: 'total-per-home',
            saldoFinal: 'saldo-final',
            transacciones: 'total-transacciones'
        }, selectors);
    }

    render(dataset) {
        const summary = this._buildSummary(dataset);

        this._updateText(this.selectors.ingresos, formatCurrency(summary.totalIngresos));
        this._updateText(this.selectors.gastos, formatCurrency(summary.totalGastos));
        this._updateText(this.selectors.perHome, formatCurrency(summary.totalPerHome));
        this._updateText(this.selectors.saldoFinal, formatCurrency(summary.saldoFinal));
        this._updateText(this.selectors.transacciones, summary.transacciones.toLocaleString('es-ES'));
    }

    _buildSummary(dataset) {
        const totals = {
            totalIngresos: 0,
            totalGastos: 0,
            totalPerHome: 0,
            saldoFinal: 0,
            transacciones: dataset.length
        };

        dataset.forEach(item => {
            totals.totalGastos += parseAmount(item.Gastos || '0');
            totals.totalIngresos += parseAmount(item.Ingresos || '0');
            totals.totalPerHome += parseAmount(item['per Home'] || '0');
        });

        if (AppState.data.financial.length > 0) {
            totals.saldoFinal = parseAmount(AppState.data.financial[0]['Saldo'] || '0');
        }

        return totals;
    }

    _updateText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}
