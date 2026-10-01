import "server-only";
import { db } from "@/lib/db";
import { moveMoney } from "@/lib/budget";

export async function setAssignmentService(
  budgetId: string,
  categoryId: string,
  month: string,
  assignedCents: number
) {
  // Validar pertenencia de la categoría al presupuesto
  const category = await db.category.findFirst({
    where: { id: categoryId, group: { budgetId } },
  });
  if (!category) throw new Error("Categoría no autorizada o no encontrada");

  return db.monthlyAssignment.upsert({
    where: { categoryId_month: { categoryId, month } },
    create: { categoryId, month, assignedCents },
    update: { assignedCents },
  });
}

export async function moveMoneyService(
  budgetId: string,
  fromCategoryId: string,
  toCategoryId: string,
  month: string,
  cents: number
) {
  const [fromCat, toCat] = await Promise.all([
    db.category.findFirst({ where: { id: fromCategoryId, group: { budgetId } } }),
    db.category.findFirst({ where: { id: toCategoryId, group: { budgetId } } }),
  ]);
  if (!fromCat || !toCat) throw new Error("Una o ambas categorías no pertenecen al presupuesto");

  // Valida montos e IDs con la función pura de lib/budget.ts
  const deltas = moveMoney(fromCategoryId, toCategoryId, month, cents);

  return db.$transaction(async (tx) => {
    for (const d of deltas) {
      const current = await tx.monthlyAssignment.findUnique({
        where: { categoryId_month: { categoryId: d.categoryId, month } },
      });
      const newTotal = (current?.assignedCents ?? 0) + d.deltaCents;
      await tx.monthlyAssignment.upsert({
        where: { categoryId_month: { categoryId: d.categoryId, month } },
        create: { categoryId: d.categoryId, month, assignedCents: newTotal },
        update: { assignedCents: newTotal },
      });
    }
  });
}

export async function createCategoryService(budgetId: string, groupId: string, name: string) {
  const group = await db.categoryGroup.findFirst({
    where: { id: groupId, budgetId },
  });
  if (!group) throw new Error("Grupo de categorías no encontrado");

  const lastCategory = await db.category.findFirst({
    where: { groupId },
    orderBy: { sort: "desc" },
    select: { sort: true },
  });
  const sort = (lastCategory?.sort ?? 0) + 1;

  return db.category.create({
    data: {
      groupId,
      name: name.trim(),
      sort,
    },
  });
}

export async function updateCategoryService(
  budgetId: string,
  categoryId: string,
  data: { name?: string; hidden?: boolean }
) {
  const category = await db.category.findFirst({
    where: { id: categoryId, group: { budgetId } },
  });
  if (!category) throw new Error("Categoría no encontrada");

  return db.category.update({
    where: { id: categoryId },
    data: {
      name: data.name !== undefined ? data.name.trim() : undefined,
      hidden: data.hidden !== undefined ? data.hidden : undefined,
    },
  });
}

export async function createCategoryGroupService(budgetId: string, name: string) {
  const lastGroup = await db.categoryGroup.findFirst({
    where: { budgetId },
    orderBy: { sort: "desc" },
    select: { sort: true },
  });
  const sort = (lastGroup?.sort ?? 0) + 1;

  return db.categoryGroup.create({
    data: {
      budgetId,
      name: name.trim(),
      sort,
    },
  });
}

export async function updateCategoryGroupService(
  budgetId: string,
  groupId: string,
  data: { name?: string }
) {
  const group = await db.categoryGroup.findFirst({
    where: { id: groupId, budgetId },
  });
  if (!group) throw new Error("Grupo de categorías no encontrado");

  return db.categoryGroup.update({
    where: { id: groupId },
    data: {
      name: data.name !== undefined ? data.name.trim() : undefined,
    },
  });
}
