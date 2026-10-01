"use client";

import { useId } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { formatCents } from "@/lib/money";
import type { SpendingCategoryItem } from "@/lib/services/reports";

interface Props {
  categories: SpendingCategoryItem[];
  totalSpendingCents: number;
  currency: string;
}

const PALETTE = [
  "#2E5A44", // Money Green
  "#1A2B4C", // Deep Blue
  "#FF8DA1", // Modern Pink
  "#4E7A62", // Muted Money Green
  "#3D5A80", // Slate Navy
  "#D46A80", // Muted Pink
  "#7B9E89", // Soft Green
  "#5E6878", // Cool Gray
  "#E59830", // Warning Warm Gold
  "#A3B899", // Pale Sage
];

export function SpendingByCategoryChart({
  categories,
  totalSpendingCents,
  currency,
}: Props) {
  const chartId = useId();

  if (categories.length === 0 || totalSpendingCents === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface/30 p-6 text-center">
        <p className="text-base font-semibold text-deep-blue">No hay gastos en este periodo</p>
        <p className="mt-1 text-sm text-muted">
          Registra gastos en tus cuentas para ver el desglose por categorías.
        </p>
      </div>
    );
  }

  // Tomamos los primeros 6 rubros más grandes y agrupamos el resto en "Otros"
  const topCategories = categories.slice(0, 6);
  const otherCategories = categories.slice(6);
  const otherTotalCents = otherCategories.reduce((acc, c) => acc + c.totalCents, 0);

  const chartData = [
    ...topCategories.map((c) => ({
      name: c.categoryName,
      cents: c.totalCents,
      percentage: c.percentage,
    })),
    ...(otherTotalCents > 0
      ? [
          {
            name: "Otros",
            cents: otherTotalCents,
            percentage: (otherTotalCents / totalSpendingCents) * 100,
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
      {/* Gráfico Donut Recharts */}
      <div className="relative h-72 w-full lg:col-span-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="cents"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={2}
              stroke="#F7F5F0"
              strokeWidth={2}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${chartId}-${index}`}
                  fill={PALETTE[index % PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [
                formatCents(Number(value) || 0, currency),
                "Gasto",
              ]}
              contentStyle={{
                backgroundColor: "#1A2B4C",
                borderColor: "#1A2B4C",
                borderRadius: "8px",
                color: "#F7F5F0",
                fontSize: "13px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              itemStyle={{ color: "#F7F5F0" }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centro de la dona */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Total gastado
          </span>
          <span className="text-lg font-extrabold text-deep-blue">
            {formatCents(totalSpendingCents, currency)}
          </span>
        </div>
      </div>

      {/* Lista detallada de categorías y porcentajes */}
      <div className="space-y-3 lg:col-span-6">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Desglose por categoría
        </h4>
        <div className="max-h-72 space-y-2.5 overflow-y-auto pr-2">
          {categories.map((c, index) => {
            const color = PALETTE[index % PALETTE.length];
            return (
              <div
                key={c.categoryId}
                className="flex items-center justify-between rounded-field border border-line/60 bg-white px-3 py-2 text-sm shadow-xs transition hover:border-line"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 truncate">
                    <p className="truncate font-semibold text-deep-blue">{c.categoryName}</p>
                    <p className="truncate text-xs text-muted">{c.groupName}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-bold text-deep-blue">
                    {formatCents(c.totalCents, currency)}
                  </p>
                  <p className="text-xs text-muted">
                    {c.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
