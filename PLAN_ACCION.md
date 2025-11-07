# Plan de Acción Detallado - Finance Dashboard Lomas

## 📌 Resumen Ejecutivo

Tu proyecto tiene una **arquitectura excelente** con buena separación de responsabilidades. Las mejoras propuestas se enfocan en:

1. **Robustez** (Testing, validación de datos, manejo de errores)
2. **Experiencia** (Persistencia de estado, UX mejorada)
3. **Seguridad** (Validación, sanitización, CSP)
4. **Performance** (Caching, optimización)

---

## 🚀 PRIMER PASO: Toma Rápida de Decisiones

### ¿Qué implementar primero?

**Opción A (Conservative):** Solo lo crítico
- ✅ Testing (DataService + FilterManager)
- ✅ Validación de datos
- ✅ Manejo de errores mejorado
- ⏱️ Tiempo: ~1 semana

**Opción B (Recomendada):** Crítico + Quick Wins
- ✅ Todo lo de Opción A
- ✅ Persistencia de estado (localStorage)
- ✅ Exportación CSV
- ✅ Seguridad (CSP)
- ⏱️ Tiempo: ~2 semanas

**Opción C (Completa):** Todo incluyendo UX
- ✅ Todo lo de Opción B
- ✅ Dark mode
- ✅ Accesibilidad mejorada
- ✅ Indicadores visuales
- ⏱️ Tiempo: ~4-5 semanas

---

## 📝 IMPLEMENTACIÓN PASO A PASO

### **Fase 1: Setup (1 día)**

#### Paso 1.1: Crear estructura de directorios para pruebas
```bash
mkdir tests
mkdir tests/unit
mkdir tests/integration
```

#### Paso 1.2: Actualizar package.json (si tienes)
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/dom": "^10.0.0",
    "jsdom": "^23.0.0"
  }
}
```

Si NO tienes package.json, crear uno:
```bash
npm init -y
npm install --save-dev vitest @testing-library/dom jsdom
```

#### Paso 1.3: Crear vitest.config.js
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8'
    }
  }
});
```

---

### **Fase 2: Testing (2-3 días)**

#### Paso 2.1: Test para DataService
Archivo: `tests/unit/DataService.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataService } from '../../js/services/DataService.js';

describe('DataService', () => {
    let dataService;

    beforeEach(() => {
        dataService = new DataService({
            dataUrl: 'http://example.com/data.tsv'
        });
    });

    it('should validate TSV structure', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('Invalid\tTSV\nMissing\tColumns')
            })
        );

        await expect(dataService.loadFinancialData()).rejects.toThrow('Columnas faltantes');
    });

    it('should parse valid TSV data', async () => {
        const tsvData = `F. Operativa\tConcepto\tIngresos\tGastos\tCategoría\tSaldo
2025-01-01\tTest\t100\t0\tTest\t1000`;

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve(tsvData)
            })
        );

        const { data } = await dataService.loadFinancialData();
        expect(data).toHaveLength(1);
        expect(data[0].Importe).toBe(100);
        expect(data[0].Tipo).toBe('Ingreso');
    });

    it('should handle network errors', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 404
            })
        );

        await expect(dataService.loadFinancialData()).rejects.toThrow('NETWORK');
    });
});
```

#### Paso 2.2: Test para FilterManager
Archivo: `tests/unit/FilterManager.test.js`

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FilterManager } from '../../js/managers/FilterManager.js';
import { AppState } from '../../js/core/state.js';

describe('FilterManager', () => {
    let filterManager;

    beforeEach(() => {
        // Reset AppState
        AppState.clearCategories(false);
        AppState.clearMonths(false);
        filterManager = new FilterManager();
    });

    it('should toggle category filter', () => {
        filterManager.toggleCategory('Gastos', false);
        expect(AppState.filters.categories.has('Gastos')).toBe(true);

        filterManager.toggleCategory('Gastos', false);
        expect(AppState.filters.categories.has('Gastos')).toBe(false);
    });

    it('should apply pending selections', () => {
        filterManager.toggleCategory('Gastos', true); // pending
        expect(AppState.filters.pendingCategories.has('Gastos')).toBe(true);
        expect(AppState.filters.categories.has('Gastos')).toBe(false);

        filterManager.applyPendingSelections();
        expect(AppState.filters.categories.has('Gastos')).toBe(true);
        expect(AppState.filters.pendingCategories.has('Gastos')).toBe(false);
    });

    it('should clear all filters', () => {
        filterManager.toggleCategory('Gastos', false);
        filterManager.toggleMonth('2025-01', false);
        filterManager.setSearchQuery('test');

        filterManager.clearAllFilters();

        expect(AppState.filters.categories.size).toBe(0);
        expect(AppState.filters.months.size).toBe(0);
        expect(AppState.filters.searchQuery).toBe('');
    });

    it('should detect pending selections', () => {
        expect(filterManager.hasPendingSelections()).toBe(false);

        filterManager.toggleCategory('Gastos', true);
        expect(filterManager.hasPendingSelections()).toBe(true);
    });
});
```

#### Paso 2.3: Ejecutar tests
```bash
npm run test
npm run test:watch  # Para desarrollo
```

---

### **Fase 3: Validación de Datos (1 día)**

#### Paso 3.1: Mejorar DataService.js
```javascript
// Agregar validación al inicio de loadFinancialData()

const REQUIRED_COLUMNS = [
    'F. Operativa',
    'Concepto',
    'Ingresos',
    'Gastos',
    'Categoría',
    'Saldo'
];

async loadFinancialData() {
    const response = await fetch(this.dataUrl);

    if (!response.ok) {
        throw new AppError(
            APP_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
            'NETWORK',
            `HTTP ${response.status}`
        );
    }

    const tsvText = await response.text();
    const lines = tsvText.split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());

    // NUEVA: Validar estructura
    const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
        throw new AppError(
            `Columnas faltantes en TSV: ${missingColumns.join(', ')}`,
            'DATA_VALIDATION',
            'Invalid structure'
        );
    }

    // ... resto del código ...
}
```

---

### **Fase 4: Manejo de Errores (1-2 días)**

#### Paso 4.1: Crear ErrorBanner.js
Archivo: `js/components/feedback/ErrorBanner.js`

[Ver código en EJEMPLOS_IMPLEMENTACION.js, sección 4]

#### Paso 4.2: Crear contenedor en index.html
```html
<!-- Antes de <div id="financial-dashboard"> -->
<div id="error-banner" class="error-banner-container"></div>
```

#### Paso 4.3: Agregar CSS a main.css
[Ver sección 4 de EJEMPLOS_IMPLEMENTACION.js para los estilos]

#### Paso 4.4: Usar en DashboardApp.js
```javascript
import { ErrorBanner } from '../components/feedback/ErrorBanner.js';

export class DashboardApp {
    constructor({
        errorBanner = new ErrorBanner(),
        // ... resto de parámetros ...
    } = {}) {
        this.errorBanner = errorBanner;
        // ...
    }

    async init() {
        try {
            this.loadingOverlay.show();
            // ... código ...
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.errorBanner.show(
                error.message || 'Error desconocido durante la carga',
                'error'
            );
            throw error;
        } finally {
            this.loadingOverlay.hide();
        }
    }
}
```

---

### **Fase 5: Persistencia de Estado (1-2 días)**

#### Paso 5.1: Crear storage.js
Archivo: `js/core/storage.js`

[Ver código en EJEMPLOS_IMPLEMENTACION.js, sección 1]

#### Paso 5.2: Integrar en DashboardApp
```javascript
import { StorageManager } from '../core/storage.js';

export class DashboardApp {
    constructor({
        storageManager = new StorageManager(),
        // ... resto ...
    } = {}) {
        this.storageManager = storageManager;
        // ...
    }

    async init() {
        try {
            this.loadingOverlay.show();

            AppState.loadChartColors();

            // NUEVA: Restaurar estado guardado
            const savedState = this.storageManager.loadState();
            if (savedState) {
                AppState.restoreState(savedState);
                console.log('✅ Estado restaurado del almacenamiento local');
            }

            const { data, lastUpdate } = await this.dataService.loadFinancialData();
            AppState.setFinancialData(data);
            this.lastUpdateBanner.render(lastUpdate);

            this._setupLanguage();
            this._registerUiInteractions();
            this._registerGlobalListeners();

            this.updateDashboard();

            // NUEVA: Guardar estado cada vez que se actualiza
            this.storageManager.saveState(AppState);
        } catch (error) {
            // ...
        }
    }

    updateDashboard() {
        try {
            const filteredData = this.filterManager.getFilteredData();
            AppState.data.filtered = filteredData;

            this.kpiManager.render(filteredData);
            this.chartManager.renderAll(filteredData);
            this.tableManager.renderAll(filteredData);
            this.filterPanel.render();

            // NUEVA: Guardar estado en localStorage
            this.storageManager.saveState(AppState);
        } catch (error) {
            console.error('❌ Dashboard update error:', error);
            ErrorHandler.handle(error);
        }
    }

    handleClearAllFilters() {
        this.filterManager.clearAllFilters();
        this._resetFilterInputs();
        this.filterPanel.hidePendingControls();
        
        // NUEVA: Limpiar almacenamiento
        this.storageManager.clear();
        
        this.updateDashboard();
    }
}
```

#### Paso 5.3: Agregar método a AppState
```javascript
// En js/core/state.js, agregar:

export class AppState {
    // ... código existente ...

    static restoreState(savedState) {
        if (!savedState) return;

        AppState.filters.current = savedState.filters.current;
        AppState.filters.dateRange = { ...savedState.filters.dateRange };
        AppState.filters.categories = new Set(savedState.filters.categories);
        AppState.filters.months = new Set(savedState.filters.months);
        AppState.filters.searchQuery = savedState.filters.searchQuery;
        AppState.sortOrders = new Map(savedState.sortOrders);
    }
}
```

---

### **Fase 6: Exportación CSV (1 día)**

#### Paso 6.1: Crear csvExport.js
Archivo: `js/core/csvExport.js`

[Ver código en EJEMPLOS_IMPLEMENTACION.js, sección 5]

#### Paso 6.2: Actualizar globalActions.js
```javascript
import { CSVExporter } from '../core/csvExport.js';

export function registerGlobalActions(dashboardApp) {
    // ... código existente ...

    window.handleExportToCSV = () => {
        const fileName = `transacciones-${new Date().toISOString().split('T')[0]}.csv`;
        CSVExporter.exportDataToCSV(
            AppState.data.filtered,
            ['F. Operativa', 'Concepto', 'Importe', 'Categoría', 'Tipo'],
            fileName
        );
        console.log('✅ Datos exportados a CSV');
    };
}
```

#### Paso 6.3: Actualizar botón en index.html
```html
<button 
    class="btn"
    onclick="handleExportToCSV()"
    aria-label="Descargar transacciones en formato CSV"
>
    📥 Exportar CSV
</button>
```

---

### **Fase 7: Seguridad - CSP (1 hora)**

#### Paso 7.1: Actualizar index.html
```html
<meta 
    http-equiv="Content-Security-Policy" 
    content="
        default-src 'self';
        script-src 'self' https://cdn.jsdelivr.net;
        style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' https://docs.google.com https://cdn.jsdelivr.net;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
    "
>
```

---

### **Fase 8: Performance - Memoización (1 día)**

#### Paso 8.1: Agregar caché a FilterManager
[Ver código en EJEMPLOS_IMPLEMENTACION.js, sección 3]

#### Paso 8.2: Invalidar caché en métodos de modificación
```javascript
export class FilterManager {
    // ... código ...

    toggleCategory(category, isPending = false) {
        this.state.toggleCategory(category, isPending);
        this.clearCache(); // Invalidar
    }

    toggleMonth(month, isPending = false) {
        this.state.toggleMonth(month, isPending);
        this.clearCache();
    }

    setDateRange(start, end) {
        this.state.setDateRange(start, end);
        this.clearCache();
    }

    setSearchQuery(query) {
        this.state.setSearchQuery(query);
        this.clearCache();
    }
}
```

---

## 📅 Cronograma Propuesto

```
Semana 1:
- Lunes:    Fases 1-2 (Setup + Testing)
- Martes:   Fase 3 (Validación)
- Miércoles: Fase 4 (Errores)
- Jueves:   Fase 5 (Persistencia)
- Viernes:  Fase 6 (CSV)

Semana 2:
- Lunes:    Fase 7 (Seguridad)
- Martes:   Fase 8 (Performance)
- Miércoles-Viernes: Testing completo + bugfixes

Luego:
- Dark mode
- Accesibilidad completa
- TypeScript migration (opcional)
```

---

## ✅ Checklist de Validación

Después de cada fase, verificar:

- [ ] Tests pasan (si aplica)
- [ ] No hay errores en consola
- [ ] Funcionalidad no se rompió
- [ ] Cambios documentados en README.md
- [ ] Commit a git con mensaje descriptivo

---

## 🎯 Métricas de Éxito

| Métrica | Baseline | Meta |
|---------|----------|------|
| Tests coverage | 0% | >80% |
| Errores en consola | Varios | 0 |
| Tiempo carga datos | ~2s | <1.5s (con memoización) |
| Tamaño bundle JS | ~150KB | <150KB |
| Lighthouse score | ~75 | >85 |

---

## 🤔 Preguntas Frecuentes

### ¿Puedo hacer todo a la vez?
No recomendado. Mejor en fases. Permite validar y recibir feedback.

### ¿Necesito todos los tests?
Mínimo: DataService + FilterManager. Puedes agregar más después.

### ¿Es importante localStorage?
Sí. Mejora mucho la UX. Los usuarios no pierden filtros al recargar.

### ¿TypeScript es necesario?
No. JavaScript funciona bien. TypeScript es "nice-to-have" para proyectos más grandes.

### ¿Cuándo agregar Dark Mode?
Después de las fases 1-5. Es UX bonus, no crítico.

---

## 📚 Recursos Útiles

- Vitest docs: https://vitest.dev
- ARIA authoring: https://www.w3.org/WAI/ARIA/apg/
- CSP guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- Performance tips: https://web.dev/performance/
- Chart.js docs: https://www.chartjs.org

---

## 💬 Próximos Pasos

1. **Revisar este plan** con el equipo
2. **Priorizar fases** según urgencia
3. **Crear issues/tasks** en GitHub/GitLab
4. **Comenzar con Fase 1** esta semana

¿Alguna pregunta o quieres que profundice en alguna sección?
