"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseMoneyToCents } from "@/lib/money";
import { requireBudget } from "@/lib/services/auth";
import { closeAccountById, createAccountWithOpeningBalance } from "@/lib/services/accounts";

export interface AccountFormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "type" | "balance", string>>;
}

const schema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre a la cuenta").max(60),
  type: z.enum(["checking", "savings", "cash", "credit", "tracking"]),
  balance: z.string().trim(),
});

export async function createAccount(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const { budget } = await requireBudget();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fe: NonNullable<AccountFormState["fieldErrors"]> = {};
    for (const i of parsed.error.issues) fe[i.path[0] as "name" | "type" | "balance"] ??= i.message;
    return { fieldErrors: fe };
  }
  const { name, type, balance } = parsed.data;
  const openingCents = balance === "" ? 0 : parseMoneyToCents(balance);
  if (openingCents === null) return { fieldErrors: { balance: "Escribe un monto válido, por ejemplo 1000" } };

  await createAccountWithOpeningBalance({ budgetId: budget.id, name, type, openingCents });
  revalidatePath("/app", "layout");
  return { ok: true };
}

export async function closeAccount(accountId: string) {
  const { budget } = await requireBudget();
  const ok = await closeAccountById(budget.id, accountId);
  revalidatePath("/app", "layout");
  return { ok };
}
