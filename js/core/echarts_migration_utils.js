/**
 * ECharts Migration Utilities
 * Helper functions for migrating from Chart.js to ECharts
 */

class EChartsMigrationUtils {
    /**
     * Convert Chart.js dataset to ECharts compatible format
     */
    static convertChartJsDataset(chartJsDataset) {
        return {
            label: chartJsDataset.label,
            data: chartJsDataset.data,
            borderColor: chartJsDataset.borderColor,
            backgroundColor: chartJsDataset.backgroundColor,
            fill: chartJsDataset.fill || false,
            tension: chartJsDataset.tension || 0.3
        };
    }

    /**
     * Verify ECharts library is loaded
     */
    static isEChartsLoaded() {
        return typeof window.echarts !== 'undefined';
    }

    /**
     * Load ECharts library from CDN
     */
    static async loadECharts() {
        if (this.isEChartsLoaded()) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Create adapter for Chart.js to ECharts migration
     */
    static createChartAdapter(chartType) {
        switch (chartType) {
            case 'line':
                return new EChartsLineChart('chart-container');
            case 'bar':
                return new EChartsBarChart('chart-container');
            case 'pie':
            case 'doughnut':
                return new EChartsPieChart('chart-container');
            default:
                throw new Error(`Unsupported chart type: ${chartType}`);
        }
    }

    /**
     * Format numbers for ECharts tooltips
     */
    static formatTooltipValue(value, format = 'currency') {
        if (value === null || value === undefined) {
            return '-';
        }

        if (format === 'currency') {
            return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        }

        if (format === 'percent') {
            return new Intl.NumberFormat('es-ES', {
                style: 'percent',
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }).format(value);
        }

        return value.toString();
    }

    /**
     * Create color palette for charts
     */
    static getColorPalette(paletteType = 'dashboard') {
        const palettes = {
            dashboard: [
                '#20c997', // Ingresos - Green
                '#dc3545', // Gastos - Red
                '#6f42c1', // Per Home - Purple
                '#0d6efd', // Balance - Blue
                '#fd7e14', // Transacciones - Orange
                '#0dcaf0'  // Saldo Minimo - Cyan
            ],
            financial: [
                '#00A86B', // Profit - Green
                '#FF4444', // Loss - Red
                '#4169E1', // Secondary - Blue
                '#FFB90F', // Warning - Gold
                '#8B4789', // Accent - Purple
                '#00CED1'  // Info - Cyan
            ]
        };

        return palettes[paletteType] || palettes.dashboard;
    }

    /**
     * Merge ECharts options with defaults
     */
    static mergeEChartsOptions(baseOptions, customOptions) {
        const merge = (target, source) => {
            const output = Object.assign({}, target);
            if (this._isObject(target) && this._isObject(source)) {
                Object.keys(source).forEach(key => {
                    if (this._isObject(source[key])) {
                        if (!(key in target)) {
                            Object.assign(output, { [key]: source[key] });
                        } else {
                            output[key] = merge(target[key], source[key]);
                        }
                    } else {
                        Object.assign(output, { [key]: source[key] });
                    }
                });
            }
            return output;
        };

        return merge(baseOptions, customOptions);
    }

    /**
     * Check if value is object
     */
    static _isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * Validate chart data structure
     */
    static validateChartData(labels, datasets) {
        if (!Array.isArray(labels) || labels.length === 0) {
            throw new Error('Invalid labels: must be non-empty array');
        }

        if (!Array.isArray(datasets) || datasets.length === 0) {
            throw new Error('Invalid datasets: must be non-empty array');
        }

        datasets.forEach((dataset, index) => {
            if (!dataset.label || !Array.isArray(dataset.data)) {
                throw new Error(`Invalid dataset at index ${index}: must have label and data array`);
            }

            if (dataset.data.length !== labels.length) {
                throw new Error(`Dataset ${index} data length (${dataset.data.length}) does not match labels length (${labels.length})`);
            }
        });

        return true;
    }

    /**
     * Create test chart for verification
     */
    static createTestChart(containerId) {
        const testData = {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
            datasets: [{
                label: 'Ingresos',
                data: [1000, 1200, 1100, 1400, 1300],
                borderColor: '#20c997',
                backgroundColor: 'rgba(32, 201, 151, 0.1)'
            }]
        };

        const chart = new EChartsLineChart(containerId);
        chart.init();
        chart.setData(testData.labels, testData.datasets);

        return chart;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EChartsMigrationUtils;
}
