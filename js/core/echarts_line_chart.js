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

        const series = this.data.map((dataset, index) => {
            // Determine if this series should use the secondary Y-axis (right side)
            // Only "Per Home" uses the secondary axis
            const isPerHome = dataset.label && dataset.label.toLowerCase().includes('per home');
            const yAxisIndex = isPerHome ? 1 : 0;
            
            // Only first series (Ingresos) has area style; others are simple lines
            const hasArea = index === 0;

            const config = {
                name: dataset.label,
                type: 'line',
                data: dataset.data,
                smooth: 0.4,
                yAxisIndex: yAxisIndex,
                lineStyle: {
                    width: 2.5,
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 6,
                    shadowOffsetY: 2
                },
                itemStyle: {
                    borderWidth: 2,
                    borderColor: '#fff',
                    shadowColor: 'rgba(0, 0, 0, 0.15)',
                    shadowBlur: 8
                },
                symbol: 'circle',
                symbolSize: [5, 8],
                tooltip: {
                    valueFormatter: (value) => this.formatValue(value)
                },
                color: this.getDatasetColor(dataset, index),
                emphasis: {
                    focus: 'series',
                    scale: 1.1,
                    lineStyle: {
                        width: 3,
                        shadowBlur: 10
                    },
                    itemStyle: {
                        borderWidth: 2.5,
                        shadowBlur: 12
                    }
                },
                animation: true,
                animationDuration: 1000,
                animationEasing: 'cubicOut'
            };
            
            // Add area style only for first series
            if (hasArea) {
                config.areaStyle = {
                    opacity: 0.25,
                    color: this.getDatasetColor(dataset, index)
                };
            }
            
            return config;
        });

        // Add histogram for transactions if data contains transactions
        let maxTransactions = 0;
        let transactionsData = [];
        
        console.log('📊 DEBUG - this.data:', this.data);
        console.log('📊 DEBUG - this.data[0]:', this.data[0]);
        
        if (this.data.length > 0 && this.data[0].transactions && Array.isArray(this.data[0].transactions)) {
            transactionsData = this.data[0].transactions;
            console.log('📊 DEBUG - Found transactions data:', transactionsData);
            
            // Calculate max transactions for scaling the axis
            maxTransactions = Math.max(...transactionsData);
            console.log('📊 DEBUG - Max transactions:', maxTransactions);
            
            // Only add series if we have transaction data
            if (transactionsData.length > 0) {
                series.push({
                    name: 'Transacciones',
                    type: 'bar',
                    data: transactionsData,
                    yAxisIndex: 2,
                    itemStyle: {
                        color: this.colors.transacciones || '#FF9800',
                        borderRadius: [4, 4, 0, 0],
                        shadowColor: 'rgba(255, 152, 0, 0.2)',
                        shadowBlur: 4
                    },
                    barWidth: '60%',
                    tooltip: {
                        valueFormatter: (value) => value + ' transacciones'
                    },
                    emphasis: {
                        focus: 'series',
                        itemStyle: {
                            color: this.colors.transacciones || '#FF9800',
                            shadowColor: 'rgba(255, 152, 0, 0.4)',
                            shadowBlur: 8
                        }
                    },
                    animation: true,
                    animationDuration: 1000,
                    animationEasing: 'cubicOut'
                });
                console.log('📊 DEBUG - Transactions series added');
            } else {
                console.log('❌ DEBUG - Transactions data is empty array');
            }
        } else {
            console.log('❌ DEBUG - No transactions data found or not an array');
            if (this.data.length === 0) console.log('❌ DEBUG - No datasets at all');
            if (this.data[0]) console.log('❌ DEBUG - First dataset structure:', Object.keys(this.data[0]));
        }

        const options = this.mergeOptions({
            xAxis: {
                type: 'category',
                data: this.labels,
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: this.colors.border,
                        width: 1
                    }
                },
                axisLabel: {
                    color: this.colors.textSecondary,
                    fontSize: 12,
                    margin: 8
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#f0f0f0',
                        type: 'dashed',
                        width: 0.5
                    }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    position: 'left',
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
                            type: 'dashed',
                            width: 0.5
                        }
                    },
                    splitArea: {
                        show: false
                    }
                },
                {
                    type: 'value',
                    position: 'right',
                    axisLine: {
                        show: false
                    },
                    axisLabel: {
                        color: this.colors.perHome,
                        fontSize: 12,
                        formatter: (value) => this.formatValue(value)
                    },
                    splitLine: {
                        show: false
                    },
                    splitArea: {
                        show: false
                    }
                },
                {
                    type: 'value',
                    show: false,
                    axisLine: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    splitArea: {
                        show: false
                    },
                    max: maxTransactions > 0 ? maxTransactions * 2.5 : 100  // Scale to 40% of total height, default to 100 if no data
                }
            ],
            series: series,
            legend: {
                data: this.data.map(d => d.label).concat(['Transacciones']),
                top: '0px',
                textStyle: {
                    color: this.colors.text,
                    fontSize: 12,
                    fontWeight: 500
                },
                itemGap: 20,
                icon: 'circle',
                padding: [0, 0, 10, 0],
                backgroundColor: 'transparent'
            },
            grid: {
                left: '60px',
                right: '80px',
                top: '50px',
                bottom: '50px',
                containLabel: false
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: '#333',
                borderWidth: 0,
                textStyle: {
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 500
                },
                padding: [10, 15],
                borderRadius: 6,
                axisPointer: {
                    type: 'cross',
                    lineStyle: {
                        color: 'rgba(127, 140, 141, 0.5)',
                        width: 1,
                        type: 'dashed'
                    }
                }
            },
            animation: true,
            animationDuration: 1200,
            animationEasing: 'cubicOut'
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EChartsLineChart };
}

// Make globally available for script tags
if (typeof window !== 'undefined') {
    window.EChartsLineChart = EChartsLineChart;
}
