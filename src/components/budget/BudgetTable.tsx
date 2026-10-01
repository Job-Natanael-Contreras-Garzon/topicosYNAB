"use client";

import { useMemo, useState, Fragment, useTransition } from "react";
import Link from "next/link";
import { setAssignmentAction } from "@/actions/budget";
import { autoAssignFromGoalsAction } from "@/actions/goals";
import { InlineNumberInput } from "./InlineNumberInput";
import { MoneyPill } from "./MoneyPill";
import { MoveMoneyDialog } from "./MoveMoneyDialog";
import { ManageCategoriesDialog } from "./ManageCategoriesDialog";
import { GoalProgress } from "@/components/goals/GoalProgress";
import { GoalModal } from "@/components/goals/GoalModal";
import { formatCents } from "@/lib/money";

export interface CategoryItem {
  id: string;
  name: string;
  hidden: boolean;
}

export interface CategoryGroupItem {
  id: string;
  name: string;
  categories: CategoryItem[];
}

export interface EvaluatedGoalItem {
  id: string;
  categoryId: string;
  kind: "monthly" | "by_date" | "balance";
  targetCents: number;
  targetDate?: Date | string | null;
  evaluation: {
    kind: "monthly" | "by_date" | "balance";
    targetCents: number;
    neededThisMonth: number;
    underfundedCents: number;
    progressPercent: number;
    targetDateStr?: string | null;
    isFunded: boolean;
  };
}

export interface BudgetComputedData {
  month: string;
  readyToAssign: number;
  categories: Record<
    string,
    {
      assigned: number;
      activity: number;
      available: number;
    }
  >;
  totals: {
    assigned: number;
    activity: number;
    available: number;
  };
}

interface Props {
  month: string;
  currency?: string;
  groups: CategoryGroupItem[];
  computedBudget: BudgetComputedData;
  evaluatedGoals?: EvaluatedGoalItem[];
}

export function BudgetTable({
  month,
  currency = "BOB",
  groups,
  computedBudget,
  evaluatedGoals = [],
}: Props) {
  // Estado para colapsar/expandir grupos
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Diálogo Mover Dinero
  const [movingCategory, setMovingCategory] = useState<{
    id: string;
    name: string;
    availableCents: number;
  } | null>(null);

  // Diálogo Administrar Categorías
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [initialGroupIdToAdd, setInitialGroupIdToAdd] = useState<string | null>(null);

  // Diálogo Metas
  const [goalModalCategory, setGoalModalCategory] = useState<{
    id: string;
    name: string;
    existingGoal?: {
      kind: "monthly" | "by_date" | "balance";
      targetCents: number;
      targetDate?: Date | string | null;
    } | null;
  } | null>(null);

  const [isAutoAssigning, startAutoAssign] = useTransition();

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleSaveAssigned = async (categoryId: string, cents: number) => {
    await setAssignmentAction(categoryId, month, cents);
  };

  const goalsMap = useMemo(() => {
    const map = new Map<string, EvaluatedGoalItem>();
    for (const g of evaluatedGoals) {
      map.set(g.categoryId, g);
    }
    return map;
  }, [evaluatedGoals]);

  const totalUnderfunded = useMemo(() => {
    return evaluatedGoals.reduce((sum, g) => sum + g.evaluation.underfundedCents, 0);
  }, [evaluatedGoals]);

  const handleAutoAssign = () => {
    startAutoAssign(async () => {
      await autoAssignFromGoalsAction(month);
    });
  };

  // Lista plana de categorías activas para el diálogo Mover Dinero
  const allActiveCategories = useMemo(() => {
    return groups.flatMap((g) =>
      g.categories
        .filter((c) => !c.hidden)
        .map((c) => ({
          id: c.id,
          name: c.name,
          groupName: g.name,
        }))
    );
  }, [groups]);

  // Cálculos de subtotales por grupo
  const groupTotals = useMemo(() => {
    const res: Record<string, { assigned: number; activity: number; available: number }> = {};
    for (const g of groups) {
      let assigned = 0;
      let activity = 0;
      let available = 0;
      for (const c of g.categories.filter((cat) => !cat.hidden)) {
        const s = computedBudget.categories[c.id];
        if (s) {
          assigned += s.assigned;
          activity += s.activity;
          available += s.available;
        }
      }
      res[g.id] = { assigned, activity, available };
    }
    return res;
  }, [groups, computedBudget]);

  return (
    <div className="space-y-4">
      {/* Barra de Acciones y Resumen del Mes */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs font-bold uppercase text-muted">Total Asignado</p>
            <p className="text-xl font-extrabold tabular-nums text-deep-blue mt-0.5">
              {formatCents(computedBudget.totals.assigned, currency)}
            </p>
          </div>
          <div className="border-l border-line pl-6">
            <p className="text-xs font-bold uppercase text-muted">Total Actividad</p>
            <p className="text-xl font-extrabold tabular-nums text-alert mt-0.5">
              {formatCents(computedBudget.totals.activity, currency)}
            </p>
          </div>
          <div className="border-l border-line pl-6">
            <p className="text-xs font-bold uppercase text-muted">Total Disponible</p>
            <p className="text-xl font-extrabold tabular-nums text-money-green mt-0.5">
              {formatCents(computedBudget.totals.available, currency)}
            </p>
          </div>
          {totalUnderfunded > 0 && (
            <div className="border-l border-line pl-6">
              <p className="text-xs font-bold uppercase text-alert">Falta en Metas</p>
              <p className="text-xl font-extrabold tabular-nums text-alert mt-0.5">
                {formatCents(totalUnderfunded, currency)}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {totalUnderfunded > 0 && (
            <button
              type="button"
              onClick={handleAutoAssign}
              disabled={isAutoAssigning}
              className="inline-flex min-h-9 items-center justify-center rounded-field bg-modern-pink text-deep-blue font-bold px-3 py-1.5 text-xs hover:brightness-95 transition shadow-sm cursor-pointer disabled:opacity-50"
              title="Asignar automáticamente el monto necesario a todas las categorías con meta descubierta"
            >
              {isAutoAssigning
                ? "Asignando…"
                : `⚡ Asignar lo que falta (${formatCents(totalUnderfunded, currency)})`}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setInitialGroupIdToAdd(null);
              setIsManageOpen(true);
            }}
            className="inline-flex min-h-9 items-center justify-center rounded-field border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-deep-blue hover:bg-powder-pink/30 hover:border-modern-pink transition cursor-pointer"
          >
            ⚙ Categorías
          </button>
        </div>
      </div>

      {/* Tabla del Presupuesto */}
      <div className="overflow-x-auto rounded-card border border-line bg-white shadow-sm">
        <table className="w-full min-w-[42rem] text-sm">
          <thead>
            <tr className="border-b border-line bg-surface/80 text-left text-xs font-bold text-muted uppercase tracking-wider">
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Asignado</th>
              <th className="px-4 py-3 text-right">Actividad</th>
              <th className="px-4 py-3 text-right">Disponible</th>
            </tr>
          </thead>
          <tbody className="text-deep-blue">
            {groups.map((group) => {
              const isCollapsed = Boolean(collapsedGroups[group.id]);
              const visibleCategories = group.categories.filter((c) => !c.hidden);
              const totals = groupTotals[group.id] || { assigned: 0, activity: 0, available: 0 };

              return (
                <Fragment key={group.id}>
                  {/* Fila del Grupo */}
                  <tr className="border-t border-line bg-surface/60 hover:bg-surface transition">
                    <th colSpan={1} className="px-4 py-2.5 text-left font-bold text-deep-blue">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.id)}
                          aria-label={isCollapsed ? `Expandir ${group.name}` : `Colapsar ${group.name}`}
                          className="h-6 w-6 rounded hover:bg-deep-blue/10 flex items-center justify-center text-xs text-muted hover:text-deep-blue transition cursor-pointer"
                        >
                          {isCollapsed ? "▶" : "▼"}
                        </button>
                        <span className="text-sm font-bold font-display">{group.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setInitialGroupIdToAdd(group.id);
                            setIsManageOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-xs text-muted hover:text-deep-blue p-0.5 cursor-pointer ml-1"
                          title="Agregar categoría a este grupo"
                        >
                          +
                        </button>
                      </div>
                    </th>
                    <td className="px-4 py-2.5 text-right font-semibold text-xs tabular-nums text-muted">
                      {formatCents(totals.assigned, currency)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-xs tabular-nums text-muted">
                      {formatCents(totals.activity, currency)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-xs tabular-nums">
                      <span className={totals.available >= 0 ? "text-money-green" : "text-alert"}>
                        {formatCents(totals.available, currency)}
                      </span>
                    </td>
                  </tr>

                  {/* Filas de Categorías (si no está colapsado) */}
                  {!isCollapsed &&
                    visibleCategories.map((c) => {
                      const state = computedBudget.categories[c.id] ?? {
                        assigned: 0,
                        activity: 0,
                        available: 0,
                      };
                      const goal = goalsMap.get(c.id);

                      return (
                        <tr
                          key={c.id}
                          className="border-t border-line/60 hover:bg-surface/30 transition group"
                        >
                          {/* Nombre de la Categoría y Progreso de Meta */}
                          <td className="px-4 py-2 pl-10 text-sm font-medium">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate">{c.name}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setGoalModalCategory({
                                    id: c.id,
                                    name: c.name,
                                    existingGoal: goal
                                      ? {
                                          kind: goal.kind,
                                          targetCents: goal.targetCents,
                                          targetDate: goal.targetDate,
                                        }
                                      : null,
                                  })
                                }
                                className={`text-xs px-1.5 py-0.5 rounded transition cursor-pointer ${
                                  goal
                                    ? "bg-powder-pink/30 text-deep-blue hover:bg-modern-pink"
                                    : "opacity-0 group-hover:opacity-60 hover:opacity-100 text-muted hover:text-deep-blue"
                                }`}
                                title={goal ? "Modificar meta de ahorro" : "Definir meta (target)"}
                              >
                                {goal ? "🎯 Meta" : "+ Meta"}
                              </button>
                            </div>

                            {/* Barra de Progreso de Meta si existe */}
                            {goal && (
                              <div className="mt-1 max-w-xs">
                                <GoalProgress
                                  underfundedCents={goal.evaluation.underfundedCents}
                                  progressPercent={goal.evaluation.progressPercent}
                                  currency={currency}
                                  isFunded={goal.evaluation.isFunded}
                                />
                              </div>
                            )}
                          </td>

                          {/* Celda Asignado: Editable en línea */}
                          <td className="px-4 py-1.5 text-right align-top">
                            <div className="flex justify-end">
                              <InlineNumberInput
                                valueCents={state.assigned}
                                currency={currency}
                                onSave={(cents) => handleSaveAssigned(c.id, cents)}
                                ariaLabel={`Asignado a ${c.name}`}
                              />
                            </div>
                          </td>

                          {/* Actividad */}
                          <td className="px-4 py-2 text-right tabular-nums text-sm font-medium align-top">
                            {state.activity !== 0 ? (
                              <Link
                                href={`/app/cuentas/todas`}
                                className="hover:underline text-deep-blue"
                                title="Ver movimientos"
                              >
                                {formatCents(state.activity, currency)}
                              </Link>
                            ) : (
                              <span className="text-muted/60">—</span>
                            )}
                          </td>

                          {/* Disponible con MoneyPill interactivo */}
                          <td className="px-4 py-2 text-right align-top">
                            <button
                              type="button"
                              onClick={() =>
                                setMovingCategory({
                                  id: c.id,
                                  name: c.name,
                                  availableCents: state.available,
                                })
                              }
                              className="cursor-pointer transition hover:scale-105"
                              title="Haz clic para mover dinero desde esta categoría"
                            >
                              <MoneyPill cents={state.available} currency={currency} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Diálogo Mover Dinero */}
      {movingCategory && (
        <MoveMoneyDialog
          month={month}
          currency={currency}
          fromCategoryId={movingCategory.id}
          fromCategoryName={movingCategory.name}
          availableCents={movingCategory.availableCents}
          allCategories={allActiveCategories}
          isOpen={Boolean(movingCategory)}
          onClose={() => setMovingCategory(null)}
        />
      )}

      {/* Diálogo Administrar Categorías */}
      <ManageCategoriesDialog
        groups={groups}
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        initialGroupIdToAdd={initialGroupIdToAdd}
      />

      {/* Diálogo de Metas */}
      {goalModalCategory && (
        <GoalModal
          categoryId={goalModalCategory.id}
          categoryName={goalModalCategory.name}
          existingGoal={goalModalCategory.existingGoal}
          isOpen={Boolean(goalModalCategory)}
          onClose={() => setGoalModalCategory(null)}
        />
      )}
    </div>
  );
}
