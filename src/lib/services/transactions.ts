import "server-only";
import { db } from "@/lib/db";

export interface TransactionFilters {
  accountId?: string;
  query?: string;
  categoryId?: string;
  status?: "all" | "unapproved" | "approved";
  fromDate?: string;
  toDate?: string;
}

export async function listTransactions(budgetId: string, filters: TransactionFilters = {}) {
  const where: any = {
    account: { budgetId },
  };

  if (filters.accountId) {
    where.accountId = filters.accountId;
  }

  if (filters.categoryId) {
    if (filters.categoryId === "income") {
      where.categoryId = null;
      where.amountCents = { gt: 0 };
    } else {
      where.categoryId = filters.categoryId;
    }
  }

  if (filters.status === "unapproved") {
    where.approved = false;
  } else if (filters.status === "approved") {
    where.approved = true;
  }

  if (filters.query?.trim()) {
    const q = filters.query.trim();
    where.OR = [
      { payee: { contains: q, mode: "insensitive" } },
      { memo: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.fromDate || filters.toDate) {
    where.date = {};
    if (filters.fromDate) {
      where.date.gte = new Date(`${filters.fromDate}T00:00:00.000Z`);
    }
    if (filters.toDate) {
      where.date.lte = new Date(`${filters.toDate}T23:59:59.999Z`);
    }
  }

  return db.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { id: "desc" }],
    include: {
      account: { select: { id: true, name: true, onBudget: true, type: true } },
      category: { select: { id: true, name: true, group: { select: { id: true, name: true } } } },
    },
  });
}

export async function getTransactionById(budgetId: string, id: string) {
  return db.transaction.findFirst({
    where: { id, account: { budgetId } },
    include: {
      account: true,
      category: true,
    },
  });
}

export async function createTransactionService(input: {
  budgetId: string;
  accountId: string;
  categoryId?: string | null;
  date: Date;
  amountCents: number;
  payee: string;
  memo?: string;
  cleared?: boolean;
  approved?: boolean;
}) {
  // Verificar que la cuenta pertenezca al presupuesto
  const account = await db.account.findFirst({
    where: { id: input.accountId, budgetId: input.budgetId },
    select: { id: true },
  });
  if (!account) throw new Error("Cuenta no encontrada o no autorizada");

  // Si tiene categoría, verificar que pertenezca al presupuesto
  if (input.categoryId) {
    const category = await db.category.findFirst({
      where: { id: input.categoryId, group: { budgetId: input.budgetId } },
      select: { id: true },
    });
    if (!category) throw new Error("Categoría no encontrada");
  }

  return db.transaction.create({
    data: {
      accountId: input.accountId,
      categoryId: input.categoryId ?? null,
      date: input.date,
      amountCents: input.amountCents,
      payee: input.payee,
      memo: input.memo ?? "",
      cleared: input.cleared ?? false,
      approved: input.approved ?? true,
    },
  });
}

export async function createTransferService(input: {
  budgetId: string;
  fromAccountId: string;
  toAccountId: string;
  amountCents: number; // Siempre positivo (lo que se transfiere)
  date: Date;
  memo?: string;
  cleared?: boolean;
  categoryId?: string | null; // Opcional si una de las cuentas es tracking
}) {
  if (input.fromAccountId === input.toAccountId) {
    throw new Error("La cuenta de origen y destino deben ser distintas");
  }

  const [fromAccount, toAccount] = await Promise.all([
    db.account.findFirst({ where: { id: input.fromAccountId, budgetId: input.budgetId } }),
    db.account.findFirst({ where: { id: input.toAccountId, budgetId: input.budgetId } }),
  ]);

  if (!fromAccount || !toAccount) {
    throw new Error("Una o ambas cuentas no pertenecen a tu presupuesto");
  }

  const pairId = `tr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const absAmount = Math.abs(input.amountCents);

  return db.$transaction(async (tx) => {
    const outflow = await tx.transaction.create({
      data: {
        accountId: fromAccount.id,
        categoryId: input.categoryId ?? null,
        date: input.date,
        amountCents: -absAmount,
        payee: `Transferencia a: ${toAccount.name}`,
        memo: input.memo ?? "",
        cleared: input.cleared ?? false,
        approved: true,
        transferPairId: pairId,
      },
    });

    const inflow = await tx.transaction.create({
      data: {
        accountId: toAccount.id,
        categoryId: input.categoryId ?? null,
        date: input.date,
        amountCents: absAmount,
        payee: `Transferencia desde: ${fromAccount.name}`,
        memo: input.memo ?? "",
        cleared: input.cleared ?? false,
        approved: true,
        transferPairId: pairId,
      },
    });

    return { outflow, inflow };
  });
}

export async function updateTransactionService(input: {
  budgetId: string;
  id: string;
  accountId: string;
  categoryId?: string | null;
  date: Date;
  amountCents: number;
  payee: string;
  memo?: string;
  cleared?: boolean;
  approved?: boolean;
}) {
  const existing = await db.transaction.findFirst({
    where: { id: input.id, account: { budgetId: input.budgetId } },
  });
  if (!existing) throw new Error("Transacción no encontrada");

  return db.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: { id: input.id },
      data: {
        accountId: input.accountId,
        categoryId: input.categoryId ?? null,
        date: input.date,
        amountCents: input.amountCents,
        payee: input.payee,
        memo: input.memo ?? "",
        cleared: input.cleared ?? existing.cleared,
        approved: input.approved ?? existing.approved,
      },
    });

    // Si forma parte de una transferencia, sincronizar la contraparte
    if (existing.transferPairId) {
      const counterpart = await tx.transaction.findFirst({
        where: {
          transferPairId: existing.transferPairId,
          id: { not: existing.id },
        },
      });

      if (counterpart) {
        // La contraparte debe tener el monto opuesto
        await tx.transaction.update({
          where: { id: counterpart.id },
          data: {
            date: input.date,
            amountCents: -input.amountCents,
            memo: input.memo ?? "",
          },
        });
      }
    }

    return updated;
  });
}

export async function deleteTransactionService(budgetId: string, id: string) {
  const existing = await db.transaction.findFirst({
    where: { id, account: { budgetId } },
  });
  if (!existing) throw new Error("Transacción no encontrada");

  return db.$transaction(async (tx) => {
    if (existing.transferPairId) {
      // Eliminar ambas patas de la transferencia
      await tx.transaction.deleteMany({
        where: { transferPairId: existing.transferPairId },
      });
      return { deletedCount: 2 };
    }

    await tx.transaction.delete({ where: { id } });
    return { deletedCount: 1 };
  });
}

export async function approveTransactionsService(budgetId: string, ids: string[]) {
  if (ids.length === 0) return 0;
  const res = await db.transaction.updateMany({
    where: {
      id: { in: ids },
      account: { budgetId },
    },
    data: { approved: true },
  });
  return res.count;
}
