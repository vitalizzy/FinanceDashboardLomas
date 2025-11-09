import { parseAmount } from '../core/utils.js';
import { allTransactionsTable } from '../components/tables/AllTransactionsTable.js';
import { topMovementsTable } from '../components/tables/TopMovementsTable.js';
import { expectedMovementsTable } from '../components/tables/ExpectedMovementsTable.js';
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
        this.helpers = {
            allTransactions: allTransactionsTable,
            topMovements: topMovementsTable,
            expectedMovements: expectedMovementsTable,
            categorySummary: categorySummaryTable,
            getCategoryStats: data => this._getCategoryStats(data),
            getTopMovements: data => this._getTopMovements(data),
            getExpectedMovements: data => this._getExpectedMovements(data)
        };
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
        const categoryTotals = {};

        data.forEach(item => {
            const category = item.Categoria || 'Sin categoría';
            const ingresos = parseAmount(item.Ingresos || '0');
            const gastos = parseAmount(item.Gastos || '0');
            const absoluteValue = Math.abs(ingresos > 0 ? ingresos : -gastos);

            if (!categoryTotals[category]) {
                categoryTotals[category] = { total: 0, movements: [], count: 0, sum: 0 };
            }

            categoryTotals[category].total += absoluteValue;
            categoryTotals[category].movements.push({
                ...item,
                amount: ingresos > 0 ? ingresos : -gastos,
                absoluteValue
            });
            categoryTotals[category].count += 1;
            categoryTotals[category].sum += absoluteValue;
        });

        const top5Categories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b.total - a.total)
            .slice(0, 5);

        const topMovements = top5Categories.map(([category, data]) => {
            const topMovement = data.movements.sort((a, b) => b.absoluteValue - a.absoluteValue)[0];
            // Calculate average movement for the category (typical amount)
            const averageAmount = data.sum / data.count;
            // Add typical movement info to the item
            return {
                ...topMovement,
                typicalAmount: averageAmount,
                categoryMovementCount: data.count
            };
        });

        return topMovements.sort((a, b) => b.absoluteValue - a.absoluteValue);
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
