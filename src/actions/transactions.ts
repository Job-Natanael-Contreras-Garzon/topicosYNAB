"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseMoneyToCents } from "@/lib/money";
import { requireBudget } from "@/lib/services/auth";
import {
  createTransactionService,
  createTransferService,
  updateTransactionService,
  deleteTransactionService,
  approveTransactionsService,
  importTransactionsService,
} from "@/lib/services/transactions";

export interface TransactionFormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const baseTransactionSchema = z.object({
  accountId: z.string().min(1, "Selecciona una cuenta"),
  kind: z.enum(["expense", "income"]),
  amount: z.string().min(1, "Ingresa un monto"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  payee: z.string().trim().min(1, "Escribe el beneficiario o pagador"),
  memo: z.string().trim().optional(),
  categoryId: z.string().optional(),
  cleared: z.preprocess((val) => val === "true" || val === "on" || val === true, z.boolean()),
});

export async function createTransactionAction(
  _prev: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const { budget } = await requireBudget();
  const raw = Object.fromEntries(formData);
  const parsed = baseTransactionSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const { accountId, kind, amount, date, payee, memo, categoryId, cleared } = parsed.data;

  // Un gasto exige obligatoriamente categoría (regla de M3)
  if (kind === "expense" && (!categoryId || categoryId === "none" || categoryId === "")) {
    return { fieldErrors: { categoryId: "Los gastos exigen asignar una categoría" } };
  }

  const cents = parseMoneyToCents(amount);
  if (cents === null || cents <= 0) {
    return { fieldErrors: { amount: "Ingresa un monto válido mayor que cero" } };
  }

  const finalAmount = kind === "expense" ? -cents : cents;
  const parsedDate = new Date(`${date}T12:00:00.000Z`);

  try {
    await createTransactionService({
      budgetId: budget.id,
      accountId,
      categoryId: kind === "expense" ? categoryId : categoryId || null,
      date: parsedDate,
      amountCents: finalAmount,
      payee,
      memo,
      cleared,
      approved: true,
    });

    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message || "Error al crear la transacción" };
  }
}

export async function updateTransactionAction(
  _prev: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const { budget } = await requireBudget();
  const raw = Object.fromEntries(formData);
  const id = String(raw.id || "");
  if (!id) return { error: "Falta el ID de la transacción" };

  const parsed = baseTransactionSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const { accountId, kind, amount, date, payee, memo, categoryId, cleared } = parsed.data;

  if (kind === "expense" && (!categoryId || categoryId === "none" || categoryId === "")) {
    return { fieldErrors: { categoryId: "Los gastos exigen asignar una categoría" } };
  }

  const cents = parseMoneyToCents(amount);
  if (cents === null || cents <= 0) {
    return { fieldErrors: { amount: "Ingresa un monto válido mayor que cero" } };
  }

  const finalAmount = kind === "expense" ? -cents : cents;
  const parsedDate = new Date(`${date}T12:00:00.000Z`);

  try {
    await updateTransactionService({
      budgetId: budget.id,
      id,
      accountId,
      categoryId: kind === "expense" ? categoryId : categoryId || null,
      date: parsedDate,
      amountCents: finalAmount,
      payee,
      memo,
      cleared,
    });

    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message || "Error al actualizar la transacción" };
  }
}

export async function deleteTransactionAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const { budget } = await requireBudget();
  try {
    await deleteTransactionService(budget.id, id);
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al eliminar" };
  }
}

const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Selecciona la cuenta de origen"),
  toAccountId: z.string().min(1, "Selecciona la cuenta de destino"),
  amount: z.string().min(1, "Ingresa un monto"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  memo: z.string().trim().optional(),
  categoryId: z.string().optional(),
  cleared: z.preprocess((val) => val === "true" || val === "on" || val === true, z.boolean()),
});

export async function createTransferAction(
  _prev: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const { budget } = await requireBudget();
  const raw = Object.fromEntries(formData);
  const parsed = transferSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const { fromAccountId, toAccountId, amount, date, memo, categoryId, cleared } = parsed.data;

  if (fromAccountId === toAccountId) {
    return { fieldErrors: { toAccountId: "La cuenta de destino debe ser diferente a la de origen" } };
  }

  const cents = parseMoneyToCents(amount);
  if (cents === null || cents <= 0) {
    return { fieldErrors: { amount: "Ingresa un monto válido mayor que cero" } };
  }

  const parsedDate = new Date(`${date}T12:00:00.000Z`);

  try {
    await createTransferService({
      budgetId: budget.id,
      fromAccountId,
      toAccountId,
      amountCents: cents,
      date: parsedDate,
      memo,
      categoryId: categoryId && categoryId !== "none" ? categoryId : null,
      cleared,
    });

    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (err: any) {
    return { error: err.message || "Error al realizar la transferencia" };
  }
}

export async function approveTransactionsAction(ids: string[]): Promise<{ count: number; error?: string }> {
  const { budget } = await requireBudget();
  try {
    const count = await approveTransactionsService(budget.id, ids);
    revalidatePath("/app", "layout");
    return { count };
  } catch (err: any) {
    return { count: 0, error: err.message || "Error al aprobar transacciones" };
  }
}

export async function importTransactionsAction(input: {
  accountId: string;
  transactions: Array<{
    date: string;
    amountCents: number;
    payee: string;
    memo?: string;
  }>;
}): Promise<{ ok: boolean; importedCount?: number; skippedCount?: number; error?: string }> {
  const { budget } = await requireBudget();
  try {
    const res = await importTransactionsService({
      budgetId: budget.id,
      accountId: input.accountId,
      transactions: input.transactions,
    });
    revalidatePath("/app", "layout");
    return { ok: true, ...res };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al importar transacciones" };
  }
}

