import "server-only";
import { db } from "@/lib/db";
import { monthOf, monthRange, monthLabel, addMonths, currentMonth } from "@/lib/months";

export interface SpendingCategoryItem {
  categoryId: string;
  categoryName: string;
  groupName: string;
  totalCents: number;
  percentage: number;
}

export interface SpendingCategoryReport {
  totalSpendingCents: number;
  categories: SpendingCategoryItem[];
}

export interface SpendingTrendItem {
  month: string; // YYYY-MM
  label: string; // Ej: "Octubre 2026"
  totalCents: number;
}

export interface NetWorthItem {
  month: string; // YYYY-MM
  label: string; // Ej: "Octubre 2026"
  assetsCents: number;
  debtsCents: number;
  netWorthCents: number;
}

/** Obtiene el rango de fechas (fromDate, toDate) basado en un selector rápido. */
export function getReportDateRange(rangeKey: string = "6m"): {
  fromDate: Date;
  toDate: Date;
  fromMonth: string;
  toMonth: string;
} {
  const now = new Date();
  const thisMonth = currentMonth(now);

  let fromMonth = thisMonth;
  if (rangeKey === "3m") {
    fromMonth = addMonths(thisMonth, -2);
  } else if (rangeKey === "6m") {
    fromMonth = addMonths(thisMonth, -5);
  } else if (rangeKey === "12m") {
    fromMonth = addMonths(thisMonth, -11);
  } else if (rangeKey === "this_year") {
    fromMonth = `${now.getFullYear()}-01`;
  } else {
    fromMonth = addMonths(thisMonth, -5);
  }

  const [fromY, fromM] = fromMonth.split("-").map(Number);
  const fromDate = new Date(Date.UTC(fromY, fromM - 1, 1, 0, 0, 0, 0));

  const [toY, toM] = thisMonth.split("-").map(Number);
  // Último milisegundo del mes toMonth
  const toDate = new Date(Date.UTC(toY, toM, 0, 23, 59, 59, 999));

  return {
    fromDate,
    toDate,
    fromMonth,
    toMonth: thisMonth,
  };
}

/**
 * 1. Gasto por categoría
 * Suma de egresos (amountCents < 0) agrupados por categoría. Excluye transferencias.
 */
export async function getSpendingByCategory(
  budgetId: string,
  fromDate: Date,
  toDate: Date
): Promise<SpendingCategoryReport> {
  const transactions = await db.transaction.findMany({
    where: {
      account: { budgetId },
      date: { gte: fromDate, lte: toDate },
      transferPairId: null, // Excluir transferencias
      amountCents: { lt: 0 }, // Solo gastos
    },
    include: {
      category: {
        include: {
          group: true,
        },
      },
    },
  });

  const categoryMap = new Map<
    string,
    { categoryId: string; categoryName: string; groupName: string; totalCents: number }
  >();

  let totalSpendingCents = 0;

  for (const tx of transactions) {
    const absAmount = Math.abs(tx.amountCents);
    totalSpendingCents += absAmount;

    const catId = tx.categoryId || "uncategorized";
    const catName = tx.category?.name || "Sin categoría";
    const grpName = tx.category?.group.name || "General";

    const current = categoryMap.get(catId) || {
      categoryId: catId,
      categoryName: catName,
      groupName: grpName,
      totalCents: 0,
    };
    current.totalCents += absAmount;
    categoryMap.set(catId, current);
  }

  const categories: SpendingCategoryItem[] = Array.from(categoryMap.values())
    .map((item) => ({
      ...item,
      percentage: totalSpendingCents > 0 ? (item.totalCents / totalSpendingCents) * 100 : 0,
    }))
    .sort((a, b) => b.totalCents - a.totalCents);

  return {
    totalSpendingCents,
    categories,
  };
}

/**
 * 2. Tendencia de gasto
 * Barras mensuales de gasto dentro del periodo. Capacidad de filtrar por categoría específica.
 */
export async function getSpendingTrend(
  budgetId: string,
  fromDate: Date,
  toDate: Date,
  filterCategoryId?: string
): Promise<SpendingTrendItem[]> {
  const where: any = {
    account: { budgetId },
    date: { gte: fromDate, lte: toDate },
    transferPairId: null,
    amountCents: { lt: 0 },
  };

  if (filterCategoryId && filterCategoryId !== "all") {
    if (filterCategoryId === "uncategorized") {
      where.categoryId = null;
    } else {
      where.categoryId = filterCategoryId;
    }
  }

  const transactions = await db.transaction.findMany({
    where,
    select: {
      date: true,
      amountCents: true,
    },
  });

  const fromMonth = monthOf(fromDate);
  const toMonth = monthOf(toDate);
  const months = monthRange(fromMonth, toMonth);

  const monthSums = new Map<string, number>();
  for (const m of months) {
    monthSums.set(m, 0);
  }

  for (const tx of transactions) {
    const m = monthOf(tx.date);
    if (monthSums.has(m)) {
      monthSums.set(m, (monthSums.get(m) || 0) + Math.abs(tx.amountCents));
    }
  }

  return months.map((m) => ({
    month: m,
    label: monthLabel(m),
    totalCents: monthSums.get(m) || 0,
  }));
}

/**
 * 3. Patrimonio neto (Net Worth)
 * Evolución mensual de saldos acumulados de todas las cuentas:
 * - Activos: cuentas con saldo positivo (o cuentas que no son de deuda con saldo >= 0)
 * - Pasivos / Deudas: saldo de tarjetas de crédito o cuentas con saldo negativo
 * - Patrimonio neto = Activos - Deudas
 */
export async function getNetWorth(
  budgetId: string,
  fromDate: Date,
  toDate: Date
): Promise<NetWorthItem[]> {
  const accounts = await db.account.findMany({
    where: { budgetId },
    select: { id: true, type: true },
  });

  // Todas las transacciones hasta la fecha final del reporte
  const transactions = await db.transaction.findMany({
    where: {
      account: { budgetId },
      date: { lte: toDate },
    },
    select: {
      accountId: true,
      amountCents: true,
      date: true,
    },
    orderBy: { date: "asc" },
  });

  const fromMonth = monthOf(fromDate);
  const toMonth = monthOf(toDate);
  const months = monthRange(fromMonth, toMonth);

  // Mapeamos los límites de tiempo de cada mes
  return months.map((m) => {
    const [y, mon] = m.split("-").map(Number);
    // Último milisegundo del mes m en UTC
    const monthEnd = new Date(Date.UTC(y, mon, 0, 23, 59, 59, 999));

    // Calculamos el saldo acumulado de cada cuenta hasta el final de este mes
    const accountBalances = new Map<string, number>();
    for (const acc of accounts) {
      accountBalances.set(acc.id, 0);
    }

    for (const tx of transactions) {
      if (tx.date <= monthEnd) {
        const cur = accountBalances.get(tx.accountId) || 0;
        accountBalances.set(tx.accountId, cur + tx.amountCents);
      }
    }

    let assetsCents = 0;
    let debtsCents = 0;

    for (const acc of accounts) {
      const bal = accountBalances.get(acc.id) || 0;
      const isCreditType = acc.type === "credit";

      if (isCreditType) {
        // En cuentas de crédito o tarjetas, un saldo negativo representa deuda
        if (bal < 0) {
          debtsCents += Math.abs(bal);
        } else {
          assetsCents += bal;
        }
      } else {
        if (bal >= 0) {
          assetsCents += bal;
        } else {
          debtsCents += Math.abs(bal);
        }
      }
    }

    return {
      month: m,
      label: monthLabel(m),
      assetsCents,
      debtsCents,
      netWorthCents: assetsCents - debtsCents,
    };
  });
}
