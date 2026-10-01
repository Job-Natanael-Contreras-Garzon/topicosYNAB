import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadyToAssignBanner } from "@/components/budget/ReadyToAssignBanner";
import { BudgetTable } from "@/components/budget/BudgetTable";
import { isValidMonth, monthLabel, nextMonth, prevMonth, currentMonth } from "@/lib/months";
import { requireBudget } from "@/lib/services/auth";
import { getBudgetMonth } from "@/lib/services/budget-data";

export async function generateMetadata({ params }: { params: Promise<{ mes: string }> }) {
  const { mes } = await params;
  return { title: `Presupuesto ${isValidMonth(mes) ? monthLabel(mes) : ""} — Sobres` };
}

export default async function PresupuestoPage({ params }: { params: Promise<{ mes: string }> }) {
  const { mes } = await params;
  if (!isValidMonth(mes)) notFound();

  const { budget } = await requireBudget();
  const { groups, budget: b } = await getBudgetMonth(budget.id, mes);
  const cur = budget.currency;
  const isCurrent = mes === currentMonth();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Navegación de Meses */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold font-display text-deep-blue capitalize">
              {monthLabel(mes)}
            </h1>
            {!isCurrent && (
              <Link
                href={`/app/presupuesto/${currentMonth()}`}
                className="rounded-full bg-powder-pink/50 px-2.5 py-0.5 text-xs font-semibold text-deep-blue hover:bg-modern-pink hover:text-deep-blue transition"
              >
                Volver al mes actual
              </Link>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            Asigna un trabajo a cada boliviano hasta que Ready to Assign sea cero.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            aria-label="Mes anterior"
            href={`/app/presupuesto/${prevMonth(mes)}`}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-field border border-line bg-white font-bold text-deep-blue hover:bg-surface transition shadow-sm"
          >
            ‹
          </Link>
          <Link
            aria-label="Mes siguiente"
            href={`/app/presupuesto/${nextMonth(mes)}`}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-field border border-line bg-white font-bold text-deep-blue hover:bg-surface transition shadow-sm"
          >
            ›
          </Link>
        </div>
      </header>

      {/* Banner de Ready to Assign con tres estados */}
      <ReadyToAssignBanner cents={b.readyToAssign} currency={cur} />

      {/* Tabla Interactiva de Grupos y Categorías */}
      <BudgetTable
        month={mes}
        currency={cur}
        groups={groups}
        computedBudget={b}
      />
    </div>
  );
}
