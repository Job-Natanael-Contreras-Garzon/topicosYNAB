import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { requireBudget } from "@/lib/services/auth";
import { listOpenAccounts, ACCOUNT_TYPE_LABELS, type AccountType } from "@/lib/services/accounts";
import { listTransactions } from "@/lib/services/transactions";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionHeaderActions } from "@/components/transactions/TransactionHeaderActions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { budget } = await requireBudget();
  const account = await db.account.findFirst({
    where: { id, budgetId: budget.id },
    select: { name: true },
  });
  return { title: account ? `${account.name} — Cuentas` : "Cuenta" };
}

export default async function CuentaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { budget } = await requireBudget();

  // Filtrar estrictamente por budgetId para evitar fugas entre usuarios
  const account = await db.account.findFirst({
    where: { id, budgetId: budget.id },
    select: {
      id: true,
      name: true,
      type: true,
      onBudget: true,
      closed: true,
    },
  });
  if (!account) notFound();

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
    listTransactions(budget.id, { accountId: id }),
  ]);

  const balanceCents = transactions.reduce((acc, t) => acc + t.amountCents, 0);
  const typeLabel = ACCOUNT_TYPE_LABELS[account.type as AccountType] || account.type;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Encabezado de la Cuenta */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold font-display text-deep-blue">{account.name}</h1>
            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted border border-line">
              {typeLabel}
            </span>
            {!account.onBudget && (
              <span className="rounded-full bg-powder-pink/50 px-2 py-0.5 text-xs font-semibold text-deep-blue">
                Seguimiento
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            Saldo acumulado:{" "}
            <strong
              className={`tabular-nums text-lg ${
                balanceCents >= 0 ? "text-money-green" : "text-alert"
              }`}
            >
              {formatCents(balanceCents, budget.currency)}
            </strong>
          </p>
        </div>

        <TransactionHeaderActions
          accounts={allAccounts}
          categoryGroups={categoryGroups}
          defaultAccountId={account.id}
          currency={budget.currency}
        />
      </div>

      {/* Tabla de Transacciones */}
      <TransactionTable
        transactions={transactions}
        accounts={allAccounts}
        categoryGroups={categoryGroups}
        currency={budget.currency}
        showAccountColumn={false}
        defaultAccountId={account.id}
      />
    </div>
  );
}
