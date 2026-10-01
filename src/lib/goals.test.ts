import { describe, expect, it } from "vitest";
import { evaluateGoal, remainingMonths } from "./goals";

describe("goals: remainingMonths", () => {
  it("mismo mes devuelve 1", () => {
    expect(remainingMonths("2026-10", "2026-10-15")).toBe(1);
  });

  it("tres meses de diferencia devuelve 3", () => {
    // 2026-10 a 2026-12: octubre, noviembre, diciembre = 3
    expect(remainingMonths("2026-10", "2026-12-31")).toBe(3);
  });

  it("fecha pasada devuelve mínimo 1", () => {
    expect(remainingMonths("2026-10", "2026-08-01")).toBe(1);
  });
});

describe("goals: evaluateGoal", () => {
  it("meta mensual: falta asignar la diferencia", () => {
    const res = evaluateGoal({ kind: "monthly", targetCents: 50_000 }, 30_000, 30_000, 0, "2026-10");
    expect(res.neededThisMonth).toBe(50_000);
    expect(res.underfundedCents).toBe(20_000);
    expect(res.isFunded).toBe(false);
  });

  it("meta mensual cumplida", () => {
    const res = evaluateGoal({ kind: "monthly", targetCents: 50_000 }, 50_000, 50_000, 0, "2026-10");
    expect(res.underfundedCents).toBe(0);
    expect(res.isFunded).toBe(true);
  });

  it("meta para una fecha: calcula cuota considerando arrastre y meses restantes", () => {
    // Meta de 3000 Bs (300 000 cents) para diciembre (3 meses: oct, nov, dic). Arrastre previo de 600 Bs (60 000 cents).
    // Restan 240 000 / 3 = 80 000 cents por mes.
    const res = evaluateGoal(
      { kind: "by_date", targetCents: 300_000, targetDate: "2026-12-15" },
      0, // Asignado este mes aún 0
      60_000, // Disponible actual = arrastre
      60_000, // Arrastre previo
      "2026-10"
    );
    expect(res.neededThisMonth).toBe(80_000);
    expect(res.underfundedCents).toBe(80_000);
  });

  it("meta por saldo objetivo: evalúa contra el disponible total", () => {
    const res = evaluateGoal({ kind: "balance", targetCents: 100_000 }, 20_000, 80_000, 60_000, "2026-10");
    expect(res.underfundedCents).toBe(20_000);
    expect(res.progressPercent).toBe(80);
  });
});
