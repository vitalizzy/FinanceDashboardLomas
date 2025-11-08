# Bar Race PLAY Button Implementation

## Summary
Se ha implementado completamente la funcionalidad del botón PLAY para el gráfico de "Evolución de categorías (Animada)".

## Cambios Realizados

### 1. **globalActions.js** ✅
- Agregado método `onBarRacePlay` a `GLOBAL_METHODS`
- Este método se registra globalmente en `window.onBarRacePlay`

```javascript
onBarRacePlay: (app) => app.handleBarRacePlay()
```

### 2. **DashboardApp.js** ✅
- Implementado `handleBarRacePlay()` method
- Obtiene la instancia del gráfico bar-race desde ChartManager
- Llama al método `play()` de la instancia si existe

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
```

### 3. **ChartManager.js** ✅
- Agregado `chartInstances` objeto para almacenar instancias de gráficos
- Implementados `getChart(chartId)` y `setChartInstance(chartId, instance)` methods
- Modificado `renderAll()` para capturar y almacenar instancias devueltas por `render()`

```javascript
getChart(chartId) {
    return this.chartInstances[chartId];
}

setChartInstance(chartId, instance) {
    this.chartInstances[chartId] = instance;
}
```

### 4. **index.html** ✅
- PLAY button ya estaba presente en línea 232
- Configurado con `onclick="window.onBarRacePlay && window.onBarRacePlay()"`
- Botón con estilo verde (background-color: #4CAF50)

```html
<button id="bar-race-play-btn" 
        class="icon-btn" 
        title="Reproducir animación" 
        style="background-color: #4CAF50; color: white; padding: 4px 8px; 
               border-radius: 4px; cursor: pointer; border: none; 
               font-size: 11px; font-weight: bold;" 
        onclick="window.onBarRacePlay && window.onBarRacePlay()">
    ▶ PLAY
</button>
```

### 5. **BarRaceChart.js** ✅ (Ya existente)
- Clase `CategoryBarRaceChart` con métodos de control:
  - `play()`: Inicia la animación frame-by-frame (1.5 segundos por frame)
  - `pause()`: Pausa la animación manteniendo la posición actual
  - `stop()`: Pausa y vuelve al frame 0
  - `showFrame(frameIndex)`: Muestra un frame específico

## Flujo de Funcionamiento

```
Usuario hace clic en PLAY button
        ↓
onclick handler llama window.onBarRacePlay()
        ↓
globalActions.registerGlobalActions() ha registrado onBarRacePlay → handleBarRacePlay
        ↓
handleBarRacePlay() obtiene barRaceChart desde chartManager.getChart('bar-race-chart')
        ↓
barRaceChart.play() inicia animación de frames
        ↓
Cada 1.5 segundos se muestra el siguiente frame
        ↓
Cuando llega al final, reinicia desde el frame 0
```

## Validación

Se ha creado `test_bar_race_play.html` con pruebas de:
1. ✅ Métodos globales registrados
2. ✅ Botón PLAY existe en HTML
3. ✅ onclick handler está configurado correctamente
4. ✅ flujo completo de llamadas
5. ✅ Instancia de ChartManager y métodos de acceso

## Características de la Animación

- **Duración por frame:** 1.5 segundos
- **Suavizado:** cubicOut animation easing
- **Formato de título:** Muestra la fecha del frame actual
- **Formato de datos:** Categorías ordenadas con valores en €
- **Comportamiento:** Loop infinito (reinicia desde el primer frame)

## Próximas Mejoras (Opcionales)

1. Agregar botón PAUSE para pausar la animación
2. Cambiar texto del botón de "PLAY" a "PAUSE" cuando esté en animación
3. Agregar indicador de frame actual (ej: "Frame 3/10")
4. Agregar velocidad ajustable de animación
5. Agregar botón para cambiar velocidad

## Testing

Para probar la funcionalidad:
1. Abrir `test_bar_race_play.html` en navegador
2. Hacer clic en "Test Global Methods" - debe mostrar ✅ para todos
3. Hacer clic en "Test PLAY Button Handler" - debe ejecutar sin errores
4. Hacer clic en "Test Full Flow Simulation" - debe completar todos los pasos
5. Hacer clic en "Check Dashboard App" - debe encontrar todas las instancias

## Archivos Modificados

- ✅ `js/app/globalActions.js` - Agregado onBarRacePlay
- ✅ `js/app/DashboardApp.js` - Implementado handleBarRacePlay()
- ✅ `js/managers/ChartManager.js` - Agregados métodos de acceso a instancias
- ✅ `index.html` - PLAY button ya presente
- ✅ `test_bar_race_play.html` - Nuevo archivo de pruebas

## Commits

- `034ce43` - Add PLAY button functionality for bar race animation
- `074d92d` - Add test page for bar race play button
