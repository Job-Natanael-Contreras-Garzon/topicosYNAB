/** Helpers para meses en formato canónico "YYYY-MM" (sin zonas horarias). */

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidMonth(m: string): boolean {
  return MONTH_RE.test(m);
}

/** Mes de una fecha, calculado en UTC (las fechas se guardan a medianoche UTC). */
export function monthOf(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export function currentMonth(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const idx = y * 12 + (m - 1) + delta;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

export function prevMonth(month: string): string {
  return addMonths(month, -1);
}

export function nextMonth(month: string): string {
  return addMonths(month, 1);
}

/** Lista contigua de meses desde `from` hasta `to` (inclusive). Vacía si from > to. */
export function monthRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let m = from; m <= to; m = nextMonth(m)) out.push(m);
  return out;
}

const NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${NAMES[m - 1]} ${y}`;
}
