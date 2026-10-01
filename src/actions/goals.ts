"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseMoneyToCents } from "@/lib/money";
import { requireBudget } from "@/lib/services/auth";
import {
  upsertGoalService,
  deleteGoalService,
  autoAssignFromGoalsService,
} from "@/lib/services/goals";
import type { GoalKind } from "@/lib/goals";

const goalSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoría"),
  kind: z.enum(["monthly", "by_date", "balance"]),
  targetAmount: z.string().min(1, "Ingresa un monto objetivo"),
  targetDate: z.string().optional(),
});

export async function upsertGoalAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const { budget } = await requireBudget();
  const raw = Object.fromEntries(formData);
  const parsed = goalSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Datos no válidos" };
  }

  const { categoryId, kind, targetAmount, targetDate } = parsed.data;
  const targetCents = parseMoneyToCents(targetAmount);

  if (targetCents === null || targetCents <= 0) {
    return { ok: false, error: "Ingresa un monto objetivo válido mayor que cero" };
  }

  if (kind === "by_date" && !targetDate) {
    return { ok: false, error: "Las metas para una fecha exigen elegir una fecha límite" };
  }

  try {
    await upsertGoalService(budget.id, categoryId, {
      kind: kind as GoalKind,
      targetCents,
      targetDate: targetDate ? new Date(`${targetDate}T12:00:00.000Z`) : null,
    });
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al guardar la meta" };
  }
}

export async function deleteGoalAction(categoryId: string): Promise<{ ok: boolean; error?: string }> {
  const { budget } = await requireBudget();
  try {
    await deleteGoalService(budget.id, categoryId);
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al eliminar la meta" };
  }
}

export async function autoAssignFromGoalsAction(
  month: string
): Promise<{ ok: boolean; assignedCount?: number; totalCents?: number; error?: string }> {
  const { budget } = await requireBudget();
  try {
    const res = await autoAssignFromGoalsService(budget.id, month);
    revalidatePath("/app", "layout");
    return { ok: true, assignedCount: res.assignedCount, totalCents: res.totalCents };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al auto-asignar fondos" };
  }
}
