/**
 * ============================================================================
 * MÓDULO DE GRÁFICOS - Chart.js
 * ============================================================================
 */

import { AppState } from './state.js';
import { translate } from './i18n.js';
import { hexToRgba, parseDate, parseAmount } from './utils.js';
import { formatCurrency } from './formatters.js';

/**
 * Crea un gráfico de barras para gastos por categoría
 */
export function createBarChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Destruir gráfico existente
    try { 
        if (window._charts && window._charts[canvasId]) {
            window._charts[canvasId].destroy();
        }
    } catch (e) { /* ignore */ }

    const chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.map(([label]) => label.length > 15 ? label.substring(0, 15) + '...' : label),
            datasets: [{
                label: translate('chart_label_expenses', AppState.language),
                data: data.map(([, value]) => value),
                backgroundColor: data.map(([label]) => 
                    AppState.filters.categories.has(label) ? 
                        hexToRgba(AppState.chartColors.balance, 0.8) : 
                        (AppState.filters.pendingCategories.has(label) ? 
                            'rgba(255, 193, 7, 0.9)' : 
                            'rgba(52, 73, 94, 0.8)')
                ),
                borderColor: data.map(([label]) => 
                    AppState.filters.categories.has(label) ? 
                        AppState.chartColors.balance : 
                        (AppState.filters.pendingCategories.has(label) ? 
                            'rgba(255, 193, 7, 1)' : 
                            'rgba(52, 73, 94, 1)')
                ),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const category = data[index][0];
                    window.selectPendingCategory(event, category);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: context => data[context[0].dataIndex][0],
                        label: context => `${translate('chart_tooltip_expenses', AppState.language)} ${formatCurrency(data[context.dataIndex][1])}`
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
        }
    });

    // Guardar instancia
    window._charts = window._charts || {};
    window._charts[canvasId] = chart;
}

/**
 * Crea un gráfico de líneas para flujo mensual
 */
export function createLineChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const last12MonthsData = data.slice(-12);

    // Destruir gráfico existente
    try { 
        if (window._charts && window._charts[canvasId]) {
            window._charts[canvasId].destroy();
        }
    } catch (e) { /* ignore */ }

    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: last12MonthsData.map(([month]) => {
                const [year, monthNum] = month.split('-');
                return `${monthNum}/${year}`;
            }),
            datasets: [{
                label: translate('chart_label_income', AppState.language),
                data: last12MonthsData.map(([, values]) => values.ingresos),
                borderColor: AppState.chartColors.ingresos,
                backgroundColor: hexToRgba(AppState.chartColors.ingresos, 0.1),
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: last12MonthsData.map(([month]) => 
                    AppState.filters.months.has(month) ? 
                        AppState.chartColors.balance : 
                        (AppState.filters.pendingMonths.has(month) ? '#ffc107' : AppState.chartColors.ingresos)
                ),
                pointRadius: last12MonthsData.map(([month]) => 
                    AppState.filters.months.has(month) ? 6 : 
                        (AppState.filters.pendingMonths.has(month) ? 5 : 4)
                ),
            }, {
                label: translate('chart_label_expenses_only', AppState.language),
                data: last12MonthsData.map(([, values]) => values.gastos),
                borderColor: AppState.chartColors.gastos,
                backgroundColor: hexToRgba(AppState.chartColors.gastos, 0.1),
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: last12MonthsData.map(([month]) => 
                    AppState.filters.months.has(month) ? 
                        AppState.chartColors.balance : 
                        (AppState.filters.pendingMonths.has(month) ? '#ffc107' : AppState.chartColors.gastos)
                ),
                pointRadius: last12MonthsData.map(([month]) => 
                    AppState.filters.months.has(month) ? 6 : 
                        (AppState.filters.pendingMonths.has(month) ? 5 : 4)
                ),
            }, {
                label: translate('chart_label_per_home', AppState.language),
                data: last12MonthsData.map(([, values]) => values.perHome),
                borderColor: AppState.chartColors.perHome,
                backgroundColor: hexToRgba(AppState.chartColors.perHome, 0.1),
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: last12MonthsData.map(([month]) => 
                    AppState.filters.months.has(month) ? 
                        AppState.chartColors.balance : 
                        (AppState.filters.pendingMonths.has(month) ? '#ffc107' : AppState.chartColors.perHome)
                ),
                pointRadius: last12MonthsData.map(([month]) => 
                    AppState.filters.months.has(month) ? 6 : 
                        (AppState.filters.pendingMonths.has(month) ? 5 : 4)
                ),
                yAxisID: 'y1'
            }, {
                label: translate('chart_label_min_balance', AppState.language),
                data: last12MonthsData.map(([, values]) => values.minBalance),
                borderColor: AppState.chartColors.saldoMinimo,
                backgroundColor: hexToRgba(AppState.chartColors.saldoMinimo, 0.1),
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: last12MonthsData.map(([month]) => 
                    AppState.filters.months.has(month) ? 
                        AppState.chartColors.balance : 
                        (AppState.filters.pendingMonths.has(month) ? '#ffc107' : AppState.chartColors.saldoMinimo)
                ),
                pointRadius: last12MonthsData.map(([month]) => 
                    AppState.filters.months.has(month) ? 6 : 
                        (AppState.filters.pendingMonths.has(month) ? 5 : 4)
                ),
            }, {
                label: translate('chart_label_final_balance', AppState.language),
                data: last12MonthsData.map(([, values]) => values.finalBalance),
                borderColor: AppState.chartColors.balance,
                backgroundColor: hexToRgba(AppState.chartColors.balance, 0.1),
                tension: 0.3,
                borderWidth: 2,
                yAxisID: 'y',
                pointBackgroundColor: last12MonthsData.map(([month]) => 
                    AppState.filters.months.has(month) ? 
                        AppState.chartColors.balance : 
                        (AppState.filters.pendingMonths.has(month) ? '#ffc107' : AppState.chartColors.balance)
                ),
                pointRadius: last12MonthsData.map(([month]) => 
                    AppState.filters.months.has(month) ? 6 : 
                        (AppState.filters.pendingMonths.has(month) ? 5 : 4)
                ),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const monthKey = last12MonthsData[index][0];
                    window.selectPendingMonth(event, monthKey);
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
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    grid: { color: 'rgba(127, 140, 141, 0.2)' },
                    ticks: { 
                        color: '#7f8c8d', 
                        callback: value => formatCurrency(value) 
                    },
                    title: { 
                        display: true, 
                        text: translate('chart_axis_income_expenses', AppState.language), 
                        color: '#2c3e50'
                    }
                },
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

    // Guardar instancia
    window._charts = window._charts || {};
    window._charts[canvasId] = chart;
}

/**
 * Obtiene gastos agrupados por categoría (top 10)
 */
export function getExpensesByCategory(data) {
    const categories = {};
    
    data.forEach((item) => {
        const gastos = parseAmount(item.Gastos || '0');
        if (gastos > 0) {
            const category = item.Categoria || 'Sin categoría';
            categories[category] = (categories[category] || 0) + gastos;
        }
    });
    
    return Object.entries(categories).sort(([,a], [,b]) => b - a).slice(0, 10);
}

/**
 * Obtiene flujo mensual de ingresos, gastos, per home y saldos
 */
export function getMonthlyFlow(data) {
    const monthlyData = {};
    
    data.forEach(item => {
        const date = parseDate(item['F. Operativa']);
        if (!date) return;
        
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                ingresos: 0,
                gastos: 0,
                perHome: 0,
                balances: []
            };
        }
        
        monthlyData[monthKey].gastos += parseAmount(item.Gastos || '0');
        monthlyData[monthKey].ingresos += parseAmount(item.Ingresos || '0');
        monthlyData[monthKey].perHome += parseAmount(item['per Home'] || '0');
        monthlyData[monthKey].balances.push({ 
            date: date.getTime(), 
            balance: parseAmount(item['Saldo'] || '0') 
        });
    });
    
    // Calcular min y final balance
    Object.keys(monthlyData).forEach(key => {
        if (monthlyData[key].balances.length > 0) {
            const balancesArr = monthlyData[key].balances;
            monthlyData[key].minBalance = Math.min(...balancesArr.map(b => b.balance));
            balancesArr.sort((a, b) => a.date - b.date);
            monthlyData[key].finalBalance = balancesArr[balancesArr.length - 1].balance;
        } else {
            monthlyData[key].minBalance = 0;
            monthlyData[key].finalBalance = 0;
        }
        delete monthlyData[key].balances;
    });
    
    return Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b));
}
