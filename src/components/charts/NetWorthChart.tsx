"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCents } from "@/lib/money";
import type { NetWorthItem } from "@/lib/services/reports";

interface Props {
  data: NetWorthItem[];
  currency: string;
}

export function NetWorthChart({ data, currency }: Props) {
  const hasData = data.length > 0;

  if (!hasData) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface/30 p-6 text-center">
        <p className="text-base font-semibold text-deep-blue">No hay historial de cuentas disponible</p>
        <p className="mt-1 text-sm text-muted">
          Crea cuentas y registra transacciones para calcular el patrimonio neto a lo largo del tiempo.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => {
    const parts = d.label.split(" ");
    const shortLabel = parts.length === 2 ? `${parts[0].slice(0, 3)} ${parts[1].slice(2)}` : d.month;
    return {
      ...d,
      shortLabel,
      assetsFormatted: d.assetsCents / 100,
      debtsFormatted: d.debtsCents / 100,
      netWorthFormatted: d.netWorthCents / 100,
    };
  });

  const latest = data[data.length - 1];

  return (
    <div className="space-y-6">
      {/* Tarjetas resumen del último mes */}
      {latest && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-card border border-line bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Activos ({latest.label})
            </span>
            <p className="mt-1 text-xl font-extrabold text-money-green">
              {formatCents(latest.assetsCents, currency)}
            </p>
          </div>
          <div className="rounded-card border border-line bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Deudas ({latest.label})
            </span>
            <p className="mt-1 text-xl font-extrabold text-alert">
              {formatCents(latest.debtsCents, currency)}
            </p>
          </div>
          <div className="rounded-card border border-line bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Patrimonio Neto Actual
            </span>
            <p
              className={`mt-1 text-xl font-extrabold ${
                latest.netWorthCents >= 0 ? "text-deep-blue" : "text-alert"
              }`}
            >
              {formatCents(latest.netWorthCents, currency)}
            </p>
          </div>
        </div>
      )}

      {/* Gráfico Recharts */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 15, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E3DED5" vertical={false} />
            <XAxis
              dataKey="shortLabel"
              stroke="#5E6878"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#E3DED5" }}
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
                  name === "assetsFormatted"
                    ? "Activos"
                    : name === "debtsFormatted"
                    ? "Deudas"
                    : "Patrimonio Neto";
                return [formatCents(cents, currency), label];
              }}
              labelFormatter={(_, payload) => {
                if (payload && payload[0]) {
                  return (payload[0].payload as any).label;
                }
                return "";
              }}
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
              formatter={(value) => {
                if (value === "assetsFormatted") return <span className="text-xs font-semibold text-deep-blue">Activos</span>;
                if (value === "debtsFormatted") return <span className="text-xs font-semibold text-alert">Deudas</span>;
                return <span className="text-xs font-semibold text-deep-blue">Patrimonio Neto</span>;
              }}
            />
            <Area
              type="monotone"
              dataKey="assetsFormatted"
              fill="#2E5A44"
              stroke="#2E5A44"
              fillOpacity={0.15}
            />
            <Area
              type="monotone"
              dataKey="debtsFormatted"
              fill="#FF8DA1"
              stroke="#FF8DA1"
              fillOpacity={0.2}
            />
            <Line
              type="monotone"
              dataKey="netWorthFormatted"
              stroke="#1A2B4C"
              strokeWidth={3}
              dot={{ r: 4, fill: "#1A2B4C" }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
