import { describe, expect, it } from "vitest";
import { centsToInput, formatCents, parseMoneyToCents } from "./money";

describe("parseMoneyToCents", () => {
  it.each([
    ["1000", 100_000],
    ["1.000,50", 100_050],
    ["1,000.50", 100_050],
    ["40,5", 4_050],
    ["40.5", 4_050],
    ["-12.3", -1_230],
    ["0,05", 5],
    ["1.000", 100_000],
    ["1.234.567,89", 123_456_789],
  ])("%s -> %i", (input, expected) => {
    expect(parseMoneyToCents(input)).toBe(expected);
  });
  it("devuelve null para texto inválido", () => {
    expect(parseMoneyToCents("")).toBeNull();
    expect(parseMoneyToCents("abc")).toBeNull();
    expect(parseMoneyToCents("-")).toBeNull();
  });
});

describe("formatCents", () => {
  it("formatea con dos decimales y separador local", () => {
    expect(formatCents(100_050)).toMatch(/1\.000,50/);
    expect(formatCents(-4_000)).toMatch(/-.*40,00|40,00.*-/);
  });
  it("centsToInput", () => expect(centsToInput(4050)).toBe("40.50"));
});
