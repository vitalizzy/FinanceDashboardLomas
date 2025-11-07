/**
 * Gráfico de líneas para flujos mensuales
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { hexToRgba } from '../../core/utils.js';
import { formatCurrency } from '../../core/formatters.js';
import { BaseLineChart } from '../../core/base_line_chart.js';

class MonthlyFlowLineChart extends BaseLineChart {
    constructor({ canvasId, data }) {
        super({ canvasId });
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
            this.buildDataset('chart_label_per_home', AppState.chartColors.perHome, values => values.perHome, 'y1'),
            this.buildDataset('chart_label_min_balance', AppState.chartColors.saldoMinimo, values => values.minBalance),
            this.buildDataset('chart_label_final_balance', AppState.chartColors.balance, values => values.finalBalance)
        ];
    }

    getOptions() {
        const handleClick = (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const monthKey = this.last12MonthsData[index][0];
                if (typeof window.selectPendingMonth === 'function') {
                    window.selectPendingMonth(null, monthKey);
                }
            }
        };

        return {
            onClick: handleClick,
            plugins: {
                legend: {
                    labels: { color: '#2c3e50', font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(127, 140, 141, 0.2)' },
                    ticks: { color: '#7f8c8d' }
                },
                y: this.buildAxisOptions('chart_axis_income_expenses', '#7f8c8d'),
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: { drawOnChartArea: false },
                    ticks: {
                        color: AppState.chartColors.perHome,
                        callback: value => formatCurrency(value)
                    },
                    title: {
                        display: true,
                        text: translate('chart_axis_per_home', AppState.language),
                        color: AppState.chartColors.perHome
                    }
                }
            }
        };
    }

    buildDataset(labelKey, color, selector, yAxisID = 'y') {
        return {
            label: translate(labelKey, AppState.language),
            data: this.last12MonthsData.map(([, values]) => selector(values)),
            borderColor: color,
            backgroundColor: hexToRgba(color, 0.1),
            tension: 0.3,
            borderWidth: 2,
            pointBackgroundColor: this.last12MonthsData.map(([month]) =>
                AppState.filters.months.has(month)
                    ? AppState.chartColors.balance
                    : (AppState.filters.pendingMonths.has(month) ? '#ffc107' : color)
            ),
            pointRadius: this.last12MonthsData.map(([month]) =>
                AppState.filters.months.has(month)
                    ? 6
                    : (AppState.filters.pendingMonths.has(month) ? 5 : 4)
            ),
            yAxisID
        };
    }

    buildAxisOptions(labelKey, tickColor) {
        return {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            grid: { color: 'rgba(127, 140, 141, 0.2)' },
            ticks: {
                color: tickColor,
                callback: value => formatCurrency(value)
            },
            title: {
                display: true,
                text: translate(labelKey, AppState.language),
                color: '#2c3e50'
            }
        };
    }
}

export function createLineChart(canvasId, data) {
    return new MonthlyFlowLineChart({ canvasId, data }).render();
}
