import Link from "next/link";
import { AddAccountDialog } from "@/components/accounts/AddAccountDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { GoalProgress } from "@/components/goals/GoalProgress";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { currentMonth, monthLabel } from "@/lib/months";
import { requireBudget } from "@/lib/services/auth";
import { listOpenAccounts } from "@/lib/services/accounts";
import { getBudgetMonth } from "@/lib/services/budget-data";
import { getEvaluatedGoalsForMonth } from "@/lib/services/goals";

export const metadata = { title: "Inicio — Sobres" };

export default async function HomePage() {
  const { user, budget } = await requireBudget();
  const accounts = await listOpenAccounts(budget.id);
  const month = currentMonth();

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-extrabold font-display text-deep-blue">
          Hola, {user.name.split(" ")[0]}
        </h1>
        <EmptyState
          title="Empecemos por tu primera cuenta"
          description="Agrega dónde tienes tu dinero (por ejemplo «Efectivo» con 1000). Ese monto aparecerá como Ready to Assign, listo para darle un trabajo."
          action={
            <div className="w-56">
              <AddAccountDialog label="Agregar mi primera cuenta" />
            </div>
          }
        />
      </div>
    );
  }

  const [{ budget: b }, evaluatedGoals, unapprovedCount] = await Promise.all([
    getBudgetMonth(budget.id, month),
    getEvaluatedGoalsForMonth(budget.id, month),
    db.transaction.count({
      where: { account: { budgetId: budget.id }, approved: false },
    }),
  ]);

  const topPriorities = evaluatedGoals
    .filter((g) => g.evaluation.underfundedCents > 0)
    .sort((a, b) => b.evaluation.underfundedCents - a.evaluation.underfundedCents)
    .slice(0, 4);

  const totalUnderfunded = evaluatedGoals.reduce(
    (sum, g) => sum + g.evaluation.underfundedCents,
    0
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Saludo y bienvenida */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-deep-blue">
            Hola, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Este es tu centro de control para el mes de {monthLabel(month)}.
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/app/presupuesto/${month}`} variant="primary">
            Ver presupuesto
          </LinkButton>
        </div>
      </div>

      {/* Las 4 Tarjetas Modulares del Home (Sprint 4 / M6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tarjeta 1: Nuevas Transacciones */}
        <div className="rounded-card border border-line bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display text-deep-blue">Nuevas Transacciones</h2>
              {unapprovedCount > 0 ? (
                <span className="rounded-full bg-modern-pink text-deep-blue px-2.5 py-0.5 text-xs font-bold shadow-sm">
                  {unapprovedCount} pendiente(s)
                </span>
              ) : (
                <span className="rounded-full bg-money-green/15 text-money-green px-2.5 py-0.5 text-xs font-bold">
                  Al día ✓
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-muted">
              {unapprovedCount > 0
                ? `Tienes ${unapprovedCount} movimiento(s) importados o registrados sin aprobar que requieren categorización.`
                : "No tienes movimientos pendientes por aprobar en tus cuentas."}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-line/60">
            {unapprovedCount > 0 ? (
              <LinkButton href="/app/cuentas/todas" variant="primary" className="w-full text-xs">
                Revisar transacciones pendientes
              </LinkButton>
            ) : (
              <LinkButton href="/app/cuentas/todas" variant="outline" className="w-full text-xs">
                Ver historial de transacciones
              </LinkButton>
            )}
          </div>
        </div>

        {/* Tarjeta 2: Ready to Assign */}
        <div
          className={`rounded-card border p-6 shadow-sm flex flex-col justify-between ${
            b.readyToAssign > 0
              ? "bg-money-green text-off-white border-money-green/30"
              : b.readyToAssign < 0
              ? "bg-alert text-white border-alert/30"
              : "bg-white text-deep-blue border-line"
          }`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-90">
              Ready to Assign (Listo para asignar)
            </p>
            <p className="mt-2 text-4xl font-extrabold tabular-nums">
              {formatCents(b.readyToAssign, budget.currency)}
            </p>
            <p className="mt-2 text-sm opacity-85">
              {b.readyToAssign > 0
                ? "Dinero disponible sin asignar. Dale un trabajo a cada peso antes de gastarlo."
                : b.readyToAssign === 0
                ? "¡Excelente! Cada unidad de dinero tiene un trabajo asignado."
                : "Has asignado más dinero del que posees. Cubre el déficit reajustando categorías."}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20">
            <Link
              href={`/app/presupuesto/${month}`}
              className={`inline-flex min-h-10 w-full items-center justify-center rounded-field text-sm font-bold transition shadow-sm ${
                b.readyToAssign > 0
                  ? "bg-off-white text-deep-blue hover:bg-white"
                  : b.readyToAssign < 0
                  ? "bg-white text-alert hover:bg-off-white"
                  : "bg-surface text-deep-blue hover:bg-line border border-line"
              }`}
            >
              {b.readyToAssign > 0 ? "Asignar dinero ahora" : "Ir a la tabla de presupuesto"}
            </Link>
          </div>
        </div>

        {/* Tarjeta 3: Prioridades Principales (Metas con mayor déficit) */}
        <div className="rounded-card border border-line bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold font-display text-deep-blue">Prioridades del Mes</h2>
              <span className="text-xs font-semibold text-muted">
                {topPriorities.length} meta(s) por financiar
              </span>
            </div>

            {topPriorities.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                ¡Todas tus metas para este mes están 100% financiadas! 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {topPriorities.map((item) => (
                  <div key={item.id} className="rounded-field bg-surface/70 border border-line p-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-deep-blue">
                      <span>{item.category.name}</span>
                      <span className="tabular-nums text-alert">
                        Falta {formatCents(item.evaluation.underfundedCents, budget.currency)}
                      </span>
                    </div>
                    <GoalProgress
                      underfundedCents={item.evaluation.underfundedCents}
                      progressPercent={item.evaluation.progressPercent}
                      currency={budget.currency}
                      isFunded={item.evaluation.isFunded}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-line/60">
            <LinkButton
              href={`/app/presupuesto/${month}`}
              variant="outline"
              className="w-full text-xs"
            >
              Ver todas las metas
            </LinkButton>
          </div>
        </div>

        {/* Tarjeta 4: Resumen Financiero del Mes */}
        <div className="rounded-card border border-line bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-display text-deep-blue mb-4">
              Resumen de {monthLabel(month)}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-field bg-surface/50 border border-line">
                <span className="text-sm font-medium text-muted">Total Asignado</span>
                <span className="text-base font-bold tabular-nums text-deep-blue">
                  {formatCents(b.totals.assigned, budget.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-field bg-surface/50 border border-line">
                <span className="text-sm font-medium text-muted">Total Gastado (Actividad)</span>
                <span className="text-base font-bold tabular-nums text-alert">
                  {formatCents(Math.abs(b.totals.activity), budget.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-field bg-surface/50 border border-line">
                <span className="text-sm font-medium text-muted">Faltante en Metas</span>
                <span className="text-base font-bold tabular-nums text-warning">
                  {formatCents(totalUnderfunded, budget.currency)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-line/60">
            <LinkButton href="/app/reportes" variant="corporate" className="w-full text-xs">
              Ver análisis y reportes detallados
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
