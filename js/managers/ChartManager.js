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
        destroyAllCharts();

        this.charts.forEach(({ id, prepare, render }) => {
            try {
                const chartData = prepare(dataset);
                if (!chartData || chartData.length === 0) {
                    return;
                }
                render(id, chartData);
            } catch (error) {
                console.error(`[ChartManager] Failed to render chart ${id}:`, error);
            }
        });
    }

    registerChart(definition) {
        this.charts.push(definition);
    }
}
