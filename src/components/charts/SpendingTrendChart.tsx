"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCents } from "@/lib/money";
import type { SpendingTrendItem } from "@/lib/services/reports";

interface Props {
  data: SpendingTrendItem[];
  currency: string;
}

export function SpendingTrendChart({ data, currency }: Props) {
  const hasSpending = data.some((d) => d.totalCents > 0);

  if (!hasSpending) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface/30 p-6 text-center">
        <p className="text-base font-semibold text-deep-blue">No hay gastos en esta selección</p>
        <p className="mt-1 text-sm text-muted">
          Prueba cambiando el rango de fechas o seleccionando todas las categorías.
        </p>
      </div>
    );
  }

  // Abreviar el label del mes para el eje X (ej: "Oct 26")
  const chartData = data.map((d) => {
    const parts = d.label.split(" ");
    const shortLabel = parts.length === 2 ? `${parts[0].slice(0, 3)} ${parts[1].slice(2)}` : d.month;
    return {
      ...d,
      shortLabel,
      amountFormatted: d.totalCents / 100,
    };
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            formatter={(value: any) => [
              formatCents(Math.round(Number(value) * 100), currency),
              "Gasto total",
            ]}
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
            itemStyle={{ color: "#FF8DA1" }}
          />
          <Bar
            dataKey="amountFormatted"
            fill="#2E5A44"
            radius={[6, 6, 0, 0]}
            maxBarSize={56}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
