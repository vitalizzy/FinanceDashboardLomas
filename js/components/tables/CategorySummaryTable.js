/**
 * ============================================================================
 * TABLA DE RESUMEN POR CATEGORÍAS (hereda de BaseTable)
 * ============================================================================
 */

import { BaseTable } from '../../core/base_table.js';
import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { formatCurrency } from '../../core/formatters.js';

// Vista de resumen que continúa la funcionalidad común de BaseTable para renderizar filas.
export class CategorySummaryTable extends BaseTable {
    constructor() {
        super('category-summary-table', {
            compact: true,
            initialRows: 20,
            rowsIncrement: 10
        });
        
        this.columns = [
            { 
                key: 'category', 
                labelKey: 'category', 
                minWidth: '150px',
                cssClass: 'weight-medium',
                sortable: true,
                searchable: true
            },
            { 
                key: 'count', 
                labelKey: 'count', 
                type: 'number', 
                width: '80px',
                align: 'text-right',
                headerAlign: 'text-right',
                sortable: true,
                searchable: false
            },
            { 
                key: 'total', 
                labelKey: 'expenses_sum', 
                type: 'currency', 
                width: '130px',
                align: 'text-right',
                headerAlign: 'text-right',
                cssClass: 'color-gastos weight-medium',
                sortable: true,
                searchable: false
            },
            { 
                key: 'percentage', 
                labelKey: 'total_percent', 
                type: 'percent', 
                width: '100px',
                align: 'text-right',
                headerAlign: 'text-right',
                cssClass: 'color-secondary',
                sortable: true,
                searchable: false
            }
        ];
    }

    render(categoryStats, totalGastos) {
        this.totalGastos = totalGastos;
        
        if (AppState.ui.categorySummarySortColumn) {
            this.sortColumn = AppState.ui.categorySummarySortColumn;
            this.sortDirection = AppState.ui.categorySummarySortDirection;
        }
        
        const data = Object.entries(categoryStats).map(([category, stats]) => ({
            category,
            count: stats.count,
            total: stats.total,
            percentage: totalGastos > 0 ? stats.total / totalGastos : 0
        }));
        
        super.render(data, this.columns);
    }

    renderRow(item, columns) {
        const isPending = AppState.filters.pendingCategories.has(item.category);
        const pendingClass = isPending ? 'pending-selected' : '';
        
        let html = `<tr class="${pendingClass}" onclick="window.selectPendingCategory(event, '${item.category.replace(/'/g, "\\'")}')">`;
        
        columns.forEach(col => {
            const value = this.formatCellValue(item[col.key], col);
            const align = col.align || '';
            html += `<td class="${align}">${value}</td>`;
        });
        
        html += '</tr>';
        return html;
    }

    renderFooter(data, columns) {
        const totalCount = data.reduce((sum, item) => sum + item.count, 0);
        const totalAmount = data.reduce((sum, item) => sum + item.total, 0);
        
        let html = '<tfoot><tr>';
        html += `<td class="weight-medium">${translate('total', AppState.language)}</td>`;
        html += `<td class="text-right">${totalCount}</td>`;
        html += `<td class="text-right">${formatCurrency(totalAmount)}</td>`;
        html += `<td class="text-right">100,0%</td>`;
        html += '</tr></tfoot>';
        
        return html;
    }
}

// Instancia global
export const categorySummaryTable = new CategorySummaryTable();

// Exponer funciones globalmente (usando safeId)
window.sortTable_category_summary_table = (col) => {
    categorySummaryTable.sort(col);
    AppState.ui.categorySummarySortColumn = categorySummaryTable.sortColumn;
    AppState.ui.categorySummarySortDirection = categorySummaryTable.sortDirection;
    if (typeof window.updateDashboard === 'function') {
        window.updateDashboard();
    }
};

window.toggleColumnFilter_category_summary_table = (col, event) => {
    categorySummaryTable.toggleColumnFilter(col, event);
};

window.applyColumnFilter_category_summary_table = (col, event) => {
    if (event) event.stopPropagation();
    categorySummaryTable.applyColumnFilterFromDropdown(col);
    if (typeof window.updateDashboard === 'function') {
        window.updateDashboard();
    }
};

window.cancelColumnFilter_category_summary_table = (col, event) => {
    if (event) event.stopPropagation();
    categorySummaryTable.cancelColumnFilter(col);
};
