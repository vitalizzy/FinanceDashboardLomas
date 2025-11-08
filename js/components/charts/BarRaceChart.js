/**
 * ECharts-based Bar Race Chart
 * Animated chart showing category amounts over time
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { formatCurrency } from '../../core/formatters.js';

// Color palette for categories - provides consistent colors for bar race
const CATEGORY_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#52C2E0',
    '#FF6B9D', '#C44569', '#AA96DA', '#FCBAD3', '#A8E6CF',
    '#FFD3B6', '#FFAAA5', '#FF8B94', '#FF6E7F', '#BDB2FF'
];

function getCategoryColor(categoryName, categoryIndex) {
    // Generate consistent color based on category name to ensure same category
    // gets same color across different frames
    const hash = categoryName.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    const colorIndex = Math.abs(hash) % CATEGORY_COLORS.length;
    return CATEGORY_COLORS[colorIndex];
}

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
        this.currentFrame = 0;
        this.isPlaying = false;
        this._animationInterval = null;
        this.speed = 1; // Animation speed multiplier (1x to 5x)
        this.categoryColorMap = {}; // Cache color assignments for categories
        console.log('🏁 BarRaceChart created:', { canvasId, frameCount: this.raceData.length });
    }

    init() {
        return this._chart.init();
    }

    setOptions(options) {
        return this._chart.setOptions(options);
    }

    setSpeed(speedMultiplier) {
        console.log('⚡ BarRaceChart.setSpeed called:', speedMultiplier);
        this.speed = Math.max(1, Math.min(5, parseFloat(speedMultiplier)));
        console.log('  ✅ Speed set to:', this.speed + 'x');
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

        console.log('🏁 BarRaceChart rendering with', this.raceData.length, 'frames');

        // Initialize with first frame
        this.showFrame(0);
    }

    showFrame(frameIndex) {
        if (frameIndex >= this.raceData.length) {
            frameIndex = 0;
        }

        const frame = this.raceData[frameIndex];
        if (!frame || !frame.categories) {
            console.warn('⚠️ Invalid frame:', frameIndex);
            return;
        }

        const chart = this._chart.getChart();
        if (!chart) {
            console.error('❌ Chart instance not available');
            return;
        }

        console.log('🏁 Showing frame', frameIndex, 'with', frame.categories.length, 'categories');

        // Build color array - assign unique color to each category based on its name
        const categoryColors = frame.categories.map(cat => {
            // Cache color for this category to ensure consistency across frames
            if (!this.categoryColorMap[cat.name]) {
                this.categoryColorMap[cat.name] = getCategoryColor(cat.name);
            }
            return this.categoryColorMap[cat.name];
        });

        const options = {
            xAxis: {
                type: 'value',
                axisLabel: {
                    formatter: (value) => {
                        if (value >= 1000) {
                            return (value / 1000).toFixed(1) + 'k€';
                        }
                        return value + '€';
                    }
                }
            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: frame.categories.map(cat => cat.name),
                axisLabel: {
                    fontSize: 12,
                    color: '#333'
                }
            },
            series: [
                {
                    name: translate('chart_label_expenses', AppState.language),
                    type: 'bar',
                    data: frame.categories.map(cat => cat.value),
                    label: {
                        show: true,
                        position: 'right',
                        valueAnimation: true,
                        formatter: (params) => {
                            if (params.value >= 1000) {
                                return (params.value / 1000).toFixed(1) + 'k€';
                            }
                            return params.value + '€';
                        }
                    },
                    itemStyle: {
                        color: function(params) {
                            return categoryColors[params.dataIndex] || AppState.chartColors.gastos;
                        }
                    }
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
            },
            animationDuration: 500,
            animationEasing: 'cubicOut',
            grid: {
                left: '150px',
                right: '80px',
                top: '60px',
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

        chart.setOption(options, true);
        this.currentFrame = frameIndex;
    }

    play() {
        console.log('🏁 Starting animation');
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentFrame = 0;

        // Calculate frame duration based on speed (1500ms / speed)
        const frameDuration = 1500 / this.speed;
        console.log(`  ⚡ Animation speed: ${this.speed}x (${frameDuration.toFixed(0)}ms per frame)`);

        this._animationInterval = setInterval(() => {
            if (this.isPlaying) {
                this.showFrame(this.currentFrame);
                this.currentFrame++;
                if (this.currentFrame >= this.raceData.length) {
                    this.currentFrame = 0;
                }
            }
        }, frameDuration);
    }

    pause() {
        console.log('🏁 Pausing animation');
        this.isPlaying = false;
        if (this._animationInterval) {
            clearInterval(this._animationInterval);
            this._animationInterval = null;
        }
    }

    stop() {
        console.log('🏁 Stopping animation');
        this.pause();
        this.showFrame(0);
    }
}

export function createBarRaceChart(canvasId, data) {
    const chart = new CategoryBarRaceChart({ canvasId, data });
    chart.render();
    return chart;
}
