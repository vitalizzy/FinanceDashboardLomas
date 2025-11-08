import { destroyAllCharts, createBarChart, createLineChart, createBarRaceChart, getExpensesByCategory, getMonthlyFlow, getByCategoryByMetric, getCategoryRaceData } from '../components/charts/index.js';

const DEFAULT_CHARTS = [
    {
        id: 'expenses-chart',
        type: 'bar',
        prepare: (data, context) => {
            // Use the selected KPI metric from the dashboard context
            const metric = context?.selectedCategoryKPI || 'gastos';
            return getByCategoryByMetric(data, metric);
        },
        render: (canvasId, chartData, context) => {
            const metric = context?.selectedCategoryKPI || 'gastos';
            createBarChart(canvasId, chartData, metric);
        }
    },
    {
        id: 'monthly-flow-chart',
        type: 'line',
        prepare: data => getMonthlyFlow(data),
        render: (canvasId, chartData) => createLineChart(canvasId, chartData)
    },
    {
        id: 'bar-race-chart',
        type: 'bar-race',
        prepare: data => getCategoryRaceData(data),
        render: (canvasId, chartData) => createBarRaceChart(canvasId, chartData)
    }
];

/**
 * Centralises chart rendering so new chart types can be registered easily.
 */
export class ChartManager {
    constructor({ charts = DEFAULT_CHARTS } = {}) {
        this.charts = charts;
        this.context = {}; // Store context like selectedCategoryKPI
        this.chartInstances = {}; // Store chart instances for access
    }

    setContext(context) {
        this.context = context;
    }

    getChart(chartId) {
        return this.chartInstances[chartId];
    }

    setChartInstance(chartId, instance) {
        this.chartInstances[chartId] = instance;
    }

    renderAll(dataset) {
        console.log('📊 ChartManager.renderAll() called with', dataset.length, 'items');
        window.destroyAllCharts();

        this.charts.forEach(({ id, prepare, render }) => {
            try {
                console.log('  📈 Rendering chart:', id);
                const chartData = prepare(dataset, this.context);
                console.log('    ✅ Data prepared:', Array.isArray(chartData) ? chartData.length + ' items' : 'object');
                if (!chartData || (Array.isArray(chartData) && chartData.length === 0)) {
                    console.warn('    ⚠️ No data for chart:', id);
                    return;
                }
                const chartInstance = render(id, chartData, this.context);
                // Store instance if returned (for animation control, etc.)
                if (chartInstance) {
                    this.setChartInstance(id, chartInstance);
                }
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
