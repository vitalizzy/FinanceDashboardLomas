 # Dashboard Financiero Lomas

## Visión General
- Panel web para analizar ingresos, gastos y saldos históricos a partir de un TSV público de Google Sheets.
- Front-end 100 % Vanilla JS con arquitectura modular ES6, sin bundlers.
- Incluye tablas con filtrado/ordenación, KPIs en vivo y gráficos Chart.js (barras, líneas, combinados extendibles).

## Arquitectura
- **DashboardApp (`js/app/DashboardApp.js`)**: orquestador que inicializa servicios, reacciona a eventos y ejecuta `updateDashboard`.
- **DataService (`js/services/DataService.js`)**: obtiene el TSV, normaliza columnas (`Importe`, `Tipo`) y entrega la última fecha disponible.
- **Gestores reutilizables**:
	- `FilterManager`: encapsula la lógica de filtros (periodos, meses, categorías, search, rangos de fecha).
	- `ChartManager`: destruye gráficos existentes y renderiza cada descriptor registrado (bar/line/combined) usando `destroyAllCharts`, `createBarChart`, `createLineChart`.
	- `TableManager`: renderiza las tablas registradas reutilizando `BaseTable` y las instancias `allTransactionsTable`, `topMovementsTable`, `categorySummaryTable`.
	- `KpiManager`: calcula totales (ingresos, gastos, per home, saldo final, nº transacciones) aplicando el formateo centralizado de `formatCurrency`.
- **Componentes UI reutilizables**:
	- `FilterPanel`: badges activos + botones de confirmación/cancelación para selecciones pendientes.
	- `Dropdown`, `DateRangePicker`, `SearchBox`: encapsulan interacción de filtros, rangos y búsqueda con `debounce` configurable.
	- `LoadingOverlay`, `LastUpdateBanner`: gestionan feedback visual (carga inicial, fecha de última actualización traducida).
- **Núcleo existente**: `APP_CONFIG`, `AppState`, `formatters`, `utils`, `i18n`, `errors`, tablas específicas y `charts.js` continúan intactos y ahora se consumen a través de los gestores anteriores.
- **Acciones globales (`js/app/globalActions.js`)**: expone las funciones requeridas por `index.html` (`clearAllFilters`, `updateDashboard`, `selectPendingCategory`, etc.), preservando la compatibilidad sin duplicar lógica.

## Artefactos Reutilizables
- **Tablas**: `BaseTable` + especializaciones. Añadir una tabla nueva solo requiere crear la definición y registrarla en `TableManager`.
- **Gráficos**: `ChartManager.registerChart({...})` permite integrar bar, line, mixed o cualquier renderer adicional.
- **Dropdowns / Date pickers / Search**: componentes configurables que emiten callbacks y se integran con `FilterManager`.
- **KPI List**: `KpiManager` actualiza cualquier tarjeta KPI declarando los `id` en el constructor.
- **Panel de filtros**: badges interactivos y botones flotantes se controlan desde `FilterPanel.togglePendingControls`/`hidePendingControls`.

## Flujo de Datos
1. `main.js` instancia `DashboardApp`, registra acciones globales y espera `DOMContentLoaded`.
2. `DashboardApp.init()` muestra el overlay, carga datos, sincroniza idioma, registra interacciones y realiza el primer `updateDashboard()`.
3. Cada evento de UI delega en `FilterManager`, que calcula `AppState.data.filtered`. Los gestores de tablas, KPIs y gráficos consumen ese array filtrado.
4. Selecciones pendientes se manejan en `AppState` y el `FilterPanel` muestra controles de confirmación globales.

## Puesta en Marcha
```powershell
Set-Location 'C:\Users\Jesus Vita\Documents\Proyecto Charts Web Lomas\FinanceDashboardLomas'
python -m http.server 8000
# abrir http://localhost:8000 en el navegador
```
- Los ES modules requieren servir los archivos; abrir `index.html` vía `file://` bloqueará el `fetch` del TSV por CORS.
- Chart.js se carga desde CDN. Para fijar versión, ajusta el `<script src="https://cdn.jsdelivr.net/npm/chart.js@VERSION/dist/chart.umd.min.js">` en `index.html`.

## Tests y Validación
- No hay suite automatizada todavía. Recomendado: `npm init` + `vitest` para probar módulos (`DataService`, `FilterManager`, `TableManager`).
- Para verificación manual:
	- Arrancar servidor local y confirmar ausencia de errores en consola.
	- Probar filtros (periodo, rango personalizado, categorías desde tablas/gráficos, meses desde gráficos) y revisar que los botones de confirmación aparezcan.
	- Validar resaltado amarillo en selecciones pendientes y azul en confirmadas.
	- Revisar ordenamiento, paginación y búsquedas en tablas.
	- Probar doble idioma desde el selector.

## Mantenimiento
- **Añadir gráfico**: `chartManager.registerChart({ id: 'nuevo-canvas', type: 'line', prepare: data => [...], render: createLineChart })`.
- **Añadir tabla**: crear nueva clase basada en `BaseTable` y extender `DEFAULT_TABLES` en `TableManager` o pasar configuración propia al construir `DashboardApp`.
- **Nuevos filtros**: ampliar `FilterManager` para manipular `AppState` y actualizar `FilterPanel` si se requieren badges adicionales.
- **Exportación CSV**: `DashboardApp.handleExportToCSV` deja un placeholder; integrar librería o utilidades según la nueva especificación.

## Licencia
- Uso interno. Todos los derechos reservados.


