/**
 * ============================================================================
 * TABLA DE TOP MOVIMIENTOS (hereda de BaseTable)
 * ============================================================================
 */

import { BaseTable } from './BaseTable.js';
import { AppState } from './state.js';
import { translate } from './i18n.js';
import { parseDate, parseAmount } from './utils.js';
import { formatCurrency } from './formatters.js';

export class TopMovementsTable extends BaseTable {
    constructor() {
        super('top-movements-table', {
            compact: true,
            pagination: false
        });
        
        this.columns = [
            { key: 'F. Operativa', labelKey: 'date', type: 'date', align: '' },
            { key: 'Categoria', labelKey: 'category', align: '' },
            { key: 'Concepto', labelKey: 'concept', align: '' },
            { key: 'amount', labelKey: 'amount', type: 'custom', align: 'text-right', cellClass: (item) => this.getAmountClass(item) },
            { key: 'per Home', labelKey: 'per_home', type: 'currency', align: 'text-right' }
        ];
    }

    render(data) {
        // Asignar sortColumn/sortDirection desde AppState.ui si está disponible
        if (AppState.ui.topMovementsSortColumn) {
            this.sortColumn = AppState.ui.topMovementsSortColumn;
            this.sortDirection = AppState.ui.topMovementsSortDirection;
        }
        
        super.render(data, this.columns);
    }

    formatCellValue(value, column) {
        if (column.key === 'amount') {
            // Es un número que ya viene calculado
            const amountClass = value >= 0 ? 'color-ingresos' : 'color-gastos';
            return `<span class="${amountClass} weight-medium">${formatCurrency(Math.abs(value))}</span>`;
        }
        return super.formatCellValue(value, column);
    }

    getAmountClass(item) {
        const amount = item.amount || 0;
        return amount >= 0 ? 'color-ingresos weight-medium' : 'color-gastos weight-medium';
    }

    renderRow(item, columns) {
        const isPending = AppState.filters.pendingCategories.has(item.Categoria || 'Sin categoría');
        const pendingClass = isPending ? 'pending-selected' : '';
        
        let html = `<tr class="${pendingClass}" onclick="window.selectPendingCategory(event, '${(item.Categoria||'Sin categoría').replace(/'/g, "\\'")}')">`;
        
        columns.forEach(col => {
            let value;
            if (col.key === 'amount') {
                value = formatCurrency(Math.abs(item.amount || 0));
            } else {
                value = this.formatCellValue(item[col.key], col);
            }
            const classes = col.cellClass ? (typeof col.cellClass === 'function' ? col.cellClass(item) : col.cellClass) : '';
            const align = col.align || '';
            html += `<td class="${classes} ${align}">${value}</td>`;
        });
        
        html += '</tr>';
        return html;
    }
}

// Instancia global
export const topMovementsTable = new TopMovementsTable();

// Exponer funciones globalmente (usando safeId)
window.sortTable_top_movements_table = (col) => {
    topMovementsTable.sort(col);
    AppState.ui.topMovementsSortColumn = topMovementsTable.sortColumn;
    AppState.ui.topMovementsSortDirection = topMovementsTable.sortDirection;
    // Re-renderizar con los datos actuales (necesitarás pasarlos desde donde se llame)
};
