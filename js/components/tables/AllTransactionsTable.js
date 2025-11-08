/**
 * ============================================================================
 * TABLA DE TODOS LOS MOVIMIENTOS (hereda de BaseTable)
 * ============================================================================
 */

import { BaseTable } from '../../core/base_table.js';
import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { parseDate, parseAmount } from '../../core/utils.js';
import { formatCurrency } from '../../core/formatters.js';

// Tabla concreta que hereda las capacidades comunes de paginado/scroll de BaseTable.
export class AllTransactionsTable extends BaseTable {
    constructor() {
        super('all-transactions-table', {
            compact: true,
            initialRows: 20,
            rowsIncrement: 20,
            sortColumn: 'F. Operativa',
            sortDirection: 'desc',
            sortStateKey: 'allTransactionsSortState'
        });
        
        this.columns = [
            { 
                key: 'F. Operativa', 
                labelKey: 'date', 
                type: 'date', 
                width: '110px',
                align: 'text-center',
                headerAlign: 'text-center',
                sortable: true,
                searchable: true
            },
            { 
                key: 'Categoria', 
                labelKey: 'category', 
                minWidth: '120px',
                maxWidth: '180px',
                sortable: true,
                searchable: true
            },
            { 
                key: 'Concepto (Original)', 
                labelKey: 'concept', 
                minWidth: '200px',
                cssClass: 'col-concepto-original', 
                sortable: true,
                searchable: true
            },
            { 
                key: 'Concepto', 
                labelKey: 'concept', 
                minWidth: '200px',
                cssClass: 'col-secreta', 
                sortable: true,
                searchable: true
            },
            { 
                key: 'Importe', 
                labelKey: 'amount', 
                type: 'currency', 
                width: '120px',
                align: 'text-right',
                headerAlign: 'text-right',
                cellClass: (item) => this.getAmountClass(item), 
                sortable: true,
                searchable: false
            },
            { 
                key: 'per Home', 
                labelKey: 'per_home', 
                type: 'currency', 
                width: '110px',
                align: 'text-right',
                headerAlign: 'text-right',
                cellClass: 'color-per-home', 
                sortable: true,
                searchable: false
            },
            { 
                key: 'Tipo', 
                labelKey: 'type', 
                width: '90px',
                align: 'text-center',
                headerAlign: 'text-center',
                cellClass: (item) => this.getTypeClass(item), 
                sortable: true,
                searchable: true
            },
            { 
                key: 'Saldo', 
                labelKey: 'balance', 
                type: 'currency', 
                width: '120px',
                align: 'text-right',
                headerAlign: 'text-right',
                cellClass: 'color-secondary', 
                sortable: true,
                searchable: false
            }
        ];
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

/**
 * NOTA: Los handlers window.sortTable_* y toggleColumnFilter_* se registran
 * automáticamente en BaseTable.registerWindowHandlers(), no es necesario
 * registrarlos aquí manualmente. Los handlers en BaseTable hacen render
 * automáticamente después de cambiar el estado de sorting/filtrado.
 */

window.applyColumnFilter_all_transactions_table = (col, event) => {
    if (event) event.stopPropagation();
    allTransactionsTable.applyColumnFilterFromDropdown(col);
};

window.cancelColumnFilter_all_transactions_table = (col, event) => {
    if (event) event.stopPropagation();
    allTransactionsTable.cancelColumnFilter(col);
};
