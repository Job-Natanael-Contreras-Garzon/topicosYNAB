import { formatCents } from "@/lib/money";

/** Monto en pastilla con color semántico: Money Green > 0, gris neutro = 0, rojo alerta < 0. */
export function MoneyPill({ cents, currency = "BOB" }: { cents: number; currency?: string }) {
  const tone =
    cents > 0
      ? "bg-money-green/15 text-money-green border border-money-green/20"
      : cents < 0
        ? "bg-alert/15 text-alert border border-alert/20"
        : "bg-line/60 text-muted";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${tone}`}
    >
      {formatCents(cents, currency)}
    </span>
  );
}
