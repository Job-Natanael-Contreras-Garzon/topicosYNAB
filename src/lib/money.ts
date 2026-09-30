/**
 * Utilidades de dinero. Todo el sistema trabaja en centavos enteros;
 * la conversión a texto ocurre únicamente en la capa visual.
 */

const LOCALE = "es-BO";

/** Formatea centavos como moneda local, p. ej. 100000 -> "Bs 1.000,00". */
export function formatCents(cents: number, currency = "BOB"): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(cents / 100);
}

/** Formatea centavos como número simple con dos decimales (para inputs). */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Convierte texto escrito por el usuario a centavos enteros.
 * Acepta "1000", "1.000,50", "1,000.50", "40,5" y "-12.3".
 * Devuelve null si el texto no es un número válido.
 */
export function parseMoneyToCents(input: string): number | null {
  let s = input.trim().replace(/\s/g, "").replace(/[^\d.,-]/g, "");
  if (!s || s === "-") return null;

  const negative = s.startsWith("-");
  s = s.replace(/-/g, "");

  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  const decimalPos = Math.max(lastDot, lastComma);

  let intPart = s;
  let decPart = "";
  if (decimalPos !== -1) {
    const after = s.length - decimalPos - 1;
    const sep = s[decimalPos];
    const sepCount = s.split(sep).length - 1;
    // Un único separador seguido de 3 dígitos se interpreta como miles ("1.000"),
    // salvo que el otro separador ya indique cuál es el decimal.
    const otherSepPresent = sep === "." ? lastComma !== -1 : lastDot !== -1;
    const isThousands = !otherSepPresent && (sepCount > 1 || after === 3);
    if (!isThousands) {
      intPart = s.slice(0, decimalPos);
      decPart = s.slice(decimalPos + 1);
    }
  }
  intPart = intPart.replace(/[.,]/g, "");
  if (!/^\d*$/.test(intPart) || !/^\d*$/.test(decPart)) return null;
  if (!intPart && !decPart) return null;

  const cents =
    parseInt(intPart || "0", 10) * 100 + parseInt((decPart + "00").slice(0, 2), 10);
  return negative ? -cents : cents;
}
