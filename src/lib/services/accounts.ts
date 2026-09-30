import "server-only";
import { db } from "@/lib/db";

export type AccountType = "checking" | "savings" | "cash" | "credit" | "tracking";

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Cuenta corriente",
  savings: "Cuenta de ahorro",
  cash: "Efectivo",
  credit: "Tarjeta de crédito",
  tracking: "Seguimiento (inversión, inmueble…)",
};

export interface AccountWithBalance {
  id: string;
  name: string;
  type: string;
  onBudget: boolean;
  balanceCents: number;
}

/** Cuentas abiertas del presupuesto con su saldo derivado de las transacciones. */
export async function listOpenAccounts(budgetId: string): Promise<AccountWithBalance[]> {
  const accounts = await db.account.findMany({
    where: { budgetId, closed: false },
    orderBy: { id: "asc" },
    select: { id: true, name: true, type: true, onBudget: true },
  });
  const sums = await db.transaction.groupBy({
    by: ["accountId"],
    where: { account: { budgetId, closed: false } },
    _sum: { amountCents: true },
  });
  const bal = new Map(sums.map((s) => [s.accountId, s._sum.amountCents ?? 0]));
  return accounts.map((a) => ({ ...a, balanceCents: bal.get(a.id) ?? 0 }));
}

export async function createAccountWithOpeningBalance(input: {
  budgetId: string;
  name: string;
  type: AccountType;
  openingCents: number;
}) {
  const onBudget = input.type !== "tracking";
  return db.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: { budgetId: input.budgetId, name: input.name, type: input.type, onBudget },
    });
    if (input.openingCents !== 0) {
      const today = new Date();
      await tx.transaction.create({
        data: {
          accountId: account.id,
          categoryId: null, // alimenta directamente Ready to Assign
          date: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())),
          amountCents: input.openingCents,
          payee: "Saldo inicial",
          approved: true,
          cleared: true,
        },
      });
    }
    return account;
  });
}

export async function closeAccountById(budgetId: string, accountId: string) {
  // updateMany con budgetId garantiza que solo se cierre una cuenta propia.
  const res = await db.account.updateMany({
    where: { id: accountId, budgetId },
    data: { closed: true },
  });
  return res.count === 1;
}
