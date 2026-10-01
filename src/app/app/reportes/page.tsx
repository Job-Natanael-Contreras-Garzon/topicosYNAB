import Link from "next/link";
import { db } from "@/lib/db";
import { requireBudget } from "@/lib/services/auth";
import {
  getReportDateRange,
  getSpendingByCategory,
  getSpendingTrend,
  getNetWorth,
} from "@/lib/services/reports";
import { SpendingByCategoryChart } from "@/components/charts/SpendingByCategoryChart";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { NetWorthChart } from "@/components/charts/NetWorthChart";

export const metadata = { title: "Reportes — Sobres" };

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    range?: string;
    category?: string;
  }>;
}

export default async function ReportesPage({ searchParams }: PageProps) {
  const { tab = "category", range = "6m", category = "all" } = await searchParams;
  const { budget } = await requireBudget();

  const { fromDate, toDate, fromMonth, toMonth } = getReportDateRange(range);

  // Consultar categorías para el filtro de la pestaña de tendencia
  const categoryGroups = await db.categoryGroup.findMany({
    where: { budgetId: budget.id },
    orderBy: { sort: "asc" },
    include: {
      categories: {
        where: { hidden: false },
        orderBy: { sort: "asc" },
      },
    },
  });

  // Cargar datos según la pestaña activa (o cargar en paralelo)
  let spendingCategoryData = null;
  let spendingTrendData = null;
  let netWorthData = null;

  if (tab === "category") {
    spendingCategoryData = await getSpendingByCategory(budget.id, fromDate, toDate);
  } else if (tab === "trend") {
    spendingTrendData = await getSpendingTrend(budget.id, fromDate, toDate, category);
  } else if (tab === "networth") {
    netWorthData = await getNetWorth(budget.id, fromDate, toDate);
  }

  const rangeButtons = [
    { id: "3m", label: "3 meses" },
    { id: "6m", label: "6 meses" },
    { id: "12m", label: "12 meses" },
    { id: "this_year", label: "Este año" },
  ];

  const tabs = [
    { id: "category", label: "Gasto por categoría", icon: "🍰" },
    { id: "trend", label: "Tendencia de gasto", icon: "📊" },
    { id: "networth", label: "Patrimonio neto", icon: "📈" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-deep-blue">Reportes</h1>
          <p className="mt-0.5 text-sm text-muted">
            Analiza tu comportamiento financiero, evolución y patrimonio neto.
          </p>
        </div>

        {/* Selector de Rango Temporal */}
        <div className="flex items-center gap-1 rounded-card border border-line bg-white p-1 shadow-xs">
          {rangeButtons.map((r) => {
            const isActive = range === r.id;
            return (
              <Link
                key={r.id}
                href={`/app/reportes?tab=${tab}&range=${r.id}${category !== "all" ? `&category=${category}` : ""}`}
                className={`rounded-field px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-deep-blue text-off-white shadow-xs"
                    : "text-muted hover:text-deep-blue hover:bg-surface"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pestañas de navegación de reportes */}
      <div className="flex border-b border-line">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <Link
              key={t.id}
              href={`/app/reportes?tab=${t.id}&range=${range}${category !== "all" ? `&category=${category}` : ""}`}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-modern-pink text-deep-blue"
                  : "border-transparent text-muted hover:border-line hover:text-deep-blue"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div className="rounded-card border border-line bg-white p-6 shadow-sm">
        {tab === "category" && spendingCategoryData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-deep-blue">
                  Distribución de Gastos por Categoría
                </h2>
                <p className="text-xs text-muted">
                  Periodo: {fromMonth} a {toMonth} (transferencias excluidas)
                </p>
              </div>
            </div>

            <SpendingByCategoryChart
              categories={spendingCategoryData.categories}
              totalSpendingCents={spendingCategoryData.totalSpendingCents}
              currency={budget.currency}
            />
          </div>
        )}

        {tab === "trend" && spendingTrendData && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-deep-blue">
                  Tendencia Mensual de Gasto
                </h2>
                <p className="text-xs text-muted">
                  Evolución cronológica mes a mes en el rango seleccionado
                </p>
              </div>

              {/* Selector de Categoría individual o todas */}
              <form method="GET" action="/app/reportes" className="flex items-center gap-2">
                <input type="hidden" name="tab" value="trend" />
                <input type="hidden" name="range" value={range} />
                <label htmlFor="category-select" className="text-xs font-semibold text-muted">
                  Filtrar categoría:
                </label>
                <select
                  id="category-select"
                  name="category"
                  defaultValue={category}
                  className="rounded-field border border-line bg-surface/50 px-3 py-1.5 text-xs font-medium text-deep-blue focus:bg-white"
                  onChange={(e) => e.target.form?.submit()}
                >
                  <option value="all">Todas las categorías</option>
                  <option value="uncategorized">Sin categoría</option>
                  {categoryGroups.map((group) => (
                    <optgroup key={group.id} label={group.name}>
                      {group.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </form>
            </div>

            <SpendingTrendChart
              data={spendingTrendData}
              currency={budget.currency}
            />
          </div>
        )}

        {tab === "networth" && netWorthData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-deep-blue">
                  Evolución del Patrimonio Neto
                </h2>
                <p className="text-xs text-muted">
                  Suma de saldos de todas las cuentas al cierre de cada mes (Activos − Deudas)
                </p>
              </div>
            </div>

            <NetWorthChart
              data={netWorthData}
              currency={budget.currency}
            />
          </div>
        )}
      </div>
    </div>
  );
}
