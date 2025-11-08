# Sistema de Ordenamiento - Diagramas Visuales

## 📊 Flujo de Ciclo de Tres Estados

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         CICLO DE TRES ESTADOS POR COLUMNA             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

        ┌─────────────────────────┐
        │   1. SIN ORDENAR        │
        │   Símbolo: ⇅            │
        │   Colores: Gris         │
        └────────────┬────────────┘
                     │
                   CLICK
                     │
                     ↓
        ┌─────────────────────────┐
        │   2. DESC (Mayor/Mayor) │
        │   Símbolo: ↓            │
        │   Colores: Verde        │
        └────────────┬────────────┘
                     │
                   CLICK
                     │
                     ↓
        ┌─────────────────────────┐
        │   3. ASC (Menor/Menor)  │
        │   Símbolo: ↑            │
        │   Colores: Azul         │
        └────────────┬────────────┘
                     │
                   CLICK
                     │
                     ↓
        ┌─────────────────────────┐
        │   1. SIN ORDENAR        │
        │   (Ciclo se repite)     │
        └─────────────────────────┘
```

---

## 🎯 Flujo de Control en sort()

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Usuario hace CLICK en columna "X"                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                        │
                        ↓
            ¿"X" existe en sortState?
                        │
        ┌───────────────┼───────────────┐
        │               │               │
       NO              SÍ
        │               │
        ↓               ↓
    AGREGAR        ¿Dirección actual?
    Nueva entrada:     │
    {               ┌──┴──┐
      key: "X"      │     │
      dir: "desc"   DESC  ASC
    }               │     │
        │           ↓     ↓
        │       CAMBIAR  REMOVER
        │       a "asc"  del array
        │           │     │
        └───┬───────┴─────┴───┬───┐
            │                 │
            ↓                 ↓
    Actualizar    Re-renderizar tabla
    sortState     (resetVisibleRows)
            │                 │
            └─────────┬───────┘
                      ↓
            ┏━━━━━━━━━━━━━━━━━┓
            ┃  FIN - Tabla    ┃
            ┃  ordenada       ┃
            ┗━━━━━━━━━━━━━━━━━┛
```

---

## 🔗 Flujo de Múltiples Ordenamientos

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ESCENARIO: Usuario ordena múltiples columnas         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

PASO 1: Click en "Categoría"
────────────────────────────
  sortState ANTES:  []
  
  Usuario CLICK → sort("categoria")
  
  sortState DESPUÉS: [
    { key: "categoria", direction: "desc" }
  ]
  
  Renderizado: "Categoría" ↓


PASO 2: Click en "Monto"
────────────────────────
  sortState ANTES:  [
    { key: "categoria", direction: "desc" }
  ]
  
  Usuario CLICK → sort("monto")
  
  sortState DESPUÉS: [
    { key: "categoria", direction: "desc" },    ← [1]
    { key: "monto", direction: "desc" }         ← [2] NUEVA
  ]
  
  Renderizado: "Categoría" ↓ [1]    "Monto" ↓ [2]


PASO 3: Click de nuevo en "Monto"
─────────────────────────────────
  sortState ANTES:  [
    { key: "categoria", direction: "desc" },
    { key: "monto", direction: "desc" }
  ]
  
  Usuario CLICK → sort("monto")
  
  "Monto" CAMBIA: desc → asc
  
  sortState DESPUÉS: [
    { key: "categoria", direction: "desc" },    ← [1]
    { key: "monto", direction: "asc" }          ← [2] MODIFICADO
  ]
  
  Renderizado: "Categoría" ↓ [1]    "Monto" ↑ [2]


PASO 4: Click de nuevo en "Monto"
─────────────────────────────────
  sortState ANTES:  [
    { key: "categoria", direction: "desc" },
    { key: "monto", direction: "asc" }
  ]
  
  Usuario CLICK → sort("monto")
  
  "Monto" con ASC → REMOVER
  
  sortState DESPUÉS: [
    { key: "categoria", direction: "desc" }    ← [1] AHORA ÚNICA
  ]
  
  Renderizado: "Categoría" ↓    "Monto" ⇅
```

---

## 🧮 Flujo de sortData() - Ordenamiento en Cascada

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  DATOS DE ENTRADA (Unsorted)                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Fila 1: { categoria: "Alquiler",   monto: 1500,  fecha: "01/01" }
Fila 2: { categoria: "Comida",     monto: 300,   fecha: "02/01" }
Fila 3: { categoria: "Alquiler",   monto: 800,   fecha: "03/01" }
Fila 4: { categoria: "Comida",     monto: 500,   fecha: "01/01" }

sortState: [
  { key: "categoria", direction: "desc" },
  { key: "monto", direction: "asc" }
]

┌─────────────────────────────────────────────────────────┐
│  PASO 1: Comparar por CATEGORÍA (Prioridad 1)          │
│          Dirección: DESC (Mayor a Menor alfabético)    │
└─────────────────────────────────────────────────────────┘

  Orden después de Paso 1:
  
  Fila 2: { categoria: "Comida",     monto: 300,   ... }
  Fila 4: { categoria: "Comida",     monto: 500,   ... }
  Fila 1: { categoria: "Alquiler",   monto: 1500,  ... }
  Fila 3: { categoria: "Alquiler",   monto: 800,   ... }

┌─────────────────────────────────────────────────────────┐
│  PASO 2: Para filas con MISMA CATEGORÍA,               │
│          comparar por MONTO (Prioridad 2)              │
│          Dirección: ASC (Menor a Mayor)                │
└─────────────────────────────────────────────────────────┘

  Dentro "Comida": { 300, 500 } → { 300, 500 } (ya está bien)
  Dentro "Alquiler": { 1500, 800 } → { 800, 1500 } (se reordena)

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  RESULTADO FINAL (Sorted)                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Fila 2: { categoria: "Comida",     monto: 300,   ... }  ← Comida, menor monto
Fila 4: { categoria: "Comida",     monto: 500,   ... }  ← Comida, mayor monto
Fila 3: { categoria: "Alquiler",   monto: 800,   ... }  ← Alquiler, menor monto
Fila 1: { categoria: "Alquiler",   monto: 1500,  ... }  ← Alquiler, mayor monto
```

---

## 🎨 Estado Visual en Header

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  HEADER DE TABLA CON DIFERENTES ESTADOS              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌───────────────────────────────────────────────────────┐
│ Categoría    │ Fecha      │ Monto      │ Descripción │
│ (sin orden)  │ (sin orden)│ (DESC [1]) │ (sin orden) │
│      ⇅       │     ⇅      │    ↓       │      ⇅      │
└───────────────────────────────────────────────────────┘

Color de fondo del header:
  ⇅ = Gris (sin ordenar)
  ↓ = Verde oscuro (DESC) + Badge verde
  ↑ = Azul oscuro (ASC) + Badge azul


┌───────────────────────────────────────────────────────┐
│ Categoría    │ Fecha      │ Monto      │ Descripción │
│ (DESC [1])   │ (ASC [2])  │ (DESC [3]) │ (sin orden) │
│      ↓       │     ↑      │    ↓       │      ⇅      │
│     [1]      │    [2]     │   [3]      │            │
└───────────────────────────────────────────────────────┘

Las columnas se ordenan EN ORDEN DE PRIORIDAD:
1. Primero por Categoría (DESC)
2. Dentro de cada categoría, por Fecha (ASC)
3. Dentro de cada fecha, por Monto (DESC)
```

---

## 📈 Comparación Antes vs Después

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  COMPORTAMIENTO ANTERIOR                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

sortState ANTES: [
  { key: "categoria", direction: "desc" }
]

Click en "Monto"
  ↓
sortState DESPUÉS: [
  { key: "monto", direction: "desc" }    ← "categoria" se REEMPLAZÓ
]

PROBLEMA: Solo una columna a la vez
          Usuario pierde el ordenamiento anterior


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  COMPORTAMIENTO NUEVO                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

sortState ANTES: [
  { key: "categoria", direction: "desc" }
]

Click en "Monto"
  ↓
sortState DESPUÉS: [
  { key: "categoria", direction: "desc" },   ← "categoria" MANTIENE
  { key: "monto", direction: "desc" }        ← "monto" se AGREGA
]

VENTAJA: Múltiples ordenamientos simultáneos
         Se añaden/modifican en cascada
         Usuario tiene mayor control
```

---

## 🧪 Árbol de Decisión para Usuarios

```
┌─ ¿Quiero ordenar una columna?
│
├─ CASO 1: Columna sin ordenamiento
│  │
│  ├─ CLICK 1 → Aparece ↓ DESC
│  │           (ordenado: mayor a menor)
│  │
│  ├─ CLICK 2 → Cambia ↑ ASC
│  │           (ordenado: menor a mayor)
│  │
│  └─ CLICK 3 → Vuelve ⇅
│              (sin ordenamiento)
│
│
├─ CASO 2: Ya tengo una columna ordenada, quiero agregar otra
│  │
│  ├─ (Primera columna sigue con su orden)
│  │
│  ├─ CLICK en segunda columna
│  │ │
│  │ └─ Aparece ↓ [2] junto a la primera [1]
│  │   (datos ordenados por ambas: primero col1, luego col2)
│  │
│  └─ Puedo seguir agregando más columnas [3], [4]...
│
│
└─ CASO 3: Tengo múltiples ordenamientos, quiero cambiar uno
   │
   ├─ CLICK en columna con [2]↓
   │ │
   │ ├─ CLICK 1 → Cambia a ↑ [2]
   │ │           (la columna 1 sigue igual)
   │ │
   │ └─ CLICK 2 → Se remueve [2]
   │             (si hay más, se renumeran: [2]→[1])
   │
   └─ (Otras columnas no se afectan)
```

---

## 📊 Ejemplo Práctico Completo

```
ESCENARIO: Análisis de gastos por categoría y mes

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  DATOS ORIGINALES (Sin orden)                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Categoría      Fecha       Monto    Descripción
Alquiler       01/11/2024  1500     Renta mensual
Comida         15/11/2024  200      Supermercado
Alquiler       15/11/2024  100      Depósito
Comida         01/11/2024  450      Restaurante
Transporte     10/11/2024  80       Gasolina
Comida         20/11/2024  150      Café


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  USUARIO HACE:  Click "Categoría"                     ┃
┃  sortState: [{ key: "categoria", direction: "desc"}]  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Resultado: Ordenado por categoría DESC (Z→A)

Transporte     10/11/2024  80       Gasolina
Comida         15/11/2024  200      Supermercado
Comida         01/11/2024  450      Restaurante
Comida         20/11/2024  150      Café
Alquiler       01/11/2024  1500     Renta mensual
Alquiler       15/11/2024  100      Depósito


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  USUARIO HACE: Click "Fecha"                          ┃
┃  sortState: [                                          ┃
┃    { key: "categoria", direction: "desc" },           ┃
┃    { key: "fecha", direction: "desc" }                ┃
┃  ]                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Resultado: Primero por categoría, luego por fecha descendente

Transporte     10/11/2024  80       Gasolina
Comida         20/11/2024  150      Café
Comida         15/11/2024  200      Supermercado
Comida         01/11/2024  450      Restaurante
Alquiler       01/11/2024  1500     Renta mensual
Alquiler       15/11/2024  100      Depósito


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  USUARIO HACE: Click "Fecha" otra vez                 ┃
┃  sortState: [                                          ┃
┃    { key: "categoria", direction: "desc" },           ┃
┃    { key: "fecha", direction: "asc" }                 ┃
┃  ]                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Resultado: Por categoría, luego por fecha ascendente

Transporte     10/11/2024  80       Gasolina
Comida         01/11/2024  450      Restaurante
Comida         15/11/2024  200      Supermercado
Comida         20/11/2024  150      Café
Alquiler       15/11/2024  100      Depósito
Alquiler       01/11/2024  1500     Renta mensual
```

---

## ✅ Checklist de Implementación

```
✓ Ciclo de tres estados por columna
✓ Múltiples columnas simultaneas
✓ Prioridades visuales con badges
✓ Ordenamiento en cascada
✓ Soporte múltiples tipos de datos
✓ Actualización visual del header
✓ Rendimiento optimizado
✓ Documentación completa
✓ Ejemplos de uso
✓ Guía de troubleshooting
```
