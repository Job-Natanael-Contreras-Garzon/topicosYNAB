import { formatCents } from "@/lib/money";

export function ReadyToAssignBanner({ cents, currency = "BOB" }: { cents: number; currency?: string }) {
  const state =
    cents > 0
      ? { tone: "bg-positive text-white", msg: `Te faltan ${formatCents(cents, currency)} por asignar` }
      : cents < 0
        ? { tone: "bg-alert text-white", msg: `Asignaste ${formatCents(-cents, currency)} de más` }
        : { tone: "bg-line text-navy", msg: "Todo asignado" };

  return (
    <section
      aria-label="Ready to Assign"
      className={`flex flex-wrap items-center justify-between gap-2 rounded-card px-6 py-4 ${state.tone}`}
    >
      <div>
        <p className="text-sm font-semibold opacity-90">Ready to Assign</p>
        <p className="text-3xl font-extrabold tabular-nums">{formatCents(cents, currency)}</p>
      </div>
      <p className="text-base font-semibold">{state.msg}</p>
    </section>
  );
}
