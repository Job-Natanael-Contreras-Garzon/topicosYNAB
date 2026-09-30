import { formatCents } from "@/lib/money";

/** Monto en pastilla con color semántico: verde > 0, gris = 0, rojo < 0. */
export function MoneyPill({ cents, currency = "BOB" }: { cents: number; currency?: string }) {
  const tone =
    cents > 0
      ? "bg-positive/15 text-positive"
      : cents < 0
        ? "bg-alert/15 text-alert"
        : "bg-line text-muted";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${tone}`}
      // El color no es lo único que informa: el signo negativo va en el texto.
    >
      {formatCents(cents, currency)}
    </span>
  );
}
