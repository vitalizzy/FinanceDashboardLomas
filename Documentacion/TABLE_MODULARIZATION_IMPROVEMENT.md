# 🎯 TABLA BASE - Modularización Mejorada

**Resumen de Mejoras en la Arquitectura de Tablas**

---

## ✅ ANTES: Código Duplicado en Cada Tabla

Cada tabla (`TopMovementsTable`, `AllTransactionsTable`, `CategorySummaryTable`) tenía su propio `renderRow()`:

```javascript
// ❌ TopMovementsTable.js
renderRow(item, columns) {
    const category = item.Categoria || 'Sin categoría';
    const isPending = AppState.filters.pendingCategories.has(category);
    const pendingClass = isPending ? 'pending-selected' : '';
    
    let html = `<tr class="${pendingClass}" onclick="...">`;
    columns.forEach(col => { ... });
    html += '</tr>';
    return html;
}

// ❌ AllTransactionsTable.js
renderRow(item, columns) {
    // Código MUY similar pero más complejo
    const isPendingCategory = ...;
    const isPendingMonth = ...;
    let html = `<tr class="${...}">`;
    columns.forEach(col => { ... });
    html += '</tr>';
    return html;
}

// ❌ CategorySummaryTable.js
renderRow(item, columns) {
    // Código similar pero simplificado
    const isPending = ...;
    let html = `<tr class="${pendingClass}">`;
    columns.forEach(col => { ... });
    html += '</tr>';
    return html;
}
```

**Problemas:**
- ❌ Duplicación de código (DRY violation)
- ❌ Difícil mantener - cambio en un lugar → hay que cambiar en 3 lugares
- ❌ Inconsistencia - cada tabla hacía cosas ligeramente diferentes
- ❌ Mayor posibilidad de bugs

---

## ✅ DESPUÉS: BaseTable con Hooks

### 1. BaseTable ahora tiene `renderRow()` genérico:

```javascript
// ✅ js/core/base_table.js
renderRow(item, columns) {
    // Permitir que subclases personalicen atributos de fila
    const rowClass = this.getRowClass ? this.getRowClass(item) : '';
    const rowAttrs = this.getRowAttributes ? this.getRowAttributes(item) : '';
    
    let html = `<tr${rowClass ? ` class="${rowClass}"` : ''}${rowAttrs ? ` ${rowAttrs}` : ''}>`;
    
    columns.forEach(col => {
        const value = this.formatCellValue(item[col.key], col);
        const cellClass = col.cellClass ? (typeof col.cellClass === 'function' ? col.cellClass(item) : col.cellClass) : '';
        const cssClass = col.cssClass || '';
        const align = col.align || '';
        const allClasses = [cellClass, cssClass, align].filter(c => c).join(' ');
        html += `<td class="${allClasses}">${value}</td>`;
    });
    
    html += '</tr>';
    return html;
}

/**
 * Hook: Devolver clase CSS para la fila
 * Sobrescribir en subclases si se necesita lógica especial
 */
getRowClass(item) {
    return '';
}

/**
 * Hook: Devolver atributos adicionales para la fila
 * Sobrescribir en subclases si se necesita lógica especial
 */
getRowAttributes(item) {
    return '';
}
```

### 2. TopMovementsTable simplificada:

```javascript
// ✅ js/components/tables/TopMovementsTable.js
export class TopMovementsTable extends BaseTable {
    // ... columnas y formatCellValue

    getRowClass(item) {
        const category = item.Categoria || 'Sin categoría';
        const isPending = AppState.filters.pendingCategories.has(category);
        return isPending ? 'pending-selected' : '';
    }

    getRowAttributes(item) {
        const category = item.Categoria || 'Sin categoría';
        return `onclick="window.selectPendingCategory(event, '${category.replace(/'/g, "\\'")}')"`;
    }
}
```

### 3. AllTransactionsTable simplificada:

```javascript
// ✅ js/components/tables/AllTransactionsTable.js
export class AllTransactionsTable extends BaseTable {
    // ... columnas y formatCellValue

    getRowClass(item) {
        const category = item.Categoria || 'Sin categoría';
        const itemDate = parseDate(item['F. Operativa']);
        const monthKey = itemDate ? `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}` : '';
        
        const isPendingCategory = AppState.filters.pendingCategories.has(category);
        const isPendingMonth = monthKey && AppState.filters.pendingMonths.has(monthKey);
        return (isPendingCategory || isPendingMonth) ? 'pending-selected' : '';
    }

    getRowAttributes(item) {
        const category = item.Categoria || 'Sin categoría';
        return `onclick="window.selectPendingCategory(event, '${category.replace(/'/g, "\\'")}')"`;
    }
}
```

### 4. CategorySummaryTable simplificada:

```javascript
// ✅ js/components/tables/CategorySummaryTable.js
export class CategorySummaryTable extends BaseTable {
    // ... columnas y formatCellValue

    getRowClass(item) {
        const isPending = AppState.filters.pendingCategories.has(item.category);
        return isPending ? 'pending-selected' : '';
    }

    getRowAttributes(item) {
        return `onclick="window.selectPendingCategory(event, '${item.category.replace(/'/g, "\\'")}')"`;
    }
}
```

---

## 📊 COMPARACIÓN

| Aspecto | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Líneas en TopMovementsTable | 119 | 100 | -16% |
| Líneas en AllTransactionsTable | 160 | 135 | -15% |
| Líneas en CategorySummaryTable | 120 | 95 | -21% |
| Código duplicado en renderRow | 3 versiones | 1 versión en BaseTable | -67% |
| Puntos de fallo (bugs) | 3 implementaciones | 1 implementación | -67% |

---

## 🎯 BENEFICIOS

1. **Menos duplicación** - Una sola versión de `renderRow()`
2. **Más fácil mantener** - Cambio en `renderRow()` afecta a TODAS las tablas
3. **Consistencia** - Todas las tablas usan mismo patrón
4. **Extensibilidad** - Fácil agregar nuevas tablas
5. **Testeable** - Menos código complejo en subclases
6. **Template Method Pattern** - BaseTable define estructura, subclases personalizan comportamiento

---

## 🔧 PATRÓN TEMPLATE METHOD

BaseTable define la "plantilla" (cómo renderizar una fila), y las subclases solo personalizan los "hooks":

```
BaseTable.renderRow()
├── getRowClass(item)        ← Subclases personalizan
├── getRowAttributes(item)   ← Subclases personalizan
└── formatCellValue(val, col) ← Subclases personalizan si es necesario
```

---

## 🚀 PRÓXIMAS MEJORAS POSIBLES

1. **Centralizar más hooks**
   - `getRowOnClick()` - Reducir repetición de handlers
   - `shouldHighlightRow()` - Lógica de highlighting
   - `getRowTooltip()` - Tooltips dinámicos

2. **Crear ComponentRegistry** para pending states
   ```javascript
   export class PendingStateHelper {
       static getRowClass(item, checkFields) {
           return checkFields.some(field => 
               AppState.filters.pending[field].has(item[field])
           ) ? 'pending-selected' : '';
       }
   }
   ```

3. **Factory para selectores de Pending**
   ```javascript
   const topMovementsPending = new PendingSelector('categories');
   const allTransactionsPending = new PendingSelector('categories', 'months');
   ```

---

## ✨ CONCLUSIÓN

La modularización correcta hace el código:
- **Menos** - Menos duplicación
- **Mejor** - Mejor mantenibilidad
- **Más fuerte** - Menos bugs
- **Más rápido** - Más fácil entender

> "Good architecture is worth the extra effort."

