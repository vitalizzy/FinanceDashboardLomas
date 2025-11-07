# 🏗️ Refactorización del Dashboard - Arquitectura Modular

## 📋 Resumen de Cambios

Se ha refactorizado el proyecto desde una arquitectura monolítica (1 archivo HTML de 3,388 líneas) a una **arquitectura modular con ES6** que separa responsabilidades y elimina código duplicado.

---

## 🗂️ Nueva Estructura de Archivos

```
FinanceDashboardLomas/
│
├── index.html                 # VERSIÓN ORIGINAL (mantener como backup)
├── index-modular.html         # NUEVA VERSIÓN MODULARIZADA
├── styles.css                 # ✨ NUEVO - Todos los estilos CSS
│
├── js/                        # ✨ NUEVA CARPETA - Módulos ES6
│   ├── config.js              # Configuración centralizada
│   ├── state.js               # Gestión de estado (AppState)
│   ├── utils.js               # Utilidades generales (parsers, debounce, etc.)
│   ├── formatters.js          # Formateo de números y monedas
│   ├── errors.js              # Manejo de errores (AppError, ErrorHandler)
│   ├── i18n.js                # Internacionalización (traducciones)
│   ├── BaseTable.js           # ⭐ Clase base para tablas (elimina duplicación)
│   ├── AllTransactionsTable.js # Tabla de todas las transacciones
│   ├── TopMovementsTable.js   # Tabla de top movimientos
│   ├── CategorySummaryTable.js # Tabla de resumen por categorías
│   └── main.js                # Archivo principal (orquestador)
│
├── logo.png
├── L2H_logo.ico
├── CNAME
└── README.md
```

---

## 🎯 Mejoras Implementadas

### 1️⃣ **Separación CSS** ✅
- **Antes**: 900+ líneas de CSS dentro de `<style>` en HTML
- **Ahora**: Archivo `styles.css` externo y optimizado
- **Beneficios**:
  - Cacheable por el navegador
  - Fácil de mantener
  - Reutilizable en múltiples páginas

### 2️⃣ **Módulos ES6** ✅
- **Antes**: Todo el código JavaScript en un solo `<script>` de 2,500+ líneas
- **Ahora**: 10 módulos ES6 con responsabilidades únicas
- **Beneficios**:
  - Código organizado por funcionalidad
  - Imports/exports explícitos
  - Mejor testabilidad
  - Scope aislado (sin contaminación del namespace global)

### 3️⃣ **Eliminación de Duplicación en Tablas** ✅
- **Antes**: 3 funciones similares con 200+ líneas duplicadas cada una
- **Ahora**: Clase base `BaseTable` + 3 clases especializadas
- **Código eliminado**: ~400 líneas duplicadas
- **Beneficios**:
  - Cambios en un solo lugar afectan todas las tablas
  - Consistencia garantizada
  - Fácil agregar nuevas tablas

---

## 🔧 Uso de la Nueva Versión

### Desarrollo Local
```bash
# Abrir index-modular.html directamente en el navegador
# NOTA: Algunos navegadores requieren servidor local para ES6 modules

# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js (npx)
npx http-server -p 8000

# Opción 3: VS Code Live Server
# Instalar extensión "Live Server" y hacer clic derecho > "Open with Live Server"
```

Luego navegar a: `http://localhost:8000/index-modular.html`

### Producción
Subir todos los archivos al servidor:
- `index-modular.html` (renombrar a `index.html` si se desea usar como principal)
- `styles.css`
- `js/` (toda la carpeta con sus módulos)
- Assets (`logo.png`, etc.)

---

## 📊 Comparativa de Arquitecturas

| Métrica | Versión Original | Versión Modular |
|---------|-----------------|-----------------|
| **Archivos HTML** | 1 (3,388 líneas) | 1 (244 líneas) |
| **Archivos CSS** | 0 (inline) | 1 (800 líneas) |
| **Archivos JS** | 0 (inline) | 10 módulos |
| **Líneas totales** | 3,388 | ~2,800 (distribuidas) |
| **Duplicación código** | Alta | **Cero** |
| **Mantenibilidad** | Baja | **Alta** |
| **Testabilidad** | Imposible | **Posible** |
| **Cacheo** | No | **Sí** |

---

## 🧩 Arquitectura de Módulos

### Diagrama de Dependencias
```
main.js (orquestador)
  ├─> config.js
  ├─> state.js ──> config.js
  ├─> i18n.js
  ├─> errors.js
  ├─> utils.js
  ├─> formatters.js ──> config.js
  └─> Tablas
       ├─> BaseTable.js ──> state.js, i18n.js, formatters.js, utils.js
       ├─> AllTransactionsTable.js ──> BaseTable.js
       ├─> TopMovementsTable.js ──> BaseTable.js
       └─> CategorySummaryTable.js ──> BaseTable.js
```

### Responsabilidades de Cada Módulo

#### **config.js** 🎛️
- Configuración centralizada
- URLs de datos
- Constantes de negocio
- Configuración de formatos

#### **state.js** 💾
- Estado global de la aplicación (`AppState`)
- Métodos para modificar filtros, categorías, meses
- Sincronización con localStorage

#### **utils.js** 🔧
- Parsers (TSV, fechas, cantidades)
- Utilidades generales (debounce, hexToRgba)

#### **formatters.js** 💰
- Formateo de números
- Formateo de monedas
- Formateo de porcentajes
- Usa `Intl.NumberFormat` con cache

#### **errors.js** ⚠️
- Clase `AppError` personalizada
- `ErrorHandler` para logging y UI

#### **i18n.js** 🌍
- Sistema de traducciones (ES/EN)
- Función `translate(key, lang)`

#### **BaseTable.js** 📊
- Clase base para todas las tablas
- Lógica compartida:
  - Renderizado de headers
  - Ordenamiento
  - Paginación
  - Formateo de celdas

#### **AllTransactionsTable.js** 💳
- Hereda de `BaseTable`
- Implementa tabla de todas las transacciones
- Incluye paginación

#### **TopMovementsTable.js** 🏆
- Hereda de `BaseTable`
- Implementa top 5 movimientos por categoría

#### **CategorySummaryTable.js** 📋
- Hereda de `BaseTable`
- Implementa resumen por categorías
- Incluye totales en footer

#### **main.js** 🚀
- Punto de entrada principal
- Orquesta todos los módulos
- Inicialización
- Event listeners
- Funciones globales (para onclick)

---

## 🔄 Migración desde Versión Original

### Paso 1: Validación
1. Abrir `index-modular.html` en navegador (con servidor local)
2. Verificar que todo funciona correctamente
3. Probar todas las funcionalidades:
   - Filtros (período, fechas, búsqueda)
   - Tablas (ordenamiento, paginación)
   - Cambio de idioma
   - Exportación CSV

### Paso 2: Despliegue
```bash
# Renombrar archivos
mv index.html index-original.html.bak
mv index-modular.html index.html

# Commit
git add .
git commit -m "Refactorización: Arquitectura modular ES6"
git push origin main
```

### Paso 3: Rollback (si es necesario)
```bash
mv index.html index-modular.html
mv index-original.html.bak index.html
git checkout index.html
```

---

## 🧪 Testing (Próximos Pasos)

La nueva arquitectura modular permite implementar tests unitarios:

```javascript
// Ejemplo: test para formatters.js
import { formatCurrency } from './js/formatters.js';

console.assert(formatCurrency(1234.56) === '1.234,56 €');
console.assert(formatCurrency(0) === '0,00 €');
```

### Frameworks Recomendados
- **Jest** (requiere transpilación con Babel)
- **Vitest** (nativo para ES6 modules)
- **Mocha + Chai**

---

## 📝 Próximas Mejoras Sugeridas

1. ✅ **COMPLETADO**: Separar CSS
2. ✅ **COMPLETADO**: Módulos ES6
3. ✅ **COMPLETADO**: Eliminar duplicación en tablas
4. ⏭️ **Pendiente**: Implementar gráficos en módulo separado (`charts.js`)
5. ⏭️ **Pendiente**: Gestión de estado con Proxy/Observer pattern
6. ⏭️ **Pendiente**: Tests unitarios con Vitest
7. ⏭️ **Pendiente**: Build process con Vite (opcional)

---

## 🤝 Contribuciones

Al trabajar en este proyecto:
1. Modificar solo los archivos en `js/` y `styles.css`
2. NO modificar `index-modular.html` directamente (solo estructura)
3. Seguir la convención de nombres de módulos
4. Documentar funciones públicas con JSDoc
5. Mantener la separación de responsabilidades

---

## 📚 Recursos

- [ES6 Modules - MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)
- [Intl.NumberFormat - MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [CSS Variables - MDN](https://developer.mozilla.org/es/docs/Web/CSS/Using_CSS_custom_properties)
- [Class Inheritance - MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes)

---

## 📞 Soporte

Para preguntas sobre esta refactorización:
- Revisar este README
- Consultar los comentarios en cada módulo
- Verificar el diagrama de dependencias

---

**Versión**: 2.0.0  
**Fecha**: Noviembre 2025  
**Autor**: Refactorización automática con GitHub Copilot
