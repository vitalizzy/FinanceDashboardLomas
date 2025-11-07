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
            { key: 'F. Operativa', labelKey: 'date', type: 'date', align: '', sortable: true },
            { key: 'Categoria', labelKey: 'category', align: '', sortable: true },
            { key: 'Concepto (Original)', labelKey: 'concept', align: '', cssClass: 'col-concepto-original', sortable: true },
            { key: 'Concepto Publico', labelKey: 'concept', align: '', cssClass: 'col-secreta', sortable: true },
            { key: 'Importe', labelKey: 'amount', type: 'currency', align: 'text-right', cellClass: (item) => this.getAmountClass(item), sortable: true },
            { key: 'per Home', labelKey: 'per_home', type: 'currency', align: 'text-right', cellClass: 'color-per-home', sortable: true },
            { key: 'Tipo', labelKey: 'type', align: 'text-center', cellClass: (item) => this.getTypeClass(item), sortable: true },
            { key: 'Saldo', labelKey: 'balance', type: 'currency', align: 'text-right', cellClass: 'color-secondary', sortable: true }
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
        const category = item.Categoria || 'Sin categoría';
        const itemDate = parseDate(item['F. Operativa']);
        const monthKey = itemDate ? `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}` : '';
        
        const isPendingCategory = AppState.filters.pendingCategories.has(category);
        const isPendingMonth = monthKey && AppState.filters.pendingMonths.has(monthKey);
        const pendingClass = (isPendingCategory || isPendingMonth) ? 'pending-selected' : '';
        
        let html = `<tr class="${pendingClass}" onclick="window.selectPendingCategory(event, '${category.replace(/'/g, "\\'")}')">`;
        
        columns.forEach(col => {
            const value = this.formatCellValue(item[col.key], col);
            const classes = col.cellClass ? (typeof col.cellClass === 'function' ? col.cellClass(item) : col.cellClass) : '';
            const cssClass = col.cssClass || '';
            const align = col.align || '';
            const allClasses = [classes, cssClass, align].filter(c => c).join(' ');
            html += `<td class="${allClasses}">${value}</td>`;
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

window.filterColumn_all_transactions_table = (col, value) => {
    allTransactionsTable.filterColumn(col, value);
    allTransactionsTable.render(AppState.data.filtered);
};

window.toggleColumnFilter_all_transactions_table = (col, event) => {
    allTransactionsTable.toggleColumnFilter(col, event);
};

window.clearColumnFilter_all_transactions_table = (col, event) => {
    allTransactionsTable.clearColumnFilter(col, event);
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
