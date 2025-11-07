/**
 * ============================================================================
 * CLASE BASE PARA TABLAS - Elimina duplicación de código
 * ============================================================================
 */

import { AppState } from './state.js';
import { translate } from './i18n.js';
import { formatCurrency, formatPercent, formatNumber } from './formatters.js';
import { parseDate, parseAmount } from './utils.js';

export class BaseTable {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        // Crear un ID seguro para funciones JavaScript (reemplazar guiones con guiones bajos)
        this.safeId = containerId.replace(/-/g, '_');
        this.sortColumn = options.sortColumn || null;
        this.sortDirection = options.sortDirection || 'asc';
        this.isCompact = options.compact || false;
        this.showPagination = options.pagination || false;
        this.itemsPerPage = options.itemsPerPage || 50;
        this.currentPage = 1;
    }

    /**
     * Método principal para renderizar la tabla
     */
    render(data, columns) {
        if (!this.container) return;
        
        if (!data || data.length === 0) {
            this.container.innerHTML = `<p style="text-align:center; color: var(--text-secondary);">${translate('no_movements', AppState.language)}</p>`;
            return;
        }

        const sortedData = this.sortData(data);
        const paginatedData = this.showPagination ? this.paginateData(sortedData) : sortedData;
        
        let tableHTML = '<div class="table-scroll-wrapper"><table class="db-table';
        if (this.isCompact) tableHTML += ' compact';
        tableHTML += '">';
        
        tableHTML += this.renderHeader(columns);
        tableHTML += this.renderBody(paginatedData, columns);
        tableHTML += this.renderFooter(data, columns);
        
        tableHTML += '</table></div>';
        
        if (this.showPagination) {
            tableHTML += this.renderPagination(data.length);
        }
        
        this.container.innerHTML = tableHTML;
    }

    /**
     * Renderiza el encabezado de la tabla
     */
    renderHeader(columns) {
        let html = '<thead><tr>';
        
        columns.forEach(col => {
            const isSortable = col.sortable !== false; // Por defecto true, a menos que sea explícitamente false
            const sortClass = isSortable && this.sortColumn === col.key ? 
                (this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : 
                (isSortable ? 'sortable' : '');
            const alignClass = col.align || '';
            const cssClass = col.cssClass || '';
            const allClasses = [sortClass, alignClass, cssClass].filter(c => c).join(' ');
            const onclick = isSortable ? `onclick="window.sortTable_${this.safeId}('${col.key}')"` : '';
            html += `<th class="${allClasses}" ${onclick} data-i18n="${col.labelKey}">${translate(col.labelKey, AppState.language)}</th>`;
        });
        
        html += '</tr></thead>';
        return html;
    }

    /**
     * Renderiza el cuerpo de la tabla (debe ser sobrescrito en clases hijas)
     */
    renderBody(data, columns) {
        let html = '<tbody>';
        
        data.forEach(item => {
            html += this.renderRow(item, columns);
        });
        
        html += '</tbody>';
        return html;
    }

    /**
     * Renderiza una fila individual (puede ser sobrescrito)
     */
    renderRow(item, columns) {
        let html = '<tr>';
        
        columns.forEach(col => {
            const value = this.formatCellValue(item[col.key], col);
            const cellClass = col.cellClass ? (typeof col.cellClass === 'function' ? col.cellClass(item) : col.cellClass) : '';
            const cssClass = col.cssClass || '';
            const align = col.align || '';
            const allClasses = [cellClass, cssClass, align].filter(c => c).join(' ');
            html += `<td class="${allClasses}">${value}</td>`;
        });
        
        html += '</tr>';
        return html;
    }

    /**
     * Formatea el valor de una celda según el tipo de columna
     */
    formatCellValue(value, column) {
        if (value === null || value === undefined) return '';
        
        switch (column.type) {
            case 'currency':
                return formatCurrency(parseAmount(value));
            case 'percent':
                return formatPercent(value);
            case 'number':
                return formatNumber(value);
            case 'date':
                const date = parseDate(value);
                return date ? date.toLocaleDateString('es-ES') : 'N/A';
            default:
                return value;
        }
    }

    /**
     * Renderiza el pie de tabla (opcional)
     */
    renderFooter(data, columns) {
        return '';
    }

    /**
     * Ordena los datos según la columna y dirección actuales
     */
    sortData(data) {
        if (!this.sortColumn) return data;
        
        return [...data].sort((a, b) => {
            let aVal = a[this.sortColumn];
            let bVal = b[this.sortColumn];
            
            // Manejar valores numéricos
            if (typeof aVal === 'string' && aVal.includes('€')) {
                aVal = parseAmount(aVal);
                bVal = parseAmount(bVal);
            }
            
            // Manejar fechas
            if (this.sortColumn.includes('Fecha') || this.sortColumn === 'F. Operativa') {
                aVal = parseDate(aVal)?.getTime() || 0;
                bVal = parseDate(bVal)?.getTime() || 0;
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Pagina los datos
     */
    paginateData(data) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return data.slice(start, end);
    }

    /**
     * Renderiza la paginación
     */
    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        let html = '<div class="pagination">';
        html += `<button ${this.currentPage === 1 ? 'disabled' : ''} onclick="window.prevPage_${this.safeId}()">←</button>`;
        html += `<span class="page-info">${translate('page', AppState.language)} ${this.currentPage} ${translate('of', AppState.language)} ${totalPages} (${totalItems} ${translate('records', AppState.language)})</span>`;
        html += `<button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="window.nextPage_${this.safeId}()">→</button>`;
        html += '</div>';
        
        return html;
    }

    /**
     * Métodos de control de paginación
     */
    nextPage() {
        this.currentPage++;
    }

    prevPage() {
        if (this.currentPage > 1) this.currentPage--;
    }

    /**
     * Métodos de control de ordenamiento
     */
    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
    }
}
