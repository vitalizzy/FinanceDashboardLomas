/**
 * ECharts Line Chart Implementation
 * Replaces Chart.js line chart with professional ECharts rendering
 */

class EChartsLineChart extends BaseECharts {
    constructor(containerId, theme = 'light') {
        super(containerId, theme);
        this.data = [];
        this.labels = [];
    }

    /**
     * Set chart data
     * @param {Array} labels - X-axis labels
     * @param {Array} datasets - Array of dataset objects
     */
    setData(labels, datasets) {
        this.labels = labels;
        this.data = datasets;
        this.render();
    }

    /**
     * Render the chart
     */
    render() {
        if (!this.init()) {
            return;
        }

        const series = this.data.map((dataset, index) => ({
            name: dataset.label,
            type: 'line',
            data: dataset.data,
            smooth: true,
            lineStyle: {
                width: 2.5
            },
            itemStyle: {
                borderWidth: 2,
                borderColor: '#fff'
            },
            areaStyle: {
                opacity: 0.3
            },
            symbol: 'circle',
            symbolSize: 6,
            tooltip: {
                valueFormatter: (value) => this.formatValue(value)
            },
            color: this.getDatasetColor(dataset, index),
            emphasis: {
                focus: 'series'
            }
        }));

        const options = this.mergeOptions({
            xAxis: {
                type: 'category',
                data: this.labels,
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: this.colors.border
                    }
                },
                axisLabel: {
                    color: this.colors.textSecondary,
                    fontSize: 12
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    show: false
                },
                axisLabel: {
                    color: this.colors.textSecondary,
                    fontSize: 12,
                    formatter: (value) => this.formatValue(value)
                },
                splitLine: {
                    lineStyle: {
                        color: '#f0f0f0',
                        type: 'dashed'
                    }
                }
            },
            series: series,
            legend: {
                data: this.data.map(d => d.label),
                top: '0px',
                textStyle: {
                    color: this.colors.text,
                    fontSize: 12
                },
                itemGap: 20
            }
        });

        this.setOptions(options);
    }

    /**
     * Get color for dataset
     */
    getDatasetColor(dataset, index) {
        if (dataset.borderColor) {
            return dataset.borderColor;
        }
        
        const colors = [
            this.colors.gastos,      // Red
            this.colors.ingresos,    // Green
            this.colors.perHome,     // Purple
            this.colors.balance,     // Blue
            this.colors.transacciones // Orange
        ];
        
        return colors[index % colors.length];
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
     * Update chart data without re-rendering everything
     */
    updateData(labels, datasets) {
        this.labels = labels;
        this.data = datasets;
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
