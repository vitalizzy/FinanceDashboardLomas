/**
 * Base class para gráficos de barras con Chart.js
 */

import { BASE_CHART_OPTIONS, destroyChartInstance } from './base_chart.js';

export class BaseBarChart {
    constructor({ canvasId }) {
        this.canvasId = canvasId;
    }

    /**
     * Tipo de gráfico asociado a la clase base.
     */
    getChartType() {
        return 'bar';
    }

    /**
     * Debe devolver el array de etiquetas a representar.
     */
    getLabels() {
        return [];
    }

    /**
     * Debe devolver los datasets a renderizar.
     */
    getDatasets() {
        return [];
    }

    /**
     * Permite personalizar las opciones específicas del gráfico.
     */
    getOptions() {
        return {};
    }

    /**
     * Monta o actualiza el gráfico en el canvas indicado.
     */
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
