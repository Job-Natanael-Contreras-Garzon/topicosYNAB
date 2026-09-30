import { describe, expect, it } from "vitest";
import { simulateLoan } from "./loan";

describe("simulateLoan", () => {
  it("sin pago extra: préstamo sin interés se paga en balance/cuota meses", () => {
    const r = simulateLoan(120000, 0, 10000);
    expect(r).toEqual({ neverPaid: false, months: 12, interest: 0 });
  });

  it("con interés: paga más de balance/cuota meses y genera intereses", () => {
    const r = simulateLoan(1_000_000, 12, 50_000);
    expect(r.neverPaid).toBe(false);
    expect(r.months).toBeGreaterThan(20);
    expect(r.interest).toBeGreaterThan(0);
  });

  it("con pago extra: menos meses y menos intereses que sin extra", () => {
    const base = simulateLoan(1_000_000, 12, 50_000);
    const fast = simulateLoan(1_000_000, 12, 50_000, 20_000);
    expect(fast.months!).toBeLessThan(base.months!);
    expect(fast.interest!).toBeLessThan(base.interest!);
  });

  it("cuota menor a los intereses: nunca se paga", () => {
    // 10 000,00 al 24% anual => intereses 200,00 al mes; cuota 150,00
    expect(simulateLoan(1_000_000, 24, 15_000)).toEqual({ neverPaid: true });
  });

  it("la última cuota no paga de más", () => {
    const r = simulateLoan(15000, 0, 10000);
    expect(r.months).toBe(2);
  });
});
