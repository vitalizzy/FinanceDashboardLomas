# MEJORES PRÁCTICAS DE PROGRAMACION - APLICABLES AL SORTING

## 1. PRINCIPIOS SOLID

### Single Responsibility Principle (SRP)
**Cada clase/función debe tener UNA única responsabilidad**

❌ MAL:
```javascript
class Table {
    render() {
        // ... renderizar
        // ... ordenar datos
        // ... filtrar datos
        // ... guardar en AppState
        // ... actualizar header
    }
}
```

✅ BIEN:
```javascript
// Cada cosa por su lado
class SortManager { /* SOLO maneja sorting */ }
class FilterManager { /* SOLO maneja filtros */ }
class RenderEngine { /* SOLO renderiza */ }
class StateManager { /* SOLO maneja estado */ }
```

**Aplicado al sorting:**
- SortManager → solo maneja toggleSort y applySortToData
- BaseTable → solo orquesta: "cuando cambio sort, re-renderiza"
- renderHeader() → solo genera HTML del header
- No mezclar lógica de sorting con lógica de UI

---

## 2. DEPENDENCY INJECTION

**Las dependencias deben inyectarse, no crearse internamente**

❌ MAL:
```javascript
class BaseTable {
    constructor() {
        this.sortManager = new SortManager();  // ← acoplado
        this.filterManager = new FilterManager();  // ← acoplado
    }
}
```

✅ BIEN:
```javascript
class BaseTable {
    constructor(containerId, options = {}, sortManager = null, filterManager = null) {
        this.sortManager = sortManager || new SortManager(options);
        this.filterManager = filterManager || new FilterManager(options);
        // Ahora fácil de testear: pasar mocks
    }
}

// En test:
const mockSortManager = { toggleSort: () => {} };
const table = new BaseTable('id', {}, mockSortManager);
```

---

## 3. CALLBACK HELL vs PROMISES

**Evitar callbacks anidados, usar Promises o async/await**

❌ MAL (Callback Hell):
```javascript
sortManager.toggleSort(column, () => {
    resetVisibleRows(() => {
        render(data, columns, () => {
            renderHeader(columns, () => {
                // ← Cuatro niveles de callbacks!
                console.log('done');
            });
        });
    });
});
```

✅ BIEN (Promises):
```javascript
sortManager.toggleSort(column)
    .then(() => resetVisibleRows())
    .then(() => render(data, columns))
    .then(() => renderHeader(columns))
    .then(() => console.log('done'))
    .catch(err => console.error(err));
```

✅ MEJOR (async/await):
```javascript
async function handleSort(column) {
    try {
        await sortManager.toggleSort(column);
        await resetVisibleRows();
        await render(data, columns);
        await renderHeader(columns);
        console.log('done');
    } catch (err) {
        console.error(err);
    }
}
```

---

## 4. EXPLICIT STATE MANAGEMENT

**El estado debe ser CLARO, VISIBLE y RASTREABLE**

❌ MAL:
```javascript
class SortManager {
    toggleSort(column) {
        this.sortState.push(...);  // ¿Qué estado hay ahora?
        // ¿Se actualizó o no?
        this.onSortChange();  // Esperar que esto funcione mágicamente
    }
}
```

✅ BIEN:
```javascript
class SortManager {
    toggleSort(column) {
        const previousState = JSON.stringify(this.sortState);
        // ... hacer cambios ...
        const newState = JSON.stringify(this.sortState);
        
        console.log(`State changed from: ${previousState} to: ${newState}`);
        
        if (previousState !== newState) {
            this.notifyStateChange(this.getSortState());
        }
    }
    
    getSortState() {
        return [...this.sortState];  // Siempre devolver copia
    }
}
```

---

## 5. EVENT-DRIVEN ARCHITECTURE

**NO tener múltiples puntos de entrada al mismo código**

❌ MAL:
```javascript
// En AllTransactionsTable.js
window.sortTable_all_transactions = () => { /* handler 1 */ };

// En BaseTable.js
window.sortTable_all_transactions = () => { /* handler 2 */ };  // ← Sobrescribe!
```

✅ BIEN:
```javascript
// EN UN SOLO LUGAR:
window.sortTable_all_transactions = (col) => {
    allTransactionsTable.sort(col);
};

// Y en BaseTable:
class BaseTable {
    registerHandler() {
        window[`sortTable_${this.id}`] = (col) => this.handleSort(col);
    }
    
    handleSort(column) {
        // Orquestar: cambiar sort → salvar estado → re-render
        this.sortManager.toggleSort(column);
        // El callback del sortManager hace el resto
    }
}
```

---

## 6. IMMUTABILITY PRINCIPLE

**NO modificar datos originales, crear copias**

❌ MAL:
```javascript
applySortToData(data, getSortableValue) {
    // Mutar array original directamente
    data.sort((a, b) => { /* ... */ });
    return data;  // ← Datos originales fueron modificados!
}
```

✅ BIEN:
```javascript
applySortToData(data, getSortableValue) {
    // Crear copia
    const sorted = [...data];  // ← Copia del array
    sorted.sort((a, b) => { /* ... */ });
    return sorted;  // Original intacto
}
```

**Por qué importa:**
- Si otra parte del código necesita datos originales unsorted → BUG
- Más fácil de debuggear
- Más fácil de cachear
- Evita side effects inesperados

---

## 7. FAIL EARLY, FAIL LOUD

**Detectar problemas INMEDIATAMENTE con mensajes claros**

❌ MAL:
```javascript
render(data) {
    if (!data) return;  // Silenciosamente no hace nada
    // Código continúa...
    // ¿Por qué no se renderizó? ¿Quién sabe?
}
```

✅ BIEN:
```javascript
render(data) {
    if (!data || data.length === 0) {
        console.warn('[BaseTable] No data provided to render');
        return;
    }
    
    if (!Array.isArray(data)) {
        throw new Error('[BaseTable] data must be an array, got: ' + typeof data);
    }
    
    // Ahora sabemos que data es válido
}
```

---

## 8. CONSISTENT NAMING CONVENTIONS

**Nombres consistentes hacen más fácil seguir el flujo**

❌ MAL:
```javascript
sortManager.toggleSort(col);  // ¿toggleSort qué hace?
sortData(data);  // ¿Aplica sort o devuelve sorted?
applySortToData();  // ¿A qué datos?
_sort();  // ¿Privado? ¿Público?
```

✅ BIEN:
```javascript
sortManager.toggleSortForColumn(columnKey);  // Claro qué hace
getSortedData(data);  // Devuelve NUEVO array sorted
applySortToData(data, getSortableValue);  // Aplica sort a datos específicos
private _performSort();  // Privado e interno
```

---

## 9. SINGLE SOURCE OF TRUTH

**Un estado NO debe vivir en múltiples lugares**

❌ MAL:
```javascript
// Estado esparcido en 3 lugares:
this.sortManager.sortState  // ← Estado 1
AppState.ui.allTransactionsSortState  // ← Estado 2
window.currentSort  // ← Estado 3

// ¿Cuál es la verdad?
```

✅ BIEN:
```javascript
// UN UNICO LUGAR: SortManager
this.sortManager.getSortState()  // ← UNICA VERDAD

// AppState es COPIA para persistencia:
AppState.ui.sortState = this.sortManager.getSortState();

// Window nunca tiene estado, solo handlers:
window.sortTable_* = (col) => this.sortManager.toggleSort(col);
```

---

## 10. DEFENSIVE PROGRAMMING FOR DATA FLOW

**Validar datos en CADA punto de transición**

❌ MAL:
```javascript
render(data, columns) {
    this.lastData = data;
    this.lastColumns = columns;
    const sorted = this.sortData(data);  // ¿Qué si data es undefined?
    // ...
}

sortData(data) {
    return this.sortManager.applySortToData(data);  // ¿Qué si sortState es []?
}

applySortToData(data) {
    if (this.sortState.length === 0) return data;  // Silenciosamente retorna unsorted
}
```

✅ BIEN:
```javascript
render(data, columns) {
    console.assert(Array.isArray(data), 'render: data must be array');
    console.assert(Array.isArray(columns), 'render: columns must be array');
    
    this.lastData = data;
    this.lastColumns = columns;
    const sorted = this.sortData(data);
    console.assert(Array.isArray(sorted), 'sortData must return array');
}

sortData(data) {
    const sortState = this.sortManager.getSortState();
    console.log(`[sortData] Sorting ${data.length} rows with state:`, sortState);
    return this.sortManager.applySortToData(data);
}

applySortToData(data) {
    if (this.sortState.length === 0) {
        console.debug('[applySortToData] No sort state, returning unsorted data');
        return data;
    }
    console.log(`[applySortToData] Applying ${this.sortState.length} sort rules`);
    return sorted;  // ← resultado del sort
}
```

---

## RESUMEN PARA EL SORTING

### Lo que ESTÁ BIEN actualmente:
1. ✅ SortManager es clase separada (SRP)
2. ✅ Callback en onSortChange (event-driven)
3. ✅ Inmutabilidad en applySortToData (spread operator)

### Lo que FALTA:
1. ❌ Logging insuficiente para debug
2. ❌ Validaciones en boundaries
3. ❌ Estado puede no sincronizarse correctamente

### PRÓXIMAS ACCIONES:
1. Usar los LOGS que agregamos
2. Seguir el flujo en browser console
3. Identificar EXACTAMENTE dónde falla
4. Aplicar fix targeted SOLO en ese punto
