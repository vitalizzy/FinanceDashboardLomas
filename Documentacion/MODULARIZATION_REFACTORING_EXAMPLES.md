# 🔄 REFACTORING EJEMPLOS - ANTES vs DESPUÉS

**Guía práctica con ejemplos de código modularizado correctamente**

---

## 1️⃣ GRÁFICOS - Factory Pattern

### ❌ ANTES: Acoplamiento fuerte

```javascript
// BarChart.js
let EChartsBarChart = null;

function getEChartsBarChart() {
    EChartsBarChart = window.EChartsBarChart;  // ← Acoplamiento global
    if (!EChartsBarChart) {
        throw new Error('EChartsBarChart not available');
    }
    return EChartsBarChart;
}

export class BarChart {
    constructor({ canvasId, data, metric = 'gastos' }) {
        const ChartClass = getEChartsBarChart();
        this._chart = new ChartClass(canvasId);
        this.data = data;
        this.metric = metric;
    }

    getLabels() {
        return this.data.map(([label]) => label);
    }

    getDatasets() {
        const metricConfig = {
            'gastos': { color: AppState.chartColors.gastos },
            'ingresos': { color: AppState.chartColors.ingresos }
        };
        const config = metricConfig[this.metric];
        return [{
            label: translate(config.labelKey, AppState.language),
            data: this.data.map(([, value]) => value)
        }];
    }
}

// En DashboardApp.js
const barChart = new BarChart({ canvasId, data, metric: 'gastos' });

// En otro lugar...
const incomeChart = new BarChart({ canvasId, data, metric: 'ingresos' });

// Y en otro lugar más...
const pieChart = new PieChart({ canvasId, data }); // ← ¿Interface diferente?
```

### ✅ DESPUÉS: Modularizado con Factory

```javascript
// ============ js/core/chart-config.js ============
export const CHART_CONFIG = {
    metrics: {
        'gastos': {
            labelKey: 'chart_label_expenses',
            color: '#EF4444'
        },
        'ingresos': {
            labelKey: 'chart_label_income',
            color: '#10B981'
        },
        'perHome': {
            labelKey: 'chart_label_per_home',
            color: '#3B82F6'
        }
    },
    types: {
        'bar': {
            height: '400px',
            padding: [50, 50, 50, 50]
        },
        'line': {
            height: '300px',
            padding: [40, 40, 40, 40]
        },
        'pie': {
            height: '350px',
            padding: [30, 30, 30, 30]
        }
    }
};

// ============ js/core/base-chart.js ============
/**
 * Interfaz base para todos los gráficos
 * Define contrato que todas las implementaciones deben cumplir
 */
export class BaseChart {
    constructor(config) {
        this.containerId = config.containerId;
        this.container = document.getElementById(this.containerId);
        this.type = config.type;
        this.data = config.data;
        this.options = config.options || {};
    }

    /**
     * Debe ser implementado por subclases
     */
    render() {
        throw new Error('render() must be implemented by subclass');
    }

    /**
     * Debe ser implementado por subclases
     */
    updateData(newData) {
        throw new Error('updateData() must be implemented by subclass');
    }

    /**
     * Genérico - igual en todos
     */
    destroy() {
        if (this.echartInstance) {
            this.echartInstance.dispose();
        }
    }
}

// ============ js/components/charts/BarChart.js ============
import { BaseChart } from '../../core/base-chart.js';
import { CHART_CONFIG } from '../../core/chart-config.js';

export class BarChart extends BaseChart {
    constructor(config) {
        super(config);
        this.metric = config.metric || 'gastos';
    }

    render() {
        const echarts = window.echarts;
        if (!echarts) throw new Error('ECharts library not loaded');

        this.echartInstance = echarts.init(this.container);
        
        const option = {
            title: { text: this._getTitle() },
            xAxis: { data: this._getLabels() },
            yAxis: {},
            series: [{
                data: this._getValues(),
                type: 'bar',
                itemStyle: {
                    color: CHART_CONFIG.metrics[this.metric].color
                }
            }]
        };

        this.echartInstance.setOption(option);
    }

    updateData(newData) {
        this.data = newData;
        this.render();
    }

    _getTitle() {
        const config = CHART_CONFIG.metrics[this.metric];
        return translate(config.labelKey, AppState.language);
    }

    _getLabels() {
        return this.data.map(([label]) => label);
    }

    _getValues() {
        return this.data.map(([, value]) => value);
    }
}

// ============ js/components/charts/chart-factory.js ============
import { BarChart } from './BarChart.js';
import { LineChart } from './LineChart.js';
import { PieChart } from './PieChart.js';
import { BarRaceChart } from './BarRaceChart.js';

/**
 * Factory centralizado para crear gráficos
 * Beneficios:
 * - Interface uniforme
 * - Fácil agregar nuevos tipos
 * - Un lugar para configurar valores por defecto
 */
export class ChartFactory {
    static #implementations = {
        'bar': BarChart,
        'line': LineChart,
        'pie': PieChart,
        'bar-race': BarRaceChart
    };

    static register(type, ChartClass) {
        this.#implementations[type] = ChartClass;
    }

    static create(type, config) {
        const ChartClass = this.#implementations[type];
        if (!ChartClass) {
            throw new Error(`Unknown chart type: ${type}`);
        }
        
        const chart = new ChartClass(config);
        return chart;
    }

    static createAndRender(type, config) {
        const chart = this.create(type, config);
        chart.render();
        return chart;
    }
}

// ============ USAGE EN DashboardApp.js ============
import { ChartFactory } from './components/charts/chart-factory.js';

// Crear gráfico de gastos
const expensesChart = ChartFactory.createAndRender('bar', {
    containerId: 'expenses-chart',
    type: 'bar',
    data: expensesByCategory,
    metric: 'gastos'
});

// Crear gráfico de ingresos - MISMA INTERFACE
const incomeChart = ChartFactory.createAndRender('bar', {
    containerId: 'income-chart',
    type: 'bar',
    data: incomeByCategory,
    metric: 'ingresos'
});

// Crear gráfico de línea - MISMA INTERFACE
const monthlyChart = ChartFactory.createAndRender('line', {
    containerId: 'monthly-chart',
    type: 'line',
    data: monthlyData
});

// Crear gráfico de carreras - MISMA INTERFACE
const raceChart = ChartFactory.createAndRender('bar-race', {
    containerId: 'race-chart',
    type: 'bar-race',
    data: raceData
});

// Beneficios:
// ✅ Mismo patrón para todos
// ✅ Fácil cambiar tipos
// ✅ Centralizado
// ✅ Fácil agregar nuevos tipos
```

---

## 2️⃣ TABLAS - Registry de Columnas

### ❌ ANTES: Definiciones duplicadas

```javascript
// TopMovementsTable.js
export class TopMovementsTable extends BaseTable {
    constructor() {
        super('top-movements-table', {
            compact: true,
            initialRows: 20,
            rowsIncrement: 10,
            sortStateKey: 'topMovementsSortState'
        });
        
        this.columns = [
            { 
                key: 'F. Operativa', 
                labelKey: 'date', 
                type: 'date', 
                width: '110px',
                align: 'text-center',
                headerAlign: 'text-center',
                sortable: true,
                searchable: true
            },
            { 
                key: 'Categoria', 
                labelKey: 'category', 
                minWidth: '120px',
                maxWidth: '180px',
                sortable: true,
                searchable: true
            },
            { 
                key: 'Concepto', 
                labelKey: 'concept', 
                minWidth: '200px',
                sortable: true,
                searchable: true
            },
            // ... más columnas
        ];
    }

    formatCellValue(value, column) {
        if (column.key === 'amount') {
            const amountClass = value >= 0 ? 'color-ingresos' : 'color-gastos';
            return `<span class="${amountClass} weight-medium">${formatCurrency(Math.abs(value))}</span>`;
        }
        return super.formatCellValue(value, column);
    }
}

// AllTransactionsTable.js
export class AllTransactionsTable extends BaseTable {
    constructor() {
        super('all-transactions-table', {
            compact: false,
            initialRows: 50,
            rowsIncrement: 25,
            sortStateKey: 'allTransactionsSortState'
        });
        
        this.columns = [
            { 
                key: 'Fecha',  // ← Nombre diferente a TopMovementsTable
                labelKey: 'date', 
                type: 'date', 
                width: '110px',
                align: 'text-center',
                headerAlign: 'text-center',
                sortable: true,
                searchable: true
            },
            { 
                key: 'Categoria',  // ← Similar al anterior
                labelKey: 'category', 
                minWidth: '120px',
                sortable: true,
                searchable: true
            },
            // ... más columnas
        ];
    }

    formatCellValue(value, column) {
        if (column.key === 'Importe') {  // ← Key diferente
            const amountClass = value >= 0 ? 'color-ingresos' : 'color-gastos';
            return `<span class="${amountClass}">${formatCurrency(value)}</span>`;
        }
        return super.formatCellValue(value, column);
    }
}

// ❌ Problemas:
// - Mismo campo "fecha" pero keys diferentes: 'F. Operativa' vs 'Fecha'
// - Mismo formato de "cantidad" pero keys diferentes: 'amount' vs 'Importe'
// - Lógica de formateo duplicada en 2+ lugares
// - Si cambio formato de cantidad, tengo que editar 2+ tablas
// - Definiciones esparcidas por el código
```

### ✅ DESPUÉS: Registry centralizado

```javascript
// ============ js/core/column-registry.js ============
import { formatCurrency, formatDate, formatPercent } from './formatters.js';

/**
 * Definiciones centralizadas de columnas
 * Una fuente de verdad para cada tipo de columna
 */
export const COLUMNS = {
    // Fecha - utilizada en varias tablas
    'date': {
        type: 'date',
        labelKey: 'date',
        width: '110px',
        align: 'text-center',
        headerAlign: 'text-center',
        formatter: (val) => formatDate(val),
        sortable: true,
        searchable: true
    },

    // Categoría
    'category': {
        type: 'string',
        labelKey: 'category',
        minWidth: '120px',
        maxWidth: '180px',
        formatter: (val) => val || 'Sin categoría',
        sortable: true,
        searchable: true
    },

    // Concepto
    'concept': {
        type: 'string',
        labelKey: 'concept',
        minWidth: '200px',
        formatter: (val) => val || '-',
        sortable: true,
        searchable: true
    },

    // Monto (dinero)
    'amount': {
        type: 'currency',
        labelKey: 'amount',
        align: 'text-right',
        headerAlign: 'text-right',
        formatter: (val) => formatCurrency(val),
        sortable: true,
        searchable: false,
        cellClass: (val) => val >= 0 ? 'color-ingresos' : 'color-gastos'
    },

    // Porcentaje
    'percentage': {
        type: 'percentage',
        labelKey: 'percentage',
        align: 'text-right',
        headerAlign: 'text-right',
        formatter: (val) => formatPercent(val),
        sortable: true,
        searchable: false
    },

    // Contador
    'count': {
        type: 'number',
        labelKey: 'count',
        align: 'text-center',
        headerAlign: 'text-center',
        formatter: (val) => val.toString(),
        sortable: true,
        searchable: false
    }
};

/**
 * Helper para obtener columnas por tabla
 */
export function getColumnsForTable(tableType) {
    const presets = {
        'top-movements': [
            { ...COLUMNS.date, key: 'F. Operativa' },  // ← Key específica, config compartida
            { ...COLUMNS.category, key: 'Categoria' },
            { ...COLUMNS.concept, key: 'Concepto' },
            { ...COLUMNS.amount, key: 'amount' }
        ],
        'all-transactions': [
            { ...COLUMNS.date, key: 'Fecha' },         // ← Key diferente, config compartida
            { ...COLUMNS.category, key: 'Categoria' },
            { ...COLUMNS.concept, key: 'Concepto' },
            { ...COLUMNS.amount, key: 'Importe' }      // ← Key diferente, config compartida
        ],
        'category-summary': [
            { ...COLUMNS.category, key: 'category' },
            { ...COLUMNS.count, key: 'count' },
            { ...COLUMNS.amount, key: 'total' },
            { ...COLUMNS.percentage, key: 'percentage' }
        ]
    };

    return presets[tableType] || [];
}

// ============ js/core/cell-formatters.js ============
/**
 * Formateadores centralizados para celdas
 * Beneficios:
 * - Un lugar para cambiar formato
 * - Reutilizable
 * - Testeable
 */
export class CellFormatter {
    static registry = new Map();

    static register(type, formatter) {
        this.registry.set(type, formatter);
    }

    static format(value, column) {
        if (column.formatter) {
            return column.formatter(value);
        }
        
        const formatter = this.registry.get(column.type);
        if (formatter) {
            return formatter(value);
        }
        
        return String(value);
    }

    static getCellClass(value, column) {
        if (typeof column.cellClass === 'function') {
            return column.cellClass(value);
        }
        return column.cellClass || '';
    }
}

// Registrar formateadores por defecto
CellFormatter.register('currency', (val) => formatCurrency(val));
CellFormatter.register('date', (val) => formatDate(val));
CellFormatter.register('percentage', (val) => formatPercent(val));
CellFormatter.register('number', (val) => formatNumber(val));
CellFormatter.register('string', (val) => String(val));

// ============ js/core/base-table.js (MEJORADO) ============
export class BaseTable {
    formatCellValue(value, column) {
        // ✅ Usar CellFormatter centralizado
        return CellFormatter.format(value, column);
    }

    // En renderBody():
    renderBody(data, columns) {
        let html = '<tbody>';
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                const value = row[col.key];
                const formattedValue = this.formatCellValue(value, col);
                const cellClass = CellFormatter.getCellClass(value, col);
                html += `<td class="${col.align} ${cellClass}">${formattedValue}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';
        return html;
    }
}

// ============ TABLAS SIMPLIFICADAS ============

// TopMovementsTable.js
import { getColumnsForTable } from '../../core/column-registry.js';

export class TopMovementsTable extends BaseTable {
    constructor() {
        super('top-movements-table', {
            compact: true,
            initialRows: 20,
            rowsIncrement: 10,
            sortStateKey: 'topMovementsSortState'
        });
        
        // ✅ Columnas definidas en un lugar
        this.columns = getColumnsForTable('top-movements');
    }

    // ✅ NO necesita override de formatCellValue
    // Heredado de BaseTable que usa CellFormatter
}

// AllTransactionsTable.js
export class AllTransactionsTable extends BaseTable {
    constructor() {
        super('all-transactions-table', {
            compact: false,
            initialRows: 50,
            rowsIncrement: 25,
            sortStateKey: 'allTransactionsSortState'
        });
        
        // ✅ Columnas definidas en un lugar
        this.columns = getColumnsForTable('all-transactions');
    }

    // ✅ NO necesita override de formatCellValue
}

// ============ BENEFICIOS ============
// ✅ Una fuente de verdad
// ✅ Cambio formato de cantidad → edito en 1 lugar
// ✅ Tablas minimalistas
// ✅ Fácil reutilizar columnas
// ✅ Consistencia garantizada
// ✅ Testeable
```

---

## 3️⃣ SELECTORES - Patrón Uniforme

### ❌ ANTES: Inconsistente

```javascript
// DateRangePicker.js
export class DateRangePicker {
    init() {
        this.startInput = document.getElementById(this.startId);
        this.endInput = document.getElementById(this.endId);
        
        this.startInput.addEventListener('change', (e) => {
            AppState.setDateRange(e.target.value, this.endInput.value);
            document.dispatchEvent(new CustomEvent('filters:updated'));
        });
        
        this.endInput.addEventListener('change', (e) => {
            AppState.setDateRange(this.startInput.value, e.target.value);
            document.dispatchEvent(new CustomEvent('filters:updated'));
        });
    }
}

// SearchBox.js
export class SearchBox {
    init() {
        this.input = document.getElementById(this.inputId);
        this.input.addEventListener('input', (e) => {
            AppState.filters.search = e.target.value;  // ← Diferente
            this.updateDisplay();  // ← Método privado
        });
    }

    updateDisplay() {
        // ... lógica
    }
}

// En FilterPanel.js
render() {
    AppState.filters.categories.forEach(category => {
        const badge = this._createBadge(category, () => {
            AppState.removeCategory(category);  // ← Tercera manera
            document.dispatchEvent(new CustomEvent('filters:updated'));
        });
    });
}

// ❌ Problemas:
// - Tres formas diferentes de manejar selecciones
// - Cada componente accede AppState directamente
// - Difícil cambiar lógica de estado
// - No hay patrón consistente
```

### ✅ DESPUÉS: Base uniforme

```javascript
// ============ js/core/base-selector.js ============
/**
 * Base para todos los selectores
 * Define interfaz consistente
 */
export class BaseSelector {
    constructor(config) {
        this.elementId = config.elementId;
        this.stateKey = config.stateKey;  // ← Clave en AppState
        this.onChange = config.onChange || (() => {});
    }

    /**
     * Obtener valor actual
     */
    getValue() {
        throw new Error('getValue() must be implemented');
    }

    /**
     * Establecer valor
     */
    setValue(value) {
        throw new Error('setValue() must be implemented');
    }

    /**
     * Inicializar y conectar elementos
     */
    init() {
        throw new Error('init() must be implemented');
    }

    /**
     * Notificar cambios
     */
    _notifyChange(value) {
        this.onChange(value);
        document.dispatchEvent(new CustomEvent('selection:changed', {
            detail: { key: this.stateKey, value }
        }));
    }
}

// ============ js/components/selectors/DateRangeSelector.js ============
import { BaseSelector } from '../../core/base-selector.js';

export class DateRangeSelector extends BaseSelector {
    constructor(config) {
        super(config);
        this.startElementId = config.startElementId;
        this.endElementId = config.endElementId;
    }

    getValue() {
        const start = document.getElementById(this.startElementId).value;
        const end = document.getElementById(this.endElementId).value;
        return { start, end };
    }

    setValue(value) {
        if (value.start) {
            document.getElementById(this.startElementId).value = value.start;
        }
        if (value.end) {
            document.getElementById(this.endElementId).value = value.end;
        }
    }

    init() {
        const startInput = document.getElementById(this.startElementId);
        const endInput = document.getElementById(this.endElementId);

        const updateSelection = () => {
            const value = this.getValue();
            this.onChange(value);
            this._notifyChange(value);
        };

        startInput.addEventListener('change', updateSelection);
        endInput.addEventListener('change', updateSelection);

        return this;
    }
}

// ============ js/components/selectors/CategorySelector.js ============
import { BaseSelector } from '../../core/base-selector.js';

export class CategorySelector extends BaseSelector {
    constructor(config) {
        super(config);
        this.containerElementId = config.containerElementId;
    }

    getValue() {
        // Devolver array de categorías seleccionadas
        const checkboxes = document.querySelectorAll(`#${this.containerElementId} input:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }

    setValue(values) {
        const checkboxes = document.querySelectorAll(`#${this.containerElementId} input`);
        checkboxes.forEach(cb => {
            cb.checked = values.includes(cb.value);
        });
    }

    init() {
        const checkboxes = document.querySelectorAll(`#${this.containerElementId} input`);
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const value = this.getValue();
                this.onChange(value);
                this._notifyChange(value);
            });
        });

        return this;
    }
}

// ============ js/components/selectors/SearchSelector.js ============
import { BaseSelector } from '../../core/base-selector.js';

export class SearchSelector extends BaseSelector {
    constructor(config) {
        super(config);
        this.debounceMs = config.debounceMs || 300;
        this.debounceTimer = null;
    }

    getValue() {
        const element = document.getElementById(this.elementId);
        return element ? element.value : '';
    }

    setValue(value) {
        const element = document.getElementById(this.elementId);
        if (element) element.value = value;
    }

    init() {
        const element = document.getElementById(this.elementId);
        
        element.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            
            this.debounceTimer = setTimeout(() => {
                const value = e.target.value;
                this.onChange(value);
                this._notifyChange(value);
            }, this.debounceMs);
        });

        return this;
    }
}

// ============ js/managers/SelectionManager.js ============
/**
 * Centraliza la gestión de todas las selecciones
 */
export class SelectionManager {
    constructor(appState) {
        this.appState = appState;
        this.listeners = new Map();
    }

    /**
     * Cambiar selección de fecha
     */
    selectDateRange(start, end) {
        this.appState.filters.dateRange = { start, end };
        this._notify('daterange', { start, end });
    }

    /**
     * Cambiar selección de categorías
     */
    selectCategories(categories) {
        this.appState.filters.categories = new Set(categories);
        this._notify('categories', categories);
    }

    /**
     * Cambiar búsqueda
     */
    setSearch(query) {
        this.appState.filters.search = query;
        this._notify('search', query);
    }

    /**
     * Limpiar todo
     */
    clearAll() {
        this.appState.clearAllFilters();
        this._notify('cleared');
    }

    /**
     * Escuchar cambios
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    _notify(event, value) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(value));
    }
}

// ============ USO EN DashboardApp.js ============
import { DateRangeSelector } from './components/selectors/DateRangeSelector.js';
import { CategorySelector } from './components/selectors/CategorySelector.js';
import { SearchSelector } from './components/selectors/SearchSelector.js';
import { SelectionManager } from './managers/SelectionManager.js';

export class DashboardApp {
    init() {
        // Crear manager centralizado
        this.selectionManager = new SelectionManager(AppState);

        // Crear selectores con interface uniforme
        const dateSelector = new DateRangeSelector({
            startElementId: 'date-start',
            endElementId: 'date-end',
            onChange: (value) => {
                this.selectionManager.selectDateRange(value.start, value.end);
                this.updateDashboard();
            }
        }).init();

        const categorySelector = new CategorySelector({
            containerElementId: 'categories-container',
            onChange: (values) => {
                this.selectionManager.selectCategories(values);
                this.updateDashboard();
            }
        }).init();

        const searchSelector = new SearchSelector({
            elementId: 'search-input',
            onChange: (query) => {
                this.selectionManager.setSearch(query);
                this.updateDashboard();
            }
        }).init();

        // ✅ Ahora todo es consistente
        // ✅ Un cambio en SelectionManager afecta a todos
        // ✅ Fácil agregar nuevos selectores
    }
}

// ============ BENEFICIOS ============
// ✅ Interface uniforme
// ✅ Fácil agregar nuevos selectores
// ✅ Lógica centralizada en SelectionManager
// ✅ Testeable
// ✅ Consistencia garantizada
```

---

## 4️⃣ UTILIDADES - Organización por Categoría

### ❌ ANTES: utils.js es un "junk drawer"

```javascript
// utils.js (200+ líneas)
export function parseDate(dateString) { }
export function parseAmount(amountString) { }
export function getCurrentPeriod() { }
export function getLastWorkingDay(date) { }
export function formatAmount(num) { }
export function isWeekend(date) { }
export function getMonthName(monthIndex) { }
export function getCategoryColor(category) { }
export function truncateString(str, max) { }
export function normalizeString(str) { }
export function sortArrayByKey(arr, key) { }
export function groupArrayByKey(arr, key) { }
// ... más 50+ funciones sin relación

// ❌ Problemas:
// - Difícil encontrar lo que buscas
// - Mezcla de responsabilidades
// - Difícil testear
// - Difícil documentar
```

### ✅ DESPUÉS: Separado por categoría

```javascript
// ============ js/core/date-utils.js ============
/**
 * Utilidades para manejo de fechas
 */

export function parseDate(dateString) {
    // Convertir string a Date
}

export function formatDate(date) {
    // Formatear Date a string legible
}

export function getCurrentPeriod() {
    // Obtener período actual
}

export function getLastWorkingDay(date) {
    // Último día laboral
}

export function isWeekend(date) {
    // ¿Es fin de semana?
}

export function getMonthName(monthIndex) {
    // Nombre del mes
}

// ============ js/core/number-utils.js ============
/**
 * Utilidades para números y moneda
 */

export function parseAmount(amountString) {
    // String a número
}

export function formatCurrency(amount) {
    // Número a moneda formateada
}

export function formatPercent(value) {
    // Valor a porcentaje
}

export function formatNumber(value) {
    // Número con separadores
}

// ============ js/core/string-utils.js ============
/**
 * Utilidades para strings
 */

export function truncateString(str, max) {
    // Cortar string a máximo
}

export function normalizeString(str) {
    // Normalizar (espacios, mayúsculas, etc)
}

export function capitalize(str) {
    // Primera letra mayúscula
}

// ============ js/core/array-utils.js ============
/**
 * Utilidades para arrays
 */

export function sortArrayByKey(arr, key) {
    // Ordenar array por propiedad
}

export function groupArrayByKey(arr, key) {
    // Agrupar por propiedad
}

export function uniqueArray(arr) {
    // Remover duplicados
}

// ============ js/core/color-utils.js ============
/**
 * Utilidades para colores
 */

export function getCategoryColor(category) {
    // Color por categoría
}

export function getAmountColor(amount) {
    // Color rojo/verde por positivo/negativo
}

// ============ IMPORTAR EN LOS LUGARES QUE SE NECESITE ============

// En BarChart.js
import { formatCurrency, formatPercent } from '../../core/number-utils.js';
import { formatDate } from '../../core/date-utils.js';

// En AllTransactionsTable.js
import { formatCurrency } from '../../core/number-utils.js';
import { formatDate } from '../../core/date-utils.js';

// En SearchBox.js
import { normalizeString } from '../../core/string-utils.js';

// ============ BENEFICIOS ============
// ✅ Fácil encontrar lo que buscas
// ✅ Responsabilidad clara
// ✅ Fácil testear
// ✅ Fácil documentar
// ✅ No duplicación
```

---

## 📋 CHECKLIST DE REFACTORING

Cuando refactoricemos un componente:

- [ ] ¿Identificar responsabilidades principales?
- [ ] ¿Crear clase base si es patrón repetido?
- [ ] ¿Extraer configuración a archivo propio?
- [ ] ¿Crear factory si hay múltiples tipos?
- [ ] ¿Eliminar acoplamiento a globals?
- [ ] ¿Agregar JSDoc a métodos públicos?
- [ ] ¿Crear ejemplos de uso?
- [ ] ¿Testeable sin DOM?
- [ ] ¿Documentar en MODULARIZATION_AUDIT.md?

