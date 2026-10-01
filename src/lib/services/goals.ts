import "server-only";
import { db } from "@/lib/db";
import { evaluateGoal, type GoalKind } from "@/lib/goals";
import { loadBudgetInput } from "./budget-data";
import { computeBudget } from "@/lib/budget";
import { prevMonth } from "@/lib/months";

export async function upsertGoalService(
  budgetId: string,
  categoryId: string,
  data: {
    kind: GoalKind;
    targetCents: number;
    targetDate?: Date | null;
  }
) {
  const category = await db.category.findFirst({
    where: { id: categoryId, group: { budgetId } },
  });
  if (!category) throw new Error("Categoría no autorizada o no encontrada");

  return db.goal.upsert({
    where: { categoryId },
    create: {
      categoryId,
      kind: data.kind,
      targetCents: Math.round(data.targetCents),
      targetDate: data.targetDate ?? null,
    },
    update: {
      kind: data.kind,
      targetCents: Math.round(data.targetCents),
      targetDate: data.targetDate ?? null,
    },
  });
}

export async function deleteGoalService(budgetId: string, categoryId: string) {
  const category = await db.category.findFirst({
    where: { id: categoryId, group: { budgetId } },
  });
  if (!category) throw new Error("Categoría no encontrada");

  return db.goal.deleteMany({
    where: { categoryId },
  });
}

/** Obtiene todas las metas del presupuesto junto con su evaluación para un mes dado. */
export async function getEvaluatedGoalsForMonth(budgetId: string, month: string) {
  const [goals, { input }] = await Promise.all([
    db.goal.findMany({
      where: { category: { group: { budgetId } } },
      include: { category: { select: { id: true, name: true, groupId: true } } },
    }),
    loadBudgetInput(budgetId),
  ]);

  const pMonth = prevMonth(month);
  const currentBudget = computeBudget(input, month);
  const prevBudget = computeBudget(input, pMonth);

  return goals.map((g) => {
    const assigned = currentBudget.categories[g.categoryId]?.assigned ?? 0;
    const available = currentBudget.categories[g.categoryId]?.available ?? 0;
    const prevAvailable = prevBudget.categories[g.categoryId]?.available ?? 0;

    const evaluation = evaluateGoal(
      {
        kind: g.kind as GoalKind,
        targetCents: g.targetCents,
        targetDate: g.targetDate,
      },
      assigned,
      available,
      prevAvailable,
      month
    );

    return {
      ...g,
      evaluation,
    };
  });
}

/** Asignar automáticamente lo que falta a todas las categorías con meta descubierta en el mes. */
export async function autoAssignFromGoalsService(budgetId: string, month: string) {
  const evaluated = await getEvaluatedGoalsForMonth(budgetId, month);
  const needingFunds = evaluated.filter((g) => g.evaluation.underfundedCents > 0);

  if (needingFunds.length === 0) return { assignedCount: 0, totalCents: 0 };

  let totalCents = 0;

  await db.$transaction(async (tx) => {
    for (const item of needingFunds) {
      const current = await tx.monthlyAssignment.findUnique({
        where: { categoryId_month: { categoryId: item.categoryId, month } },
      });
      const currentAssigned = current?.assignedCents ?? 0;
      const needed = item.evaluation.underfundedCents;
      const newAssigned = currentAssigned + needed;

      await tx.monthlyAssignment.upsert({
        where: { categoryId_month: { categoryId: item.categoryId, month } },
        create: { categoryId: item.categoryId, month, assignedCents: newAssigned },
        update: { assignedCents: newAssigned },
      });

      totalCents += needed;
    }
  });

  return { assignedCount: needingFunds.length, totalCents };
}
