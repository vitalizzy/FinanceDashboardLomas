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
        try {
            console.log('📥 DataService: Starting to fetch data from:', this.dataUrl);
            
            const response = await fetch(this.dataUrl);
            console.log('📥 DataService: Fetch response status:', response.status);

            if (!response.ok) {
                console.error('❌ DataService: HTTP error', response.status);
                throw new AppError(
                    APP_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
                    'NETWORK',
                    `HTTP ${response.status}`
                );
            }

            const tsvText = await response.text();
            console.log('📥 DataService: TSV text received, length:', tsvText.length);
            
            const rawRows = parseTSV(tsvText);
            console.log('📥 DataService: Parsed rows:', rawRows ? rawRows.length : 'null');

            if (!rawRows || rawRows.length === 0) {
                console.error('❌ DataService: No data in TSV');
                throw new AppError(
                    APP_CONFIG.ERROR_MESSAGES.NO_DATA,
                    'DATA',
                    'TSV file is empty'
                );
            }

            console.log('📥 DataService: Starting normalization...');
            const normalized = this._normalizeData(rawRows);
            console.log('✅ DataService: Normalization complete, rows:', normalized.length);
            
            console.log('📥 DataService: Sorting by date...');
            const ordered = this._sortByDateDesc(normalized);
            console.log('✅ DataService: Sorting complete');
            
            const lastUpdate = ordered.length ? parseDate(ordered[0]['F. Operativa']) : null;
            console.log('✅ DataService: Last update:', lastUpdate);

            return { data: ordered, lastUpdate };
        } catch (error) {
            console.error('❌ DataService.loadFinancialData error:', error);
            throw error;
        }
    }

    _normalizeData(rows) {
        try {
            return rows.map((item, index) => {
                try {
                    const ingresos = parseAmount(item.Ingresos || '0');
                    const gastos = parseAmount(item.Gastos || '0');
                    const importe = ingresos > 0 ? ingresos : -gastos;
                    const tipo = ingresos > 0 ? 'Ingreso' : 'Gasto';

                    return { ...item, Importe: importe, Tipo: tipo };
                } catch (error) {
                    console.error(`❌ Error normalizing row ${index}:`, error, 'Item:', item);
                    throw error;
                }
            });
        } catch (error) {
            console.error('❌ Error in _normalizeData:', error);
            throw error;
        }
    }

    _sortByDateDesc(rows) {
        return [...rows].sort((a, b) => {
            const dateA = parseDate(a['F. Operativa']);
            const dateB = parseDate(b['F. Operativa']);
            return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });
    }
}
