"use server";

import { revalidatePath } from "next/cache";
import { parseMoneyToCents } from "@/lib/money";
import { requireBudget } from "@/lib/services/auth";
import {
  setAssignmentService,
  moveMoneyService,
  createCategoryService,
  updateCategoryService,
  createCategoryGroupService,
  updateCategoryGroupService,
} from "@/lib/services/categories";

export async function setAssignmentAction(
  categoryId: string,
  month: string,
  cents: number
): Promise<{ ok: boolean; error?: string }> {
  const { budget } = await requireBudget();
  try {
    await setAssignmentService(budget.id, categoryId, month, Math.round(cents));
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al actualizar asignación" };
  }
}

export async function moveMoneyAction(
  fromCategoryId: string,
  toCategoryId: string,
  month: string,
  amount: string | number
): Promise<{ ok: boolean; error?: string }> {
  const { budget } = await requireBudget();

  const cents = typeof amount === "number" ? Math.round(amount) : parseMoneyToCents(amount);
  if (cents === null || cents <= 0) {
    return { ok: false, error: "Ingresa un monto válido mayor que cero" };
  }

  try {
    await moveMoneyService(budget.id, fromCategoryId, toCategoryId, month, cents);
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al mover dinero" };
  }
}

export async function createCategoryAction(
  groupId: string,
  name: string
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const { budget } = await requireBudget();
  if (!name.trim()) return { ok: false, error: "Escribe el nombre de la categoría" };

  try {
    const created = await createCategoryService(budget.id, groupId, name);
    revalidatePath("/app", "layout");
    return { ok: true, id: created.id };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al crear categoría" };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  data: { name?: string; hidden?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  const { budget } = await requireBudget();
  try {
    await updateCategoryService(budget.id, categoryId, data);
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al actualizar categoría" };
  }
}

export async function createCategoryGroupAction(
  name: string
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const { budget } = await requireBudget();
  if (!name.trim()) return { ok: false, error: "Escribe el nombre del grupo" };

  try {
    const created = await createCategoryGroupService(budget.id, name);
    revalidatePath("/app", "layout");
    return { ok: true, id: created.id };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al crear grupo" };
  }
}

export async function updateCategoryGroupAction(
  groupId: string,
  name: string
): Promise<{ ok: boolean; error?: string }> {
  const { budget } = await requireBudget();
  if (!name.trim()) return { ok: false, error: "El nombre no puede estar vacío" };

  try {
    await updateCategoryGroupService(budget.id, groupId, { name });
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al actualizar grupo" };
  }
}
