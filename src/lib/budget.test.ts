import { describe, expect, it } from "vitest";
import {
  computeBudget,
  moveMoney,
  onBudgetBalance,
  readyToAssign,
  available,
  type BudgetInput,
} from "./budget";
import { monthRange } from "./months";

const CATS = ["comida", "salidas"];
const base = (over: Partial<BudgetInput> = {}): BudgetInput => ({
  categoryIds: CATS,
  assignments: [],
  transactions: [],
  ...over,
});
const income = (month: string, amountCents: number) => ({
  onBudget: true, categoryId: null, month, amountCents,
});
const spend = (month: string, categoryId: string, amountCents: number) => ({
  onBudget: true, categoryId, month, amountCents: -Math.abs(amountCents),
});

/** Verifica el invariante contable en todos los meses del rango. */
function expectConsistent(input: BudgetInput, from: string, to: string) {
  for (const m of monthRange(from, to)) {
    const b = computeBudget(input, m);
    expect(b.readyToAssign + b.totals.available, `mes ${m}`).toBe(onBudgetBalance(input, m));
  }
}

describe("budget: casos base", () => {
  it("mes sin movimientos: todo en cero", () => {
    const b = computeBudget(base(), "2026-09");
    expect(b.readyToAssign).toBe(0);
    expect(b.categories.comida.available).toBe(0);
  });

  it("CU1: el saldo inicial entra íntegro a Ready to Assign", () => {
    const input = base({ transactions: [income("2026-09", 100_000)] });
    expect(readyToAssign(input, "2026-09")).toBe(100_000);
  });

  it("CU2: asignar 450 y 100 reduce Ready to Assign en 550", () => {
    const input = base({
      transactions: [income("2026-09", 100_000)],
      assignments: [
        { categoryId: "comida", month: "2026-09", assignedCents: 45_000 },
        { categoryId: "salidas", month: "2026-09", assignedCents: 10_000 },
      ],
    });
    const b = computeBudget(input, "2026-09");
    expect(b.readyToAssign).toBe(100_000 - 55_000);
    expect(b.categories.comida.available).toBe(45_000);
    expect(b.categories.salidas.available).toBe(10_000);
  });

  it("CU3: un gasto de 40 baja el disponible de Comida en 40", () => {
    const input = base({
      transactions: [income("2026-09", 100_000), spend("2026-09", "comida", 4_000)],
      assignments: [{ categoryId: "comida", month: "2026-09", assignedCents: 45_000 }],
    });
    expect(available(input, "comida", "2026-09")).toBe(41_000);
  });

  it("las cuentas de seguimiento no afectan al presupuesto", () => {
    const input = base({
      transactions: [
        income("2026-09", 100_000),
        { onBudget: false, categoryId: null, month: "2026-09", amountCents: 999_999 },
      ],
    });
    expect(readyToAssign(input, "2026-09")).toBe(100_000);
  });

  it("transferencia entre cuentas de presupuesto no altera nada", () => {
    const input = base({
      transactions: [
        income("2026-09", 100_000),
        { onBudget: true, categoryId: null, month: "2026-09", amountCents: -30_000 },
        { onBudget: true, categoryId: null, month: "2026-09", amountCents: 30_000 },
      ],
    });
    expect(readyToAssign(input, "2026-09")).toBe(100_000);
    expectConsistent(input, "2026-09", "2026-09");
  });
});

describe("budget: arrastre entre meses", () => {
  it("el saldo positivo se arrastra al mes siguiente, incluso con meses saltados", () => {
    const input = base({
      transactions: [income("2026-06", 100_000)],
      assignments: [{ categoryId: "comida", month: "2026-06", assignedCents: 30_000 }],
    });
    expect(available(input, "comida", "2026-07")).toBe(30_000);
    expect(available(input, "comida", "2026-09")).toBe(30_000);
    expect(readyToAssign(input, "2026-09")).toBe(70_000);
    expectConsistent(input, "2026-06", "2026-12");
  });
});

describe("budget: sobregasto (CU4)", () => {
  const overspent = base({
    transactions: [income("2026-08", 100_000), spend("2026-08", "comida", 12_000)],
    assignments: [{ categoryId: "comida", month: "2026-08", assignedCents: 10_000 }],
  });

  it("el mes del sobregasto muestra disponible negativo", () => {
    expect(available(overspent, "comida", "2026-08")).toBe(-2_000);
  });

  it("el mes siguiente arranca en 0 y el déficit reduce Ready to Assign", () => {
    expect(available(overspent, "comida", "2026-09")).toBe(0);
    // Ingresos 1000 - asignado 100 - sobregasto 20 = 880
    expect(readyToAssign(overspent, "2026-08")).toBe(90_000);
    expect(readyToAssign(overspent, "2026-09")).toBe(88_000);
  });

  it("cubrir el sobregasto moviendo dinero deja la categoría en 0", () => {
    const deltas = moveMoney("salidas", "comida", "2026-08", 2_000);
    const fixed = base({
      transactions: overspent.transactions,
      assignments: [
        ...overspent.assignments,
        { categoryId: "salidas", month: "2026-08", assignedCents: 5_000 },
        ...deltas.map((d) => ({
          categoryId: d.categoryId, month: d.month, assignedCents: d.deltaCents,
        })),
      ],
    });
    expect(available(fixed, "comida", "2026-08")).toBe(0);
    expect(available(fixed, "salidas", "2026-08")).toBe(3_000);
  });

  it("consistencia con sobregasto", () => {
    expectConsistent(overspent, "2026-08", "2027-02");
  });
});

describe("budget: moveMoney", () => {
  it("genera deltas opuestos que suman cero", () => {
    const d = moveMoney("a", "b", "2026-09", 500);
    expect(d.reduce((s, x) => s + x.deltaCents, 0)).toBe(0);
  });
  it("rechaza montos inválidos y categorías iguales", () => {
    expect(() => moveMoney("a", "b", "2026-09", 0)).toThrow();
    expect(() => moveMoney("a", "a", "2026-09", 100)).toThrow();
  });
});

describe("budget: consistencia (propiedad)", () => {
  it("RTA + Σ disponibles = saldo de cuentas en 300 escenarios aleatorios", () => {
    let seed = 42;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
    const months = monthRange("2026-01", "2026-08");
    for (let run = 0; run < 300; run++) {
      const input = base({ assignments: [], transactions: [] });
      for (const m of months) {
        if (rnd() < 0.4) input.transactions.push(income(m, Math.floor(rnd() * 200_000)));
        for (const c of CATS) {
          if (rnd() < 0.5)
            input.assignments.push({
              categoryId: c, month: m, assignedCents: Math.floor(rnd() * 100_000),
            });
          if (rnd() < 0.5) input.transactions.push(spend(m, c, Math.floor(rnd() * 100_000)));
        }
        if (rnd() < 0.2) {
          const amt = Math.floor(rnd() * 50_000);
          input.transactions.push(
            { onBudget: true, categoryId: null, month: m, amountCents: -amt },
            { onBudget: true, categoryId: null, month: m, amountCents: amt },
          );
        }
      }
      expectConsistent(input, "2026-01", "2026-12");
    }
  });
});
