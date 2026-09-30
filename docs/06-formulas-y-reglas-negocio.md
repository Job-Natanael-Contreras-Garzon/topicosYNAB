# Fórmulas Matemáticas y Reglas de Negocio

> **Documento de referencia:** Clon de YNAB en Next.js: documentación por módulos  
> **Fecha:** 29 de septiembre de 2026 · @eude  
> **Ubicación en el código:** `src/lib/budget.ts` y `src/lib/loan.ts`  
> **Aclaración clave:** Esta sección es lo que separa un clon funcional y preciso de uno que solo "aparenta" funcionar. Debe implementarse mediante funciones puras y verificarse con pruebas unitarias exhaustivas en Vitest (`budget.test.ts`).

---

## 📐 Notación y Unidades

- $c$: Identificador de una categoría presupuestaria individual.
- $m$: Mes presupuestario analizado en formato canónico `YYYY-MM`.
- $m - 1$: Mes calendario inmediato anterior.
- **Unidades:** Todos los importes están expresados en **centavos enteros** (`amountCents: number / int`). Los gastos son cantidades negativas y los ingresos son cantidades positivas.

---

## 🧮 1. Disponible de una Categoría

El disponible representa los fondos netos utilizables en una categoría durante un mes dado. Los remanentes positivos se arrastran hacia el mes siguiente. Si el mes cerró con sobregasto (saldo negativo), el nuevo mes **arranca en cero ($0$)** y el déficit se absorbe en el cálculo global de *Ready to Assign*.

$$\text{Disp}_c(m) = \max(0,\, \text{Disp}_c(m-1)) + \text{Asig}_c(m) + \text{Act}_c(m)$$

Donde:
- $\text{Asig}_c(m)$: Importe asignado a la categoría $c$ en el mes $m$.
- $\text{Act}_c(m)$: Actividad de la categoría $c$ en el mes $m$, equivalente a la sumatoria de todas las transacciones vinculadas a esa categoría en dicho mes (gastos con signo negativo).

---

## 💰 2. Ready to Assign (Listo para Asignar)

Representa el dinero real disponible en cuentas de presupuesto que aún no ha sido distribuido en sobres de categorías. Corresponde a todos los ingresos no categorizados acumulados históricamente hasta el mes $m$, menos todo lo asignado acumulado, menos la penalización por sobregastos de meses previos:

$$\text{RTA}(m) = \sum_{t \le m} \text{Ingresos}(t) \;-\; \sum_{t \le m} \sum_c \text{Asig}_c(t) \;-\; \sum_{k < m} \sum_c \max(0,\, -\text{Disp}_c(k))$$

---

## ⚖️ 3. Ecuación Maestra de Consistencia (Invariante Contable)

Esta igualdad constituye la prueba unitaria fundamental del sistema (`budget.test.ts`). Debe cumplirse de manera exacta en cualquier mes $m$:

$$\text{RTA}(m) + \sum_c \text{Disp}_c(m) = \sum_{\text{cuentas onBudget}} \text{Saldo}$$

> [!CAUTION]
> Si esta ecuación no se cumple en algún caso de prueba (al aplicar transferencias, transacciones con fecha retroactiva, meses sin actividad o sobregastos intencionales), existe un error lógico en el cálculo de `lib/budget.ts` o en las mutaciones de transacciones de M3.

---

## 🎯 4. Fórmulas de Cálculo para Metas (*Targets*)

### Tipo A: Meta Mensual (*monthly*)
Objetivo de presupuestar una cantidad fija cada mes:
$$\text{Falta}_c(m) = \max(0,\, \text{Meta} - \text{Asig}_c(m))$$

### Tipo B: Meta para una Fecha Límite (*by_date*)
Objetivo de acumular un importe total antes o durante un mes objetivo.
- Sean $n$: número de meses restantes hasta la fecha límite ($n \ge 1$, computando el mes en curso).
- Sea $\text{arrastre} = \max(0,\, \text{Disp}_c(m-1))$.

$$\text{Necesario}_c(m) = \left\lceil \frac{\text{Meta} - \text{arrastre}}{n} \right\rceil$$

$$\text{Falta}_c(m) = \max(0,\, \text{Necesario}_c(m) - \text{Asig}_c(m))$$

### Tipo C: Meta por Saldo Objetivo (*balance*)
Objetivo de mantener en todo momento un colchón disponible de al menos una cifra fija:
$$\text{Falta}_c(m) = \max(0,\, \text{Meta} - \text{Disp}_c(m))$$

### Porcentaje de Progreso Visual de la Meta
$$\text{Progreso}_c(m) = \min\left(1.0,\, \frac{\text{Disp}_c(m)}{\text{Meta}}\right) \times 100\%$$

---

## 📉 5. Simulación de Préstamos y Amortización (`lib/loan.ts`)

- **Tasa mensual:** $r = \frac{\text{APR}}{12 \times 100}$.
- Cada iteración mensual calcula los intereses generados sobre el capital insoluto, aplica la cuota ordinaria más cualquier aporte extraordinario recurrente, y amortiza el saldo.
- La comparación entre el escenario base (sin pago extra) y el escenario acelerado (con pago extra) arroja el diferencial exacto de **meses ahorrados** y **monto de intereses economizados**.

### Implementación Canónica en TypeScript:

```typescript
export interface LoanSimulationResult {
  neverPaid: boolean;
  months?: number;
  interest?: number;
}

export function simulateLoan(
  balance: number,
  apr: number,
  payment: number,
  extra = 0
): LoanSimulationResult {
  const r = apr / 12 / 100;
  let b = balance;
  let months = 0;
  let interest = 0;

  // Si la cuota total no alcanza ni a pagar los intereses mensuales, la deuda es impagable
  if (payment + extra <= b * r) {
    return { neverPaid: true };
  }

  while (b > 0 && months < 1200) { // Límite de seguridad de 100 años (1200 meses)
    const i = Math.round(b * r);
    const pay = Math.min(b + i, payment + extra);
    b = b + i - pay;
    interest += i;
    months++;
  }

  return {
    neverPaid: false,
    months,
    interest
  };
}
```

---

## ⚠️ Reglas Críticas de Negocio que no se Deben Olvidar

1. **Tratamiento de Tarjetas de Crédito:**
   - Un gasto efectuado con tarjeta de crédito se deduce de la categoría correspondiente de la misma forma que un gasto en efectivo.
   - El pago de la tarjeta no es un gasto presupuestario, sino una **transferencia de fondos** entre la cuenta bancaria de origen y la cuenta de pasivo de la tarjeta de crédito.
2. **Reubicación Temporal de Movimientos:**
   - Si el usuario edita la fecha de una transacción y la desplaza a otro mes, toda su actividad contable debe trasladarse automáticamente al nuevo mes sin desbalancear los cierres.
3. **Restricción de Asignación en Meses Históricos:**
   - No permitir asignar dinero en un mes anterior al mes de la primera transacción registrada sin advertir expresamente al usuario.
4. **Exclusiones Conscientes del MVP:**
   - El cálculo de *"Age of Money"* (edad del dinero) y los algoritmos automáticos de plantillas de categorías quedan formalmente postergados para la versión 2.0.
