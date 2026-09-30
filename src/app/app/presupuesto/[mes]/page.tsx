import Link from "next/link";
import { notFound } from "next/navigation";
import { MoneyPill } from "@/components/budget/MoneyPill";
import { ReadyToAssignBanner } from "@/components/budget/ReadyToAssignBanner";
import { formatCents } from "@/lib/money";
import { isValidMonth, monthLabel, nextMonth, prevMonth } from "@/lib/months";
import { requireBudget } from "@/lib/services/auth";
import { getBudgetMonth } from "@/lib/services/budget-data";

export const metadata = { title: "Presupuesto — Sobres" };

export default async function PresupuestoPage({ params }: { params: Promise<{ mes: string }> }) {
  const { mes } = await params;
  if (!isValidMonth(mes)) notFound();

  const { budget } = await requireBudget();
  const { groups, budget: b } = await getBudgetMonth(budget.id, mes);
  const cur = budget.currency;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">{monthLabel(mes)}</h1>
        <div className="flex gap-2">
          <Link aria-label="Mes anterior" href={`/app/presupuesto/${prevMonth(mes)}`} className="flex min-h-10 min-w-10 items-center justify-center rounded-field border border-line bg-white font-bold">‹</Link>
          <Link aria-label="Mes siguiente" href={`/app/presupuesto/${nextMonth(mes)}`} className="flex min-h-10 min-w-10 items-center justify-center rounded-field border border-line bg-white font-bold">›</Link>
        </div>
      </header>

      <ReadyToAssignBanner cents={b.readyToAssign} currency={cur} />

      <div className="overflow-x-auto rounded-card border border-line bg-white">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 text-right font-semibold">Asignado</th>
              <th className="px-4 py-3 text-right font-semibold">Actividad</th>
              <th className="px-4 py-3 text-right font-semibold">Disponible</th>
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.id}>
              <tr className="bg-surface">
                <th colSpan={4} className="px-4 py-2 text-left font-bold">{g.name}</th>
              </tr>
              {g.categories.filter((c) => !c.hidden).map((c) => {
                const s = b.categories[c.id] ?? { assigned: 0, activity: 0, available: 0 };
                return (
                  <tr key={c.id} className="border-t border-line">
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatCents(s.assigned, cur)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatCents(s.activity, cur)}</td>
                    <td className="px-4 py-2 text-right"><MoneyPill cents={s.available} currency={cur} /></td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
      <p className="text-sm text-muted">
        Vista de solo lectura por ahora: la edición de «Asignado» y «Mover dinero» es parte del Sprint 3.
      </p>
    </div>
  );
}
