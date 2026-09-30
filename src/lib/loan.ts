/** Simulación de préstamos (docs/06-formulas-y-reglas-negocio.md, sección 5). */

export interface LoanSimulationResult {
  neverPaid: boolean;
  months?: number;
  interest?: number;
}

export function simulateLoan(
  balance: number,
  apr: number,
  payment: number,
  extra = 0,
): LoanSimulationResult {
  const r = apr / 12 / 100;
  let b = balance;
  let months = 0;
  let interest = 0;

  // Si la cuota total no alcanza ni a pagar los intereses mensuales, la deuda es impagable.
  if (payment + extra <= b * r) {
    return { neverPaid: true };
  }

  while (b > 0 && months < 1200) {
    // Límite de seguridad: 100 años.
    const i = Math.round(b * r);
    const pay = Math.min(b + i, payment + extra);
    b = b + i - pay;
    interest += i;
    months++;
  }

  return { neverPaid: false, months, interest };
}
