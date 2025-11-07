/**
 * Gráfico de barras para gastos por categoría
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { hexToRgba } from '../../core/utils.js';
import { formatCurrency } from '../../core/formatters.js';
import { BaseBarChart } from '../../core/base_bar_chart.js';

class ExpensesBarChart extends BaseBarChart {
    constructor({ canvasId, data }) {
        super({ canvasId });
        this.data = data;
    }

    getLabels() {
        return this.data.map(([label]) => label.length > 15 ? `${label.substring(0, 15)}...` : label);
    }

    getDatasets() {
        return [{
            label: translate('chart_label_expenses', AppState.language),
            data: this.data.map(([, value]) => value),
            backgroundColor: this.data.map(([label]) =>
                AppState.filters.categories.has(label)
                    ? hexToRgba(AppState.chartColors.balance, 0.8)
                    : (AppState.filters.pendingCategories.has(label)
                        ? 'rgba(255, 193, 7, 0.9)'
                        : 'rgba(52, 73, 94, 0.8)')
            ),
            borderColor: this.data.map(([label]) =>
                AppState.filters.categories.has(label)
                    ? AppState.chartColors.balance
                    : (AppState.filters.pendingCategories.has(label)
                        ? 'rgba(255, 193, 7, 1)'
                        : 'rgba(52, 73, 94, 1)')
            ),
            borderWidth: 2
        }];
    }

    getOptions() {
        const handleClick = (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const category = this.data[index][0];
                if (typeof window.selectPendingCategory === 'function') {
                    window.selectPendingCategory(null, category);
                }
            }
        };

        return {
            onClick: handleClick,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: context => this.data[context[0].dataIndex][0],
                        label: context => `${translate('chart_tooltip_expenses', AppState.language)} ${formatCurrency(this.data[context.dataIndex][1])}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#7f8c8d', maxRotation: 45, minRotation: 0 }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(127, 140, 141, 0.2)' },
                    ticks: {
                        color: '#7f8c8d',
                        callback: value => formatCurrency(value)
                    }
                }
            }
        };
    }
}

export function createBarChart(canvasId, data) {
    return new ExpensesBarChart({ canvasId, data }).render();
}
