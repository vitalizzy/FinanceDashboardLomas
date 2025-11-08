/**
 * ECharts-based Monthly Flow Line Chart
 * Replaces Chart.js with professional ECharts visualization
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { formatCurrency } from '../../core/formatters.js';

// Will be resolved at runtime when createLineChart is called
let EChartsLineChart = null;

function getEChartsLineChart() {
    if (!EChartsLineChart) {
        EChartsLineChart = window.EChartsLineChart;
        if (!EChartsLineChart) {
            console.error('❌ EChartsLineChart not found. Ensure base_echarts.js and echarts_line_chart.js are loaded.');
            throw new Error('EChartsLineChart not available');
        }
    }
    return EChartsLineChart;
}

class MonthlyFlowLineChart {
    constructor({ canvasId, data }) {
        const ChartClass = getEChartsLineChart();
        
        // Delegate to ECharts instance
        this._chart = new ChartClass(canvasId);
        
        console.log('📊 LineChart constructor - data:', data);
        if (!data || !Array.isArray(data)) {
            console.error('❌ Invalid data passed to LineChart. Expected array, got:', typeof data);
        }
        this.rawData = data || [];
        this.last12MonthsData = this.rawData.slice(-12);
        console.log('📊 LineChart created:', { canvasId, dataLength: this.rawData.length, last12: this.last12MonthsData.length });
    }

    init() {
        return this._chart.init();
    }

    setData(labels, datasets) {
        return this._chart.setData(labels, datasets);
    }

    on(eventName, handler) {
        return this._chart.on(eventName, handler);
    }

    getLabels() {
        try {
            const labels = this.last12MonthsData.map(([month]) => {
                if (!month) {
                    console.warn('⚠️ Month is undefined');
                    return 'Unknown';
                }
                const parts = month.split('-');
                const year = parts[0];
                const monthNum = parts[1];
                return `${monthNum}/${year}`;
            });
            console.log('  📍 Labels generated:', labels.length);
            return labels;
        } catch (e) {
            console.error('❌ Error in getLabels():', e);
            return [];
        }
    }

    getDatasets() {
        try {
            const datasets = [
                this.buildDataset('chart_label_income', AppState.chartColors.ingresos, values => values.ingresos),
                this.buildDataset('chart_label_expenses_only', AppState.chartColors.gastos, values => values.gastos),
                this.buildDataset('chart_label_per_home', AppState.chartColors.perHome, values => values.perHome),
                this.buildDataset('chart_label_min_balance', AppState.chartColors.saldoMinimo, values => values.minBalance),
                this.buildDataset('chart_label_final_balance', AppState.chartColors.balance, values => values.finalBalance)
            ];
            console.log('  📊 Datasets generated:', datasets.length, 'series');
            return datasets;
        } catch (e) {
            console.error('❌ Error in getDatasets():', e);
            return [];
        }
    }

    buildDataset(labelKey, color, selector) {
        return {
            label: translate(labelKey, AppState.language),
            data: this.last12MonthsData.map(([, values]) => selector(values)),
            borderColor: color,
            backgroundColor: color
        };
    }

    render() {
        console.log('📈 LineChart.render() called');
        if (!this.init()) {
            console.error('Failed to initialize ECharts for monthly flow chart');
            return;
        }

        const labels = this.getLabels();
        const datasets = this.getDatasets();
        console.log('📊 LineChart data:', { labelsCount: labels.length, datasetsCount: datasets.length });

        // Setup click handler
        this.on('click', (event) => {
            if (event.dataIndex !== undefined) {
                const monthKey = this.last12MonthsData[event.dataIndex][0];
                if (typeof window.selectPendingMonth === 'function') {
                    window.selectPendingMonth(null, monthKey);
                }
            }
        });

        // Render using parent class
        this.setData(labels, datasets);
    }
}

export function createLineChart(canvasId, data) {
    return new MonthlyFlowLineChart({ canvasId, data }).render();
}
