/**
 * ECharts Pie Chart Implementation
 * Professional pie/doughnut chart rendering with ECharts
 */

class EChartsPieChart extends BaseECharts {
    constructor(containerId, theme = 'light') {
        super(containerId, theme);
        this.data = [];
        this.labels = [];
        this.chartType = 'pie'; // 'pie' or 'doughnut'
    }

    /**
     * Set chart data
     * @param {Array} labels - Category labels
     * @param {Array} data - Data values
     * @param {String} chartType - 'pie' or 'doughnut'
     */
    setData(labels, data, chartType = 'doughnut') {
        this.labels = labels;
        this.data = data;
        this.chartType = chartType;
        this.render();
    }

    /**
     * Render the chart
     */
    render() {
        if (!this.init()) {
            return;
        }

        const chartData = this.labels.map((label, index) => ({
            name: label,
            value: this.data[index]
        }));

        const seriesConfig = {
            name: 'Distribución',
            type: this.chartType === 'doughnut' ? 'pie' : 'pie',
            radius: this.chartType === 'doughnut' ? ['40%', '70%'] : ['0%', '75%'],
            data: chartData,
            itemStyle: {
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                formatter: '{b}: {c}',
                fontSize: 12,
                color: this.colors.text
            },
            tooltip: {
                formatter: (params) => {
                    if (params.componentSubType === 'pie') {
                        const value = params.value;
                        const percent = ((value / this.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                        return `${params.name}<br/>${this.formatValue(value)} (${percent}%)`;
                    }
                }
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        };

        const options = this.mergeOptions({
            series: [seriesConfig],
            legend: {
                orient: 'vertical',
                right: '10%',
                top: 'center',
                textStyle: {
                    color: this.colors.text,
                    fontSize: 12
                },
                itemGap: 12
            },
            tooltip: {
                trigger: 'item'
            }
        });

        this.setOptions(options);
    }

    /**
     * Get chart colors based on data distribution
     */
    getChartColors() {
        const colors = [
            this.colors.ingresos,      // Green
            this.colors.gastos,        // Red
            this.colors.perHome,       // Purple
            this.colors.balance,       // Blue
            this.colors.transacciones, // Orange
            this.colors.saldoMinimo    // Cyan
        ];
        
        return this.labels.map((_, index) => colors[index % colors.length]);
    }

    /**
     * Format value for display
     */
    formatValue(value) {
        if (value === null || value === undefined) {
            return '-';
        }
        
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    /**
     * Update chart data
     */
    updateData(labels, data, chartType = 'doughnut') {
        this.labels = labels;
        this.data = data;
        this.chartType = chartType;
        this.render();
    }

    /**
     * Add event listener for chart interactions
     */
    on(eventName, handler) {
        if (this.chart) {
            this.chart.on(eventName, handler);
        }
    }

    /**
     * Remove event listener
     */
    off(eventName, handler) {
        if (this.chart) {
            this.chart.off(eventName, handler);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EChartsPieChart };
}

// Make globally available for script tags
if (typeof window !== 'undefined') {
    window.EChartsPieChart = EChartsPieChart;
}
