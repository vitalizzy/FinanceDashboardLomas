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
            rowsIncrement: 10,
            sortStateKey: 'categorySummarySortState'
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
                headerClass: 'weight-medium',
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

/**
 * NOTA: Los handlers window.sortTable_*, toggleColumnFilter_*, applyColumnFilter_*,
 * y cancelColumnFilter_* se registran automáticamente en BaseTable.registerWindowHandlers(),
 * no es necesario registrarlos aquí manualmente. Los handlers en BaseTable hacen render
 * automáticamente después de cambiar el estado de sorting/filtrado.
 */
