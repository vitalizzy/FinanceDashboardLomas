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
    constructor({ canvasId, data, metric = 'gastos' }) {
        const ChartClass = getEChartsBarChart();
        
        // Delegate to ECharts instance
        this._chart = new ChartClass(canvasId);
        
        console.log('📊 BarChart constructor - data:', data);
        if (!data || !Array.isArray(data)) {
            console.error('❌ Invalid data passed to BarChart. Expected array, got:', typeof data);
        }
        this.data = data || [];
        this.metric = metric;
        console.log('📊 BarChart created:', { canvasId, dataLength: this.data.length, metric });
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
            // Map metric to label key and color
            const metricConfig = {
                'gastos': { labelKey: 'chart_label_expenses', color: AppState.chartColors.gastos },
                'ingresos': { labelKey: 'chart_label_income', color: AppState.chartColors.ingresos },
                'perHome': { labelKey: 'chart_label_per_home', color: AppState.chartColors.perHome },
                'transacciones': { labelKey: 'kpi_transacciones', color: AppState.chartColors.transacciones }
            };
            
            const config = metricConfig[this.metric] || metricConfig['gastos'];
            
            const datasets = [{
                label: translate(config.labelKey, AppState.language),
                data: this.data.map(([, value]) => value),
                backgroundColor: config.color
            }];
            console.log('  📊 Datasets generated: 1 series with', datasets[0].data.length, 'points for metric:', this.metric);
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
        console.log('  📊 BarChart this.data:', this.data);

        // First, render the chart data
        this.setData(labels, datasets);

        // Then, setup deferred click handler AFTER chart is rendered
        // Extract category keys from data for precise filtering
        const categoryKeys = this.data.map(([category]) => category);
        
        console.log('📊 Registering deferred click handler for categories with keys:', categoryKeys);
        this._chart.setDeferredClickHandler(
            categoryKeys,
            (selectedCategory) => {
                console.log('✅ Category selected from BarChart:', selectedCategory);
                if (typeof window.selectPendingCategory === 'function') {
                    console.log('📞 Calling selectPendingCategory with:', selectedCategory);
                    window.selectPendingCategory(null, selectedCategory);
                } else {
                    console.error('❌ selectPendingCategory function not found on window');
                }
            },
            'category'
        );
    }
}

export function createBarChart(canvasId, data, metric = 'gastos') {
    return new ExpensesBarChart({ canvasId, data, metric }).render();
}
