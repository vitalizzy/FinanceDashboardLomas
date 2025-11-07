/**
 * ============================================================================
 * TABLA DE RESUMEN POR CATEGORÍAS (hereda de BaseTable)
 * ============================================================================
 */

import { BaseTable } from './BaseTable.js';
import { AppState } from './state.js';
import { translate } from './i18n.js';
import { formatCurrency, formatPercent } from './formatters.js';

export class CategorySummaryTable extends BaseTable {
    constructor() {
        super('category-summary-table', {
            compact: true,
            pagination: false
        });
        
        this.columns = [
            { key: 'category', labelKey: 'category', align: 'weight-medium' },
            { key: 'count', labelKey: 'count', type: 'number', align: 'text-right' },
            { key: 'total', labelKey: 'expenses_sum', type: 'currency', align: 'text-right color-gastos weight-medium' },
            { key: 'percentage', labelKey: 'total_percent', type: 'percent', align: 'text-right color-secondary' }
        ];
    }

    render(categoryStats, totalGastos) {
        this.totalGastos = totalGastos;
        
        // Asignar sortColumn/sortDirection desde AppState.ui
        if (AppState.ui.categorySummarySortColumn) {
            this.sortColumn = AppState.ui.categorySummarySortColumn;
            this.sortDirection = AppState.ui.categorySummarySortDirection;
        }
        
        // Convertir el objeto categoryStats a array
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
    // Re-renderizar con los datos actuales
};
