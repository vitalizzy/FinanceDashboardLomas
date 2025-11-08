import { destroyAllCharts, createBarChart, createLineChart, getExpensesByCategory, getMonthlyFlow } from '../components/charts/index.js';

const DEFAULT_CHARTS = [
    {
        id: 'expenses-chart',
        type: 'bar',
        prepare: data => getExpensesByCategory(data),
        render: (canvasId, chartData) => createBarChart(canvasId, chartData)
    },
    {
        id: 'monthly-flow-chart',
        type: 'line',
        prepare: data => getMonthlyFlow(data),
        render: (canvasId, chartData) => createLineChart(canvasId, chartData)
    }
];

/**
 * Centralises chart rendering so new chart types can be registered easily.
 */
export class ChartManager {
    constructor({ charts = DEFAULT_CHARTS } = {}) {
        this.charts = charts;
    }

    renderAll(dataset) {
        console.log('📊 ChartManager.renderAll() called with', dataset.length, 'items');
        window.destroyAllCharts();

        this.charts.forEach(({ id, prepare, render }) => {
            try {
                console.log('  📈 Rendering chart:', id);
                const chartData = prepare(dataset);
                console.log('    ✅ Data prepared:', Array.isArray(chartData) ? chartData.length + ' items' : 'object');
                if (!chartData || (Array.isArray(chartData) && chartData.length === 0)) {
                    console.warn('    ⚠️ No data for chart:', id);
                    return;
                }
                render(id, chartData);
                console.log('    ✅ Chart rendered:', id);
            } catch (error) {
                console.error(`[ChartManager] Failed to render chart ${id}:`, error);
            }
        });
    }

    registerChart(definition) {
        this.charts.push(definition);
    }
}
