import Link from "next/link";
import { AddAccountDialog } from "@/components/accounts/AddAccountDialog";
import { ReadyToAssignBanner } from "@/components/budget/ReadyToAssignBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { currentMonth, monthLabel } from "@/lib/months";
import { requireBudget } from "@/lib/services/auth";
import { listOpenAccounts } from "@/lib/services/accounts";
import { getBudgetMonth } from "@/lib/services/budget-data";

export const metadata = { title: "Inicio — Sobres" };

export default async function HomePage() {
  const { user, budget } = await requireBudget();
  const accounts = await listOpenAccounts(budget.id);
  const month = currentMonth();

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-extrabold">Hola, {user.name.split(" ")[0]}</h1>
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

  const { budget: b } = await getBudgetMonth(budget.id, month);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold">Hola, {user.name.split(" ")[0]}</h1>
      <ReadyToAssignBanner cents={b.readyToAssign} currency={budget.currency} />
      <div className="rounded-card border border-line bg-white p-6">
        <h2 className="mb-1 text-xl font-bold">Resumen de {monthLabel(month)}</h2>
        <p className="mb-4 text-muted">Así va tu mes hasta ahora.</p>
        <LinkButton href={`/app/presupuesto/${month}`}>Asignar fondos</LinkButton>
      </div>
      <p className="text-sm text-muted">
        Las tarjetas de prioridades y transacciones por aprobar llegan en los siguientes sprints.{" "}
        <Link className="font-semibold text-primary" href="/app/presupuesto/">Ir al presupuesto</Link>
      </p>
    </div>
  );
}
