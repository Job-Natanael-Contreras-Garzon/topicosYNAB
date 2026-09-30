/**
 * Fórmulas puras del presupuesto base cero (docs/06-formulas-y-reglas-negocio.md).
 * Sin acceso a base de datos: recibe datos planos y devuelve números en centavos.
 *
 *   Disp_c(m) = max(0, Disp_c(m-1)) + Asig_c(m) + Act_c(m)
 *   RTA(m)    = Σ_{t<=m} Ingresos(t) − Σ_{t<=m} Σ_c Asig_c(t) − Σ_{k<m} Σ_c max(0, −Disp_c(k))
 *
 * Invariante: RTA(m) + Σ_c Disp_c(m) = Σ saldos de cuentas de presupuesto (hasta el mes m).
 */
import { monthRange } from "./months";

export interface AssignmentInput {
  categoryId: string;
  month: string; // YYYY-MM
  assignedCents: number;
}

export interface TransactionInput {
  /** Solo cuentan las cuentas de presupuesto; las de seguimiento se ignoran. */
  onBudget: boolean;
  categoryId: string | null;
  month: string; // YYYY-MM
  amountCents: number;
}

export interface BudgetInput {
  categoryIds: string[];
  assignments: AssignmentInput[];
  transactions: TransactionInput[];
}

export interface CategoryMonth {
  assigned: number;
  activity: number;
  available: number;
}

export interface BudgetMonth {
  month: string;
  readyToAssign: number;
  categories: Record<string, CategoryMonth>;
  totals: { assigned: number; activity: number; available: number };
}

/** Primer mes con datos (asignaciones o movimientos), o null si no hay ninguno. */
export function firstMonthWithData(input: BudgetInput): string | null {
  let first: string | null = null;
  for (const a of input.assignments) if (!first || a.month < first) first = a.month;
  for (const t of input.transactions) {
    if (t.onBudget && (!first || t.month < first)) first = t.month;
  }
  return first;
}

/** Calcula el estado completo del presupuesto para el mes `month`. */
export function computeBudget(input: BudgetInput, month: string): BudgetMonth {
  const cats = input.categoryIds;
  const assignedBy = new Map<string, number>(); // `${cat}|${month}`
  const activityBy = new Map<string, number>();
  const incomeBy = new Map<string, number>(); // month -> ingresos sin categoría

  for (const a of input.assignments) {
    const k = `${a.categoryId}|${a.month}`;
    assignedBy.set(k, (assignedBy.get(k) ?? 0) + a.assignedCents);
  }
  for (const t of input.transactions) {
    if (!t.onBudget) continue;
    if (t.categoryId === null) {
      incomeBy.set(t.month, (incomeBy.get(t.month) ?? 0) + t.amountCents);
    } else {
      const k = `${t.categoryId}|${t.month}`;
      activityBy.set(k, (activityBy.get(k) ?? 0) + t.amountCents);
    }
  }

  const start = firstMonthWithData(input);
  const empty = (): BudgetMonth => ({
    month,
    readyToAssign: 0,
    categories: Object.fromEntries(
      cats.map((c) => [c, { assigned: 0, activity: 0, available: 0 }]),
    ),
    totals: { assigned: 0, activity: 0, available: 0 },
  });
  if (!start || month < start) return empty();

  let income = 0;
  let assignedTotal = 0;
  let overspentPenalty = 0; // Σ_{k<m} Σ_c max(0, −Disp_c(k))
  let prevAvail = new Map<string, number>();
  let result: BudgetMonth = empty();

  for (const m of monthRange(start, month)) {
    income += incomeBy.get(m) ?? 0;
    const catState: Record<string, CategoryMonth> = {};
    const curAvail = new Map<string, number>();
    let monthAssigned = 0;
    let monthActivity = 0;
    let monthAvailable = 0;

    for (const c of cats) {
      const assigned = assignedBy.get(`${c}|${m}`) ?? 0;
      const activity = activityBy.get(`${c}|${m}`) ?? 0;
      const carry = Math.max(0, prevAvail.get(c) ?? 0);
      const available = carry + assigned + activity;
      curAvail.set(c, available);
      catState[c] = { assigned, activity, available };
      monthAssigned += assigned;
      monthActivity += activity;
      monthAvailable += available;
    }
    assignedTotal += monthAssigned;

    if (m === month) {
      result = {
        month,
        readyToAssign: income - assignedTotal - overspentPenalty,
        categories: catState,
        totals: {
          assigned: monthAssigned,
          activity: monthActivity,
          available: monthAvailable,
        },
      };
    }
    // El sobregasto de este mes penaliza a Ready to Assign a partir del siguiente.
    for (const v of curAvail.values()) overspentPenalty += Math.max(0, -v);
    prevAvail = curAvail;
  }
  return result;
}

/** Disponible de una categoría en un mes. */
export function available(input: BudgetInput, categoryId: string, month: string): number {
  return computeBudget(input, month).categories[categoryId]?.available ?? 0;
}

/** Ready to Assign en un mes. */
export function readyToAssign(input: BudgetInput, month: string): number {
  return computeBudget(input, month).readyToAssign;
}

/** Saldo de cuentas de presupuesto hasta el mes `month` (para la prueba de consistencia). */
export function onBudgetBalance(input: BudgetInput, month: string): number {
  return input.transactions
    .filter((t) => t.onBudget && t.month <= month)
    .reduce((sum, t) => sum + t.amountCents, 0);
}

export interface AssignmentDelta {
  categoryId: string;
  month: string;
  deltaCents: number;
}

/**
 * Mover dinero entre categorías: resta de la asignación del mes de la categoría origen
 * y suma a la del destino. Ready to Assign no cambia.
 */
export function moveMoney(
  fromCategoryId: string,
  toCategoryId: string,
  month: string,
  cents: number,
): AssignmentDelta[] {
  if (!Number.isInteger(cents) || cents <= 0) throw new Error("El monto debe ser mayor que 0");
  if (fromCategoryId === toCategoryId) throw new Error("Elige dos categorías distintas");
  return [
    { categoryId: fromCategoryId, month, deltaCents: -cents },
    { categoryId: toCategoryId, month, deltaCents: cents },
  ];
}

