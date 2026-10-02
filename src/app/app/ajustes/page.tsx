import { requireBudget } from "@/lib/services/auth";
import { listBudgetMembers } from "@/lib/services/members";
import { BudgetMembersManager } from "@/components/members/BudgetMembersManager";

export const metadata = { title: "Ajustes y Miembros — Sobres" };

export default async function AjustesPage() {
  const { user, budget, isOwner } = await requireBudget();
  const { owner, members, totalCount } = await listBudgetMembers(budget.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-deep-blue">
          Ajustes y Colaboración
        </h1>
        <p className="mt-1 text-sm text-muted">
          Administra las preferencias de tu cuenta, los datos de tu presupuesto y los miembros
          colaboradores.
        </p>
      </div>

      {/* Información del Perfil y Presupuesto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tu Perfil */}
        <div className="rounded-card border border-line bg-white p-6 shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Tu Perfil</span>
          <div className="space-y-1">
            <p className="text-lg font-bold text-deep-blue">{user.name}</p>
            <p className="text-xs text-muted font-mono">{user.email}</p>
          </div>
          <div className="pt-2 border-t border-line/60">
            <span className="text-xs text-muted">Rol en este presupuesto: </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                isOwner ? "bg-deep-blue text-off-white" : "bg-modern-pink text-deep-blue"
              }`}
            >
              {isOwner ? "Propietario" : "Colaborador"}
            </span>
          </div>
        </div>

        {/* Presupuesto Activo */}
        <div className="rounded-card border border-line bg-white p-6 shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Presupuesto Activo
          </span>
          <div className="space-y-1">
            <p className="text-lg font-bold text-deep-blue">{budget.name}</p>
            <p className="text-xs text-muted">Moneda de operación: <strong>{budget.currency}</strong></p>
          </div>
          <div className="pt-2 border-t border-line/60">
            <p className="text-xs text-muted">
              Base de datos: <span className="font-semibold text-money-green">PostgreSQL (En línea)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Gestión de Miembros Colaboradores (M11) */}
      <div className="rounded-card border border-line bg-white p-6 shadow-sm">
        <BudgetMembersManager
          owner={owner}
          members={members}
          totalCount={totalCount}
          currentUserId={user.id}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}
