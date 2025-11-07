# Análisis Comparativo: Funcionalidades Faltantes

## ✅ IMPLEMENTADO CORRECTAMENTE

### Módulos Creados
1. `config.js` - ✅ APP_CONFIG, NUMBER_FORMAT_CONFIG
2. `state.js` - ✅ AppState con filtros y UI state
3. `utils.js` - ✅ parseTSV, parseDate, parseAmount, hexToRgba, debounce
4. `formatters.js` - ✅ formatCurrency, formatNumber, formatPercent
5. `errors.js` - ✅ ErrorHandler, AppError
6. `i18n.js` - ✅ translations, translate()
7. `BaseTable.js` - ✅ Clase base para tablas
8. `AllTransactionsTable.js` - ✅ Tabla de transacciones
9. `TopMovementsTable.js` - ✅ Tabla top movimientos
10. `CategorySummaryTable.js` - ✅ Tabla resumen categorías
11. `charts.js` - ✅ createBarChart, createLineChart, getExpensesByCategory, getMonthlyFlow
12. `security.js` - ✅ Columna secreta con contraseña
13. `main.js` - ✅ Orquestador principal

## ❌ PROBLEMAS IDENTIFICADOS

### 1. GRÁFICOS NO RESALTAN EN AMARILLO
**Original:**
```javascript
backgroundColor: data.map(([label]) => 
    selectedCategories.has(label) ? hexToRgba(chartColors.balance, 0.8) : 
    (pendingSelectedCategories.has(label) ? 'rgba(255, 193, 7, 0.9)' : 'rgba(52, 73, 94, 0.8)')
)
```

**Actual:**
```javascript
backgroundColor: data.map(([label]) => 
    AppState.filters.categories.has(label) ? hexToRgba(AppState.chartColors.balance, 0.8) : 
    (AppState.filters.pendingCategories.has(label) ? 'rgba(255, 193, 7, 0.9)' : 'rgba(52, 73, 94, 0.8)')
)
```

**Problema:** Los colores se calculan UNA VEZ al crear el gráfico. Cuando cambian los pending, el gráfico NO se regenera.

**Solución:** Destruir y recrear los gráficos cuando cambian las selecciones pendientes.

### 2. FUNCIÓN destroyAllCharts() FALTA
**Original:**
```javascript
function destroyAllCharts() {
    try {
        if (window._charts) {
            for (const key in window._charts) {
                try {
                    const c = window._charts[key];
                    if (c && typeof c.destroy === 'function') {
                        c.destroy();
                    }
                } catch (e) { /* ignore */ }
            }
        }
        // Fallback: intenta con Chart.getChart para cada canvas
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            try {
                const ch = Chart.getChart(canvas);
                if (ch) ch.destroy();
            } catch (e) { /* ignore */ }
        });
        window._charts = {};
    } catch (e) {
        console.error('Error destroying charts:', e);
    }
}
```

**Actual:** NO EXISTE - Solo se destruyen individualmente en createBarChart/createLineChart

**Solución:** Crear función destroyAllCharts() en charts.js

### 3. REGENERACIÓN DE GRÁFICOS EN updatePendingSelectionUI
**Original:**
```javascript
function updatePendingSelectionUI() {
    const filteredData = getFilteredData();
    destroyAllCharts(); // <-- IMPORTANTE
    
    const expensesByCategory = getExpensesByCategory(filteredData);
    if (expensesByCategory.length > 0) createBarChart('expenses-chart', expensesByCategory);
    
    const monthlyFlow = getMonthlyFlow(filteredData);
    if (monthlyFlow.length > 0) createLineChart('monthly-flow-chart', monthlyFlow);
    
    // ... resto del código
}
```

**Actual:** NO EXISTE - Solo updateDashboard() que no regenera gráficos

**Solución:** updateDashboard() debe regenerar gráficos cuando hay pendientes

### 4. VARIABLES LOCALES vs GLOBALES
**Original:** Usaba variables locales globales en el script
```javascript
let selectedCategories = AppState.filters.categories;
let pendingSelectedCategories = AppState.filters.pendingCategories;
```

**Actual:** Todo usa AppState directamente (CORRECTO)

**Decisión:** ✅ La versión modular es MEJOR - usa AppState directamente

### 5. CLICK EN TABLAS PARA SELECCIONAR CATEGORÍA
**Original:**
```javascript
tableHTML += `<tr class="${pendingClass}" onclick="window.selectPendingCategory(event, '${category}')">`;
```

**Actual:** Las tablas NO tienen onclick en las filas

**Solución:** Agregar onclick a CategorySummaryTable y AllTransactionsTable

## 📋 PLAN DE CORRECCIÓN

### Paso 1: Agregar destroyAllCharts() a charts.js
```javascript
export function destroyAllCharts() {
    try {
        if (window._charts) {
            for (const key in window._charts) {
                try {
                    const c = window._charts[key];
                    if (c && typeof c.destroy === 'function') {
                        c.destroy();
                    }
                } catch (e) { /* ignore */ }
            }
        }
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            try {
                const ch = Chart.getChart(canvas);
                if (ch) ch.destroy();
            } catch (e) { /* ignore */ }
        });
        window._charts = {};
    } catch (e) {
        console.error('Error destroying charts:', e);
    }
}
```

### Paso 2: Modificar updateDashboard() en main.js
Debe SIEMPRE regenerar gráficos (no solo una vez), especialmente cuando hay pendientes.

### Paso 3: Agregar clase CSS .pending-selected
Ya existe en styles.css pero verificar que se aplique correctamente

### Paso 4: Hacer filas de tablas clickeables
Agregar onclick a CategorySummaryTable para seleccionar categorías

## 🎯 RESULTADO ESPERADO

1. ✅ Click en barra del gráfico → Barra se pone AMARILLA
2. ✅ Click en punto del gráfico → Punto se pone AMARILLO
3. ✅ Aparecen botones ✓ y ✕
4. ✅ Click en ✓ → Barra/punto se pone AZUL (confirmado)
5. ✅ Dashboard filtra datos
6. ✅ Click en ✕ → Vuelve a gris (cancelado)
