 # Dashboard Financiero Lomas

## Visión General
- Panel web para analizar ingresos, gastos y saldos históricos a partir de un TSV público de Google Sheets.
- Front-end 100 % Vanilla JS con arquitectura modular ES6, sin bundlers.
- Incluye tablas con filtrado/ordenación, KPIs en vivo y gráficos Chart.js (barras, líneas, combinados extendibles).

## Arquitectura
- **Core (`js/core/`)**: capa fundacional con configuración (`config`), estado global (`state`), internacionalización (`i18n`), formateadores numéricos, utilidades comunes, manejo de errores y helpers de seguridad. Todo el front consume estos módulos con rutas `../core/...`.
- **Aplicación (`js/app/`)**:
	- `DashboardApp`: orquestador que inicializa servicios, coordina managers y ejecuta `updateDashboard()`.
	- `globalActions`: expone la superficie pública utilizada por los handlers inline de `index.html` (clear/apply filters, export, etc.).
- **Servicios (`js/services/`)**: `DataService` obtiene y normaliza el TSV (deriva `Importe`, `Tipo`) apoyándose en utilidades del core.
- **Gestores (`js/managers/`)**: capas de dominio que reutilizan componentes para pintar la UI.
	- `FilterManager`: aplica periodos, meses, categorías, búsqueda y rangos.
	- `ChartManager`: destruye y re-renderiza cada descriptor (`destroyAllCharts`, `createBarChart`, `createLineChart`).
	- `TableManager`: monta tablas registradas (`allTransactionsTable`, `topMovementsTable`, `categorySummaryTable`).
	- `KpiManager`: agrega ingresos/gastos/per home/saldo final reutilizando `formatCurrency`.
- **Componentes (`js/components/`)**: UI desacoplada por ámbito.
	- `filters/`: `FilterPanel`, `Dropdown`, `DateRangePicker`, `SearchBox` coordinan interacción de filtros con `FilterManager`.
	- `feedback/`: `LoadingOverlay`, `LastUpdateBanner` muestran estado de carga y fecha de actualización.
	- `tables/`: `BaseTable` (scroll infinito + ordenamiento) y especializaciones por vista.
	- `charts/`: registro central (`ChartRegistry`), renderers (`BarChart`, `LineChart`) y transformadores de datos (`dataTransforms`).

## Estructura de Carpetas
- `js/core`: configuración global, estado, utilidades comunes, internacionalización, formateo, errores y seguridad.
- `js/components/filters`: controladores de UI para filtros rápidos, rangos de fechas y búsqueda.
- `js/components/feedback`: componentes de overlay y banner contextual.
- `js/components/tables`: `BaseTable` y las implementaciones `AllTransactionsTable`, `TopMovementsTable`, `CategorySummaryTable`.
- `js/components/charts`: registro central (`ChartRegistry`), renderers (`BarChart`, `LineChart`) y transformadores de datos.
- `js/managers`: orquestadores de tablas, gráficos, filtros y KPIs que consumen los componentes anteriores.
- `js/services`: integraciones externas y normalización de datos (TSV).
- `js/app`: inicialización, wiring general y acciones globales.

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
	- Revisar ordenamiento, scroll infinito y búsquedas en tablas.
	- Probar doble idioma desde el selector.

## Mantenimiento
- **Añadir gráfico**: `chartManager.registerChart({ id: 'nuevo-canvas', type: 'line', prepare: data => [...], render: createLineChart })`.
- **Añadir tabla**: crear nueva clase basada en `BaseTable` y extender `DEFAULT_TABLES` en `TableManager` o pasar configuración propia al construir `DashboardApp`.
- **Nuevos filtros**: ampliar `FilterManager` para manipular `AppState` y actualizar `FilterPanel` si se requieren badges adicionales.
- **Exportación CSV**: `DashboardApp.handleExportToCSV` deja un placeholder; integrar librería o utilidades según la nueva especificación.

## Licencia
- Uso interno. Todos los derechos reservados.


