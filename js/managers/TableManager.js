import { parseAmount } from '../core/utils.js';
import { BaseTable } from '../core/base_table.js';
import { allTransactionsTable } from '../components/tables/AllTransactionsTable.js';
import { topMovementsTable } from '../components/tables/TopMovementsTable.js';
import { categorySummaryTable } from '../components/tables/CategorySummaryTable.js';

const DEFAULT_TABLES = [
    {
        key: 'all-transactions',
        render: (dataset, helpers) => {
            helpers.allTransactions.render(dataset);
        }
    },
    {
        key: 'expected-movements',
        render: (dataset, helpers) => {
            const expectedMovements = helpers.getExpectedMovements(dataset);
            helpers.expectedMovements.render(expectedMovements);
        }
    },
    {
        key: 'category-summary',
        render: (dataset, helpers) => {
            const stats = helpers.getCategoryStats(dataset);
            const totalExpenses = dataset.reduce((sum, item) => sum + parseAmount(item.Gastos || '0'), 0);
            helpers.categorySummary.render(stats, totalExpenses);
        }
    }
];

/**
 * Provides a single entry point to render every table view.
 */
export class TableManager {
    constructor({ tables = DEFAULT_TABLES } = {}) {
        this.tables = tables;
        
        // Create BaseTable instance for expected movements dynamically
        this._createExpectedMovementsTable();
        
        this.helpers = {
            allTransactions: allTransactionsTable,
            topMovements: topMovementsTable,
            expectedMovements: this.expectedMovementsTable,
            categorySummary: categorySummaryTable,
            getCategoryStats: data => this._getCategoryStats(data),
            getTopMovements: data => this._getTopMovements(data),
            getExpectedMovements: data => this._getExpectedMovements(data)
        };
    }

    /**
     * Creates a BaseTable instance configured for expected movements
     */
    _createExpectedMovementsTable() {
        const table = new BaseTable('expected-movements-table', {
            compact: false,
            initialRows: 10,
            rowsIncrement: 5,
            sortStateKey: 'expectedMovementsSortState'
        });

        // Configure columns for expected movements
        table.columns = [
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

        this.expectedMovementsTable = table;
    }

    renderAll(dataset) {
        this.tables.forEach(({ key, render }) => {
            try {
                render(dataset, this.helpers);
            } catch (error) {
                console.error(`[TableManager] Failed to render table ${key}:`, error);
            }
        });
    }

    _getCategoryStats(data) {
        const stats = {};

        data.forEach(item => {
            const gastos = parseAmount(item.Gastos || '0');
            if (gastos <= 0) return;

            const category = item.Categoria || 'Sin categoría';
            if (!stats[category]) {
                stats[category] = { count: 0, total: 0 };
            }
            stats[category].count += 1;
            stats[category].total += gastos;
        });

        return stats;
    }

    _getTopMovements(data) {
        const categoryStats = {};

        // Agrupar por categoría y recopilar todos los importes
        data.forEach(item => {
            const category = item.Categoria || 'Sin categoría';
            const ingresos = parseAmount(item.Ingresos || '0');
            const gastos = parseAmount(item.Gastos || '0');
            const amount = Math.abs(ingresos > 0 ? ingresos : -gastos);

            if (!categoryStats[category]) {
                categoryStats[category] = { 
                    amounts: [],
                    count: 0,
                    totalPerHome: 0
                };
            }

            categoryStats[category].amounts.push(amount);
            categoryStats[category].count += 1;
            
            // Calcular per home (importe / 160)
            const perHome = amount / 160;
            categoryStats[category].totalPerHome += perHome;
        });

        // Calcular importe típico (moda con margen del 5%)
        const topMovementsData = Object.entries(categoryStats).map(([category, stats]) => {
            const typicalAmount = this._calculateTypicalAmount(stats.amounts);
            const avgPerHome = stats.totalPerHome / stats.count;

            return {
                category,
                typicalAmount,
                perHome: avgPerHome,
                transactionCount: stats.count,
                totalAmount: stats.amounts.reduce((a, b) => a + b, 0)
            };
        });

        // Ordenar por importe típico descendente y tomar top 5
        return topMovementsData
            .sort((a, b) => b.typicalAmount - a.typicalAmount)
            .slice(0, 5);
    }

    /**
     * Calcula el importe típico (moda) de una categoría
     * Encuentra la cantidad que más se repite dentro de un margen del 5%
     * @param {Array} amounts - Array de importes
     * @returns {number} Importe típico
     */
    _calculateTypicalAmount(amounts) {
        if (amounts.length === 0) return 0;
        if (amounts.length === 1) return amounts[0];

        // Ordenar los importes
        const sorted = [...amounts].sort((a, b) => a - b);

        // Agrupar importes dentro de un margen del 5%
        const groups = [];
        let currentGroup = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
            const margin = sorted[i] * 0.05; // 5% de margen
            if (Math.abs(sorted[i] - sorted[i - 1]) <= margin) {
                currentGroup.push(sorted[i]);
            } else {
                groups.push(currentGroup);
                currentGroup = [sorted[i]];
            }
        }
        groups.push(currentGroup);

        // Encontrar el grupo más grande (moda)
        const largestGroup = groups.reduce((max, group) => 
            group.length > max.length ? group : max
        );

        // Retornar el promedio del grupo más frecuente
        return largestGroup.reduce((a, b) => a + b, 0) / largestGroup.length;
    }

    /**
     * Calcula los 10 importes esperados (promedio) por categoría
     * @param {Array} data - Dataset de transacciones
     * @returns {Array} Array de objetos con categoria y importe esperado
     */
    _getExpectedMovements(data) {
        const categoryStats = {};

        data.forEach(item => {
            const category = item.Categoria || 'Sin categoría';
            const ingresos = parseAmount(item.Ingresos || '0');
            const gastos = parseAmount(item.Gastos || '0');
            const amount = ingresos > 0 ? ingresos : -gastos;

            if (!categoryStats[category]) {
                categoryStats[category] = { 
                    totalAmount: 0, 
                    count: 0,
                    minAmount: amount,
                    maxAmount: amount,
                    type: ingresos > 0 ? 'income' : 'expense'
                };
            }

            categoryStats[category].totalAmount += Math.abs(amount);
            categoryStats[category].count += 1;
            categoryStats[category].minAmount = Math.min(categoryStats[category].minAmount, Math.abs(amount));
            categoryStats[category].maxAmount = Math.max(categoryStats[category].maxAmount, Math.abs(amount));
        });

        // Convertir a array y ordenar por total (mayor a menor)
        const expectedMovements = Object.entries(categoryStats)
            .map(([category, stats]) => ({
                category,
                expectedAmount: stats.totalAmount / stats.count,
                transactionCount: stats.count,
                totalAmount: stats.totalAmount,
                minAmount: stats.minAmount,
                maxAmount: stats.maxAmount,
                type: stats.type
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 10); // Top 10 categorías

        return expectedMovements;
    }
}
