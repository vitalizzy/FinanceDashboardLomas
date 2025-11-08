# Sistema de Ordenamiento de Tablas - Guía Técnica

## 📋 Descripción General

Las tablas del dashboard implementan un **sistema de tres estados** para el ordenamiento de columnas, con soporte para **múltiples columnas ordenadas simultáneamente** manteniendo prioridades.

---

## 🔄 Estados de Ordenamiento por Columna

### Ciclo de Estados (Three-State Sorting)

Cada columna orderable tiene 3 estados que se ciclan al hacer click:

```
┌─────────────────┐
│  SIN ORDEN      │  ← Estado inicial
│   (no icono)    │
└────────┬────────┘
         │ CLICK
         ↓
┌─────────────────┐
│  DESC ↓         │  ← Mayor a Menor
│   (↓ visible)   │
└────────┬────────┘
         │ CLICK
         ↓
┌─────────────────┐
│  ASC ↑          │  ← Menor a Mayor
│   (↑ visible)   │
└────────┬────────┘
         │ CLICK
         ↓
┌─────────────────┐  (Ciclo se repite)
│  SIN ORDEN      │
└─────────────────┘
```

### Visualización en Headers

| Estado | Símbolo | Significado | Badge |
|--------|---------|------------|-------|
| Sin Ordenar | ⇅ | Columna no está ordenada | ❌ |
| Descendente | ↓ | Valores de mayor a menor | [N] |
| Ascendente | ↑ | Valores de menor a mayor | [N] |

**[N]** = Número de prioridad (1 = primera, 2 = segunda, etc.)

## Tablas Afectadas

- ✅ **All Transactions Table** (Todas las transacciones)
- ✅ **Top Movements Table** (Top movimientos por categoría)
- ✅ **Category Summary Table** (Resumen de categorías)

---

## 🎯 Ejemplos de Comportamiento

### Ejemplo 1: Ordenamiento Simple
```
Usuario hace click en columna "Monto"
→ Ordena DESC (mayor a menor)
→ Icono muestra: ↓ (sin badge porque es la única)

Usuario hace click nuevamente
→ Cambia a ASC (menor a mayor)  
→ Icono muestra: ↑

Usuario hace click nuevamente
→ Elimina ordenamiento
→ Icono vuelve a: ⇅
```

### Ejemplo 2: Ordenamiento Múltiple con Prioridades
```
1. Click en "Categoría" 
   → Ordena DESC
   → "Categoría" muestra: ↓ [1]

2. Click en "Monto"
   → Se agrega a ordenamiento (NO reemplaza)
   → "Categoría" muestra: ↓ [1]
   → "Monto" muestra: ↓ [2]
   → Resultado: Primero ordena por categoría, luego por monto

3. Click en "Monto" nuevamente
   → "Monto" cambia a ASC
   → "Categoría" sigue en ↓ [1]
   → "Monto" ahora muestra: ↑ [2]

4. Click en "Categoría" nuevamente
   → "Categoría" cambia a ASC
   → "Monto" sigue en ↑ [2]
   → "Categoría" ahora muestra: ↑ [1]

5. Click en "Categoría" nuevamente
   → "Categoría" se remueve (tercer click)
   → "Monto" pasa a ser [1] ↑ (la única)
   → "Categoría" vuelve a: ⇅ (sin orden)
```

---

## 🛠️ Implementación Técnica

### BaseTable.sort(column)

Implementa el ciclo de tres estados para ordenamiento:

```javascript
sort(column) {
    const index = this.sortState.findIndex(entry => entry.key === column);

    if (index === -1) {
        // Primer click: ordenar descendentemente (DESC)
        // Se agrega a la lista manteniendo otras columnas activas
        this.sortState.push({ key: column, direction: 'desc' });
    } else {
        const currentDirection = this.sortState[index].direction;
        if (currentDirection === 'desc') {
            // Segundo click: cambiar a ascendentemente (ASC)
            this.sortState[index].direction = 'asc';
        } else if (currentDirection === 'asc') {
            // Tercer click: remover ordenamiento (sin orden)
            this.sortState.splice(index, 1);
        }
    }

    this.sortColumn = this.sortState[0]?.key || null;
    this.sortDirection = this.sortState[0]?.direction || 'asc';
    this.resetVisibleRows();
}
```

**Lógica:**
1. **Primer click**: Columna NO en sortState → Se añade con **DESC**
2. **Segundo click**: Columna con DESC → Cambia a **ASC**
3. **Tercer click**: Columna con ASC → Se **remueve** del sortState

### BaseTable.sortData(data)

Ordena datos aplicando múltiples columnas en cascada:

```javascript
sortData(data) {
    if (this.sortState.length === 0) return data;

    const columnsByKey = Object.fromEntries((this.lastColumns || []).map(col => [col.key, col]));

    return [...data].sort((a, b) => {
        // Itera por cada entrada en sortState (en orden de prioridad)
        for (const { key, direction } of this.sortState) {
            const column = columnsByKey[key] || {};
            const valA = this.getSortableValue(a, key, column);
            const valB = this.getSortableValue(b, key, column);

            // Comparación:
            // - Si valores son diferentes, retorna resultado inmediatamente
            // - Si valores son iguales, continúa con siguiente prioridad
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
        }
        return 0; // Todos los criterios resultaron iguales
    });
}
```

### Renderización del Header

En `renderHeader()`, para cada columna:

```javascript
const sortEntryIndex = this.sortState.findIndex(entry => entry.key === col.key);
const sortEntry = sortEntryIndex >= 0 ? this.sortState[sortEntryIndex] : null;

// Icono de ordenamiento
const sortSymbol = sortEntry ? (sortEntry.direction === 'asc' ? '↑' : '↓') : '⇅';
const priorityBadge = sortEntry ? `<span class="sort-order-badge">${sortEntryIndex + 1}</span>` : '';

// Se renderiza: ↓ [1] o ↑ [2] o solo ⇅
```

---

## 📊 Estructura del Estado

### sortState (Array)

```javascript
// Ejemplo: Ordenado por "Categoría" DESC, luego "Monto" DESC
this.sortState = [
    { key: 'categoria', direction: 'desc' },  // [1] Prioridad 1
    { key: 'monto', direction: 'desc' }       // [2] Prioridad 2
];

// Ejemplo: Sin ordenamiento
this.sortState = [];

// Ejemplo: Solo una columna
this.sortState = [
    { key: 'fecha', direction: 'asc' }        // [1] Prioridad única
];
```

---

## 📱 Cómo Usar

### Para el Usuario

1. **Hacer un ordenamiento simple:**
   - Click en encabezado de columna o icono ⇅
   - Aparece ↓ (DESC, mayor a menor)
   - Click nuevamente: Aparece ↑ (ASC, menor a mayor)
   - Click nuevamente: Vuelve a ⇅ (sin orden)

2. **Hacer múltiples ordenamientos:**
   - Click en "Categoría" → ↓ [1]
   - Click en "Monto" → [1] sigue, aparece [2] ↓
   - Badges muestran el orden de prioridad

3. **Mantener otros ordenamientos:**
   - Si "Monto" está [2]↓, click nuevamente → cambia a [2]↑
   - "Categoría"[1]↓ permanece sin cambios

### Para el Desarrollador

```javascript
// Obtener estado actual
const state = table.getSortState();

// Establecer ordenamiento inicial
table.setSortState([{ key: 'fecha', direction: 'desc' }]);

// Simular click del usuario
table.sort('monto');

// Limpiar ordenamiento
table.setSortState([]);
```

---

## 🔍 Tipos de Datos Soportados

| Tipo | Ejemplo | Comportamiento |
|------|---------|----------------|
| `currency` | €1,500.00 | Convertido a número |
| `percent` | 25.5% | Convertido a número |
| `number` | 42 | Ordenamiento numérico |
| `date` | 01/01/2024 | Ordenamiento por timestamp |
| `string` | "Alquiler" | Ordenamiento alfabético |

---

## 🧪 Casos de Uso Reales

### Caso 1: Ver mayores gastos primero
```
Click "Monto" → ↓ [1]
Resultado: Gastos ordenados de mayor a menor
```

### Caso 2: Agrupar por categoría, luego por monto
```
Click "Categoría" → ↓ [1]
Click "Monto" → ↓ [2]
Resultado: Primero por categoría, dentro cada una por monto
```

### Caso 3: Categorías DESC, dentro cada categoría fechas ASC
```
Click "Categoría" → ↓ [1]
Click "Fecha" → ↑ [2]
Resultado: Categorías DESC, fechas ASC dentro cada categoría
```

---

## ✅ Características Implementadas

- ✅ Ciclo de tres estados por columna
- ✅ Múltiples columnas de ordenamiento simultáneamente
- ✅ Prioridades visuales con badges [1], [2], [3]...
- ✅ Ordenamiento en cascada por todas las columnas activas
- ✅ Soporte para distintos tipos de datos
- ✅ Integración con AppState para persistencia
- ✅ Rendimiento optimizado

---

## Commits Relacionados

- `16b9937` - Implement three-state column sorting (DESC → ASC → No Sort)
- Latest - Enhance: Support multiple simultaneous column sorting with priorities
