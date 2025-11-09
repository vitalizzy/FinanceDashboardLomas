/**
 * ============================================================================
 * TABLA DE TOP MOVIMIENTOS (hereda de BaseTable)
 * ============================================================================
 */

import { BaseTable } from '../../core/base_table.js';
import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { parseAmount } from '../../core/utils.js';
import { formatCurrency } from '../../core/formatters.js';

// Implementación especializada basada en BaseTable para listar movimientos relevantes.
export class TopMovementsTable extends BaseTable {
    constructor() {
        super('expected-movements-table', {
            compact: true,
            initialRows: 20,
            rowsIncrement: 10,
            sortStateKey: 'topMovementsSortState'
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
                key: 'Concepto', 
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
            },
            { 
                key: 'typicalAmount', 
                labelKey: 'typical_amount', 
                type: 'currency', 
                width: '140px',
                align: 'text-right',
                headerAlign: 'text-right',
                cssClass: 'color-secondary',
                sortable: true,
                searchable: false
            }
        ];
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

    /**
     * Hook: Personalizar clase de fila (pending status)
     */
    getRowClass(item) {
        const category = item.Categoria || 'Sin categoría';
        const isPending = AppState.filters.pendingCategories.has(category);
        return isPending ? 'pending-selected' : '';
    }

    /**
     * Hook: Personalizar atributos de fila (onclick handler)
     */
    getRowAttributes(item) {
        const category = item.Categoria || 'Sin categoría';
        return `onclick="window.selectPendingCategory(event, '${category.replace(/'/g, "\\'")}')"`;
    }
}

// Instancia global
export const topMovementsTable = new TopMovementsTable();

/**
 * NOTA: Los handlers window.sortTable_*, toggleColumnFilter_*, applyColumnFilter_*,
 * y cancelColumnFilter_* se registran automáticamente en BaseTable.registerWindowHandlers(),
 * no es necesario registrarlos aquí manualmente. Los handlers en BaseTable hacen render
 * automáticamente después de cambiar el estado de sorting/filtrado.
 */
