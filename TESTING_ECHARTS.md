# 📊 ECharts Integration Testing Guide

## 🎯 Estado Actual

- **Branch Activo:** `feature/echarts-integration`
- **Commit:** 9fc8a43
- **Main Status:** Intacto (sin cambios)
- **Fase:** 1 - Prueba Inicial

## 📁 Archivos Implementados

### Core Classes (js/core/)

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `base_echarts.js` | Clase base con funcionalidades comunes | ✅ Completo |
| `echarts_line_chart.js` | Gráficos de línea con ECharts | ✅ Completo |
| `echarts_bar_chart.js` | Gráficos de barras con ECharts | ✅ Completo |
| `echarts_pie_chart.js` | Gráficos de pie/dona con ECharts | ✅ Completo |
| `echarts_migration_utils.js` | Utilidades de migración | ✅ Completo |

### Documentación

| Archivo | Descripción |
|---------|-------------|
| `ECHARTS_BRANCH_INFO.md` | Guía de la rama de desarrollo |
| `OPCIONES_GRAFICOS.md` | Análisis comparativo de librerías (main) |
| `TESTING_ECHARTS.md` | Este archivo - Guía de testing |

## 🧪 Cómo Testear Localmente

### 1. Verificar que estás en el branch correcto

```bash
git checkout feature/echarts-integration
```

### 2. Crear archivo de prueba HTML

Crea un archivo `test_echarts.html` en la raíz del proyecto:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ECharts Testing - Finance Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <script src="js/core/base_echarts.js"></script>
    <script src="js/core/echarts_line_chart.js"></script>
    <script src="js/core/echarts_bar_chart.js"></script>
    <script src="js/core/echarts_pie_chart.js"></script>
    <script src="js/core/echarts_migration_utils.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Google Sans Text', 'Segoe UI', sans-serif;
            background: #f5f6f8;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #1f2933;
            margin-bottom: 30px;
            border-bottom: 2px solid #d9dde3;
            padding-bottom: 10px;
        }
        h2 {
            color: #52606d;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .chart-wrapper {
            background: white;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
            border: 1px solid #d9dde3;
        }
        .chart-box {
            width: 100%;
            height: 400px;
            border-radius: 4px;
            background: #fafbfc;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        @media (max-width: 900px) {
            .grid-2 { grid-template-columns: 1fr; }
        }
        .status {
            background: #d4edda;
            color: #155724;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 20px;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 4px;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 ECharts Integration Testing</h1>
        
        <div class="status" id="status">
            Cargando librerías...
        </div>

        <!-- Line Chart -->
        <h2>📈 Gráfico de Línea (Line Chart)</h2>
        <div class="chart-wrapper">
            <div id="chart-line" class="chart-box"></div>
        </div>

        <!-- Bar Charts -->
        <h2>📊 Gráficos de Barras (Bar Charts)</h2>
        <div class="grid-2">
            <div class="chart-wrapper">
                <h3 style="font-size: 14px; margin-bottom: 15px;">Barras Básicas</h3>
                <div id="chart-bar-basic" class="chart-box"></div>
            </div>
            <div class="chart-wrapper">
                <h3 style="font-size: 14px; margin-bottom: 15px;">Barras Múltiples</h3>
                <div id="chart-bar-multi" class="chart-box"></div>
            </div>
        </div>

        <!-- Pie Charts -->
        <h2>🥧 Gráficos Circulares (Pie/Doughnut)</h2>
        <div class="grid-2">
            <div class="chart-wrapper">
                <h3 style="font-size: 14px; margin-bottom: 15px;">Pie Chart</h3>
                <div id="chart-pie" class="chart-box"></div>
            </div>
            <div class="chart-wrapper">
                <h3 style="font-size: 14px; margin-bottom: 15px;">Doughnut Chart</h3>
                <div id="chart-doughnut" class="chart-box"></div>
            </div>
        </div>

        <!-- Test Results -->
        <h2>✅ Resultados del Test</h2>
        <div class="chart-wrapper">
            <div id="results" style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">
                Ejecutando tests...
            </div>
        </div>
    </div>

    <script>
        async function runTests() {
            const results = [];
            const status = document.getElementById('status');
            
            try {
                // Check ECharts
                if (!window.echarts) {
                    throw new Error('ECharts no está cargado');
                }
                results.push('✅ ECharts librería cargada');

                // Check base classes
                if (typeof BaseECharts === 'undefined') {
                    throw new Error('BaseECharts no definida');
                }
                results.push('✅ BaseECharts clase disponible');

                if (typeof EChartsLineChart === 'undefined') {
                    throw new Error('EChartsLineChart no definida');
                }
                results.push('✅ EChartsLineChart clase disponible');

                if (typeof EChartsBarChart === 'undefined') {
                    throw new Error('EChartsBarChart no definida');
                }
                results.push('✅ EChartsBarChart clase disponible');

                if (typeof EChartsPieChart === 'undefined') {
                    throw new Error('EChartsPieChart no definida');
                }
                results.push('✅ EChartsPieChart clase disponible');

                if (typeof EChartsMigrationUtils === 'undefined') {
                    throw new Error('EChartsMigrationUtils no definida');
                }
                results.push('✅ EChartsMigrationUtils clase disponible');

                // Create test charts
                results.push('\n--- Creando Gráficos de Prueba ---\n');

                // Line Chart Test
                const lineChart = new EChartsLineChart('chart-line');
                lineChart.init();
                lineChart.setData(
                    ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                    [
                        {
                            label: 'Ingresos',
                            data: [1000, 1200, 1100, 1400, 1300, 1500],
                            borderColor: '#20c997'
                        },
                        {
                            label: 'Gastos',
                            data: [800, 900, 950, 1000, 900, 1100],
                            borderColor: '#dc3545'
                        }
                    ]
                );
                results.push('✅ Line Chart creado y renderizado');

                // Bar Chart Test
                const barChart = new EChartsBarChart('chart-bar-basic');
                barChart.init();
                barChart.setData(
                    ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
                    [
                        {
                            label: 'Movimientos',
                            data: [150, 200, 175, 225, 190],
                            backgroundColor: '#0d6efd'
                        }
                    ]
                );
                results.push('✅ Bar Chart (básico) creado');

                // Bar Chart Multiple Test
                const barChartMulti = new EChartsBarChart('chart-bar-multi');
                barChartMulti.init();
                barChartMulti.setData(
                    ['Categoría A', 'Categoría B', 'Categoría C', 'Categoría D'],
                    [
                        {
                            label: 'Q1',
                            data: [1000, 1200, 900, 1100],
                            backgroundColor: '#20c997'
                        },
                        {
                            label: 'Q2',
                            data: [1100, 1300, 1000, 1200],
                            backgroundColor: '#dc3545'
                        }
                    ]
                );
                results.push('✅ Bar Chart (múltiples series) creado');

                // Pie Chart Test
                const pieChart = new EChartsPieChart('chart-pie');
                pieChart.init();
                pieChart.setData(
                    ['Categoría A', 'Categoría B', 'Categoría C', 'Categoría D'],
                    [1200, 1500, 900, 800],
                    'pie'
                );
                results.push('✅ Pie Chart creado');

                // Doughnut Chart Test
                const doughnutChart = new EChartsPieChart('chart-doughnut');
                doughnutChart.init();
                doughnutChart.setData(
                    ['Producto 1', 'Producto 2', 'Producto 3', 'Producto 4', 'Producto 5'],
                    [2200, 1800, 1500, 900, 600],
                    'doughnut'
                );
                results.push('✅ Doughnut Chart creado');

                // Test utilities
                results.push('\n--- Pruebas de Utilidades ---\n');

                const palette = EChartsMigrationUtils.getColorPalette('dashboard');
                if (Array.isArray(palette) && palette.length > 0) {
                    results.push(`✅ Color palette cargada (${palette.length} colores)`);
                }

                try {
                    EChartsMigrationUtils.validateChartData(
                        ['A', 'B', 'C'],
                        [{ label: 'Test', data: [1, 2, 3] }]
                    );
                    results.push('✅ Validación de datos funciona');
                } catch (e) {
                    results.push(`❌ Error en validación: ${e.message}`);
                }

                // All tests passed
                status.textContent = '✅ Todos los tests completados exitosamente';
                status.style.background = '#d4edda';
                status.style.color = '#155724';
                status.style.borderColor = '#c3e6cb';

            } catch (error) {
                results.push(`\n❌ ERROR: ${error.message}`);
                status.textContent = `❌ Error durante testing: ${error.message}`;
                status.style.background = '#f8d7da';
                status.style.color = '#721c24';
                status.style.borderColor = '#f5c6cb';
            }

            document.getElementById('results').textContent = results.join('\n');
        }

        // Run tests when page loads
        window.addEventListener('load', runTests);
    </script>
</body>
</html>
```

### 3. Abrir en navegador

1. Abre `test_echarts.html` en tu navegador
2. Deberías ver 5 gráficos diferentes funcionando
3. Verifica que todos los tests pasen en la sección de resultados

## 📊 Características Implementadas

### Línea
- ✅ Múltiples series
- ✅ Áreas con gradiente
- ✅ Puntos animados
- ✅ Tooltips profesionales
- ✅ Leyenda interactiva

### Barras
- ✅ Bordes redondeados
- ✅ Múltiples series agrupadas
- ✅ Rotación automática de etiquetas
- ✅ Tooltips con formato
- ✅ Efectos hover

### Pie/Dona
- ✅ Modo pie y doughnut
- ✅ Leyenda posicionable
- ✅ Porcentajes en tooltip
- ✅ Sombras en hover
- ✅ Colores personalizables

## 🔄 Próximos Pasos (Fase 2-3)

Una vez verificado que el testing funciona:

1. **Fase 2 (Migración Gradual):**
   - Actualizar `index.html` con CDN de ECharts
   - Modificar `ChartManager.js` para usar nuevas clases
   - Integrar en componentes de gráficos

2. **Fase 3 (Customización):**
   - Temas personalizados
   - Interactividad avanzada (click, zoom)
   - Export de imágenes
   - Testing responsivo

3. **Merge a Main:**
   - Después de completar Fase 3
   - Code review
   - Testing en producción

## 🐛 Troubleshooting

### "ECharts no está definido"
- Verifica que `echarts.min.js` se cargó desde CDN
- Abre la consola del navegador (F12) y revisa errores de red

### "BaseECharts no está definida"
- Verifica el orden de los scripts en el HTML
- `base_echarts.js` debe cargarse primero

### "El gráfico no se muestra"
- Verifica que el contenedor tiene un ID correcto
- Asegúrate de que el contenedor tenga dimensiones (width/height)
- Revisa la consola para errores

### "Las colors no coinciden"
- Verifica que los colores en `getThemeColors()` coinciden con main.css
- Usa el selector del navegador para inspeccionar

## 📚 Recursos

- [ECharts Official Docs](https://echarts.apache.org/)
- [ECharts Examples Gallery](https://echarts.apache.org/examples)
- [ECharts API Reference](https://echarts.apache.org/en/api.html)

## ✅ Checklist para Completar Testing

- [ ] Archivo `test_echarts.html` crea 5 gráficos
- [ ] Todos los tests en la sección de resultados pasan
- [ ] Los gráficos son responsivos (redimensiona la ventana)
- [ ] Los tooltips funcionan al pasar el mouse
- [ ] Los colores coinciden con el dashboard
- [ ] No hay errores en la consola del navegador
- [ ] El rendimiento es bueno (sin lag)

---

**Última Actualización:** 2025-11-08  
**Branch:** `feature/echarts-integration`  
**Commit:** 9fc8a43
