import Link from "next/link";
import { logoutUser } from "@/actions/auth";
import { AddAccountDialog } from "@/components/accounts/AddAccountDialog";
import { CloseAccountButton } from "@/components/accounts/CloseAccountButton";
import { NavLinks } from "@/components/NavLinks";
import { formatCents } from "@/lib/money";
import { requireBudget } from "@/lib/services/auth";
import { listOpenAccounts } from "@/lib/services/accounts";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, budget } = await requireBudget();
  const accounts = await listOpenAccounts(budget.id);
  const onBudget = accounts.filter((a) => a.onBudget);
  const tracking = accounts.filter((a) => !a.onBudget);

  const group = (title: string, list: typeof accounts) =>
    list.length > 0 && (
      <section aria-label={title} className="space-y-1">
        <h2 className="px-3 text-xs font-bold uppercase tracking-wide text-off-white/60">{title}</h2>
        <ul>
          {list.map((a) => (
            <li key={a.id} className="group flex items-center justify-between rounded-field px-3 py-1.5 hover:bg-white/10 transition">
              <Link href={`/app/cuentas/${a.id}`} className="flex flex-1 items-center justify-between gap-2 text-sm text-off-white">
                <span className="truncate">{a.name}</span>
                <span className="tabular-nums text-off-white/80">{formatCents(a.balanceCents, budget.currency)}</span>
              </Link>
              <span className="ml-1 text-off-white/70">
                <CloseAccountButton id={a.id} name={a.name} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[17rem_1fr] bg-surface text-deep-blue">
      <aside className="flex flex-col gap-6 bg-deep-blue p-4 md:sticky md:top-0 md:h-dvh md:overflow-y-auto">
        <Link href="/app" className="font-display text-2xl font-extrabold text-off-white">
          Sobres<span className="text-modern-pink">.</span>
        </Link>
        <NavLinks />
        <div className="space-y-4">
          <div className="px-1">
            <Link
              href="/app/cuentas/todas"
              className="flex items-center justify-between rounded-field px-3 py-2 text-sm font-semibold text-off-white/90 hover:bg-white/10 hover:text-off-white transition"
            >
              <span className="flex items-center gap-2">
                <span>💳</span>
                <span>Todas las cuentas</span>
              </span>
              <span className="tabular-nums text-xs text-off-white/70">
                {formatCents(accounts.reduce((s, a) => s + a.balanceCents, 0), budget.currency)}
              </span>
            </Link>
          </div>
          {group("Presupuesto", onBudget)}
          {group("Seguimiento", tracking)}
          <div className="text-off-white [&_button]:text-off-white [&_button:hover]:bg-white/10">
            <AddAccountDialog />
          </div>
        </div>
        <div className="mt-auto border-t border-white/15 pt-4 text-sm text-off-white">
          <p className="truncate font-semibold">{user.name}</p>
          <p className="mb-2 truncate text-off-white/60">{user.email}</p>
          <form action={logoutUser}>
            <button className="min-h-10 rounded-field px-3 font-semibold text-off-white/80 hover:bg-white/10 hover:text-off-white transition cursor-pointer">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
