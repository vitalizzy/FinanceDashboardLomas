/**
 * Base Class for ECharts Integration
 * Provides common configuration and utilities for all ECharts charts
 */

class BaseECharts {
    constructor(containerId, theme = 'light') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
        
        this.containerId = containerId;
        this.theme = theme;
        this.chart = null;
        this.options = {};
        this.colors = this.getThemeColors();
    }

    /**
     * Get theme colors based on dashboard configuration
     */
    getThemeColors() {
        return {
            ingresos: '#20c997',      // Green
            gastos: '#dc3545',        // Red
            perHome: '#6f42c1',       // Purple
            balance: '#0d6efd',       // Blue
            transacciones: '#fd7e14', // Orange
            saldoMinimo: '#0dcaf0',   // Cyan
            text: '#1f2933',          // Primary text
            textSecondary: '#52606d', // Secondary text
            border: '#d9dde3',        // Border
            background: '#f5f6f8'     // Background
        };
    }

    /**
     * Initialize ECharts instance
     */
    init() {
        if (!window.echarts) {
            console.error('ECharts library not loaded');
            return false;
        }
        
        this.chart = window.echarts.init(this.container, this.theme);
        
        // Handle resize
        window.addEventListener('resize', () => {
            if (this.chart) {
                this.chart.resize();
            }
        });
        
        return true;
    }

    /**
     * Get base configuration for all charts
     */
    getBaseConfig() {
        return {
            grid: {
                left: '50px',
                right: '20px',
                top: '30px',
                bottom: '50px',
                containLabel: true
            },
            textStyle: {
                fontFamily: "'Google Sans Text', 'Segoe UI', sans-serif"
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                borderColor: '#333',
                textStyle: {
                    color: '#fff',
                    fontSize: 12,
                    fontFamily: "'Google Sans Text', 'Segoe UI', sans-serif"
                },
                borderWidth: 0,
                borderRadius: 4,
                padding: [8, 12]
            },
            axisLine: {
                lineStyle: {
                    color: this.colors.border
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#f0f0f0'
                }
            }
        };
    }

    /**
     * Set chart options and render
     */
    setOptions(options) {
        if (!this.chart) {
            console.error('Chart not initialized');
            return;
        }
        
        this.options = options;
        this.chart.setOption(options);
    }

    /**
     * Resize chart
     */
    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }

    /**
     * Dispose chart
     */
    dispose() {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    }

    /**
     * Get chart instance for advanced operations
     */
    getChart() {
        return this.chart;
    }

    /**
     * Get current options
     */
    getOptions() {
        return this.options;
    }

    /**
     * Show loading animation
     */
    showLoading() {
        if (this.chart) {
            this.chart.showLoading('default', {
                text: 'Cargando...',
                textStyle: {
                    color: this.colors.textSecondary
                }
            });
        }
    }

    /**
     * Hide loading animation
     */
    hideLoading() {
        if (this.chart) {
            this.chart.hideLoading();
        }
    }

    /**
     * Export chart as PNG
     */
    exportImage(filename = 'chart.png') {
        if (this.chart) {
            const url = this.chart.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#fff'
            });
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
        }
    }

    /**
     * Merge user options with base config
     */
    mergeOptions(userOptions) {
        return this._deepMerge(this.getBaseConfig(), userOptions);
    }

    /**
     * Deep merge objects
     */
    _deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this._isObject(target) && this._isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this._isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this._deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    /**
     * Check if value is object
     */
    _isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
}
