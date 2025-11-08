/**
 * ECharts-based Monthly Flow Line Chart
 * Replaces Chart.js with professional ECharts visualization
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { formatCurrency } from '../../core/formatters.js';

class MonthlyFlowLineChart extends EChartsLineChart {
    constructor({ canvasId, data }) {
        super(canvasId);
        this.rawData = data;
        this.last12MonthsData = data.slice(-12);
    }

    getLabels() {
        return this.last12MonthsData.map(([month]) => {
            const [year, monthNum] = month.split('-');
            return `${monthNum}/${year}`;
        });
    }

    getDatasets() {
        return [
            this.buildDataset('chart_label_income', AppState.chartColors.ingresos, values => values.ingresos),
            this.buildDataset('chart_label_expenses_only', AppState.chartColors.gastos, values => values.gastos),
            this.buildDataset('chart_label_per_home', AppState.chartColors.perHome, values => values.perHome),
            this.buildDataset('chart_label_min_balance', AppState.chartColors.saldoMinimo, values => values.minBalance),
            this.buildDataset('chart_label_final_balance', AppState.chartColors.balance, values => values.finalBalance)
        ];
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
        if (!this.init()) {
            console.error('Failed to initialize ECharts for monthly flow chart');
            return;
        }

        const labels = this.getLabels();
        const datasets = this.getDatasets();

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
