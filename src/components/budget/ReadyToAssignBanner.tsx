import { formatCents } from "@/lib/money";

export function ReadyToAssignBanner({ cents, currency = "BOB" }: { cents: number; currency?: string }) {
  const state =
    cents > 0
      ? { tone: "bg-money-green text-off-white shadow-md shadow-money-green/15", msg: `Te faltan ${formatCents(cents, currency)} por asignar` }
      : cents < 0
        ? { tone: "bg-alert text-white shadow-md shadow-alert/15", msg: `Asignaste ${formatCents(-cents, currency)} de más` }
        : { tone: "bg-line/60 text-deep-blue border border-line", msg: "Todo asignado" };

  return (
    <section
      aria-label="Ready to Assign"
      className={`flex flex-wrap items-center justify-between gap-2 rounded-card px-6 py-4 transition ${state.tone}`}
    >
      <div>
        <p className="text-sm font-semibold opacity-90">Ready to Assign</p>
        <p className="text-3xl font-extrabold tabular-nums">{formatCents(cents, currency)}</p>
      </div>
      <p className="text-base font-semibold">{state.msg}</p>
    </section>
  );
}
