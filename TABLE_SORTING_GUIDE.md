# Tabla Ordenamiento - Guía de Comportamiento

## Sistema de Tres Estados

El ordenamiento de columnas en todas las tablas utiliza un sistema de ciclo de tres estados:

### Ciclo de Estados

```
Click 1: Sin Ordenar (⇅) → DESC (↓)
Click 2: DESC (↓) → ASC (↑)
Click 3: ASC (↑) → Sin Ordenar (⇅)
```

### Visualización en Headers

| Estado | Símbolo | Significado |
|--------|---------|------------|
| Sin Ordenar | ⇅ | Columna no está ordenada |
| Descendente | ↓ | Valores de mayor a menor |
| Ascendente | ↑ | Valores de menor a mayor |

## Tablas Afectadas

- ✅ **All Transactions Table** (Todas las transacciones)
- ✅ **Top Movements Table** (Top movimientos por categoría)
- ✅ **Category Summary Table** (Resumen de categorías)

## Comportamiento

### Primer Click
- La columna se ordena **descendentemente (DESC)**
- Símbolo cambia a **↓**

### Segundo Click
- La columna se ordena **ascendentemente (ASC)**
- Símbolo cambia a **↑**

### Tercer Click
- Se **remueve el ordenamiento**
- Símbolo vuelve a **⇅** (sin orden)

## Ordenamiento Múltiple

- Solo se puede ordenar por **una columna a la vez**
- Clicking en una nueva columna reemplaza el ordenamiento anterior
- El estado anterior se limpia

## Tipos de Datos

El ordenamiento se adapta al tipo de datos:

- **Moneda/Currency**: Ordena numéricamente (ignorando símbolos €)
- **Números**: Ordena numéricamente
- **Fechas**: Ordena cronológicamente
- **Texto**: Ordena alfabéticamente (case-insensitive)
- **Porcentajes**: Ordena numéricamente

## Ejemplos

### Ejemplo 1: Ordenar Gastos
```
Sin orden → Click en "Gastos" → ↓ DESC (mayor a menor)
                            → Click → ↑ ASC (menor a mayor)
                            → Click → ⇅ Sin orden
```

### Ejemplo 2: Cambiar de Columna
```
"Gastos" ordenado DESC ↓ → Click en "Categoría"
→ "Gastos" vuelve a ⇅ (sin orden)
→ "Categoría" ahora está DESC ↓
```

## Commit

- `16b9937` - Implement three-state column sorting (DESC → ASC → No Sort)
