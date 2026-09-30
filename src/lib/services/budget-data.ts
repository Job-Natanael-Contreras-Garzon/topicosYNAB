import "server-only";
import { db } from "@/lib/db";
import { computeBudget, type BudgetInput } from "@/lib/budget";
import { monthOf } from "@/lib/months";

/** Carga los datos planos del presupuesto y delega el cálculo a lib/budget.ts (funciones puras). */
export async function loadBudgetInput(budgetId: string) {
  const groups = await db.categoryGroup.findMany({
    where: { budgetId },
    orderBy: { sort: "asc" },
    include: { categories: { orderBy: { sort: "asc" } } },
  });
  const categoryIds = groups.flatMap((g) => g.categories.map((c) => c.id));

  const [assignments, transactions] = await Promise.all([
    db.monthlyAssignment.findMany({
      where: { category: { group: { budgetId } } },
      select: { categoryId: true, month: true, assignedCents: true },
    }),
    db.transaction.findMany({
      where: { account: { budgetId } }, // incluye cuentas cerradas: su historial se conserva
      select: { categoryId: true, date: true, amountCents: true, account: { select: { onBudget: true } } },
    }),
  ]);

  const input: BudgetInput = {
    categoryIds,
    assignments,
    transactions: transactions.map((t) => ({
      onBudget: t.account.onBudget,
      categoryId: t.categoryId,
      month: monthOf(t.date),
      amountCents: t.amountCents,
    })),
  };
  return { groups, input };
}

export async function getBudgetMonth(budgetId: string, month: string) {
  const { groups, input } = await loadBudgetInput(budgetId);
  return { groups, budget: computeBudget(input, month) };
}
