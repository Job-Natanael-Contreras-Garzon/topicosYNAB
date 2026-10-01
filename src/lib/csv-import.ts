/**
 * Utilidades puras para el procesamiento y mapeo de archivos CSV bancarios (M8).
 */

export type DateFormat = "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY" | "DD-MM-YYYY";
export type DecimalSeparator = "." | ",";

export interface ColumnMapping {
  dateCol: string;
  payeeCol: string;
  memoCol?: string;
  // Modo de monto: una sola columna con signo o dos columnas separadas (egreso/ingreso)
  amountMode: "single" | "dual";
  amountCol?: string;
  outflowCol?: string;
  inflowCol?: string;
  invertSign?: boolean;
}

export interface CsvParseOptions {
  dateFormat: DateFormat;
  decimalSeparator: DecimalSeparator;
  mapping: ColumnMapping;
}

export interface ParsedCsvTransaction {
  date: string; // ISO YYYY-MM-DD
  amountCents: number; // Negativo = gasto, Positivo = ingreso
  payee: string;
  memo: string;
  raw?: Record<string, string>;
}

/**
 * Parsea un string numérico con separador configurable (, o .) a centavos enteros.
 */
export function parseCsvAmountToCents(
  raw: string | undefined | null,
  decimalSeparator: DecimalSeparator = "."
): number {
  if (!raw) return 0;
  let str = raw.trim();
  if (!str) return 0;

  // Quitar símbolos de moneda y espacios
  str = str.replace(/[$\s€BsBOB]/gi, "");

  let isNegative = false;
  if (str.startsWith("-") || (str.startsWith("(") && str.endsWith(")"))) {
    isNegative = true;
    str = str.replace(/[()\-]/g, "").trim();
  } else if (str.endsWith("-")) {
    isNegative = true;
    str = str.replace("-", "").trim();
  }

  if (decimalSeparator === ",") {
    // Si la coma es el decimal, quitamos los puntos de miles y cambiamos la coma por punto
    str = str.replace(/\./g, "").replace(",", ".");
  } else {
    // Si el punto es el decimal, quitamos las comas de miles
    str = str.replace(/,/g, "");
  }

  const num = parseFloat(str);
  if (isNaN(num)) return 0;

  const cents = Math.round(num * 100);
  return isNegative ? -cents : cents;
}

/**
 * Parsea una fecha en string según el formato seleccionado y la devuelve en "YYYY-MM-DD".
 */
export function parseCsvDate(raw: string | undefined | null, format: DateFormat): string | null {
  if (!raw) return null;
  const str = raw.trim().replace(/[T\s].*$/, ""); // Remover horas si vienen incluidas

  let year: number;
  let month: number;
  let day: number;

  if (format === "YYYY-MM-DD") {
    const parts = str.split(/[-/]/);
    if (parts.length < 3) return null;
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else if (format === "DD/MM/YYYY" || format === "DD-MM-YYYY") {
    const parts = str.split(/[-/]/);
    if (parts.length < 3) return null;
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else if (format === "MM/DD/YYYY") {
    const parts = str.split(/[-/]/);
    if (parts.length < 3) return null;
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else {
    return null;
  }

  // Si el año viene en formato de 2 dígitos (ej: 26)
  if (year < 100) {
    year += 2000;
  }

  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    year < 1990 ||
    year > 2100
  ) {
    return null;
  }

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Mapea una fila cruda a una transacción procesada.
 */
export function mapCsvRow(
  row: Record<string, string>,
  options: CsvParseOptions
): ParsedCsvTransaction | null {
  const { mapping, dateFormat, decimalSeparator } = options;

  const rawDate = row[mapping.dateCol];
  const date = parseCsvDate(rawDate, dateFormat);
  if (!date) return null;

  const payee = (row[mapping.payeeCol] || "Transacción importada").trim();
  const memo = mapping.memoCol ? (row[mapping.memoCol] || "").trim() : "";

  let amountCents = 0;

  if (mapping.amountMode === "single") {
    const rawAmount = mapping.amountCol ? row[mapping.amountCol] : "";
    amountCents = parseCsvAmountToCents(rawAmount, decimalSeparator);
    if (mapping.invertSign) {
      amountCents = -amountCents;
    }
  } else {
    // Modo dual: Outflow (gasto) e Inflow (ingreso)
    const rawOutflow = mapping.outflowCol ? row[mapping.outflowCol] : "";
    const rawInflow = mapping.inflowCol ? row[mapping.inflowCol] : "";

    const outflow = Math.abs(parseCsvAmountToCents(rawOutflow, decimalSeparator));
    const inflow = Math.abs(parseCsvAmountToCents(rawInflow, decimalSeparator));

    if (outflow > 0) {
      amountCents = -outflow;
    } else if (inflow > 0) {
      amountCents = inflow;
    }
  }

  if (amountCents === 0 && !row[mapping.dateCol]) {
    return null;
  }

  return {
    date,
    amountCents,
    payee,
    memo,
    raw: row,
  };
}
