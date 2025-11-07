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
        this.columnFilters = {}; // Filtros por columna
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

        // Aplicar filtros de columna
        const filteredData = this.applyColumnFilters(data);
        const sortedData = this.sortData(filteredData);
        const paginatedData = this.showPagination ? this.paginateData(sortedData) : sortedData;
        
        let tableHTML = '<div class="table-scroll-wrapper"><table class="db-table';
        if (this.isCompact) tableHTML += ' compact';
        tableHTML += '">';
        
        tableHTML += this.renderHeader(columns);
        tableHTML += this.renderBody(paginatedData, columns);
        tableHTML += this.renderFooter(filteredData, columns);
        
        tableHTML += '</table></div>';
        
        if (this.showPagination) {
            tableHTML += this.renderPagination(filteredData.length);
        }
        
        this.container.innerHTML = tableHTML;
    }

    /**
     * Renderiza el encabezado de la tabla
     */
    renderHeader(columns) {
        let html = '<thead>';
        
        // Una sola fila con títulos, ordenamiento y lupa
        html += '<tr>';
        columns.forEach(col => {
            const isSortable = col.sortable !== false;
            const isSearchable = col.searchable !== false;
            const sortClass = isSortable && this.sortColumn === col.key ? 
                (this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : 
                (isSortable ? 'sortable' : '');
            const alignClass = col.align || '';
            const cssClass = col.cssClass || '';
            const allClasses = [sortClass, alignClass, cssClass].filter(c => c).join(' ');
            
            html += `<th class="${allClasses}" data-i18n="${col.labelKey}">`;
            html += `<div class="th-content">`;
            html += `<span class="th-label" ${isSortable ? `onclick="window.sortTable_${this.safeId}('${col.key}')"` : ''}>${translate(col.labelKey, AppState.language)}</span>`;
            
            // Icono de lupa si es searchable
            if (isSearchable) {
                html += `<span class="th-search-icon" onclick="window.toggleColumnFilter_${this.safeId}('${col.key}', event)">🔍</span>`;
                html += `<div class="column-filter-dropdown" id="filter_${this.safeId}_${col.key}" style="display:none;">
                    <input 
                        type="text" 
                        class="column-search-input" 
                        placeholder="Buscar..."
                        value="${this.columnFilters[col.key] || ''}"
                        oninput="window.filterColumn_${this.safeId}('${col.key}', this.value)"
                        onclick="event.stopPropagation()"
                    />
                    <button class="clear-filter-btn" onclick="window.clearColumnFilter_${this.safeId}('${col.key}', event)">✕</button>
                </div>`;
            }
            
            html += `</div>`;
            html += `</th>`;
        });
        html += '</tr>';
        
        html += '</thead>';
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

    /**
     * Aplica filtros por columna
     */
    applyColumnFilters(data) {
        if (Object.keys(this.columnFilters).length === 0) {
            return data;
        }

        return data.filter(item => {
            for (const [columnKey, filterValue] of Object.entries(this.columnFilters)) {
                if (!filterValue) continue;
                
                const cellValue = String(item[columnKey] || '').toLowerCase();
                const searchValue = filterValue.toLowerCase();
                
                if (!cellValue.includes(searchValue)) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Filtra por una columna específica
     */
    filterColumn(columnKey, filterValue) {
        if (filterValue && filterValue.trim()) {
            this.columnFilters[columnKey] = filterValue.trim();
        } else {
            delete this.columnFilters[columnKey];
        }
        this.currentPage = 1; // Reset a primera página al filtrar
    }

    /**
     * Toggle del dropdown de filtro
     */
    toggleColumnFilter(columnKey, event) {
        if (event) event.stopPropagation();
        
        const dropdownId = `filter_${this.safeId}_${columnKey}`;
        const dropdown = document.getElementById(dropdownId);
        
        if (!dropdown) return;
        
        // Cerrar todos los otros dropdowns
        document.querySelectorAll('.column-filter-dropdown').forEach(d => {
            if (d.id !== dropdownId) d.style.display = 'none';
        });
        
        // Toggle este dropdown
        if (dropdown.style.display === 'none') {
            dropdown.style.display = 'block';
            const input = dropdown.querySelector('input');
            if (input) setTimeout(() => input.focus(), 100);
        } else {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Limpiar filtro de una columna específica
     */
    clearColumnFilter(columnKey, event) {
        if (event) event.stopPropagation();
        delete this.columnFilters[columnKey];
        const dropdownId = `filter_${this.safeId}_${columnKey}`;
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            const input = dropdown.querySelector('input');
            if (input) input.value = '';
            dropdown.style.display = 'none';
        }
        this.currentPage = 1;
    }
}
