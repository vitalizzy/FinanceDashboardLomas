/**
 * Base class genérica para gráficos de líneas con Chart.js
 */

import { BASE_CHART_OPTIONS, destroyChartInstance } from './base_chart.js';

export class BaseLineChart {
    constructor({ canvasId }) {
        this.canvasId = canvasId;
    }

    getChartType() {
        return 'line';
    }

    getLabels() {
        return [];
    }

    getDatasets() {
        return [];
    }

    getOptions() {
        return {};
    }

    render() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) return null;

        destroyChartInstance(this.canvasId);

        const chart = new Chart(canvas, {
            type: this.getChartType(),
            data: {
                labels: this.getLabels(),
                datasets: this.getDatasets()
            },
            options: this._mergeOptions()
        });

        window._charts = window._charts || {};
        window._charts[this.canvasId] = chart;
        return chart;
    }

    _mergeOptions() {
        const overrides = this.getOptions() || {};
        return {
            ...BASE_CHART_OPTIONS,
            ...overrides
        };
    }
}
