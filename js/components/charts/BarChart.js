/**
 * ECharts-based Expenses Bar Chart
 * Replaces Chart.js with professional ECharts visualization
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { formatCurrency } from '../../core/formatters.js';

// Access global EChartsBarChart that was loaded via script tag
const EChartsBarChart = window.EChartsBarChart;

if (!EChartsBarChart) {
    console.error('EChartsBarChart not found. Ensure base_echarts.js and echarts_bar_chart.js are loaded.');
}

class ExpensesBarChart extends EChartsBarChart {
    constructor({ canvasId, data }) {
        super(canvasId);
        console.log('📊 BarChart constructor - data:', data);
        if (!data || !Array.isArray(data)) {
            console.error('❌ Invalid data passed to BarChart. Expected array, got:', typeof data);
        }
        this.data = data || [];
        console.log('📊 BarChart created:', { canvasId, dataLength: this.data.length });
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
            if (event.dataIndex !== undefined) {
                const category = this.data[event.dataIndex][0];
                if (typeof window.selectPendingCategory === 'function') {
                    window.selectPendingCategory(null, category);
                }
            }
        });

        // Render using parent class
        this.setData(labels, datasets);
    }
}

export function createBarChart(canvasId, data) {
    return new ExpensesBarChart({ canvasId, data }).render();
}
