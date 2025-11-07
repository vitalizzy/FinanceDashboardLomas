/**
 * ============================================================================
 * CLASE BASE PARA TABLAS - Elimina duplicación de código
 * ============================================================================
 */

import { AppState } from '../../core/state.js';
import { translate } from '../../core/i18n.js';
import { formatCurrency, formatPercent, formatNumber } from '../../core/formatters.js';
import { parseDate, parseAmount } from '../../core/utils.js';

export class BaseTable {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        // Crear un ID seguro para funciones JavaScript (reemplazar guiones con guiones bajos)
        this.safeId = containerId.replace(/-/g, '_');
        this.sortColumn = options.sortColumn || null;
        this.sortDirection = options.sortDirection || 'asc';
        this.isCompact = options.compact || false;
        this.initialRows = options.initialRows || 20;
        this.rowsIncrement = options.rowsIncrement || this.initialRows;
        this.visibleRows = this.initialRows;
        this.columnFilters = {}; // Filtros por columna
        this.lastColumns = [];
        this.lastData = [];
        this.currentData = [];
        this.totalRows = 0;
        this.handleScrollBound = this.handleScroll.bind(this);
        this.isRendering = false;
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

        this.isRendering = true;
        this.lastData = data;
        this.lastColumns = columns;

        // Aplicar filtros de columna
        const filteredData = this.applyColumnFilters(data);
        const sortedData = this.sortData(filteredData);

        this.currentData = sortedData;
        this.totalRows = sortedData.length;

        this.visibleRows = this.totalRows === 0 ? 0 : Math.min(this.initialRows, this.totalRows);

        const visibleData = sortedData.slice(0, this.visibleRows);
        
        let tableHTML = '<div class="table-scroll-wrapper"><table class="db-table';
        if (this.isCompact) tableHTML += ' compact';
        tableHTML += '">';
        
        tableHTML += this.renderHeader(columns);
        tableHTML += this.renderBody(visibleData, columns);
        tableHTML += this.renderFooter(filteredData, columns);
        
        tableHTML += '</table></div>';
        
        this.container.innerHTML = tableHTML;
        const wrapper = this.container.querySelector('.table-scroll-wrapper');
        if (wrapper) {
            wrapper.scrollTop = 0;
        }
        this.visibleRows = visibleData.length;
        this.setupInfiniteScroll();
        this.isRendering = false;
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
            
            // Clases de ordenamiento
            const sortClass = isSortable && this.sortColumn === col.key ? 
                (this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : 
                (isSortable ? 'sortable' : '');
            
            // Configuración de alineamiento y clases
            const alignClass = col.headerAlign || col.align || '';
            const cssClass = col.cssClass || '';
            const headerClass = col.headerClass || '';
            
            // Combinar todas las clases
            const allClasses = [sortClass, alignClass, cssClass, headerClass].filter(c => c).join(' ');
            
            // Solo estilos de dimensiones (NO color, font, etc - eso va en CSS)
            const styles = [];
            if (col.width) styles.push(`width: ${col.width}`);
            if (col.minWidth) styles.push(`min-width: ${col.minWidth}`);
            if (col.maxWidth) styles.push(`max-width: ${col.maxWidth}`);
            
            const styleAttr = styles.length > 0 ? `style="${styles.join('; ')}"` : '';
            
            html += `<th class="${allClasses}" ${styleAttr} data-i18n="${col.labelKey}">`;
            html += `<div class="th-content">`;

            // Label del header (hereda estilos del th)
            html += `<span class="th-label" ${isSortable ? `onclick="window.sortTable_${this.safeId}('${col.key}')"` : ''}>${translate(col.labelKey, AppState.language)}</span>`;

            const metaParts = [];

            if (isSortable) {
                const isActiveSort = this.sortColumn === col.key;
                const sortState = isActiveSort ? this.sortDirection : null;
                const sortSymbol = sortState === 'asc' ? '↑' : sortState === 'desc' ? '↓' : '⇅';
                const sortClasses = ['th-sort-icon'];
                if (sortState) sortClasses.push(`sorted-${sortState}`);
                metaParts.push(`<span class="${sortClasses.join(' ')}" onclick="window.sortTable_${this.safeId}('${col.key}')">${sortSymbol}</span>`);
            }

            if (isSearchable) {
                metaParts.push(`<span class="th-search-icon" onclick="window.toggleColumnFilter_${this.safeId}('${col.key}', event)">🔍</span>`);
                metaParts.push(`<div class="column-filter-dropdown" id="filter_${this.safeId}_${col.key}" style="display:none;">
                    <input 
                        type="text" 
                        class="column-search-input" 
                        placeholder="Buscar..."
                        value="${this.columnFilters[col.key] || ''}"
                        oninput="window.filterColumn_${this.safeId}('${col.key}', this.value)"
                        onclick="event.stopPropagation()"
                    />
                    <button class="clear-filter-btn" onclick="window.clearColumnFilter_${this.safeId}('${col.key}', event)">✕</button>
                </div>`);
            }

            if (metaParts.length) {
                html += `<span class="th-meta">${metaParts.join('')}</span>`;
            }

            html += `</div>`;
            html += `</th>`;
        });
        html += '</tr>';
        
        html += '</thead>';
        return html;
    }

    setupInfiniteScroll() {
        const wrapper = this.container?.querySelector('.table-scroll-wrapper');
        if (!wrapper) return;

        wrapper.removeEventListener('scroll', this.handleScrollBound);
        wrapper.addEventListener('scroll', this.handleScrollBound, { passive: true });
    }

    handleScroll(event) {
        if (this.isRendering || !this.currentData || this.visibleRows >= this.totalRows) return;

        const wrapper = event.currentTarget;
        const threshold = 24;
        if (wrapper.scrollTop + wrapper.clientHeight < wrapper.scrollHeight - threshold) {
            return;
        }

        const nextVisible = Math.min(this.visibleRows + this.rowsIncrement, this.totalRows);
        const rowsToAdd = this.currentData.slice(this.visibleRows, nextVisible);
        if (!rowsToAdd.length) return;

        const tbody = wrapper.querySelector('tbody');
        if (!tbody) return;

        const fragment = document.createDocumentFragment();
        rowsToAdd.forEach(item => {
            const template = document.createElement('template');
            template.innerHTML = this.renderRow(item, this.lastColumns).trim();
            if (template.content.firstElementChild) {
                fragment.appendChild(template.content.firstElementChild);
            }
        });

        tbody.appendChild(fragment);
        this.visibleRows = nextVisible;
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
     * Métodos de control de ordenamiento
     */
    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        this.resetVisibleRows();
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
        this.resetVisibleRows();
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
        this.resetVisibleRows();
    }

    resetVisibleRows() {
        this.visibleRows = this.initialRows;
    }
}
