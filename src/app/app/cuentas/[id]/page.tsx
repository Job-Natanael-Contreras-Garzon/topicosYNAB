import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { requireBudget } from "@/lib/services/auth";

export default async function CuentaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { budget } = await requireBudget();
  // Filtra por budgetId: otro usuario nunca puede ver tus cuentas.
  const account = await db.account.findFirst({
    where: { id, budgetId: budget.id },
    include: { transactions: { select: { amountCents: true } } },
  });
  if (!account) notFound();
  const balance = account.transactions.reduce((s, t) => s + t.amountCents, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold">{account.name}</h1>
      <p className="text-lg font-semibold tabular-nums">Saldo: {formatCents(balance, budget.currency)}</p>
      <EmptyState
        title="Los movimientos llegan en el Sprint 2"
        description="Aquí aparecerá la tabla de transacciones de esta cuenta, con filtros, edición y transferencias."
      />
    </div>
  );
}
