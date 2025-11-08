# Bar Race Animation Controls Implementation

## Summary
Se ha implementado completamente los controles de animación para el gráfico de "Evolución de categorías (Animada)" con botones PLAY y STOP siguiendo el patrón de diseño del proyecto.

## Cambios Realizados

### 1. **main.css** ✅ (Actualizado)
- Agregadas clases CSS `.icon-play` y `.icon-stop`
- Estilos siguen el patrón del proyecto (icon-confirm/icon-cancel)
- `.icon-play`: Color verde (#1f7e36), efectos hover
- `.icon-stop`: Color rojo (#af2f2d), efectos hover

```css
.icon-play {
    border-color: rgba(40,167,69,0.4);
    color: #1f7e36;
    font-size: 14px;
}

.icon-stop {
    border-color: rgba(220,53,69,0.4);
    color: #af2f2d;
    font-size: 14px;
}

.icon-play:hover {
    background: rgba(40,167,69,0.08);
    border-color: rgba(40,167,69,0.6);
    color: #1b6d2f;
}

.icon-stop:hover {
    background: rgba(220,53,69,0.08);
    border-color: rgba(220,53,69,0.6);
    color: #962524;
}
```

### 2. **globalActions.js** ✅ (Actualizado)
- Agregado método `onBarRacePlay` a `GLOBAL_METHODS`
- Agregado método `onBarRaceStop` a `GLOBAL_METHODS`
- Se registran globalmente como `window.onBarRacePlay` y `window.onBarRaceStop`

```javascript
onBarRacePlay: (app) => app.handleBarRacePlay(),
onBarRaceStop: (app) => app.handleBarRaceStop()
```

### 3. **DashboardApp.js** ✅ (Actualizado)
- Implementado `handleBarRacePlay()` method
- Implementado `handleBarRaceStop()` method
- Ambos obtienen la instancia del gráfico y llaman a los métodos correspondientes

```javascript
handleBarRacePlay() {
    console.log('▶️  handleBarRacePlay called');
    try {
        const barRaceChart = this.chartManager.getChart('bar-race-chart');
        if (barRaceChart && barRaceChart.play) {
            console.log('  ✅ Starting bar race animation');
            barRaceChart.play();
        }
    } catch (error) {
        console.error('  ❌ Error playing bar race animation:', error);
    }
}

handleBarRaceStop() {
    console.log('⏹️  handleBarRaceStop called');
    try {
        const barRaceChart = this.chartManager.getChart('bar-race-chart');
        if (barRaceChart && barRaceChart.stop) {
            console.log('  ✅ Stopping bar race animation');
            barRaceChart.stop();
        }
    } catch (error) {
        console.error('  ❌ Error stopping bar race animation:', error);
    }
}
```

### 4. **ChartManager.js** ✅ (Ya existente)
- Agregado `chartInstances` objeto para almacenar instancias de gráficos
- Implementados `getChart(chartId)` y `setChartInstance(chartId, instance)` methods
- Modificado `renderAll()` para capturar y almacenar instancias devueltas por `render()`

### 5. **index.html** ✅ (Actualizado)
- Botón PLAY actualizado con clase `icon-btn icon-play`
- Agregado botón STOP con clase `icon-btn icon-stop`
- Ambos botones usan SVG icons
- Siguen el patrón de estilo del proyecto

```html
<button id="bar-race-play-btn" class="icon-btn icon-play" 
        title="Reproducir animación" 
        onclick="window.onBarRacePlay && window.onBarRacePlay()">
    <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg" 
         aria-hidden="true" focusable="false" fill="currentColor">
        <polygon points="5 3 19 12 5 21"/>
    </svg>
</button>

<button id="bar-race-stop-btn" class="icon-btn icon-stop" 
        title="Detener animación" 
        onclick="window.onBarRaceStop && window.onBarRaceStop()">
    <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg" 
         aria-hidden="true" focusable="false" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" rx="1"/>
        <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>
</button>
```

## Comportamiento de los Botones

| Botón | Acción | Resultado |
|-------|--------|-----------|
| **PLAY** (▶) | Inicia la animación | Muestra frames en loop a velocidad seleccionada |
| **STOP** (⏹) | Detiene la animación | Pausa y vuelve al frame 0 |

## Control de Velocidad

Se puede ajustar la velocidad de animación con el selector **Velocidad**:

| Velocidad | Duración por Frame |
|-----------|-------------------|
| 1x (Normal) | 1500ms |
| 2x (Rápido) | 750ms |
| 3x (Muy Rápido) | 500ms |
| 4x (Extremo) | 375ms |
| 5x (Ultra) | 300ms |

**Cálculo:** Duración = 1500ms ÷ Velocidad

La velocidad se puede cambiar en cualquier momento, incluso durante la animación.

## Sistema de Colores por Categoría

Cada categoría tiene asignado un color único y persistente:

### Paleta de Colores
- Total de 20 colores distintos
- Colores se asignan basándose en el nombre de la categoría
- La misma categoría siempre tiene el mismo color en todos los frames
- Facilita el seguimiento de movimientos y adelantamientos

### Ventajas
✅ Fácil identificación visual de categorías  
✅ Seguimiento de movimientos en el ranking  
✅ Detección rápida de adelantamientos  
✅ Consistencia a lo largo de toda la animación  

### Colores Utilizados
```
#FF6B6B, #4ECDC4, #45B7D1, #FFA07A, #98D8C8,
#F7DC6F, #BB8FCE, #85C1E2, #F8B88B, #52C2E0,
#FF6B9D, #C44569, #AA96DA, #FCBAD3, #A8E6CF,
#FFD3B6, #FFAAA5, #FF8B94, #FF6E7F, #BDB2FF
```

## Comportamiento de los Botones

| Botón | Acción | Resultado |
|-------|--------|-----------|
| **PLAY** (▶) | Inicia la animación | Muestra frames en loop cada 1.5s |
| **STOP** (⏹) | Detiene la animación | Pausa y vuelve al frame 0 |

## Acumulación de Datos de Gastos

El gráfico bar race utiliza **valores acumulados** de gastos:

- **Cada frame** muestra el total acumulado de gastos por categoría desde el inicio hasta esa fecha
- **Solo incluye Gastos (Gastos)**, excluye Ingresos
- **Top 10 categorías** por monto acumulado en cada frame
- **Valores siempre incrementales**: los valores nunca disminuyen, solo se acumulan

### Ejemplo:

```
Día 1: Categoría A: 100€, Categoría B: 50€
Día 2: Categoría A: 80€, Categoría C: 30€

Frame Día 1:
  - Categoría A: 100€ (acumulado)
  - Categoría B: 50€ (acumulado)

Frame Día 2:
  - Categoría A: 180€ (100 + 80)
  - Categoría B: 50€ (sin cambios)
  - Categoría C: 30€ (acumulado)
```

## Diseño Visual

- **Botones circulares** (28x28px) siguiendo patrón del proyecto
- **PLAY**: Triángulo verde (icon-play)
- **STOP**: Dos rectángulos rojos (icon-stop)
- **Efectos hover**: Cambios de color y borde semi-transparente
- **Gap entre botones**: 6px

## Flujo de Funcionamiento

```
PLAY button
    ↓
onclick → window.onBarRacePlay()
    ↓
handleBarRacePlay() → chartManager.getChart() → chart.play()
    ↓
Inicia animación cada 1.5s por frame

STOP button
    ↓
onclick → window.onBarRaceStop()
    ↓
handleBarRaceStop() → chartManager.getChart() → chart.stop()
    ↓
Para animación y vuelve a frame 0
```

## Métodos de BarRaceChart

- `play()`: Inicia animación cíclica respetando velocidad configurada
- `pause()`: Pausa manteniendo posición actual
- `stop()`: Pausa y reinicia a frame 0
- `setSpeed(multiplier)`: Cambia la velocidad (1-5)
- `showFrame(index)`: Muestra un frame específico

## Patrón de Diseño Utilizado

Sigue el patrón existente del proyecto:
- ✅ Clases `icon-btn`, `icon-play`, `icon-stop`
- ✅ SVG icons inline con `fill="currentColor"`
- ✅ Colores consistentes (verde para acciones positivas, rojo para negativas)
- ✅ Estilos hover y focus
- ✅ Global action registration en globalActions.js

## Archivos Modificados

- ✅ `assets/styles/main.css` - Agregadas clases icon-play e icon-stop
- ✅ `js/app/globalActions.js` - Agregados onBarRacePlay, onBarRaceStop y onBarRaceSpeedChange
- ✅ `js/app/DashboardApp.js` - Implementados handleBarRacePlay(), handleBarRaceStop() y handleBarRaceSpeedChange()
- ✅ `js/components/charts/BarRaceChart.js` - Agregados colores por categoría y control de velocidad
- ✅ `index.html` - Actualizado HTML con botones PLAY, STOP y selector de velocidad

## Commits

- `034ce43` - Add PLAY button functionality for bar race animation
- `074d92d` - Add test page for bar race play button  
- `3d9fb59` - Add PLAY button implementation documentation
- `166be8b` - Add STOP button and improve button styling for bar race controls
- `1112099` - Update animation controls documentation
- `e89c49f` - Fix bar race chart to accumulate expenses over time
- `7f98865` - Update documentation with cumulative data explanation
- `0e57f83` - Add speed control and unique colors for bar race chart
