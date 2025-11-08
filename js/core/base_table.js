/**
 * ============================================================================
 * CLASE BASE PARA TABLAS - Elimina duplicación de código
 * ============================================================================
 */

import { AppState } from './state.js';
import { translate } from './i18n.js';
import { formatCurrency, formatPercent, formatNumber } from './formatters.js';
import { parseDate, parseAmount } from './utils.js';

// Valores reutilizables para todas las tablas que heredan de BaseTable.
const BASE_TABLE_DEFAULTS = Object.freeze({
    compact: false,
    initialRows: 20,
    rowsIncrement: 20,
    sortColumn: null,
    sortDirection: 'asc'
});

export class BaseTable {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        // Crear un ID seguro para funciones JavaScript (reemplazar guiones con guiones bajos)
        this.safeId = containerId.replace(/-/g, '_');
        const mergedOptions = { ...BASE_TABLE_DEFAULTS, ...options };
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.isCompact = mergedOptions.compact;
        this.initialRows = mergedOptions.initialRows;
        this.rowsIncrement = mergedOptions.rowsIncrement ?? mergedOptions.initialRows;
        this.visibleRows = this.initialRows;
        this.sortState = [];
        this.lastColumns = [];
        this.lastData = [];
        this.currentData = [];
        this.totalRows = 0;
        this.handleScrollBound = this.handleScroll.bind(this);
        this.isRendering = false;

        const initialSortState = Array.isArray(mergedOptions.initialSortState)
            ? mergedOptions.initialSortState
            : (mergedOptions.sortColumn
                ? [{ key: mergedOptions.sortColumn, direction: mergedOptions.sortDirection }]
                : []);
        this.setSortState(initialSortState);
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
            const sortEntryIndex = this.sortState.findIndex(entry => entry.key === col.key);
            const sortEntry = sortEntryIndex >= 0 ? this.sortState[sortEntryIndex] : null;
            const sortClass = isSortable && sortEntry ? `sortable sorted-${sortEntry.direction}` : (isSortable ? 'sortable' : '');
            
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
                const sortSymbol = sortEntry ? (sortEntry.direction === 'asc' ? '↑' : '↓') : '⇅';
                const sortClasses = ['th-sort-icon'];
                if (sortEntry) sortClasses.push(`sorted-${sortEntry.direction}`);
                const priorityBadge = sortEntry ? `<span class="sort-order-badge">${sortEntryIndex + 1}</span>` : '';
                metaParts.push(`<span class="${sortClasses.join(' ')}" onclick="window.sortTable_${this.safeId}('${col.key}')">${sortSymbol}${priorityBadge}</span>`);
            }

            if (isSearchable) {
                const filterKey = this.resolveFilterKey(col);
                const currentFilterValue = AppState.getColumnFilterValue(filterKey, { preferPending: true });
                const inputValue = this.escapeAttribute(currentFilterValue);
                metaParts.push(`<span class="th-search-icon" onclick="window.toggleColumnFilter_${this.safeId}('${col.key}', event)">🔍</span>`);
                metaParts.push(`<div class="column-filter-dropdown" id="filter_${this.safeId}_${col.key}" style="display:none;">
                    <input 
                        type="text" 
                        class="column-search-input" 
                        placeholder="Buscar..."
                        value="${inputValue}"
                        data-column="${col.key}"
                        onclick="event.stopPropagation()"
                    />
                    <div class="column-filter-actions">
                        <button class="filter-action-btn apply" onclick="window.applyColumnFilter_${this.safeId}('${col.key}', event)">✓</button>
                        <button class="filter-action-btn cancel" onclick="window.cancelColumnFilter_${this.safeId}('${col.key}', event)">✕</button>
                    </div>
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
        if (this.sortState.length === 0) return data;

        const columnsByKey = Object.fromEntries((this.lastColumns || []).map(col => [col.key, col]));

        return [...data].sort((a, b) => {
            for (const { key, direction } of this.sortState) {
                const column = columnsByKey[key] || {};
                const valA = this.getSortableValue(a, key, column);
                const valB = this.getSortableValue(b, key, column);

                if (valA < valB) return direction === 'asc' ? -1 : 1;
                if (valA > valB) return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    /**
     * Métodos de control de ordenamiento
     */
    sort(column) {
        const index = this.sortState.findIndex(entry => entry.key === column);

        if (index === -1) {
            // Primer click: ordenar descendentemente (DESC)
            this.sortState = [{ key: column, direction: 'desc' }];
        } else {
            const currentDirection = this.sortState[index].direction;
            if (currentDirection === 'desc') {
                // Segundo click: cambiar a ascendentemente (ASC)
                this.sortState[index].direction = 'asc';
            } else if (currentDirection === 'asc') {
                // Tercer click: remover ordenamiento (sin orden)
                this.sortState.splice(index, 1);
            }
        }

        this.sortColumn = this.sortState[0]?.key || null;
        this.sortDirection = this.sortState[0]?.direction || 'asc';
        this.resetVisibleRows();
    }

    /**
     * Aplica filtros por columna
     */
    applyColumnFilters(data) {
        if (!AppState.filters.columnFilters || AppState.filters.columnFilters.size === 0) {
            return data;
        }

        return data.filter(item => {
            for (const [columnKey, filterPayload] of AppState.filters.columnFilters.entries()) {
                if (!filterPayload) continue;
                const filterValue = (filterPayload.value || '').toLowerCase();
                if (!filterValue) continue;

                const targetField = filterPayload.field || columnKey;
                const cellValue = String(item[targetField] || '').toLowerCase();
                
                if (!cellValue.includes(filterValue)) {
                    return false;
                }
            }
            return true;
        });
    }

    applyColumnFilterFromDropdown(columnKey) {
        const dropdownId = `filter_${this.safeId}_${columnKey}`;
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const input = dropdown.querySelector('input');
        const value = input ? input.value : '';
    const column = this.getColumnDefinition(columnKey);
    const filterKey = this.resolveFilterKey(column) || columnKey;
        const labelKey = column?.labelKey || null;

        AppState.setPendingColumnFilter(filterKey, {
            value,
            labelKey,
            field: filterKey
        });

        dropdown.style.display = 'none';
        this.resetVisibleRows();
        document.dispatchEvent(new CustomEvent('filters:pending-updated'));
    }

    cancelColumnFilter(columnKey) {
        const dropdownId = `filter_${this.safeId}_${columnKey}`;
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const input = dropdown.querySelector('input');
    const column = this.getColumnDefinition(columnKey);
    const filterKey = this.resolveFilterKey(column) || columnKey;
        AppState.clearPendingColumnFilter(filterKey);
        if (input) {
            input.value = AppState.getColumnFilterValue(filterKey, { preferPending: false }) || '';
        }
        dropdown.style.display = 'none';
        document.dispatchEvent(new CustomEvent('filters:pending-updated'));
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
            if (input) {
                const column = this.getColumnDefinition(columnKey);
                const filterKey = this.resolveFilterKey(column) || columnKey;
                input.value = AppState.getColumnFilterValue(filterKey, { preferPending: true }) || '';
                setTimeout(() => input.focus(), 100);
            }
        } else {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Limpiar filtro de una columna específica
     */
    clearColumnFilter(columnKey, event) {
        if (event) event.stopPropagation();
    const column = this.getColumnDefinition(columnKey);
    const filterKey = this.resolveFilterKey(column) || columnKey;
        AppState.removeColumnFilter(filterKey);
        const dropdownId = `filter_${this.safeId}_${columnKey}`;
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            const input = dropdown.querySelector('input');
            if (input) input.value = '';
            dropdown.style.display = 'none';
        }
        document.dispatchEvent(new CustomEvent('filters:updated'));
    }

    /**
     * Restablecer el número de filas visibles y re-renderizar
     */
    resetVisibleRows() {
        this.visibleRows = this.initialRows;
        this.render(this.lastData, this.lastColumns);
    }

    setSortState(sortState = []) {
        this.sortState = sortState
            .filter(entry => entry && entry.key)
            .map(entry => ({
                key: entry.key,
                direction: entry.direction === 'desc' ? 'desc' : 'asc'
            }));
        this.sortColumn = this.sortState[0]?.key || null;
        this.sortDirection = this.sortState[0]?.direction || 'asc';
    }

    getSortState() {
        return this.sortState.map(entry => ({ ...entry }));
    }

    getColumnDefinition(columnKey) {
        return (this.lastColumns || []).find(col => col.key === columnKey);
    }

    resolveFilterKey(column) {
        if (!column) return null;
        return column.filterKey || column.key;
    }

    getSortableValue(row, columnKey, column = {}) {
        if (typeof column.sortAccessor === 'function') {
            return column.sortAccessor(row);
        }

        let value = row[columnKey];

        if (column.type === 'currency') {
            return parseAmount(value || 0);
        }

        if (column.type === 'percent' || column.type === 'number') {
            const numeric = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
            return Number.isNaN(numeric) ? 0 : numeric;
        }

        if (column.type === 'date' || columnKey.includes('Fecha') || columnKey === 'F. Operativa') {
            return parseDate(value)?.getTime() || 0;
        }

        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string' && value.includes('€')) {
            return parseAmount(value);
        }

        return String(value ?? '').toLowerCase();
    }

    escapeAttribute(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}
