/**
 * ============================================================================
 * TABLA CONFIGURABLE REUTILIZABLE
 * ============================================================================
 * Componente que permite crear tablas con diferentes configuraciones de columnas
 * manteniendo toda la funcionalidad (ordenamiento, filtrado, paginación, etc.)
 */

import { BaseTable } from './BaseTable.js';
import { AppState } from './state.js';

export class ConfigurableTable extends BaseTable {
    /**
     * @param {string} containerId - ID del contenedor HTML
     * @param {Object} config - Configuración de la tabla
     * @param {Array} config.columns - Array de definiciones de columnas
     * @param {string} config.columns[].key - Clave del campo en los datos
     * @param {string} config.columns[].labelKey - Clave de traducción para el título
     * @param {string} config.columns[].align - Alineación (text-right, text-center)
     * @param {string} config.columns[].cssClass - Clases CSS adicionales
     * @param {boolean} config.columns[].sortable - Si la columna es ordenable (default: true)
     * @param {boolean} config.columns[].searchable - Si la columna es filtrable (default: true)
     * @param {Function} config.columns[].formatter - Función para formatear el valor
     * @param {Object} config.options - Opciones de la tabla
     * @param {boolean} config.options.compact - Tabla compacta
     * @param {boolean} config.options.pagination - Mostrar paginación
     * @param {number} config.options.itemsPerPage - Items por página
     * @param {string} config.options.sortColumn - Columna de ordenamiento inicial
     * @param {string} config.options.sortDirection - Dirección inicial (asc/desc)
     * @param {Function} config.onRowClick - Callback al hacer clic en una fila
     * @param {Function} config.renderFooter - Función custom para renderizar el footer
     */
    constructor(containerId, config = {}) {
        super(containerId, config.options || {});
        
        this.columns = config.columns || [];
        this.onRowClick = config.onRowClick || null;
        this.customRenderFooter = config.renderFooter || null;
        
        // Aplicar ordenamiento inicial desde config
        if (config.options?.sortColumn) {
            this.sortColumn = config.options.sortColumn;
            this.sortDirection = config.options.sortDirection || 'asc';
        }
    }

    /**
     * Método público para renderizar con los datos
     */
    renderWithData(data) {
        this.render(data, this.columns);
    }

    /**
     * Override del renderRow para soportar formatter personalizado
     */
    renderRow(item, columns) {
        const rowClass = this.onRowClick ? 'interactive-row' : '';
        const onclick = this.onRowClick ? `onclick="window.handleRowClick_${this.safeId}(${JSON.stringify(item).replace(/"/g, '&quot;')})"` : '';
        
        let html = `<tr class="${rowClass}" ${onclick}>`;
        
        columns.forEach(col => {
            let value = item[col.key];
            
            // Aplicar formatter personalizado si existe
            if (col.formatter && typeof col.formatter === 'function') {
                value = col.formatter(value, item);
            } else {
                value = this.formatCellValue(value, col);
            }
            
            const alignClass = col.align || '';
            const cssClass = col.cssClass || '';
            const allClasses = [alignClass, cssClass].filter(c => c).join(' ');
            
            html += `<td class="${allClasses}">${value}</td>`;
        });
        
        html += '</tr>';
        return html;
    }

    /**
     * Override del renderFooter para soportar custom footer
     */
    renderFooter(data, columns) {
        if (this.customRenderFooter && typeof this.customRenderFooter === 'function') {
            return this.customRenderFooter(data, columns);
        }
        return super.renderFooter(data, columns);
    }

    /**
     * Registrar event handlers globales para esta instancia
     */
    registerGlobalHandlers() {
        const safeId = this.safeId;
        
        window[`sortTable_${safeId}`] = (col) => {
            this.sort(col);
            this.renderWithData(AppState.data.filtered);
        };

        window[`filterColumn_${safeId}`] = (col, value) => {
            this.filterColumn(col, value);
            this.renderWithData(AppState.data.filtered);
        };

        window[`toggleColumnFilter_${safeId}`] = (col, event) => {
            this.toggleColumnFilter(col, event);
        };

        window[`clearColumnFilter_${safeId}`] = (col, event) => {
            this.clearColumnFilter(col, event);
            this.renderWithData(AppState.data.filtered);
        };

        if (this.showPagination) {
            window[`nextPage_${safeId}`] = () => {
                this.nextPage();
                this.renderWithData(AppState.data.filtered);
            };

            window[`prevPage_${safeId}`] = () => {
                this.prevPage();
                this.renderWithData(AppState.data.filtered);
            };
        }

        if (this.onRowClick) {
            window[`handleRowClick_${safeId}`] = (item) => {
                this.onRowClick(item);
            };
        }
    }
}

/**
 * Factory function para crear tablas configurables fácilmente
 */
export function createConfigurableTable(containerId, config) {
    const table = new ConfigurableTable(containerId, config);
    table.registerGlobalHandlers();
    return table;
}
