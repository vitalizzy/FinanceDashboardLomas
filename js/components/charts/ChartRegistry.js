/**
 * Registro centralizado de instancias Chart.js
 */

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
