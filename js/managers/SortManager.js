/**
 * ============================================================================
 * SORT MANAGER - Sistema modularizado de ordenamiento
 * ============================================================================
 * 
 * Gestor centralizado para ordenamiento multi-columna con lógica de 3 estados:
 * 1. Sin ordenamiento → DESC (mayor a menor)
 * 2. DESC → ASC (menor a mayor)
 * 3. ASC → Sin ordenamiento
 * 
 * Soporta múltiples columnas simultáneas con sistema de prioridad.
 * La prioridad de ordenamiento se define por el orden en que se hace click en las columnas.
 */

export class SortManager {
    /**
     * Constructor del gestor de ordenamiento
     * @param {Object} options - Opciones de configuración
     * @param {Array} options.initialSortState - Estado inicial del ordenamiento
     * @param {Function} options.onSortChange - Callback cuando cambia el estado de ordenamiento
     */
    constructor(options = {}) {
        this.sortState = Array.isArray(options.initialSortState)
            ? options.initialSortState.map(entry => ({
                key: entry.key,
                direction: entry.direction === 'desc' ? 'desc' : 'asc'
            }))
            : [];
        
        this.onSortChange = options.onSortChange || (() => {});
        this.sortColumn = this.sortState[0]?.key || null;
        this.sortDirection = this.sortState[0]?.direction || 'asc';
    }

    /**
     * Implementa la lógica de 3 estados para el ordenamiento de columnas
     * 
     * Estados:
     * 1. Primer click (nuevo): Agregar como DESC con máxima prioridad
     * 2. Segundo click: Cambiar de DESC a ASC
     * 3. Tercer click: Remover ordenamiento
     * 
     * @param {string} column - Nombre de la columna a ordenar
     * @returns {Object} Nuevo estado de ordenamiento
     */
    toggleSort(column) {
        console.log(`[SortManager.toggleSort] Column: ${column}, Current state:`, JSON.stringify(this.sortState));
        
        const index = this.sortState.findIndex(entry => entry.key === column);

        if (index === -1) {
            // Primer click: ordenar descendentemente (DESC)
            console.log(`[SortManager] First click - adding ${column} as DESC`);
            this.sortState.push({ key: column, direction: 'desc' });
        } else {
            const currentDirection = this.sortState[index].direction;
            if (currentDirection === 'desc') {
                // Segundo click: cambiar a ascendentemente (ASC)
                console.log(`[SortManager] Second click - changing ${column} to ASC`);
                this.sortState[index].direction = 'asc';
            } else if (currentDirection === 'asc') {
                // Tercer click: remover ordenamiento
                console.log(`[SortManager] Third click - removing ${column}`);
                this.sortState.splice(index, 1);
            }
        }

        // Actualizar referencias a la columna principal
        this.sortColumn = this.sortState[0]?.key || null;
        this.sortDirection = this.sortState[0]?.direction || 'asc';

        console.log(`[SortManager.toggleSort] New state:`, JSON.stringify(this.sortState));

        // Notificar cambio
        this.onSortChange(this.getSortState());

        return this.getSortState();
    }

    /**
     * Obtiene una copia del estado de ordenamiento actual
     * @returns {Array} Array de {key, direction} para cada columna ordenada
     */
    getSortState() {
        return this.sortState.map(entry => ({ ...entry }));
    }

    /**
     * Establece el estado de ordenamiento completo
     * @param {Array} sortState - Nuevo estado de ordenamiento
     */
    setSortState(sortState = []) {
        this.sortState = Array.isArray(sortState)
            ? sortState
                .filter(entry => entry && entry.key)
                .map(entry => ({
                    key: entry.key,
                    direction: entry.direction === 'desc' ? 'desc' : 'asc'
                }))
            : [];
        
        this.sortColumn = this.sortState[0]?.key || null;
        this.sortDirection = this.sortState[0]?.direction || 'asc';
        this.onSortChange(this.getSortState());
    }

    /**
     * Establece el estado de ordenamiento sin triggerar el callback onSortChange
     * Útil para restaurar estado persistido sin causar loops infinitos
     * @param {Array} sortState - Nuevo estado de ordenamiento
     */
    setSortStateDirectly(sortState = []) {
        console.log(`[SortManager.setSortStateDirectly] Setting state without callback:`, JSON.stringify(sortState));
        this.sortState = Array.isArray(sortState)
            ? sortState
                .filter(entry => entry && entry.key)
                .map(entry => ({
                    key: entry.key,
                    direction: entry.direction === 'desc' ? 'desc' : 'asc'
                }))
            : [];
        
        this.sortColumn = this.sortState[0]?.key || null;
        this.sortDirection = this.sortState[0]?.direction || 'asc';
        // NO llamar a onSortChange() aquí - eso evita loops infinitos
    }

    /**
     * Obtiene información del ordenamiento para una columna específica
     * @param {string} columnKey - Clave de la columna
     * @returns {Object|null} {key, direction, priority} o null si no está ordenada
     */
    getSortInfoForColumn(columnKey) {
        const index = this.sortState.findIndex(entry => entry.key === columnKey);
        if (index === -1) return null;
        
        return {
            key: this.sortState[index].key,
            direction: this.sortState[index].direction,
            priority: index + 1 // Basado en 1, no en 0
        };
    }

    /**
     * Verifica si una columna está ordenada
     * @param {string} columnKey - Clave de la columna
     * @returns {boolean}
     */
    isColumnSorted(columnKey) {
        return this.sortState.some(entry => entry.key === columnKey);
    }

    /**
     * Aplica el ordenamiento a un array de datos
     * @param {Array} data - Datos a ordenar
     * @param {Function} getSortableValue - Función para obtener valor sorteable de una fila
     * @returns {Array} Datos ordenados
     */
    applySortToData(data, getSortableValue) {
        console.log(`[SortManager.applySortToData] Called with ${data?.length || 0} rows, sortState:`, JSON.stringify(this.sortState));
        
        if (!Array.isArray(data) || data.length === 0) {
            console.log(`[SortManager.applySortToData] No data to sort`);
            return data;
        }

        if (this.sortState.length === 0) {
            console.log(`[SortManager.applySortToData] No sort state, returning unsorted data`);
            return data;
        }

        // Crear una copia para evitar mutar el array original
        const sorted = [...data];

        // Ordenar en cascada por cada columna en su orden de prioridad
        sorted.sort((a, b) => {
            for (const { key, direction } of this.sortState) {
                const valueA = getSortableValue(a, key);
                const valueB = getSortableValue(b, key);

                let comparison = 0;

                // Comparación numérica
                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    comparison = valueA - valueB;
                }
                // Comparación de strings
                else if (typeof valueA === 'string' && typeof valueB === 'string') {
                    comparison = valueA.localeCompare(valueB, 'es-ES', { numeric: true });
                }
                // Comparación mixta
                else {
                    const strA = String(valueA ?? '');
                    const strB = String(valueB ?? '');
                    comparison = strA.localeCompare(strB, 'es-ES', { numeric: true });
                }

                // Invertir comparación si es descendente
                if (direction === 'desc') {
                    comparison = -comparison;
                }

                // Si no son iguales, devolver la comparación
                if (comparison !== 0) {
                    return comparison;
                }
                // Si son iguales en esta columna, continuar con la siguiente
            }

            return 0;
        });

        console.log(`[SortManager.applySortToData] Returning ${sorted.length} sorted rows`);
        return sorted;
    }

    /**
     * Reinicia el ordenamiento (limpia todo)
     */
    reset() {
        this.sortState = [];
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.onSortChange(this.getSortState());
    }

    /**
     * Obtiene una descripción textual del estado de ordenamiento
     * @returns {string} Descripción readable del estado
     */
    getDescription() {
        if (this.sortState.length === 0) {
            return 'Sin ordenamiento';
        }

        return this.sortState
            .map((entry, idx) => `${idx + 1}. ${entry.key} (${entry.direction === 'desc' ? '↓' : '↑'})`)
            .join(', ');
    }
}
