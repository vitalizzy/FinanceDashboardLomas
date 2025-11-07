import { AppError } from '../core/errors.js';
import { APP_CONFIG } from '../core/config.js';
import { parseTSV, parseDate, parseAmount } from '../core/utils.js';

/**
 * Encapsulates data retrieval and normalization logic.
 */
export class DataService {
    constructor({ dataUrl = APP_CONFIG.DATA_URL } = {}) {
        this.dataUrl = dataUrl;
    }

    async loadFinancialData() {
        const response = await fetch(this.dataUrl);

        if (!response.ok) {
            throw new AppError(
                APP_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
                'NETWORK',
                `HTTP ${response.status}`
            );
        }

        const tsvText = await response.text();
        const rawRows = parseTSV(tsvText);

        if (!rawRows || rawRows.length === 0) {
            throw new AppError(
                APP_CONFIG.ERROR_MESSAGES.NO_DATA,
                'DATA',
                'TSV file is empty'
            );
        }

        const normalized = this._normalizeData(rawRows);
        const ordered = this._sortByDateDesc(normalized);
        const lastUpdate = ordered.length ? parseDate(ordered[0]['F. Operativa']) : null;

        return { data: ordered, lastUpdate };
    }

    _normalizeData(rows) {
        return rows.map(item => {
            const ingresos = parseAmount(item.Ingresos || '0');
            const gastos = parseAmount(item.Gastos || '0');
            const importe = ingresos > 0 ? ingresos : -gastos;
            const tipo = ingresos > 0 ? 'Ingreso' : 'Gasto';

            return { ...item, Importe: importe, Tipo: tipo };
        });
    }

    _sortByDateDesc(rows) {
        return [...rows].sort((a, b) => {
            const dateA = parseDate(a['F. Operativa']);
            const dateB = parseDate(b['F. Operativa']);
            return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });
    }
}
