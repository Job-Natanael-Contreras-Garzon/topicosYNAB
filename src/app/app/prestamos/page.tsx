import { db } from "@/lib/db";
import { requireBudget } from "@/lib/services/auth";
import { LoanPlanner } from "@/components/loans/LoanPlanner";

export const metadata = { title: "Préstamos — Sobres" };

export default async function PrestamosPage() {
  const { budget } = await requireBudget();

  // Buscar cuentas de pasivo o tarjetas de crédito con saldo deudor
  const creditAccounts = await db.account.findMany({
    where: {
      budgetId: budget.id,
      type: "credit",
      closed: false,
    },
    include: {
      transactions: {
        select: { amountCents: true },
      },
    },
  });

  let initialDebtCents = 2000000; // 20 000 por defecto para simular
  if (creditAccounts.length > 0) {
    const totalDebt = creditAccounts.reduce((acc, account) => {
      const balance = account.transactions.reduce((b, tx) => b + tx.amountCents, 0);
      return balance < 0 ? acc + Math.abs(balance) : acc;
    }, 0);

    if (totalDebt > 0) {
      initialDebtCents = totalDebt;
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-deep-blue">
          Calculadora de Préstamos y Deuda
        </h1>
        <p className="mt-1 text-sm text-muted">
          Planifica la amortización de tus deudas, simula aportes voluntarios mensuales y
          descubre exactamente cuántos meses y dinero en intereses te ahorras.
        </p>
      </div>

      <LoanPlanner
        currency={budget.currency}
        initialBalanceCents={initialDebtCents}
      />
    </div>
  );
}
