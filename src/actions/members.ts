"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireBudget } from "@/lib/services/auth";
import { addBudgetMemberService, removeBudgetMemberService } from "@/lib/services/members";

export interface MemberActionState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const inviteSchema = z.object({
  email: z.string().trim().email("Ingresa un correo electrónico válido"),
});

export async function inviteMemberAction(
  _prev: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const { user, budget, isOwner } = await requireBudget();

  if (!isOwner) {
    return { error: "Solo el propietario puede invitar nuevos miembros" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = inviteSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: {
        email: parsed.error.issues[0]?.message || "Correo inválido",
      },
    };
  }

  try {
    await addBudgetMemberService({
      budgetId: budget.id,
      currentUserId: user.id,
      email: parsed.data.email,
    });

    revalidatePath("/app/ajustes");
    revalidatePath("/app/ajustes/miembros");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message || "Error al invitar al colaborador" };
  }
}

export async function removeMemberAction(memberId: string): Promise<{ ok: boolean; error?: string }> {
  const { user, budget, isOwner } = await requireBudget();

  if (!isOwner) {
    return { ok: false, error: "Solo el propietario puede revocar colaboradores" };
  }

  try {
    await removeBudgetMemberService({
      budgetId: budget.id,
      currentUserId: user.id,
      memberId,
    });

    revalidatePath("/app/ajustes");
    revalidatePath("/app/ajustes/miembros");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al revocar colaborador" };
  }
}
