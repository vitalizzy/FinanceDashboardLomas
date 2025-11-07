/**
 * Registro centralizado de instancias Chart.js
 */

// Opciones compartidas por cualquier renderer que utilice Chart.js en el proyecto.
export const BASE_CHART_OPTIONS = Object.freeze({
    responsive: true,
    maintainAspectRatio: false
});

// Helper para destruir una instancia específica antes de recrearla.
export function destroyChartInstance(canvasId) {
    try {
        if (window._charts && window._charts[canvasId]) {
            const chart = window._charts[canvasId];
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
            delete window._charts[canvasId];
        }

        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const existing = Chart.getChart(canvas);
            if (existing) existing.destroy();
        }
    } catch (error) {
        console.error(`[destroyChartInstance] Error al destruir ${canvasId}:`, error);
    }
}

export function destroyAllCharts() {
    try {
        if (window._charts) {
            for (const key in window._charts) {
                try {
                    const chart = window._charts[key];
                    if (chart && typeof chart.destroy === 'function') {
                        chart.destroy();
                    }
                } catch (error) {
                    /* ignore and continue */
                }
            }
        }

        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            try {
                const instance = Chart.getChart(canvas);
                if (instance) instance.destroy();
            } catch (error) {
                /* ignore */
            }
        });

        window._charts = {};
    } catch (error) {
        console.error('[destroyAllCharts] Error:', error);
    }
}
