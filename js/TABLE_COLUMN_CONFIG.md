# Configuración de Columnas de Tabla

## Propiedades Disponibles por Columna

### 🔑 **Propiedades Básicas**

```javascript
{
    key: 'nombre_campo',           // OBLIGATORIO: Nombre del campo en los datos
    labelKey: 'translation_key',   // OBLIGATORIO: Clave de traducción para el título
}
```

### 🎨 **Apariencia del Header**

```javascript
{
    // Color
    headerColor: '#495057',              // Color del texto del header
    headerBgColor: '#f8f9fa',            // Color de fondo del header
    
    // Tipografía
    headerFontSize: '13px',              // Tamaño de fuente del header
    headerFontWeight: '600',             // Peso de fuente (normal, 600, bold, etc.)
    
    // Espaciado
    headerPadding: '14px 12px',          // Padding del header
    
    // Clases CSS
    headerClass: 'custom-header-class',  // Clase CSS adicional para el header
}
```

### 📐 **Dimensiones**

```javascript
{
    width: '150px',        // Ancho fijo de la columna
    minWidth: '100px',     // Ancho mínimo
    maxWidth: '300px',     // Ancho máximo
}
```

### 🧭 **Alineamiento**

```javascript
{
    // Alineamiento general (afecta header y células)
    align: 'text-right',         // Opciones: 'text-left', 'text-center', 'text-right'
    
    // Alineamiento específico del header (sobrescribe 'align' solo para header)
    headerAlign: 'text-center',  // Opciones: 'text-left', 'text-center', 'text-right'
    
    // Alineamiento del texto dentro del header
    headerTextAlign: 'center',   // Opciones: 'left', 'center', 'right'
}
```

### 🎛️ **Funcionalidad**

```javascript
{
    sortable: true,      // Si la columna es ordenable (default: true)
    searchable: true,    // Si la columna tiene filtro de búsqueda (default: true)
}
```

### 🎭 **Clases CSS Adicionales**

```javascript
{
    cssClass: 'weight-medium color-ingresos',  // Clases CSS para las células de datos
}
```

### 🔧 **Formateador Personalizado**

```javascript
{
    formatter: (value, item) => {
        // Función para formatear el valor de la celda
        return formatCurrency(value);
    }
}
```

## 📋 Ejemplo Completo

```javascript
const columns = [
    {
        key: 'F. Operativa',
        labelKey: 'date',
        width: '120px',
        align: 'text-center',
        headerAlign: 'text-center',
        sortable: true,
        searchable: true,
        headerFontWeight: '700',
    },
    {
        key: 'Concepto Publico',
        labelKey: 'concept',
        minWidth: '200px',
        maxWidth: '400px',
        sortable: true,
        searchable: true,
    },
    {
        key: 'Ingresos',
        labelKey: 'income',
        width: '120px',
        align: 'text-right',
        headerAlign: 'text-right',
        cssClass: 'weight-medium color-ingresos',
        sortable: true,
        searchable: false,
        formatter: (value) => formatCurrency(value),
    },
    {
        key: 'Gastos',
        labelKey: 'expenses',
        width: '120px',
        align: 'text-right',
        headerAlign: 'text-right',
        headerColor: '#dc3545',
        cssClass: 'weight-medium color-gastos',
        sortable: true,
        searchable: false,
        formatter: (value) => formatCurrency(value),
    },
    {
        key: 'Categoria',
        labelKey: 'category',
        width: '150px',
        sortable: true,
        searchable: true,
        headerBgColor: '#e9ecef',
    }
];
```

## 🎯 Jerarquía de Prioridades

1. **Estilos inline** (width, headerColor, etc.) > Clases CSS
2. **headerAlign** > **align** (para el header)
3. **headerClass** se añade a las clases calculadas automáticamente
4. **cssClass** se aplica solo a las células de datos, no al header

## 💡 Consejos de Uso

### ✅ **Buenas Prácticas**

- Usa `align` para alineamiento consistente en header y células
- Usa `headerAlign` solo cuando necesites alineamiento diferente en el header
- Usa `width` fija para columnas de cantidades (Ingresos, Gastos)
- Usa `minWidth` y `maxWidth` para columnas de texto largo
- Deshabilita `searchable: false` en columnas numéricas o de moneda
- Usa `formatter` para transformar valores (fechas, monedas, porcentajes)

### ⚠️ **Evitar**

- No mezcles `width` con `minWidth/maxWidth` en la misma columna
- No uses `headerTextAlign` y `headerAlign` juntos (pueden conflictuar)
- No pongas `searchable: true` en columnas calculadas o formateadas

## 🔍 Clases CSS Predefinidas Disponibles

### Alineamiento
- `text-left` - Alinear a la izquierda
- `text-center` - Centrar
- `text-right` - Alinear a la derecha

### Estilos de Texto
- `weight-medium` - Peso de fuente medio (500)
- `color-ingresos` - Color verde para ingresos
- `color-gastos` - Color rojo para gastos
- `color-per-home` - Color azul para por vivienda
- `color-secondary` - Color gris secundario

### Columnas Especiales
- `col-secreta` - Columna de contenido secreto
- `col-concepto-original` - Columna de concepto original

## 🚀 Uso con ConfigurableTable

```javascript
import { createConfigurableTable } from './ConfigurableTable.js';

const myTable = createConfigurableTable('my-container', {
    columns: [
        { key: 'fecha', labelKey: 'date', width: '100px', align: 'text-center' },
        { key: 'concepto', labelKey: 'concept', minWidth: '200px' },
        { key: 'monto', labelKey: 'amount', width: '120px', align: 'text-right', 
          formatter: (v) => formatCurrency(v) }
    ],
    options: {
        compact: false,
        pagination: true,
        itemsPerPage: 50,
        sortColumn: 'fecha',
        sortDirection: 'desc'
    }
});

myTable.renderWithData(data);
```
