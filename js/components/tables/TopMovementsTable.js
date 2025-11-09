/**
 * ============================================================================
 * TABLA DE TOP MOVIMIENTOS (hereda de BaseTable)
 * ============================================================================
 * Muestra top 5 categorías con importe típico, per home y transacciones
 * Ordenadas por importe típico descendente
 */

import { BaseTable } from '../../core/base_table.js';

// Implementación especializada basada en BaseTable para listar movimientos relevantes.
export class TopMovementsTable extends BaseTable {
    constructor() {
        super('expected-movements-table', {
            compact: false,
            initialRows: 10,
            rowsIncrement: 5,
            sortStateKey: 'topMovementsSortState'
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
                key: 'typicalAmount', 
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
                key: 'perHome', 
                labelKey: 'per_home', 
                type: 'currency', 
                width: '120px',
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
}

// Instancia global
export const topMovementsTable = new TopMovementsTable();
