# Configuración de Columnas de Tabla - Sistema Modular

## Filosofía del Sistema

**TODAS las tablas heredan automáticamente los mismos estilos profesionales desde CSS.**  
No necesitas configurar colores, fuentes o estilos en cada columna - todo es consistente por defecto.

## Propiedades Disponibles por Columna

### 🔑 **Propiedades Obligatorias**

```javascript
{
    key: 'nombre_campo',           // OBLIGATORIO: Nombre del campo en los datos
    labelKey: 'translation_key',   // OBLIGATORIO: Clave de traducción para el título
}
```

### 📐 **Dimensiones (Únicas configurables a nivel de columna)**

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
}
```

### 🎛️ **Funcionalidad**

```javascript
{
    sortable: true,      // Si la columna es ordenable (default: true)
    searchable: true,    // Si la columna tiene filtro de búsqueda (default: true)
}
```

### 🎭 **Clases CSS para Células de Datos**

```javascript
{
    cssClass: 'weight-medium color-ingresos',  // Clases CSS SOLO para las células de datos
    headerClass: 'custom-header',               // Clases CSS adicionales SOLO para el header
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

## ❌ Propiedades ELIMINADAS (Ahora en CSS Global)

Estas propiedades ya NO son necesarias porque TODAS las tablas usan los mismos estilos:

- ~~`headerColor`~~ → Ahora: `--table-header-text-color` en CSS
- ~~`headerBgColor`~~ → Ahora: `--table-header-bg-start/end` en CSS
- ~~`headerFontSize`~~ → Ahora: `--table-header-font-size` en CSS
- ~~`headerFontWeight`~~ → Ahora: `--table-header-font-weight` en CSS
- ~~`headerPadding`~~ → Ahora: `--table-header-padding` en CSS
- ~~`headerTextAlign`~~ → Usa `headerAlign` o `align`

## 🎨 Variables CSS Globales (para personalización del sistema)

Si necesitas cambiar el look de TODAS las tablas a la vez, modifica estas variables en `styles.css`:

```css
:root {
    /* Encabezados de Tabla */
    --table-header-bg-start: #f8f9fa;
    --table-header-bg-end: #f1f3f5;
    --table-header-text-color: #495057;
    --table-header-font-weight: 600;
    --table-header-font-size: 13px;
    --table-header-padding: 14px 12px;
    --table-header-border-color: #dee2e6;
    --table-header-hover-bg-start: #e9ecef;
    --table-header-hover-bg-end: #dee2e6;
    
    /* Icono de Búsqueda */
    --table-search-icon-color: #6c757d;
    --table-search-icon-bg: rgba(108, 117, 125, 0.1);
    --table-search-icon-hover-bg: rgba(108, 117, 125, 0.2);
    --table-search-icon-hover-color: #495057;
}
```

## 📋 Ejemplo Correcto (Sistema Modular)

```javascript
const columns = [
    {
        key: 'F. Operativa',
        labelKey: 'date',
        width: '110px',
        align: 'text-center',
        sortable: true,
        searchable: true
    },
    {
        key: 'Concepto Publico',
        labelKey: 'concept',
        minWidth: '200px',
        sortable: true,
        searchable: true
    },
    {
        key: 'Ingresos',
        labelKey: 'income',
        width: '120px',
        align: 'text-right',
        cssClass: 'weight-medium color-ingresos', // Solo para células
        sortable: true,
        searchable: false,
        formatter: (value) => formatCurrency(value)
    },
    {
        key: 'Gastos',
        labelKey: 'expenses',
        width: '120px',
        align: 'text-right',
        cssClass: 'weight-medium color-gastos', // Solo para células
        sortable: true,
        searchable: false,
        formatter: (value) => formatCurrency(value)
    }
];
```

## ✅ **Buenas Prácticas**

1. **NO configures estilos visuales por columna** - Usa las variables CSS globales
2. **USA `align`** para alineamiento consistente en header y células
3. **USA `width` fija** para columnas de cantidades (Ingresos, Gastos)
4. **USA `minWidth/maxWidth`** para columnas de texto largo
5. **DESHABILITA `searchable: false`** en columnas numéricas o de moneda
6. **USA `formatter`** para transformar valores (fechas, monedas, porcentajes)
7. **USA `cssClass`** para estilos de células (color-ingresos, weight-medium, etc.)

## ⚠️ **Evitar**

- ❌ NO mezcles `width` con `minWidth/maxWidth` en la misma columna
- ❌ NO uses propiedades eliminadas (headerColor, headerBgColor, etc.)
- ❌ NO pongas `searchable: true` en columnas calculadas o formateadas
- ❌ NO intentes sobrescribir estilos de header con inline styles

## 🎯 Ventajas del Sistema Modular

1. **Consistencia Total**: Todas las tablas se ven idénticas
2. **Fácil Mantenimiento**: Cambia UNA variable CSS y afecta a TODAS las tablas
3. **Escalable**: Nuevas tablas heredan automáticamente el look profesional
4. **Menos Código**: No necesitas configurar estilos en cada columna
5. **Profesional**: Diseño unificado en todo el dashboard
