/**
 * ============================================================================
 * TABLA DE TOP MOVIMIENTOS (hereda de BaseTable)
 * ============================================================================
 */

import { BaseTable } from './BaseTable.js';
import { AppState } from '../../state.js';
import { translate } from '../../i18n.js';
import { parseAmount } from '../../utils.js';
import { formatCurrency } from '../../formatters.js';

export class TopMovementsTable extends BaseTable {
    constructor() {
        super('top-movements-table', {
            compact: true,
            initialRows: 20,
            rowsIncrement: 10
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
                key: 'Concepto Publico', 
                labelKey: 'concept', 
                minWidth: '200px',
                sortable: true,
                searchable: true
            },
            { 
                key: 'amount', 
                labelKey: 'amount', 
                type: 'custom', 
                width: '130px',
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
                sortable: true,
                searchable: false
            }
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
        const category = item.Categoria || 'Sin categoría';
        const isPending = AppState.filters.pendingCategories.has(category);
        const pendingClass = isPending ? 'pending-selected' : '';
        
        let html = `<tr class="${pendingClass}" onclick="window.selectPendingCategory(event, '${category.replace(/'/g, "\\'")}')">`;
        
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
    if (typeof window.updateDashboard === 'function') {
        window.updateDashboard();
    }
};

window.filterColumn_top_movements_table = (col, value) => {
    topMovementsTable.filterColumn(col, value);
    if (typeof window.updateDashboard === 'function') {
        window.updateDashboard();
    }
};

window.toggleColumnFilter_top_movements_table = (col, event) => {
    topMovementsTable.toggleColumnFilter(col, event);
};

window.clearColumnFilter_top_movements_table = (col, event) => {
    topMovementsTable.clearColumnFilter(col, event);
    if (typeof window.updateDashboard === 'function') {
        window.updateDashboard();
    }
};
