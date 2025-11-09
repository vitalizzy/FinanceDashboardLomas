/**
 * ============================================================================
 * TABLA DE MOVIMIENTOS ESPERADOS POR CATEGORIA (hereda de BaseTable)
 * ============================================================================
 * Muestra las 10 categorías principales con su importe medio esperado,
 * rango de valores (mínimo/máximo) y cantidad de transacciones.
 */

import { BaseTable } from '../../core/base_table.js';
import { translate } from '../../core/i18n.js';
import { formatCurrency } from '../../core/formatters.js';

/**
 * Tabla especializada que muestra importes esperados por categoría
 */
export class ExpectedMovementsTable extends BaseTable {
    constructor() {
        super('expected-movements-table', {
            compact: false,
            initialRows: 10,
            rowsIncrement: 5,
            sortStateKey: 'expectedMovementsSortState'
        });
        
        this.columns = [
            { 
                key: 'category', 
                labelKey: 'category', 
                minWidth: '150px',
                maxWidth: '200px',
                sortable: true,
                searchable: true
            },
            { 
                key: 'expectedAmount', 
                labelKey: 'typical_amount', 
                type: 'currency',
                width: '140px',
                align: 'text-right',
                headerAlign: 'text-right',
                cssClass: 'color-primary weight-medium',
                sortable: true,
                searchable: false
            },
            { 
                key: 'minAmount', 
                labelKey: 'min_amount', 
                type: 'currency',
                width: '130px',
                align: 'text-right',
                headerAlign: 'text-right',
                cssClass: 'color-secondary',
                sortable: true,
                searchable: false
            },
            { 
                key: 'maxAmount', 
                labelKey: 'max_amount', 
                type: 'currency',
                width: '130px',
                align: 'text-right',
                headerAlign: 'text-right',
                cssClass: 'color-secondary',
                sortable: true,
                searchable: false
            },
            { 
                key: 'totalAmount', 
                labelKey: 'total_amount', 
                type: 'currency',
                width: '130px',
                align: 'text-right',
                headerAlign: 'text-right',
                cssClass: 'color-secondary',
                sortable: true,
                searchable: false
            },
            { 
                key: 'transactionCount', 
                labelKey: 'count', 
                width: '100px',
                align: 'text-center',
                headerAlign: 'text-center',
                sortable: true,
                searchable: false
            }
        ];
    }

    /**
     * Renderiza la tabla con los importes esperados
     * @param {Array} data - Array de objetos con estadísticas por categoría
     */
    render(data) {
        // Preparar datos para la tabla base
        const tableData = data.map(item => ({
            ...item,
            // Asegurar que los valores numéricos están en el formato correcto
            expectedAmount: typeof item.expectedAmount === 'number' ? item.expectedAmount : 0,
            minAmount: typeof item.minAmount === 'number' ? item.minAmount : 0,
            maxAmount: typeof item.maxAmount === 'number' ? item.maxAmount : 0,
            totalAmount: typeof item.totalAmount === 'number' ? item.totalAmount : 0,
            transactionCount: item.transactionCount || 0
        }));

        // Llamar al método render de la clase base
        super.render(tableData);
    }

    /**
     * Hook para personalizar el formateo de celdas
     */
    formatCellValue(value, column) {
        // Las columnas tipo 'currency' se formatean automáticamente en la clase base
        // Solo necesitamos personalización especial si es requerida
        return super.formatCellValue(value, column);
    }

    /**
     * Hook para personalizar la clase CSS de cada fila
     */
    getRowClass(item) {
        // Puedes agregar clases especiales basadas en el contenido de la fila
        if (item.type === 'income') {
            return 'row-income';
        } else if (item.type === 'expense') {
            return 'row-expense';
        }
        return '';
    }
}

// Instancia global
export const expectedMovementsTable = new ExpectedMovementsTable();
