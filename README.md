# Dashboard Financiero Lomas

## 📊 Descripción
Dashboard interactivo para visualización y análisis de movimientos bancarios. Proporciona una vista detallada de ingresos, gastos y análisis financiero con gráficos dinámicos y tablas interactivas.

## 🎯 Características Principales

- Gráficos de tendencias mensuales
- Análisis por categorías
- Resumen de movimientos principales
- Vista detallada de transacciones
- Filtrado múltiple y búsqueda en tiempo real
- Exportación a CSV

## 🧰 Tecnologías

- HTML5
- CSS3 (Variables CSS para theming)
- JavaScript (Vanilla)
- Chart.js (visualizaciones)
- Google Sheets como backend (TSV público)

## 🚀 Quick start (desarrollo)

1. Abrir PowerShell y situarse en la carpeta del proyecto:

```powershell
Set-Location 'C:\Users\Jesus Vita\Documents\Proyecto Charts Web Lomas\FinanceDashboardLomas'
python -m http.server 8000
```

2. Abrir en el navegador: http://localhost:8000

Notas: servir con un servidor local es recomendable porque la petición fetch al TSV remoto puede verse afectada por políticas de CORS si abres el archivo con file://.

## 🔧 Cambios recientes importantes

- Migración de la lógica de gráficos a la API moderna de Chart.js (v3+/v4): el código ahora crea y destruye instancias con la API pública, y mantiene un registro local (`window._charts`) para evitar errores al reinstanciar gráficos.
- Se reemplazaron llamadas a internals de Chart.js (p. ej. `Chart.helpers.each`/`Chart.instances`) que provocaban excepciones con versiones modernas de la librería.

Si prefieres fijar una versión concreta de Chart.js (recomendado en producción), cambia la etiqueta `<script>` que carga Chart.js por una versión específica (por ejemplo `https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js`).

## � Troubleshooting (problemas comunes)

- Errores en consola relacionados con Chart.js:
	- Si ves algo como `Chart.helpers is undefined` o errores de runtime, asegúrate de haber actualizado el archivo `index.html` (ya está aplicado en esta rama). Si el problema persiste, pega el error aquí y lo reviso.

- Problemas con la carga de datos (fetch al TSV):
	- Si la petición al `TSV_URL` falla por CORS o muestra 403/404, revisa la configuración de publicación de la hoja de Google o usa un TSV local para pruebas.

- Exportación a CSV / funcionalidad del candado (🔒):
	- La columna "Concepto (Original)" está protegida por contraseña (la lógica está en `index.html`). Para cambiar la contraseña hay un hash en el script; edítalo con precaución.

## ✅ Cómo comprobar que todo funciona

1. Levanta el servidor local y abre el dashboard.
2. Abre las DevTools (F12) y revisa la consola: no deben aparecer errores que detengan la ejecución del script.
3. Verifica que los gráficos (barras y líneas) se renderizan y que al interactuar con ellos (click) se muestran las opciones de selección/pending selection.
4. Prueba filtros, búsqueda y exportar CSV.

## 👥 Contribución
Fork, crea una rama y abre un PR. Mantén estilo consistente y añade pruebas mínimas si cambias lógica.

## ⚠️ Licencia
Uso interno - Todos los derechos reservados

## 💰 Sistema de formateo de números

El dashboard utiliza un **sistema centralizado y escalable** para formatear todos los números. Esto garantiza consistencia en toda la aplicación.

### Funciones disponibles:

1. **`formatCurrency(amount)`** - Formatea moneda en euros
   - Input: `1234.56`
   - Output: `"1.234,56 €"`
   - Uso: Para todos los valores monetarios

2. **`formatNumber(value, minDecimals, maxDecimals)`** - Formatea números generales
   - Input: `1234.56`
   - Output: `"1.234,56"` (con decimales por defecto)
   - Input: `1234.56, 0, 0`
   - Output: `"1.235"` (sin decimales)
   - Uso: Para contadores, porcentajes, etc.

3. **`formatPercent(value)`** - Formatea porcentajes
   - Input: `0.1523`
   - Output: `"15,2%"`
   - Uso: Para valores porcentuales

### Características:

- ✅ **Formato español**: Punto para miles (.), coma para decimales (,)
- ✅ **Caché de formateadores**: Optimizado para rendimiento
- ✅ **Manejo de errores**: Gestión segura de valores nulos o inválidos
- ✅ **Escalabilidad**: Un solo punto de configuración en `NUMBER_FORMAT_CONFIG`
- ✅ **Documentación**: JSDoc completa en cada función

### Para cambiar el formato globalmente:

Modifica solo la sección `NUMBER_FORMAT_CONFIG` en el código:

```javascript
const NUMBER_FORMAT_CONFIG = {
    locale: 'es-ES',  // Cambia aquí para otro idioma
    currency: 'EUR',   // Cambia aquí para otra moneda
    defaults: {
        number: { ... },
        currency: { ... }
    }
};
```

### Ubicaciones donde se usa:

- **KPIs**: Todos los valores de las tarjetas superiores
- **Gráficos**: Ejes, tooltips y leyendas
- **Tablas**: Top Movements, Category Summary, All Transactions
- **Exportación**: Los datos exportados mantienen el formato

---

## 🏠 Logo integrado

El logo ahora está integrado directamente en `index.html` (HTML + CSS). Para localizarlo y editarlo:

- Abre `index.html` y busca el bloque con la clase `logo` (contiene `.icon`, `.house`, `.roof`, `.little-house`, y `.brand`).
- Las variables de color usadas por el logo están definidas en el bloque de estilos principal: `--beige`, `--blue`, `--dark`.
- Para cambiar tamaños o espacios, edita las reglas CSS dentro del bloque `<style>` en `index.html`.

Se eliminaron los archivos externos relacionados con el logo (`components/logo.html`, `components/site-logo.js`, `styles/logo.css`) porque el logo fue integrado para simplificar la gestión del proyecto. Si prefieres restaurar el componente externo en lugar de la versión integrada, avísame y lo revertimos.

