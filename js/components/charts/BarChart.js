/**
 * ECharts-based Expenses Bar Chart
 * Replaces Chart.js with professional ECharts visualization
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { formatCurrency } from '../../core/formatters.js';

// Will be resolved at runtime when createBarChart is called
let EChartsBarChart = null;

function getEChartsBarChart() {
    if (!EChartsBarChart) {
        EChartsBarChart = window.EChartsBarChart;
        if (!EChartsBarChart) {
            console.error('❌ EChartsBarChart not found. Ensure base_echarts.js and echarts_bar_chart.js are loaded.');
            throw new Error('EChartsBarChart not available');
        }
    }
    return EChartsBarChart;
}

class ExpensesBarChart {
    constructor({ canvasId, data }) {
        const ChartClass = getEChartsBarChart();
        
        // Delegate to ECharts instance
        this._chart = new ChartClass(canvasId);
        
        console.log('📊 BarChart constructor - data:', data);
        if (!data || !Array.isArray(data)) {
            console.error('❌ Invalid data passed to BarChart. Expected array, got:', typeof data);
        }
        this.data = data || [];
        console.log('📊 BarChart created:', { canvasId, dataLength: this.data.length });
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
            const labels = this.data.map(([label]) => {
                if (!label) return 'Unknown';
                return label.length > 15 ? `${label.substring(0, 15)}...` : label;
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
            const datasets = [{
                label: translate('chart_label_expenses', AppState.language),
                data: this.data.map(([, value]) => value),
                backgroundColor: AppState.chartColors.gastos
            }];
            console.log('  📊 Datasets generated: 1 series with', datasets[0].data.length, 'points');
            return datasets;
        } catch (e) {
            console.error('❌ Error in getDatasets():', e);
            return [];
        }
    }

    render() {
        console.log('📊 BarChart.render() called');
        if (!this.init()) {
            console.error('Failed to initialize ECharts for expenses chart');
            return;
        }

        const labels = this.getLabels();
        const datasets = this.getDatasets();
        console.log('📊 BarChart data:', { labelsCount: labels.length, datasetsCount: datasets.length });

        // Setup click handler
        this.on('click', (event) => {
            console.log('🖱️ BarChart click event:', event);
            if (event.dataIndex !== undefined) {
                const category = this.data[event.dataIndex][0];
                console.log('✅ Category selected:', category);
                if (typeof window.selectPendingCategory === 'function') {
                    console.log('📞 Calling selectPendingCategory with:', category);
                    window.selectPendingCategory(null, category);
                } else {
                    console.error('❌ selectPendingCategory function not found on window');
                }
            }
        });

        // Render using instance
        this.setData(labels, datasets);
    }
}

export function createBarChart(canvasId, data) {
    return new ExpensesBarChart({ canvasId, data }).render();
}
