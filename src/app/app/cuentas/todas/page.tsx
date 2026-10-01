import { db } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { requireBudget } from "@/lib/services/auth";
import { listOpenAccounts } from "@/lib/services/accounts";
import { listTransactions } from "@/lib/services/transactions";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionHeaderActions } from "@/components/transactions/TransactionHeaderActions";

export const metadata = { title: "Todas las cuentas — Sobres" };

export default async function TodasLasCuentasPage() {
  const { budget } = await requireBudget();

  const [allAccounts, categoryGroups, transactions] = await Promise.all([
    listOpenAccounts(budget.id),
    db.categoryGroup.findMany({
      where: { budgetId: budget.id },
      orderBy: { sort: "asc" },
      select: {
        id: true,
        name: true,
        categories: {
          where: { hidden: false },
          orderBy: { sort: "asc" },
          select: { id: true, name: true },
        },
      },
    }),
    listTransactions(budget.id),
  ]);

  const onBudgetAccounts = allAccounts.filter((a) => a.onBudget);
  const trackingAccounts = allAccounts.filter((a) => !a.onBudget);

  const onBudgetTotal = onBudgetAccounts.reduce((s, a) => s + a.balanceCents, 0);
  const trackingTotal = trackingAccounts.reduce((s, a) => s + a.balanceCents, 0);
  const netTotal = onBudgetTotal + trackingTotal;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Encabezado General */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-deep-blue">Todas las cuentas</h1>
          <p className="mt-1 text-sm text-muted">
            Vista global de todos los movimientos y saldos de tu presupuesto.
          </p>
        </div>

        <TransactionHeaderActions
          accounts={allAccounts}
          categoryGroups={categoryGroups}
        />
      </div>

      {/* Tarjetas de Saldo Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-card border border-line bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-muted">Cuentas de Presupuesto</p>
          <p className="text-2xl font-extrabold tabular-nums text-money-green mt-1">
            {formatCents(onBudgetTotal, budget.currency)}
          </p>
          <p className="text-xs text-muted mt-1">{onBudgetAccounts.length} cuenta(s)</p>
        </div>

        <div className="rounded-card border border-line bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-muted">Cuentas de Seguimiento</p>
          <p className="text-2xl font-extrabold tabular-nums text-deep-blue mt-1">
            {formatCents(trackingTotal, budget.currency)}
          </p>
          <p className="text-xs text-muted mt-1">{trackingAccounts.length} cuenta(s)</p>
        </div>

        <div className="rounded-card border border-line bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-muted">Patrimonio Neto Total</p>
          <p className="text-2xl font-extrabold tabular-nums text-deep-blue mt-1">
            {formatCents(netTotal, budget.currency)}
          </p>
          <p className="text-xs text-muted mt-1">Suma consolidada</p>
        </div>
      </div>

      {/* Tabla Global con Columna de Cuenta */}
      <TransactionTable
        transactions={transactions}
        accounts={allAccounts}
        categoryGroups={categoryGroups}
        currency={budget.currency}
        showAccountColumn={true}
      />
    </div>
  );
}
