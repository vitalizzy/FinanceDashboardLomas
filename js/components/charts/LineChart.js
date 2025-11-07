/**
 * Gráfico de líneas para flujos mensuales
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { hexToRgba } from '../../core/utils.js';
import { formatCurrency } from '../../core/formatters.js';

export function createLineChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const last12MonthsData = data.slice(-12);

    try {
        if (window._charts && window._charts[canvasId]) {
            window._charts[canvasId].destroy();
        }
    } catch (error) {
        /* ignore */
    }

    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: last12MonthsData.map(([month]) => {
                const [year, monthNum] = month.split('-');
                return `${monthNum}/${year}`;
            }),
            datasets: [
                buildDataset(last12MonthsData, 'chart_label_income', AppState.chartColors.ingresos, values => values.ingresos),
                buildDataset(last12MonthsData, 'chart_label_expenses_only', AppState.chartColors.gastos, values => values.gastos),
                buildDataset(last12MonthsData, 'chart_label_per_home', AppState.chartColors.perHome, values => values.perHome, 'y1'),
                buildDataset(last12MonthsData, 'chart_label_min_balance', AppState.chartColors.saldoMinimo, values => values.minBalance),
                buildDataset(last12MonthsData, 'chart_label_final_balance', AppState.chartColors.balance, values => values.finalBalance)
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const monthKey = last12MonthsData[index][0];
                    if (typeof window.selectPendingMonth === 'function') {
                        window.selectPendingMonth(null, monthKey);
                    }
                }
            },
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
                y: buildAxisOptions('chart_axis_income_expenses', '#7f8c8d'),
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
        }
    });

    window._charts = window._charts || {};
    window._charts[canvasId] = chart;
}

function buildDataset(last12MonthsData, labelKey, color, selector, yAxisID = 'y') {
    return {
        label: translate(labelKey, AppState.language),
        data: last12MonthsData.map(([, values]) => selector(values)),
        borderColor: color,
        backgroundColor: hexToRgba(color, 0.1),
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: last12MonthsData.map(([month]) =>
            AppState.filters.months.has(month)
                ? AppState.chartColors.balance
                : (AppState.filters.pendingMonths.has(month) ? '#ffc107' : color)
        ),
        pointRadius: last12MonthsData.map(([month]) =>
            AppState.filters.months.has(month)
                ? 6
                : (AppState.filters.pendingMonths.has(month) ? 5 : 4)
        ),
        yAxisID
    };
}

function buildAxisOptions(labelKey, tickColor) {
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
