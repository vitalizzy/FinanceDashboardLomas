import { parseAmount } from '../utils.js';
import { allTransactionsTable } from '../AllTransactionsTable.js';
import { topMovementsTable } from '../TopMovementsTable.js';
import { categorySummaryTable } from '../CategorySummaryTable.js';

const DEFAULT_TABLES = [
    {
        key: 'all-transactions',
        render: (dataset, helpers) => {
            helpers.allTransactions.render(dataset);
        }
    },
    {
        key: 'top-movements',
        render: (dataset, helpers) => {
            const topMovements = helpers.getTopMovements(dataset);
            helpers.topMovements.render(topMovements);
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
            categorySummary: categorySummaryTable,
            getCategoryStats: data => this._getCategoryStats(data),
            getTopMovements: data => this._getTopMovements(data)
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
                categoryTotals[category] = { total: 0, movements: [] };
            }

            categoryTotals[category].total += absoluteValue;
            categoryTotals[category].movements.push({
                ...item,
                amount: ingresos > 0 ? ingresos : -gastos,
                absoluteValue
            });
        });

        const top5Categories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b.total - a.total)
            .slice(0, 5);

        const topMovements = top5Categories.map(([category, data]) => {
            return data.movements.sort((a, b) => b.absoluteValue - a.absoluteValue)[0];
        });

        return topMovements.sort((a, b) => b.absoluteValue - a.absoluteValue);
    }
}
