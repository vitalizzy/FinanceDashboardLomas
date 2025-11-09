# 📚 Arquitectura y Lógica del Proyecto Finance Dashboard

**Documento:** Guía de Estructura del Proyecto  
**Propósito:** Entender la arquitectura, patrones y flujos de datos  
**Audiencia:** Desarrolladores nuevos, mantenimiento futuro  

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Capas](#arquitectura-de-capas)
3. [Componentes y Responsabilidades](#componentes-y-responsabilidades)
4. [Flujo de Datos](#flujo-de-datos)
5. [Patrones de Diseño](#patrones-de-diseño)
6. [Estructura de Directorios](#estructura-de-directorios)
7. [Cómo Funciona: Ejemplos Prácticos](#cómo-funciona-ejemplos-prácticos)

---

## 🎯 Visión General

**Finance Dashboard Lomas** es una aplicación web de análisis financiero que:

- 📊 Visualiza movimientos bancarios con gráficos interactivos
- 🔍 Filtra datos por período, categoría, mes y búsqueda
- 📈 Muestra KPIs (indicadores clave) con resumenes
- 📋 Tablas con ordenamiento, paginación y filtrado
- 🌍 Soporte multiidioma (Español/Inglés)
- 🔐 Seguridad con contraseña para datos sensibles

**Stack Tecnológico:**
- Frontend: Vanilla JavaScript (ES6 modules)
- Gráficos: ECharts (reemplazó Chart.js)
- Almacenamiento: CSV en localStorage + fetch
- Estilos: CSS puro (responsive, mobile-first)
- Arquitectura: Orientada a objetos con managers y services

---

## 🏗️ Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN (HTML/CSS)                  │
│              index.html + assets/styles/main.css            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│                 APLICACIÓN (DashboardApp)                   │
│  Orquestador principal que coordina todas las piezas        │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼───────┐  ┌────▼─────┐  ┌──────▼──────┐
│  MANAGERS     │  │ SERVICES  │  │  CORE       │
│               │  │           │  │             │
│ - Filter      │  │ DataSvc   │  │ - State     │
│ - Chart       │  │           │  │ - i18n      │
│ - Table       │  │           │  │ - formatters│
│ - KPI         │  │           │  │ - security  │
│ - Sort        │  │           │  │ - errors    │
└───────┬───────┘  └────┬──────┘  └──────┬──────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼──────────┐          ┌──────────▼────────┐
│   COMPONENTES    │          │    BASE CLASSES   │
│                  │          │                   │
│ - LineChart      │          │ - BaseECharts     │
│ - BarChart       │          │ - BaseTable       │
│ - Tables         │          │                   │
│ - Filters        │          │                   │
│ - Feedback       │          │                   │
└──────────────────┘          └───────────────────┘
```

---

## 📦 Componentes y Responsabilidades

### 🎯 **APLICACIÓN PRINCIPAL**

#### **main.js**
**¿Qué hace?** Punto de entrada de la aplicación  
**Responsabilidad:** Inicializar DashboardApp y registrar global actions

```javascript
// Importa DashboardApp
// Crea instancia global 'app'
// Registra funciones globales en window
// Llama app.init() al cargar
```

**Importancia:** 🔴 Crítica - Sin esto, nada funciona

---

#### **js/app/DashboardApp.js**
**¿Qué hace?** Orquestador central de toda la aplicación  
**Responsabilidad:** Coordinar managers, servicios y UI

```javascript
constructor() {
    // Inyecta dependencias: DataService, FilterManager, etc.
    this.dataService = new DataService();
    this.filterManager = new FilterManager();
    this.tableManager = new TableManager();
    this.chartManager = new ChartManager();
    this.kpiManager = new KpiManager();
}

async init() {
    // 1. Cargar datos
    // 2. Renderizar UI inicial
    // 3. Configurar event listeners
}

updateDashboard() {
    // Llamada MAESTRO después de cualquier cambio:
    // - Cambio de filtro
    // - Cambio de KPI
    // - Selección de mes/categoría
    // Re-renderiza tablas, gráficos, KPIs
}
```

**Métodos Principales:**
- `init()` - Inicialización completa
- `updateDashboard()` - Renderizar todo con datos filtrados
- `handleSelectPendingMonth(month)` - Filtrar por mes
- `handleSelectPendingCategory(category)` - Filtrar por categoría
- `handleCategoryKPIChange(metric)` - Cambiar métrica de gráfico
- `handleApplyPendingSelection()` - Confirmar filtros
- `handleClearPendingSelection()` - Cancelar filtros

**Importancia:** 🔴 Crítica - Es el "cerebro" de la app

---

#### **js/app/globalActions.js**
**¿Qué hace?** Registra funciones globales en window  
**Responsabilidad:** Permitir que HTML onclick() llame métodos de app

```javascript
// Mapea window.functionName → app.method()
// Permite: <button onclick="window.applyFilter()"></button>
// Sin esto, onclick en HTML no funcionaría
```

**Importancia:** 🟡 Media - Necesaria para interactividad HTML

---

### 💾 **SERVICIOS**

#### **js/services/DataService.js**
**¿Qué hace?** Cargar y gestionar datos financieros  
**Responsabilidad:** Obtener CSV, parsear, guardar en AppState

```javascript
async loadFinancialData() {
    // Fetch CSV desde URL
    // Parsea CSV a array de objetos
    // Calcula agregaciones (sumas por categoría, mes, etc.)
    // Guarda en AppState.data
}

getCategoryData(metric) {
    // Devuelve datos de categoría agregados por métrica
    // Ej: [['Alimentación', 1200], ['Hogar', 800]]
}

getMonthlyData() {
    // Devuelve últimos 12 meses con ingresos/gastos
    // Para gráfico de líneas
}
```

**Importancia:** 🔴 Crítica - Todos los datos vienen de aquí

---

### 🎮 **MANAGERS** (Controladores de Dominio)

Los managers siguen el patrón **Manager Pattern**: cada uno controla un aspecto específico del dashboard.

#### **js/managers/FilterManager.js**
**¿Qué hace?** Gestionar todos los filtros  
**Responsabilidad:** Aplicar/cancelar filtros, validar estado pending

```javascript
toggleMonth(month, isPending=false) {
    // Añade/quita mes del filtro
    // isPending=true → preview, no aplicado aún
    // isPending=false → aplicado permanentemente
}

toggleCategory(category, isPending=false) {
    // Similar para categorías
}

applyPendingSelections() {
    // Confirma todos los filtros pending
    // Mueve de AppState.filters.pendingMonths → AppState.filters.months
}

clearPendingSelections() {
    // Descarta cambios pending
}

getFilteredData() {
    // IMPORTANTE: Aplica TODOS los filtros de forma coherente
    // 1. Período (actual, últimos 3 meses, rango personalizado)
    // 2. Categorías seleccionadas
    // 3. Meses seleccionados
    // 4. Búsqueda de concepto
    // Devuelve array de transacciones filtradas
}
```

**Flujo de Filtrado:**
```
1. Usuario selecciona filtro (ej: mes "2024-01")
   ↓
2. FilterManager.toggleMonth("2024-01", true) 
   → AppState.filters.pendingMonths.add("2024-01")
   ↓
3. Dashboard muestra PREVIEW de datos filtrados
   ↓
4. Usuario confirma → applyPendingSelections()
   → AppState.filters.months.add("2024-01")
   → Filtro permanente
```

**Importancia:** 🔴 Crítica - Controla lo más usado del dashboard

---

#### **js/managers/ChartManager.js**
**¿Qué hace?** Renderizar gráficos ECharts  
**Responsabilidad:** Crear/actualizar gráficos (líneas, barras, animados)

```javascript
renderChart(chartKey, data, options={}) {
    // Obtiene datos filtrados
    // Crea instancia ECharts (LineChart, BarChart, etc.)
    // Renderiza en DOM
}

getChart(chartKey) {
    // Obtiene instancia de gráfico para control avanzado
}

setContext(context) {
    // Guarda contexto: selectedCategoryKPI, filtros, etc.
}
```

**Tipos de Gráficos:**
- `line-chart` → MonthlyFlowLineChart (flujo mensual)
- `expenses-chart` → ExpensesBarChart (categorías)
- `bar-race-chart` → BarRaceChart (ranking animado)

**Importancia:** 🔴 Crítica - Sin gráficos, no hay visualización

---

#### **js/managers/TableManager.js**
**¿Qué hace?** Renderizar tablas con datos  
**Responsabilidad:** Crear/actualizar BaseTable con columnas y datos

```javascript
renderTable(tableKey, data, options={}) {
    // Obtiene columnas configuradas
    // Obtiene datos filtrados
    // Crea instancia BaseTable
    // Renderiza en DOM
}

getTables() {
    // Configura qué tablas mostrar y con qué columnas
    // Ej: AllTransactionsTable, CategorySummaryTable, etc.
}
```

**Tablas Disponibles:**
- `all-transactions` → Todas las transacciones
- `category-summary` → Resumen por categoría
- `top-movements` → Top movimientos

**Importancia:** 🟡 Media-Alta - Muestra datos crudos

---

#### **js/managers/KpiManager.js**
**¿Qué hace?** Calcular y mostrar KPIs  
**Responsabilidad:** Agregar datos, calcular tendencias, mostrar tarjetas

```javascript
calculateKPIs(data) {
    // Total Ingresos: sum(data.Importe where type='ingreso')
    // Total Gastos: sum(data.Importe where type='gasto')
    // Per Home: totalGastos / 160 (casas)
    // Balance: ingresos - gastos
    // Transacciones: count(data)
}

renderKPIs() {
    // Muestra tarjetas con valores calculados
    // Incluye trending (↑ subió, ↓ bajó)
}
```

**Importancia:** 🟡 Media - Indicadores secundarios

---

#### **js/managers/SortManager.js**
**¿Qué hace?** Gestionar ordenamiento de tablas  
**Responsabilidad:** Aplicar y mostrar estado de ordenamiento

```javascript
setSortState(tableKey, columnKey, direction) {
    // Guarda en localStorage: qué tabla, columna, dirección
    // direction: 'asc' | 'desc'
}

getSortState(tableKey) {
    // Recupera estado de ordenamiento para tabla
}
```

**Importancia:** 🟢 Baja - Solo ordena visualmente

---

### 🔧 **CORE** (Utilidades Fundamentales)

#### **js/core/state.js** - AppState (Store Global)
**¿Qué hace?** Almacenar estado global de la aplicación  
**Responsabilidad:** Única fuente de verdad

```javascript
AppState = {
    data: {
        financial: [],  // Todas las transacciones
        // + agregaciones calculadas
    },
    filters: {
        months: new Set(),           // Meses aplicados
        pendingMonths: new Set(),    // Meses en preview
        categories: new Set(),       // Categorías aplicadas
        pendingCategories: new Set(),// Categorías en preview
        dateRange: { start, end },   // Rango personalizado
        searchQuery: '',             // Búsqueda de concepto
        current: 'all'               // Período rápido
    },
    language: 'es',                  // Idioma actual
    chartColors: { ... }             // Colores por métrica
}
```

**¿Por qué existe?** Evitar pasar datos entre funciones. Todos pueden acceder.

**Importancia:** 🔴 Crítica - Todo depende del estado

---

#### **js/core/i18n.js** - Internacionalización
**¿Qué hace?** Gestionar textos en múltiples idiomas  
**Responsabilidad:** Traducir strings según idioma actual

```javascript
translate(key, language='es') {
    // Busca key en diccionario del idioma
    // Devuelve string traducido
    // Ej: translate('expenses_by_category', 'es')
    // → 'Gastos por categoría'
}
```

**Estructura:**
```javascript
{
    es: {
        'expenses_by_category': 'Gastos por categoría',
        'category_by_metric_gastos': 'Gastos por categoría',
        ...
    },
    en: {
        'expenses_by_category': 'Expenses by Category',
        'category_by_metric_gastos': 'Expenses by Category',
        ...
    }
}
```

**Importancia:** 🟡 Media - Necesaria para multiidioma

---

#### **js/core/formatters.js**
**¿Qué hace?** Dar formato a valores  
**Responsabilidad:** Convertir números a moneda, fechas, porcentajes

```javascript
formatCurrency(value) {
    // 1200 → "1.200 €"
}

formatPercentage(value) {
    // 0.234 → "23.4%"
}

formatDate(dateString) {
    // "2024-01-15" → "15/01/2024"
}
```

**Importancia:** 🟡 Media - Mejora legibilidad

---

#### **js/core/base_echarts.js** - Base para Gráficos
**¿Qué hace?** Clase base reutilizable para todos los gráficos ECharts  
**Responsabilidad:** Configuración común, métodos genéricos

```javascript
class BaseECharts {
    getThemeColors() { ... }
    getBaseConfig() { ... }
    
    // NUEVOS (implementados recientemente):
    truncateLabel(label, maxLength=12) { ... }
    getOptimizedGrid() { ... }
    registerClickHandler(xAxisData, handler, filterType) { ... }
    showSelectionFeedback(value, filterType) { ... }
}
```

**Importancia:** 🔴 Crítica - Todos los gráficos heredan de esto

---

#### **js/core/base_table.js** - Base para Tablas
**¿Qué hace?** Clase base reutilizable para todas las tablas  
**Responsabilidad:** Renderizar filas, columnas, ordenamiento, paginación

```javascript
class BaseTable {
    render() { ... }
    renderRow(item, columns) { ... }
    applySort(data, sortConfig) { ... }
    applySearch(data, searchTerm) { ... }
}
```

**Importancia:** 🔴 Crítica - Todas las tablas heredan de esto

---

#### **js/core/security.js**
**¿Qué hace?** Proteger datos sensibles con contraseña  
**Responsabilidad:** Pedir contraseña antes de mostrar concepto original

```javascript
setupSecurityListeners() {
    // Si usuario hace click en concepto secreto
    // Pide contraseña
    // Si correcta, muestra concepto real
}
```

**Importancia:** 🟡 Media - Opcional, para privacidad

---

#### **js/core/errors.js**
**¿Qué hace?** Gestionar errores  
**Responsabilidad:** Logging, notificaciones de error

```javascript
ErrorHandler.log(error, context) {
    // Registra error con contexto
    // Muestra notificación amigable al usuario
}
```

**Importancia:** 🟢 Baja - Soporte, no core

---

### 📊 **COMPONENTES ESPECÍFICOS**

#### **js/components/charts/LineChart.js**
**¿Qué hace?** Gráfico de líneas mensual  
**Hereda de:** EChartsLineChart → BaseECharts

```javascript
class MonthlyFlowLineChart {
    getLabels() { // Devuelve meses: ["01/2024", "02/2024", ...]
    getDatasets() { // Devuelve series: ingresos, gastos, balance, etc.
    render() {
        // Configura opciones ECharts
        // Registra click handler para filtrar por mes
        // Muestra toast feedback
    }
}
```

**Características:**
- 5 líneas: Ingresos, Gastos, Per Home, Saldo Mín, Saldo Final
- Barras de transacciones al fondo (z-level bajo)
- Click → filtra por mes
- Toast visual: "✓ Month selected: 2024-01"

**Importancia:** 🟡 Media-Alta - Visualización principal

---

#### **js/components/charts/BarChart.js**
**¿Qué hace?** Gráfico de barras por categoría  
**Hereda de:** EChartsBarChart → BaseECharts

```javascript
class ExpensesBarChart {
    getLabels() { // Categorías: ["Alimentación", "Hogar", ...]
    getDatasets() { // Gastos/ingresos por categoría
    render() {
        // Configura ECharts
        // Registra click handler para filtrar por categoría
    }
}
```

**Características:**
- Métrica selector: Gastos, Ingresos, Per Home, Transacciones
- Labels truncados a 12 caracteres (ej: "Alimentaci...")
- Click → filtra por categoría

**Importancia:** 🟡 Media - Análisis por categoría

---

#### **js/components/tables/AllTransactionsTable.js**
**¿Qué hace?** Tabla con TODAS las transacciones  
**Hereda de:** BaseTable

**Características:**
- Columnas: Fecha, Categoría, Concepto, Importe, Tipo
- Ordenamiento: clickeable en headers
- Búsqueda: por concepto
- Paginación: 50 registros por página
- Concepto original: protegido con contraseña

**Importancia:** 🟡 Media - Datos crudos

---

#### **js/components/tables/CategorySummaryTable.js**
**¿Qué hace?** Resumen agregado por categoría  
**Hereda de:** BaseTable

**Características:**
- Columnas: Categoría, Cantidad, Importe, % del Total
- Dinámico: cambia según métrica seleccionada
- Click en categoría → filtra

**Importancia:** 🟢 Baja - Análisis secundario

---

#### **js/components/tables/TopMovementsTable.js**
**¿Qué hace?** Top 10 movimientos más grandes  
**Hereda de:** BaseTable

**Características:**
- Orden: mayor a menor importe
- Muestra: Categoría, Concepto, Importe, Tipo

**Importancia:** 🟢 Baja - Vistazo rápido

---

#### **js/components/filters/FilterPanel.js**
**¿Qué hace?** Panel de controles Confirm/Cancel  
**Responsabilidad:** Mostrar/ocultar botones pending

```javascript
togglePendingControls(show) {
    // Muestra/oculta botones Confirm y Cancel
}
```

**Importancia:** 🟡 Media - Crucial para flujo de filtrado

---

#### **js/components/filters/DateRangePicker.js**
**¿Qué hace?** Selector de rango de fechas  
**Responsabilidad:** Permitir filtro personalizado de fechas

**Importancia:** 🟡 Media - Filtrado avanzado

---

#### **js/components/filters/Dropdown.js**
**¿Qué hace?** Dropdowns reutilizables  
**Responsabilidad:** Renderizar selects dinámicos

**Importancia:** 🟢 Baja - UI

---

#### **js/components/filters/SearchBox.js**
**¿Qué hace?** Caja de búsqueda  
**Responsabilidad:** Filtrar por concepto/texto libre

**Importancia:** 🟡 Media - Búsqueda importante

---

---

## 📈 Flujo de Datos

### Flujo General: "El Usuario Cambia Filtro"

```
1. Usuario hace CLICK en filtro
   ↓
2. HTML onclick → window.functionName()
   ↓
3. globalActions.js mapea a app.method()
   ↓
4. DashboardApp.handleFilterChange()
   ↓
5. FilterManager.toggleMonth/Category(value, true)
   ↓
6. AppState.filters.pendingMonths.add(value)
   ↓
7. DashboardApp.updateDashboard()
   ↓
8. Todos los managers re-renderean:
   - ChartManager.renderChart() con datos filtrados
   - TableManager.renderTable() con datos filtrados
   - KpiManager.renderKPIs() con datos filtrados
   ↓
9. Usuario ve PREVIEW de datos filtrados
   ↓
10. Usuario hace click CONFIRM
   ↓
11. DashboardApp.handleApplyPendingSelection()
   ↓
12. FilterManager.applyPendingSelections()
   ↓
13. AppState.filters.pendingMonths → AppState.filters.months
   ↓
14. DashboardApp.updateDashboard() (actualiza permanentemente)
   ↓
15. ✅ Filtro aplicado
```

### Flujo Específico: "Usuario Hace Click en Gráfico"

```
1. Usuario hace CLICK en punto del gráfico
   ↓
2. BaseECharts.registerClickHandler() captura evento
   ↓
3. Extrae valor del eje X (ej: mes "2024-01")
   ↓
4. Ejecuta callback: window.selectPendingMonth()
   ↓
5. showSelectionFeedback() muestra toast: "✓ Month selected"
   ↓
6. DashboardApp.handleSelectPendingMonth("2024-01")
   ↓
7. FilterManager.toggleMonth("2024-01", true) [PENDING]
   ↓
8. FilterPanel.togglePendingControls(true) [muestra botones]
   ↓
9. DashboardApp.updateDashboard() [actualiza preview]
   ↓
10. Usuario ve PREVIEW con datos del mes
   ↓
11. Si confirma → FilterManager.applyPendingSelections()
    Si cancela → FilterManager.clearPendingSelections()
```

---

## 🎨 Patrones de Diseño

### 1. **Manager Pattern**
**Uso:** ChartManager, TableManager, FilterManager, KpiManager  
**Propósito:** Separar responsabilidades por dominio

```javascript
// ❌ MAL (todo en DashboardApp)
class DashboardApp {
    renderChart() { ... }
    renderTable() { ... }
    applyFilter() { ... }
    calculateKPI() { ... }
}

// ✅ BIEN (cada manager su dominio)
class DashboardApp {
    chartManager.renderChart() { ... }
    tableManager.renderTable() { ... }
    filterManager.applyFilter() { ... }
    kpiManager.calculateKPI() { ... }
}
```

---

### 2. **Template Method Pattern (Herencia)**
**Uso:** BaseTable, BaseECharts, componentes específicos  
**Propósito:** Reutilizar código común

```javascript
class BaseTable {
    render(data, columns) {
        const html = this.renderHeader(columns) +
                     this.renderRows(data, columns) +
                     this.renderFooter(data);
        this.container.innerHTML = html;
    }
}

class AllTransactionsTable extends BaseTable {
    // Hereda render()
    // Solo define renderRow() específico
    renderRow(item, columns) { ... }
}
```

---

### 3. **Service Locator Pattern**
**Uso:** DashboardApp con dependencias inyectadas  
**Propósito:** Composición flexible

```javascript
class DashboardApp {
    constructor({
        dataService = new DataService(),
        filterManager = new FilterManager(),
        // ...
    } = {}) {
        this.dataService = dataService;
        this.filterManager = filterManager;
    }
}

// Permite testing: new DashboardApp({ filterManager: mockFilterManager })
```

---

### 4. **Observer-like Pattern (Global State)**
**Uso:** AppState + updateDashboard()  
**Propósito:** Cualquier cambio en estado → actualizar UI

```javascript
AppState.filters.months.add("2024-01");
// Alguien debe saber que AppState cambió
// → Llamar DashboardApp.updateDashboard()
```

---

### 5. **Facade Pattern**
**Uso:** FilterManager abstrae complejidad de filtros  
**Propósito:** Interfaz simple para operaciones complejas

```javascript
// ❌ Cliente no debería hacer esto
AppState.filters.pendingMonths.add(month);
AppState.filters.pendingCategories.add(category);
AppState.filters.searchQuery = query;
// ... más lógica

// ✅ Cliente usa facade
filterManager.toggleMonth(month, true);
filterManager.toggleCategory(category, true);
filterManager.setSearchQuery(query);
// La complejidad está oculta
```

---

## 📁 Estructura de Directorios

```
FinanceDashboardLomas/
│
├── index.html                          # HTML principal
├── main.js                             # Punto de entrada
│
├── js/
│   ├── main.js                         # Inicialización app
│   │
│   ├── app/
│   │   ├── DashboardApp.js            # Orquestador principal
│   │   └── globalActions.js           # Funciones globales para onclick
│   │
│   ├── services/
│   │   └── DataService.js             # Cargar y parsear datos
│   │
│   ├── managers/
│   │   ├── FilterManager.js           # Gestión de filtros
│   │   ├── ChartManager.js            # Gestión de gráficos
│   │   ├── TableManager.js            # Gestión de tablas
│   │   ├── KpiManager.js              # Cálculo de KPIs
│   │   └── SortManager.js             # Estado de ordenamiento
│   │
│   ├── core/
│   │   ├── state.js                   # AppState (store global)
│   │   ├── base_echarts.js            # Base para gráficos
│   │   ├── base_table.js              # Base para tablas
│   │   ├── i18n.js                    # Traducciones
│   │   ├── formatters.js              # Formatear valores
│   │   ├── security.js                # Protección datos
│   │   ├── errors.js                  # Manejo de errores
│   │   ├── config.js                  # Configuración
│   │   ├── utils.js                   # Utilidades generales
│   │   ├── echarts_line_chart.js      # Impl. gráfico líneas
│   │   ├── echarts_bar_chart.js       # Impl. gráfico barras
│   │   └── echarts_pie_chart.js       # Impl. gráfico pie (si)
│   │
│   └── components/
│       ├── charts/
│       │   ├── LineChart.js           # Gráfico lineal mensual
│       │   ├── BarChart.js            # Gráfico barras categorías
│       │   ├── BarRaceChart.js        # Gráfico ranking animado
│       │   └── dataTransforms.js      # Transformar datos para charts
│       │
│       ├── tables/
│       │   ├── AllTransactionsTable.js
│       │   ├── CategorySummaryTable.js
│       │   └── TopMovementsTable.js
│       │
│       ├── filters/
│       │   ├── FilterPanel.js
│       │   ├── DateRangePicker.js
│       │   ├── Dropdown.js
│       │   └── SearchBox.js
│       │
│       └── feedback/
│           ├── LoadingOverlay.js
│           └── LastUpdateBanner.js
│
├── assets/
│   ├── styles/
│   │   └── main.css                   # Estilos completos
│   ├── icons/
│   └── images/
│
└── Documentacion/
    ├── INTERACTIVE_CHARTS_GUIDE.md
    ├── CHARTS_OPTIMIZATION_ANALYSIS.md
    └── ... (otros documentos)
```

---

## 💡 Cómo Funciona: Ejemplos Prácticos

### Ejemplo 1: Usuario Filtra por Mes

**Paso 1:** Usuario hace click en punto del gráfico (línea)

```html
<!-- NO hay onclick directo, ECharts lo captura -->
<!-- BaseECharts.on('click', handler) -->
```

**Paso 2:** Handler ejecuta

```javascript
// echarts_line_chart.js → registerClickHandler()
const monthKeys = this.last12MonthsData.map(([month]) => month);
this._chart.registerClickHandler(
    monthKeys,
    (selectedMonth) => {
        console.log('📞 Executing month filter callback with:', selectedMonth);
        if (typeof window.selectPendingMonth === 'function') {
            window.selectPendingMonth(null, selectedMonth);
        }
    },
    'month'
);
```

**Paso 3:** Muestra toast

```javascript
// BaseECharts.showSelectionFeedback()
// Toast aparece: "✓ Month selected: 2024-01"
```

**Paso 4:** Llama a DashboardApp

```javascript
// globalActions.js mapea window.selectPendingMonth
onCategoryKPIChange: (app, event, month) => 
    app.handleSelectPendingMonth(event, month)
```

**Paso 5:** FilterManager añade a pending

```javascript
// DashboardApp.handleSelectPendingMonth()
this.filterManager.toggleMonth(monthKey, true);  // true = pending
```

**Paso 6:** Actualiza dashboard (preview)

```javascript
this.updateDashboard();
// → ChartManager.renderChart() con datos filtrados
// → TableManager.renderTable() con datos filtrados
// → Usuario ve PREVIEW
```

**Paso 7:** Usuario confirma

```javascript
// Click en botón CONFIRM
// DashboardApp.handleApplyPendingSelection()
this.filterManager.applyPendingSelections();
// Mueve pendingMonths → months (definitivo)
this.updateDashboard();
```

---

### Ejemplo 2: Usuario Selecciona Métrica de Gráfico

**Paso 1:** Usuario selecciona "Ingresos" en dropdown

```html
<select id="expenses-kpi-selector" 
        onchange="window.onCategoryKPIChange && window.onCategoryKPIChange(this.value)">
    <option value="gastos">Gastos</option>
    <option value="ingresos">Ingresos</option>
    <!-- ... -->
</select>
```

**Paso 2:** Llama globalAction

```javascript
// globalActions.js
onCategoryKPIChange: (app, metric) => app.handleCategoryKPIChange(metric)
```

**Paso 3:** DashboardApp procesa

```javascript
handleCategoryKPIChange(metric) {
    this.selectedCategoryKPI = metric;  // Guarda selección
    this.updateCategoryChartTitle(metric);  // Actualiza título
    this.updateDashboard();
}
```

**Paso 4:** Actualiza título

```javascript
updateCategoryChartTitle(metric) {
    const titleElement = document.getElementById('category-chart-title');
    const i18nKey = metricToKeyMap[metric];  // gastos → category_by_metric_gastos
    const translatedText = translate(i18nKey, AppState.language);
    titleElement.textContent = translatedText;
    // Título: "Gastos por categoría" → "Ingresos por categoría"
}
```

**Paso 5:** Re-renderiza gráfico

```javascript
// DashboardApp.updateDashboard()
this.chartManager.setContext({ selectedCategoryKPI: metric });
this.chartManager.renderChart('expenses-chart', ...);
// BarChart obtiene datos según métrica nueva
// Gráfico muestra ingresos por categoría
```

---

### Ejemplo 3: Flujo Completo de Tabla

**Paso 1:** Se renderiza tabla

```javascript
// TableManager.renderTable('all-transactions', data)
const allTransactionsTable = new AllTransactionsTable('all-transactions-table', {
    initialRows: 50,
    compact: false
});
allTransactionsTable.render(filteredData, columns);
```

**Paso 2:** BaseTable.render() ordena datos

```javascript
render(data, columns) {
    const filteredData = this.applySearch(data, this.searchQuery);
    const sortedData = this.applySort(filteredData, this.sortState);
    const paginatedData = this.paginate(sortedData);
    
    const html = this.renderHeader(columns) +
                 paginatedData.map(row => this.renderRow(row, columns)) +
                 this.renderFooter(data);
    
    this.container.innerHTML = html;
}
```

**Paso 3:** Renderiza con seguridad

```javascript
// AllTransactionsTable.renderRow()
renderRow(item, columns) {
    // Si concepto es secreto, muestra "***"
    // Click en secreto pide contraseña
    
    const conceptoValue = item['Concepto Secreto'] ? '***' : item.Concepto;
    // ...
}
```

**Paso 4:** Paginación

```javascript
// Click en página 2
// BaseTable.goToPage(2)
this.currentPage = 2;
this.render(data, columns);
// Muestra transacciones 50-100
```

**Paso 5:** Ordenamiento

```javascript
// Click en header "Importe"
// BaseTable.setSortState('all-transactions-table', 'Importe', 'asc')
this.sortState = { column: 'Importe', direction: 'asc' };
this.applySort(data) // Ordena por importe ASC
this.render(data, columns);
```

---

## 🎓 Principios Clave de Arquitectura

### 1. **Separación de Responsabilidades**
- ✅ FilterManager solo filtra
- ✅ ChartManager solo grafica
- ✅ DataService solo carga datos
- ❌ NO: DashboardApp haciendo todo

### 2. **Single Source of Truth (AppState)**
- ✅ Todos leen de AppState
- ✅ Un solo lugar de datos
- ❌ NO: Data duplicada en múltiples sitios

### 3. **Dependency Injection**
- ✅ DashboardApp recibe managers en constructor
- ✅ Fácil de testear (pasar mocks)
- ❌ NO: new FilterManager() dentro de DashboardApp

### 4. **Pending Pattern para Filtros**
- ✅ Preview antes de confirmar
- ✅ Usuario puede cancelar
- ✅ Confirmación explícita
- ❌ NO: Aplicar filtros inmediatamente

### 5. **Template Method en Herencia**
- ✅ BaseTable define estructura
- ✅ Subclases personalizan detalles
- ✅ Reutilización de código
- ❌ NO: Copiar-pegar código

---

## 📚 Recomendaciones para Mantener el Código

### Cuando Agregues Nuevas Funcionalidades

1. **Nuevo filtro?** → Agregalo a FilterManager
2. **Nuevo gráfico?** → Hereda de BaseECharts
3. **Nueva tabla?** → Hereda de BaseTable
4. **Nuevo KPI?** → Agrégalo a KpiManager
5. **Texto de UI?** → Agregalo a i18n.js (es/en)

### Debugging

- **Problema con filtro?** → Revisar FilterManager.getFilteredData()
- **Gráfico no muestra?** → Revisar ChartManager.renderChart()
- **Tabla vacía?** → Revisar TableManager + BaseTable.render()
- **UI en idioma equivocado?** → Revisar i18n.js + data-i18n en HTML

### Testing

Estructura para test unitario:

```javascript
describe('FilterManager', () => {
    it('should toggle month in pending state', () => {
        const fm = new FilterManager();
        fm.toggleMonth('2024-01', true);
        expect(fm.state.filters.pendingMonths.has('2024-01')).toBe(true);
    });
});
```

---

## 🔗 Relaciones Entre Componentes

```
              HTML/index.html
                    ↓
            main.js (init)
                    ↓
         DashboardApp (orquestador)
           ↙        ↓        ↘
       Managers    Services   Global Actions
     ↙  ↓  ↓  ↘        ↓              ↓
  Chart Table Filter  DataService   onclick handlers
  Manager Manager Manager           window.functionName
     ↓      ↓      ↓                     ↓
  Uses:   Uses:  Uses:             Llama a:
  - Chart  Table  AppState      DashboardApp methods
  - Base   Base   - state.js
  - Core   - Core - i18n
           - Core - formatters
                 
                    ↓ Todo actualiza
                    
                AppState (Single Source of Truth)
                    
                    ↓ Todos leen de aquí
                    
         Todos los managers renderean
```

---

## 🎯 Conclusión

Este proyecto demuestra una **arquitectura web moderna y escalable**:

- ✅ **Modular:** Cada pieza tiene responsabilidad clara
- ✅ **Mantenible:** Fácil agregar features sin romper existentes
- ✅ **Testeable:** Componentes desacoplados, fácil de mockear
- ✅ **Escalable:** Puede crecer sin complejidad exponencial
- ✅ **Profesional:** Patrones reales de desarrollo web

El patrón **Manager + Service + Core** es muy usado en aplicaciones grandes porque:
- Reduce bugs (cada componente solo hace una cosa)
- Facilita onboarding (nuevo dev entiende estructura rápido)
- Permite parallelizar trabajo (equipo trabaja en diferentes managers)
- Soporta evolución (refactorizar sin tocar todo)

---

**Documento finalizado:** 📄 Guía completa de arquitectura  
**Para aprender más:** Revisar archivos reales y seguir la lógica de DashboardApp.init()
