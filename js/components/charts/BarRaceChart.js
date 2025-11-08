/**
 * ECharts-based Bar Race Chart
 * Animated chart showing category amounts over time
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { formatCurrency } from '../../core/formatters.js';

// Will be resolved at runtime
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

class CategoryBarRaceChart {
    constructor({ canvasId, data }) {
        const ChartClass = getEChartsBarChart();
        
        // Delegate to ECharts instance
        this._chart = new ChartClass(canvasId);
        
        console.log('🏁 BarRaceChart constructor - data:', data);
        if (!data || !Array.isArray(data)) {
            console.error('❌ Invalid data passed to BarRaceChart. Expected array, got:', typeof data);
        }
        this.raceData = data || [];
        console.log('🏁 BarRaceChart created:', { canvasId, frameCount: this.raceData.length });
    }

    init() {
        return this._chart.init();
    }

    setOptions(options) {
        return this._chart.setOptions(options);
    }

    render() {
        console.log('🏁 BarRaceChart.render() called');
        if (!this.init()) {
            console.error('Failed to initialize ECharts for bar race chart');
            return;
        }

        if (this.raceData.length === 0) {
            console.warn('⚠️ No data for bar race chart');
            return;
        }

        // Create animation frames
        const maxValue = Math.max(...this.raceData.flatMap(frame => 
            frame.categories.map(cat => cat.value)
        ));

        // Get all unique categories to maintain consistent colors
        const allCategories = new Set();
        this.raceData.forEach(frame => {
            frame.categories.forEach(cat => allCategories.add(cat.name));
        });
        const categoryList = Array.from(allCategories);

        // Create series data for animation
        const series = [
            {
                name: translate('chart_label_expenses', AppState.language),
                type: 'bar',
                data: this.raceData[0]?.categories.map(cat => cat.value) || [],
                label: {
                    show: true,
                    position: 'right',
                    valueAnimation: true,
                    formatter: (params) => formatCurrency(params.value)
                },
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: AppState.chartColors.gastos },
                        { offset: 1, color: AppState.chartColors.ingresos }
                    ])
                }
            }
        ];

        const options = {
            xAxis: {
                type: 'value',
                axisLabel: {
                    formatter: (value) => formatCurrency(value)
                }
            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: this.raceData[0]?.categories.map(cat => cat.name) || [],
                axisLabel: {
                    fontSize: 12
                }
            },
            series: series,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            grid: {
                left: '150px',
                right: '80px',
                top: '40px',
                bottom: '40px'
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    if (params[0]) {
                        return `${params[0].name}: ${formatCurrency(params[0].value)}`;
                    }
                    return '';
                }
            }
        };

        this.setOptions(options);

        // Animate through frames
        this.animateFrames();
    }

    animateFrames() {
        let currentFrame = 0;
        const frameInterval = setInterval(() => {
            if (currentFrame >= this.raceData.length) {
                currentFrame = 0; // Loop animation
            }

            const frame = this.raceData[currentFrame];
            const chart = this._chart.getChart();

            if (chart) {
                chart.setOption({
                    yAxis: {
                        data: frame.categories.map(cat => cat.name)
                    },
                    series: [
                        {
                            data: frame.categories.map(cat => cat.value)
                        }
                    ],
                    title: {
                        text: frame.date,
                        left: 'center',
                        textStyle: {
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#333'
                        }
                    }
                }, false);
            }

            currentFrame++;
        }, 2000); // 2 seconds per frame

        // Store interval ID for cleanup if needed
        this._animationInterval = frameInterval;
    }
}

export function createBarRaceChart(canvasId, data) {
    return new CategoryBarRaceChart({ canvasId, data }).render();
}
