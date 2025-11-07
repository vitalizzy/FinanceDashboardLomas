/**
 * ============================================================================
 * TABLA DE TODOS LOS MOVIMIENTOS (hereda de BaseTable)
 * ============================================================================
 */

import { BaseTable } from './BaseTable.js';
import { AppState } from './state.js';
import { translate } from './i18n.js';
import { parseDate, parseAmount } from './utils.js';
import { formatCurrency } from './formatters.js';

export class AllTransactionsTable extends BaseTable {
    constructor() {
        super('all-transactions-table', {
            compact: true,
            pagination: true,
            itemsPerPage: 50,
            sortColumn: 'F. Operativa',
            sortDirection: 'desc'
        });
        
        this.columns = [
            { key: 'F. Operativa', labelKey: 'date', type: 'date', align: '' },
            { key: 'Categoria', labelKey: 'category', align: '' },
            { key: 'Concepto (Original)', labelKey: 'concept', align: '', cssClass: 'col-concepto-original' },
            { key: 'Concepto Publico', labelKey: 'concept', align: '', cssClass: 'col-secreta' },
            { key: 'Importe', labelKey: 'amount', type: 'currency', align: 'text-right', cellClass: (item) => this.getAmountClass(item) },
            { key: 'per Home', labelKey: 'per_home', type: 'currency', align: 'text-right', cellClass: 'color-per-home' },
            { key: 'Tipo', labelKey: 'type', align: 'text-center', cellClass: (item) => this.getTypeClass(item) },
            { key: 'Saldo', labelKey: 'balance', type: 'currency', align: 'text-right', cellClass: 'color-secondary' }
        ];
    }

    render(data) {
        super.render(data, this.columns);
    }

    getAmountClass(item) {
        const amount = parseAmount(item.Importe || '0');
        return amount >= 0 ? 'color-ingresos weight-medium' : 'color-gastos weight-medium';
    }

    getTypeClass(item) {
        const tipo = item.Tipo || '';
        return tipo === 'Ingreso' ? 'color-ingresos' : 'color-gastos';
    }

    renderRow(item, columns) {
        let html = '<tr>';
        
        columns.forEach(col => {
            const value = this.formatCellValue(item[col.key], col);
            const classes = col.cellClass ? (typeof col.cellClass === 'function' ? col.cellClass(item) : col.cellClass) : '';
            const align = col.align || '';
            html += `<td class="${classes} ${align}">${value}</td>`;
        });
        
        html += '</tr>';
        return html;
    }
}

// Instancia global
export const allTransactionsTable = new AllTransactionsTable();

// Exponer funciones globalmente para onclick (usando safeId)
window.sortTable_all_transactions_table = (col) => {
    allTransactionsTable.sort(col);
    allTransactionsTable.render(AppState.data.filtered);
};

window.nextPage_all_transactions_table = () => {
    allTransactionsTable.nextPage();
    allTransactionsTable.render(AppState.data.filtered);
};

window.prevPage_all_transactions_table = () => {
    allTransactionsTable.prevPage();
    allTransactionsTable.render(AppState.data.filtered);
};
