# Guía de Integración - Gráficos Financieros en Google Sites

## 📊 Descripción
Este snippet permite visualizar datos financieros de una Google Sheet en gráficos interactivos directamente en Google Sites.

## 🚀 Cómo integrar en Google Sites

### Paso 1: Subir el archivo HTML
1. Ve a [Google Sites](https://sites.google.com)
2. Crea un nuevo sitio o edita uno existente
3. En la página donde quieres insertar los gráficos:
   - Haz clic en **"Insertar"** → **"Insertar con código"**
   - Selecciona **"HTML incorporado"**

### Paso 2: Copiar el código
Copia todo el contenido del archivo `google-sites-charts.html` y pégalo en el cuadro de código HTML.

### Paso 3: Configurar permisos
Asegúrate de que tu Google Sheet tenga los siguientes permisos:
- **Visibilidad**: "Cualquiera con el enlace puede ver"
- **Acceso**: "Editor" o "Lector" según necesites

### Paso 4: Actualizar la URL del CSV
Si cambias la URL de tu Google Sheet, actualiza esta línea en el código:
```javascript
const CSV_URL = 'TU_NUEVA_URL_AQUI';
```

## 📋 Características del Dashboard

### 📈 Gráficos Incluidos:
1. **Resumen Financiero**: Tarjetas con totales de ingresos, gastos, saldo y transacciones
2. **Flujo Mensual**: Gráfico de líneas mostrando ingresos vs gastos por mes
3. **Gastos por Categoría**: Gráfico de barras con las categorías más importantes
4. **Distribución de Gastos**: Gráfico circular (dona) con el porcentaje por categoría

### 🔍 Filtros Disponibles:
- Todos los datos
- Mes actual
- Año actual
- Últimos 3 meses

### 🎨 Diseño:
- Compatible con el estilo de Google Sites
- Responsive (se adapta a móviles)
- Colores consistentes con Google Material Design

## ⚙️ Personalización

### Cambiar colores:
Modifica las variables de color en la sección CSS:
```css
.summary-card {
    border-left: 4px solid #4285f4; /* Cambia este color */
}
```

### Añadir más gráficos:
Puedes añadir nuevos tipos de gráficos siguiendo el patrón:
```javascript
function createNewChart(canvasId, data, title) {
    // Tu código de gráfico aquí
}
```

### Modificar filtros:
Añade nuevas opciones en el select de filtros:
```html
<option value="nuevo_filtro">Nuevo Filtro</option>
```

## 🔧 Solución de Problemas

### Error: "No se pueden cargar los datos"
- Verifica que la URL del CSV sea pública
- Asegúrate de que el Google Sheet tenga permisos de lectura pública
- Comprueba que el formato del CSV sea correcto

### Los gráficos no se muestran:
- Verifica que Chart.js se esté cargando correctamente
- Revisa la consola del navegador para errores JavaScript
- Asegúrate de que los datos CSV tengan el formato esperado

### Problemas de rendimiento:
- Si tienes muchos datos, considera filtrar desde el origen
- Limita el número de elementos mostrados en cada gráfico
- Usa la paginación para grandes conjuntos de datos

## 📱 Compatibilidad
- ✅ Google Sites
- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles
- ✅ Tablets

## 🔄 Actualización Automática
Los datos se actualizan automáticamente cuando se modifica la Google Sheet, ya que el snippet siempre carga los datos más recientes desde la URL pública del CSV.

## 📞 Soporte
Si necesitas ayuda adicional o quieres personalizar más el dashboard, puedes:
1. Modificar el código HTML directamente
2. Añadir más tipos de gráficos
3. Personalizar los filtros y la visualización
