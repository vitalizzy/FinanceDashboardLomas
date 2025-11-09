/**
 * Base Class for ECharts Integration
 * Provides common configuration and utilities for all ECharts charts
 */

// Global chart instances tracker
window._echartsInstances = window._echartsInstances || new Map();

/**
 * Function to destroy all ECharts instances
 */
window.destroyAllCharts = function() {
    if (window._echartsInstances) {
        window._echartsInstances.forEach((chart, key) => {
            if (chart && typeof chart.dispose === 'function') {
                chart.dispose();
            }
        });
        window._echartsInstances.clear();
    }
};

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
        console.log('🎨 BaseECharts.init() called for container:', this.containerId);
        if (!window.echarts) {
            console.error('❌ ECharts library not loaded');
            return false;
        }
        
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.dispose();
        }
        
        console.log('  📦 Container element:', this.container ? 'found ✅' : 'NOT FOUND ❌');
        this.chart = window.echarts.init(this.container, this.theme);
        console.log('  📊 ECharts instance created:', this.chart ? '✅' : '❌');
        
        // Register chart instance
        if (!window._echartsInstances) {
            window._echartsInstances = new Map();
        }
        window._echartsInstances.set(this.containerId, this.chart);
        
        // Handle resize
        window.addEventListener('resize', () => {
            if (this.chart) {
                this.chart.resize();
            }
        });
        
        return true;
    }

    /**
     * Truncate label text to specified length with ellipsis
     * Used for axis labels and category names that might be too long
     * 
     * @param {String} label - Text to truncate
     * @param {Number} maxLength - Maximum characters before truncation (default 12)
     * @returns {String} Truncated label with '...' if needed
     * 
     * @example
     * this.truncateLabel('Alimentación y Bebidas', 12) // 'Alimentaci...'
     */
    truncateLabel(label, maxLength = 12) {
        if (!label) return '';
        return label.length > maxLength ? 
            label.substring(0, maxLength) + '...' : 
            label;
    }

    /**
     * Get optimized grid configuration based on container size
     * Maximizes chart area while maintaining label visibility
     * 
     * @returns {Object} Grid configuration with responsive spacing
     * 
     * Configuration:
     * - Small containers (<600px): Reduced padding to maximize space
     * - Large containers (>=600px): Balanced padding for readability
     */
    getOptimizedGrid() {
        const containerWidth = this.container ? this.container.offsetWidth : 800;
        
        return {
            left: containerWidth > 600 ? '35px' : '30px',   // Reduced from 50px
            right: '15px',                                   // Reduced from 20px
            top: '20px',                                     // Reduced from 30px
            bottom: containerWidth > 600 ? '40px' : '35px', // Reduced from 50px
            containLabel: true
        };
    }

    /**
     * Get base configuration for all charts
     */
    getBaseConfig() {
        return {
            grid: this.getOptimizedGrid(),
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
            },
            // Enable zoom and data zoom
            dataZoom: [
                {
                    type: 'slider',
                    show: false,
                    start: 0,
                    end: 100,
                    handleSize: '100%',
                    handleStyle: {
                        color: this.colors.balance,
                        opacity: 0.8
                    },
                    borderColor: this.colors.border,
                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                },
                {
                    type: 'inside',
                    start: 0,
                    end: 100,
                    zoomOnMouseWheel: true
                }
            ]
        };
    }

    /**
     * Set chart options and render
     */
    setOptions(options) {
        console.log('🎨 BaseECharts.setOptions() called');
        if (!this.chart) {
            console.error('❌ Chart not initialized');
            return;
        }
        
        console.log('  📊 Setting options with', Object.keys(options).length, 'top-level keys');
        this.options = options;
        this.chart.setOption(options);
        console.log('  ✅ Options set successfully');
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
     * Register event listener on chart
     */
    on(eventName, handler) {
        if (this.chart && typeof handler === 'function') {
            this.chart.on(eventName, handler);
            console.log(`  📡 Event listener registered: ${eventName}`);
        } else {
            console.warn('⚠️ Chart not initialized or handler is not a function');
        }
    }

    /**
     * Register click handler for interactive filtering
     * Captures X-axis data point when chart is clicked
     * 
     * @param {Array} xAxisData - Array of data points on X-axis (labels, months, etc.)
     * @param {Function} handler - Callback function that receives the clicked X-axis value
     * @param {String} [filterType='generic'] - Type of filter (month, category, etc.) for logging
     * 
     * @example
     * // For monthly data filtering
     * const xAxisLabels = ['01/2024', '02/2024', '03/2024'];
     * chart.registerClickHandler(xAxisLabels, (value) => {
     *     console.log('Selected month:', value);
     *     // Apply filter...
     * }, 'month');
     */
    registerClickHandler(xAxisData, handler, filterType = 'generic') {
        if (!Array.isArray(xAxisData) || typeof handler !== 'function') {
            console.error('❌ registerClickHandler: xAxisData must be an array and handler must be a function');
            return;
        }

        this.on('click', (event) => {
            if (event.dataIndex !== undefined && event.dataIndex < xAxisData.length) {
                const selectedValue = xAxisData[event.dataIndex];
                console.log(`🖱️ Chart clicked - ${filterType} selected:`, selectedValue);
                
                // Show immediate visual feedback to user
                this.showSelectionFeedback(selectedValue, filterType.charAt(0).toUpperCase() + filterType.slice(1), 2000);
                
                try {
                    handler(selectedValue);
                    console.log(`✅ ${filterType} filter applied:`, selectedValue);
                } catch (e) {
                    console.error(`❌ Error applying ${filterType} filter:`, e);
                }
            } else {
                console.warn(`⚠️ Invalid dataIndex or missing data. dataIndex: ${event.dataIndex}, xAxisData length: ${xAxisData.length}`);
            }
        });

        console.log(`📊 Click handler registered for ${filterType} filtering with ${xAxisData.length} data points`);
    }

    /**
     * Register a deferred click handler that will be called after rendering is complete
     * This is useful when you need to ensure the chart is fully initialized before binding events
     * 
     * @param {Array} xAxisData - Array of data points on X-axis (labels, months, etc.)
     * @param {Function} handler - Callback function that receives the clicked X-axis value
     * @param {String} [filterType='generic'] - Type of filter for logging and visual feedback
     * 
     * @example
     * // In a chart's render() method AFTER setData() completes:
     * this._chart.setDeferredClickHandler(
     *     monthKeys,
     *     (selectedMonth) => window.selectPendingMonth(null, selectedMonth),
     *     'month'
     * );
     */
    setDeferredClickHandler(xAxisData, handler, filterType = 'generic') {
        // Ensure chart is initialized before registering handler
        if (!this.chart) {
            console.warn(`⚠️ Chart not yet initialized. Deferring click handler registration for ${filterType}`);
            // Retry after a short delay
            setTimeout(() => this.setDeferredClickHandler(xAxisData, handler, filterType), 100);
            return;
        }

        console.log(`📊 Setting deferred click handler for ${filterType} filtering`);
        this.registerClickHandler(xAxisData, handler, filterType);
    }

    /**
     * Show visual feedback toast/notification for chart selection
     * Displays immediate confirmation that user's click was registered
     * 
     * @param {String} selectedValue - The value that was selected
     * @param {String} filterType - Type of filter for display message
     * @param {Number} durationMs - How long to show the toast (default 2000ms)
     * 
     * @example
     * this.showSelectionFeedback('2024-01', 'Month', 2000);
     * // Shows: "✓ Month selected: 2024-01" in a toast
     */
    showSelectionFeedback(selectedValue, filterType = 'Item', durationMs = 2000) {
        // Create or reuse toast container
        let toastContainer = document.getElementById('chart-selection-toast');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'chart-selection-toast';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                font-family: 'Google Sans Text', 'Segoe UI', sans-serif;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }

        // Create toast element
        const toast = document.createElement('div');
        const toastId = 'toast-' + Date.now();
        toast.id = toastId;
        toast.style.cssText = `
            background: linear-gradient(135deg, #20c997 0%, #1a9d7f 100%);
            color: white;
            padding: 12px 18px;
            border-radius: 8px;
            margin-bottom: 8px;
            box-shadow: 0 4px 12px rgba(32, 201, 151, 0.3);
            animation: slideIn 0.3s ease-out;
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        `;

        // Truncate very long values for display
        const displayValue = selectedValue && selectedValue.length > 20 ? 
            selectedValue.substring(0, 20) + '...' : 
            selectedValue;

        toast.innerHTML = `
            <span style="font-size: 16px;">✓</span>
            <span>${filterType} selected: <strong>${displayValue}</strong></span>
        `;

        toastContainer.appendChild(toast);

        // Fade out and remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, durationMs);

        // Add animations if not already in stylesheet
        if (!document.getElementById('chart-toast-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'chart-toast-styles';
            styleSheet.innerHTML = `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                }
            `;
            document.head.appendChild(styleSheet);
        }
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BaseECharts, destroyAllCharts };
}

// Make globally available for script tags
if (typeof window !== 'undefined') {
    window.BaseECharts = BaseECharts;
    window.destroyAllCharts = destroyAllCharts;
}
