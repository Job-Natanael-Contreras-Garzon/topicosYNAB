/**
 * Lógica matemática de metas (Targets) de acuerdo a docs/06-formulas-y-reglas-negocio.md.
 * Funciones puras sin dependencias de base de datos.
 */

export type GoalKind = "monthly" | "by_date" | "balance";

export interface GoalInput {
  kind: GoalKind;
  targetCents: number;
  targetDate?: Date | string | null;
}

export interface GoalEvaluation {
  kind: GoalKind;
  targetCents: number;
  neededThisMonth: number;
  underfundedCents: number;
  progressPercent: number;
  targetDateStr?: string | null;
  isFunded: boolean;
}

/** Calcula los meses restantes entre el mes activo (YYYY-MM) y la fecha límite (mínimo 1). */
export function remainingMonths(currentMonthStr: string, targetDate: Date | string): number {
  const [curY, curM] = currentMonthStr.split("-").map(Number);
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const tarY = target.getUTCFullYear();
  const tarM = target.getUTCMonth() + 1;

  const diff = (tarY - curY) * 12 + (tarM - curM) + 1;
  return Math.max(1, diff);
}

/**
 * Evalúa el estado de una meta para un mes presupuestario dado.
 * @param goal Datos de la meta (tipo, objetivo, fecha)
 * @param assignedCents Monto asignado a la categoría en este mes
 * @param availableCents Saldo disponible de la categoría en este mes
 * @param previousCarryOver Saldo disponible arrastrado del mes anterior (max(0, Disp(m-1)))
 * @param currentMonthStr Mes presupuestario YYYY-MM
 */
export function evaluateGoal(
  goal: GoalInput,
  assignedCents: number,
  availableCents: number,
  previousCarryOver: number,
  currentMonthStr: string
): GoalEvaluation {
  const target = Math.max(0, goal.targetCents);
  let neededThisMonth = 0;
  let underfunded = 0;

  if (target === 0) {
    return {
      kind: goal.kind,
      targetCents: 0,
      neededThisMonth: 0,
      underfundedCents: 0,
      progressPercent: 100,
      isFunded: true,
    };
  }

  const targetDateStr = goal.targetDate
    ? typeof goal.targetDate === "string"
      ? goal.targetDate.split("T")[0]
      : goal.targetDate.toISOString().split("T")[0]
    : null;

  switch (goal.kind) {
    case "monthly": {
      neededThisMonth = target;
      underfunded = Math.max(0, target - assignedCents);
      break;
    }
    case "by_date": {
      if (!goal.targetDate) {
        neededThisMonth = target;
        underfunded = Math.max(0, target - assignedCents);
      } else {
        const n = remainingMonths(currentMonthStr, goal.targetDate);
        const carry = Math.max(0, previousCarryOver);
        const remainingToSave = Math.max(0, target - carry);
        neededThisMonth = Math.ceil(remainingToSave / n);
        underfunded = Math.max(0, neededThisMonth - assignedCents);
      }
      break;
    }
    case "balance": {
      neededThisMonth = target;
      underfunded = Math.max(0, target - availableCents);
      break;
    }
  }

  // Progreso visual: porcentaje de saldo disponible sobre la meta
  const ratio = target > 0 ? Math.min(1, Math.max(0, availableCents) / target) : 1;
  const progressPercent = Math.round(ratio * 100);
  const isFunded = underfunded === 0;

  return {
    kind: goal.kind,
    targetCents: target,
    neededThisMonth,
    underfundedCents: underfunded,
    progressPercent,
    targetDateStr,
    isFunded,
  };
}
