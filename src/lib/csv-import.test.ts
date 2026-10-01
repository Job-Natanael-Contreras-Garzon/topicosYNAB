import { describe, it, expect } from "vitest";
import {
  parseCsvAmountToCents,
  parseCsvDate,
  mapCsvRow,
  type CsvParseOptions,
} from "./csv-import";

describe("CSV Import Utilities (M8)", () => {
  describe("parseCsvAmountToCents", () => {
    it("parses standard decimal amounts with dot", () => {
      expect(parseCsvAmountToCents("150.50", ".")).toBe(15050);
      expect(parseCsvAmountToCents("-50.25", ".")).toBe(-5025);
      expect(parseCsvAmountToCents("1,250.00", ".")).toBe(125000);
      expect(parseCsvAmountToCents("(30.00)", ".")).toBe(-3000);
    });

    it("parses amounts with comma as decimal separator", () => {
      expect(parseCsvAmountToCents("150,50", ",")).toBe(15050);
      expect(parseCsvAmountToCents("-50,25", ",")).toBe(-5025);
      expect(parseCsvAmountToCents("1.250,00", ",")).toBe(125000);
    });

    it("handles currency symbols and spaces", () => {
      expect(parseCsvAmountToCents("$ 120.00", ".")).toBe(12000);
      expect(parseCsvAmountToCents("Bs 450,50", ",")).toBe(45050);
      expect(parseCsvAmountToCents("- BOB 15.00", ".")).toBe(-1500);
    });

    it("returns 0 for empty or invalid strings", () => {
      expect(parseCsvAmountToCents("", ".")).toBe(0);
      expect(parseCsvAmountToCents(null, ".")).toBe(0);
      expect(parseCsvAmountToCents("abc", ".")).toBe(0);
    });
  });

  describe("parseCsvDate", () => {
    it("parses YYYY-MM-DD format", () => {
      expect(parseCsvDate("2026-10-15", "YYYY-MM-DD")).toBe("2026-10-15");
      expect(parseCsvDate("2026-05-01T14:30:00", "YYYY-MM-DD")).toBe("2026-05-01");
    });

    it("parses DD/MM/YYYY format", () => {
      expect(parseCsvDate("15/10/2026", "DD/MM/YYYY")).toBe("2026-10-15");
      expect(parseCsvDate("01/05/2026", "DD/MM/YYYY")).toBe("2026-05-01");
    });

    it("parses MM/DD/YYYY format", () => {
      expect(parseCsvDate("10/15/2026", "MM/DD/YYYY")).toBe("2026-10-15");
      expect(parseCsvDate("05/01/2026", "MM/DD/YYYY")).toBe("2026-05-01");
    });

    it("returns null for invalid dates", () => {
      expect(parseCsvDate("not-a-date", "YYYY-MM-DD")).toBeNull();
      expect(parseCsvDate("", "DD/MM/YYYY")).toBeNull();
      expect(parseCsvDate("32/13/2026", "DD/MM/YYYY")).toBeNull();
    });
  });

  describe("mapCsvRow", () => {
    it("maps a row with single amount column", () => {
      const options: CsvParseOptions = {
        dateFormat: "DD/MM/YYYY",
        decimalSeparator: ".",
        mapping: {
          dateCol: "Fecha",
          payeeCol: "Comercio",
          amountCol: "Monto",
          amountMode: "single",
        },
      };

      const row = {
        Fecha: "12/10/2026",
        Comercio: "Supermercado Hipermaxi",
        Monto: "-350.50",
      };

      const result = mapCsvRow(row, options);
      expect(result).not.toBeNull();
      expect(result?.date).toBe("2026-10-12");
      expect(result?.payee).toBe("Supermercado Hipermaxi");
      expect(result?.amountCents).toBe(-35050);
    });

    it("supports invertSign for banks that report expenses as positive", () => {
      const options: CsvParseOptions = {
        dateFormat: "YYYY-MM-DD",
        decimalSeparator: ".",
        mapping: {
          dateCol: "Date",
          payeeCol: "Description",
          amountCol: "Amount",
          amountMode: "single",
          invertSign: true,
        },
      };

      const row = {
        Date: "2026-10-12",
        Description: "Coffee Shop",
        Amount: "25.00", // Gasto reportado en positivo por el banco
      };

      const result = mapCsvRow(row, options);
      expect(result?.amountCents).toBe(-2500);
    });

    it("maps a row with dual outflow/inflow columns", () => {
      const options: CsvParseOptions = {
        dateFormat: "YYYY-MM-DD",
        decimalSeparator: ",",
        mapping: {
          dateCol: "Fecha",
          payeeCol: "Detalle",
          amountMode: "dual",
          outflowCol: "Debito",
          inflowCol: "Credito",
        },
      };

      const expenseRow = {
        Fecha: "2026-10-01",
        Detalle: "Farmacia",
        Debito: "45,80",
        Credito: "",
      };

      const incomeRow = {
        Fecha: "2026-10-05",
        Detalle: "Sueldo",
        Debito: "",
        Credito: "4.500,00",
      };

      const resExpense = mapCsvRow(expenseRow, options);
      expect(resExpense?.amountCents).toBe(-4580);

      const resIncome = mapCsvRow(incomeRow, options);
      expect(resIncome?.amountCents).toBe(450000);
    });
  });
});
