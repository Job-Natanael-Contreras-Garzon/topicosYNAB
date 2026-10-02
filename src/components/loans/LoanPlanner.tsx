"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCents, parseMoneyToCents, centsToInput } from "@/lib/money";
import { simulateLoanSchedule } from "@/lib/loan";

interface Props {
  currency?: string;
  initialBalanceCents?: number;
}

export function LoanPlanner({
  currency = "BOB",
  initialBalanceCents = 2000000, // 20 000 por defecto
}: Props) {
  const [balanceInput, setBalanceInput] = useState(centsToInput(initialBalanceCents));
  const [aprInput, setAprInput] = useState("18.5");
  const [paymentInput, setPaymentInput] = useState("800");
  const [extraInput, setExtraInput] = useState("200");

  const balanceCents = parseMoneyToCents(balanceInput) ?? 0;
  const apr = parseFloat(aprInput) || 0;
  const paymentCents = parseMoneyToCents(paymentInput) ?? 0;
  const extraCents = parseMoneyToCents(extraInput) ?? 0;

  const simulation = simulateLoanSchedule(balanceCents, apr, paymentCents, extraCents);
  const isImpossible = simulation.base.neverPaid || simulation.withExtra.neverPaid;

  const chartData = simulation.schedule.map((pt) => ({
    label: pt.label,
    month: pt.month,
    baseBalanceFormatted: pt.baseBalance / 100,
    extraBalanceFormatted: pt.extraBalance / 100,
  }));

  const monthsExtra = simulation.withExtra.months ?? 0;
  const monthsBase = simulation.base.months ?? 0;

  return (
    <div className="space-y-8">
      {/* Panel de Parámetros de Entrada */}
      <div className="rounded-card border border-line bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-deep-blue mb-4">
          Parámetros del Préstamo o Deuda
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="loan-balance-input" className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
              Saldo Pendiente ({currency})
            </label>
            <input
              id="loan-balance-input"
              type="text"
              inputMode="decimal"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className="w-full rounded-field border border-line bg-surface/40 px-3 py-2 text-sm font-bold text-deep-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-modern-pink"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="loan-apr-input" className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
              Tasa Nominal Anual (APR %)
            </label>
            <input
              id="loan-apr-input"
              type="number"
              step="0.1"
              value={aprInput}
              onChange={(e) => setAprInput(e.target.value)}
              className="w-full rounded-field border border-line bg-surface/40 px-3 py-2 text-sm font-bold text-deep-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-modern-pink"
              placeholder="15.0"
            />
          </div>

          <div>
            <label htmlFor="loan-payment-input" className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
              Cuota Regular Mensual ({currency})
            </label>
            <input
              id="loan-payment-input"
              type="text"
              inputMode="decimal"
              value={paymentInput}
              onChange={(e) => setPaymentInput(e.target.value)}
              className="w-full rounded-field border border-line bg-surface/40 px-3 py-2 text-sm font-bold text-deep-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-modern-pink"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="loan-extra-input" className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
              Pago Extra Voluntario ({currency})
            </label>
            <div className="space-y-1.5">
              <input
                id="loan-extra-input"
                type="text"
                inputMode="decimal"
                value={extraInput}
                onChange={(e) => setExtraInput(e.target.value)}
                className="w-full rounded-field border border-line bg-surface/40 px-3 py-2 text-sm font-bold text-money-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-modern-pink"
                placeholder="0.00"
              />
              <div className="flex gap-1">
                {[50, 100, 200, 500].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setExtraInput(String(v))}
                    className="rounded px-1.5 py-0.5 text-[11px] font-semibold bg-surface hover:bg-powder-pink/50 text-deep-blue border border-line"
                  >
                    +{v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Deuda Impagable si la cuota no cubre intereses */}
      {isImpossible && (
        <div className="rounded-card border border-alert/30 bg-alert/10 p-5 text-alert">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span>⚠️</span> Cuota insuficiente para amortizar
          </h3>
          <p className="mt-1 text-xs text-alert/90">
            La cuota mensual ({currency} {paymentInput}) es menor o igual a los intereses devengados
            cada mes. A este ritmo la deuda nunca se terminaría de pagar. Incrementa la cuota mensual
            o el aporte extra para reducir el capital.
          </p>
        </div>
      )}

      {/* Tarjetas de Métricas de Ahorro y Plazo */}
      {!isImpossible && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-card border border-line bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Plazo con aporte extra
            </span>
            <p className="mt-1 text-2xl font-extrabold text-deep-blue">
              {monthsExtra} meses
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Frente a {monthsBase} meses con cuota base
            </p>
          </div>

          <div className="rounded-card border border-line bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Tiempo ahorrado
            </span>
            <p className="mt-1 text-2xl font-extrabold text-money-green">
              {simulation.monthsSaved} meses libres
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {simulation.monthsSaved > 0
                ? `Te liberas ${(simulation.monthsSaved / 12).toFixed(1)} años antes`
                : "Sin ahorro de tiempo"}
            </p>
          </div>

          <div className="rounded-card border border-line bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Intereses totales
            </span>
            <p className="mt-1 text-2xl font-extrabold text-deep-blue">
              {formatCents(simulation.withExtra.interest ?? 0, currency)}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              En lugar de {formatCents(simulation.base.interest ?? 0, currency)}
            </p>
          </div>

          <div className="rounded-card border border-line bg-money-green/10 p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-money-green">
              Dinero ahorrado
            </span>
            <p className="mt-1 text-2xl font-extrabold text-money-green">
              {formatCents(simulation.interestSaved, currency)}
            </p>
            <p className="mt-0.5 text-xs text-deep-blue font-medium">
              Ahorro directo en intereses bancarios
            </p>
          </div>
        </div>
      )}

      {/* Gráfico Comparativo de Amortización Recharts */}
      {!isImpossible && chartData.length > 0 && (
        <div className="rounded-card border border-line bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
            <div>
              <h3 className="text-base font-bold text-deep-blue">
                Curvas de Amortización Comparativas
              </h3>
              <p className="text-xs text-muted">
                Contraste de evolución del saldo: Cuota Regular vs. Cuota + Aporte Extra Voluntario
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E3DED5" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#5E6878"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#E3DED5" }}
                  tickFormatter={(val) => `Mes ${val}`}
                />
                <YAxis
                  stroke="#5E6878"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currency} ${val}`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    const cents = Math.round(Number(value) * 100);
                    const label =
                      name === "baseBalanceFormatted"
                        ? "Saldo Cuota Regular"
                        : "Saldo con Pago Extra";
                    return [formatCents(cents, currency), label];
                  }}
                  labelFormatter={(m) => `Mes ${m}`}
                  contentStyle={{
                    backgroundColor: "#1A2B4C",
                    borderColor: "#1A2B4C",
                    borderRadius: "8px",
                    color: "#F7F5F0",
                    fontSize: "13px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(val) => {
                    if (val === "baseBalanceFormatted") {
                      return <span className="text-xs font-semibold text-deep-blue">Sin aporte extra</span>;
                    }
                    return <span className="text-xs font-semibold text-money-green">Con aporte extra ({currency} {extraInput}/mes)</span>;
                  }}
                />
                {/* Curva Base (Regular) */}
                <Line
                  type="monotone"
                  dataKey="baseBalanceFormatted"
                  stroke="#1A2B4C"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                {/* Curva con Aporte Extra */}
                <Area
                  type="monotone"
                  dataKey="extraBalanceFormatted"
                  fill="#2E5A44"
                  stroke="#2E5A44"
                  strokeWidth={3}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
