/** Simulación de préstamos (docs/06-formulas-y-reglas-negocio.md, sección 5). */

export interface LoanSimulationResult {
  neverPaid: boolean;
  months?: number;
  interest?: number;
}

export interface LoanSchedulePoint {
  month: number;
  label: string;
  baseBalance: number;
  extraBalance: number;
}

export interface DetailedLoanSimulation {
  base: LoanSimulationResult;
  withExtra: LoanSimulationResult;
  monthsSaved: number;
  interestSaved: number;
  schedule: LoanSchedulePoint[];
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

/**
 * Calcula la simulación comparativa completa con cronograma temporal
 * para proyectar las dos curvas de amortización (cuota regular vs. aporte extra).
 */
export function simulateLoanSchedule(
  balance: number,
  apr: number,
  payment: number,
  extra = 0,
): DetailedLoanSimulation {
  const base = simulateLoan(balance, apr, payment, 0);
  const withExtra = simulateLoan(balance, apr, payment, extra);

  if (base.neverPaid || withExtra.neverPaid) {
    return {
      base,
      withExtra,
      monthsSaved: 0,
      interestSaved: 0,
      schedule: [],
    };
  }

  const monthsSaved = Math.max(0, (base.months ?? 0) - (withExtra.months ?? 0));
  const interestSaved = Math.max(0, (base.interest ?? 0) - (withExtra.interest ?? 0));

  const r = apr / 12 / 100;
  const maxMonths = Math.max(base.months ?? 0, withExtra.months ?? 0);

  let bBase = balance;
  let bExtra = balance;

  const schedule: LoanSchedulePoint[] = [
    {
      month: 0,
      label: "Inicio",
      baseBalance: balance,
      extraBalance: balance,
    },
  ];

  // Si el horizonte supera 100 meses, muestreamos para rendimiento óptimo en Recharts
  const step = maxMonths > 100 ? Math.ceil(maxMonths / 60) : 1;

  for (let m = 1; m <= maxMonths; m++) {
    if (bBase > 0) {
      const iBase = Math.round(bBase * r);
      const payBase = Math.min(bBase + iBase, payment);
      bBase = Math.max(0, bBase + iBase - payBase);
    }

    if (bExtra > 0) {
      const iExtra = Math.round(bExtra * r);
      const payExtra = Math.min(bExtra + iExtra, payment + extra);
      bExtra = Math.max(0, bExtra + iExtra - payExtra);
    }

    if (m % step === 0 || m === maxMonths || bBase === 0 || bExtra === 0) {
      // Evitar duplicar el mismo punto si coincide
      const last = schedule[schedule.length - 1];
      if (!last || last.month !== m) {
        schedule.push({
          month: m,
          label: `Mes ${m}`,
          baseBalance: bBase,
          extraBalance: bExtra,
        });
      }
    }
  }

  return {
    base,
    withExtra,
    monthsSaved,
    interestSaved,
    schedule,
  };
}
