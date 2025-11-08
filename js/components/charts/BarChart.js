/**
 * ECharts-based Expenses Bar Chart
 * Replaces Chart.js with professional ECharts visualization
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { formatCurrency } from '../../core/formatters.js';

class ExpensesBarChart extends EChartsBarChart {
    constructor({ canvasId, data }) {
        super(canvasId);
        this.data = data;
    }

    getLabels() {
        return this.data.map(([label]) => label.length > 15 ? `${label.substring(0, 15)}...` : label);
    }

    getDatasets() {
        return [{
            label: translate('chart_label_expenses', AppState.language),
            data: this.data.map(([, value]) => value),
            backgroundColor: AppState.chartColors.gastos
        }];
    }

    render() {
        if (!this.init()) {
            console.error('Failed to initialize ECharts for expenses chart');
            return;
        }

        const labels = this.getLabels();
        const datasets = this.getDatasets();

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
