"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { upsertGoalAction, deleteGoalAction } from "@/actions/goals";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { centsToInput } from "@/lib/money";
import type { GoalKind } from "@/lib/goals";

interface Props {
  categoryId: string;
  categoryName: string;
  existingGoal?: {
    kind: GoalKind;
    targetCents: number;
    targetDate?: Date | string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalModal({
  categoryId,
  categoryName,
  existingGoal,
  isOpen,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [kind, setKind] = useState<GoalKind>(existingGoal?.kind || "monthly");
  const [targetAmount, setTargetAmount] = useState(
    existingGoal ? centsToInput(existingGoal.targetCents) : ""
  );
  const [targetDate, setTargetDate] = useState(
    existingGoal?.targetDate
      ? typeof existingGoal.targetDate === "string"
        ? existingGoal.targetDate.split("T")[0]
        : existingGoal.targetDate.toISOString().split("T")[0]
      : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      if (existingGoal) {
        setKind(existingGoal.kind);
        setTargetAmount(centsToInput(existingGoal.targetCents));
        setTargetDate(
          existingGoal.targetDate
            ? typeof existingGoal.targetDate === "string"
              ? existingGoal.targetDate.split("T")[0]
              : existingGoal.targetDate.toISOString().split("T")[0]
            : ""
        );
      } else {
        setKind("monthly");
        setTargetAmount("");
        setTargetDate("");
      }
      setError(null);
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen, existingGoal]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", categoryId);
    formData.set("kind", kind);

    setError(null);
    startTransition(async () => {
      const res = await upsertGoalAction(formData);
      if (res.ok) {
        onClose();
      } else {
        setError(res.error || "No se pudo guardar la meta");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("¿Deseas eliminar la meta para esta categoría?")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteGoalAction(categoryId);
      if (res.ok) {
        onClose();
      } else {
        setError(res.error || "No se pudo eliminar");
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-[min(94vw,28rem)] rounded-card border border-line bg-surface p-6 text-deep-blue shadow-2xl backdrop:bg-deep-blue/50"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-deep-blue">Meta de Categoría</h2>
          <p className="text-xs text-muted mt-0.5">Configurar objetivo para «{categoryName}»</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-deep-blue text-lg font-bold p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de Tipo de Meta */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold">Tipo de Meta</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setKind("monthly")}
              className={`rounded-field p-2 text-xs font-semibold text-center border transition cursor-pointer ${
                kind === "monthly"
                  ? "bg-deep-blue text-off-white border-deep-blue shadow-sm"
                  : "bg-white text-deep-blue border-line hover:bg-surface"
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setKind("by_date")}
              className={`rounded-field p-2 text-xs font-semibold text-center border transition cursor-pointer ${
                kind === "by_date"
                  ? "bg-deep-blue text-off-white border-deep-blue shadow-sm"
                  : "bg-white text-deep-blue border-line hover:bg-surface"
              }`}
            >
              Para una fecha
            </button>
            <button
              type="button"
              onClick={() => setKind("balance")}
              className={`rounded-field p-2 text-xs font-semibold text-center border transition cursor-pointer ${
                kind === "balance"
                  ? "bg-deep-blue text-off-white border-deep-blue shadow-sm"
                  : "bg-white text-deep-blue border-line hover:bg-surface"
              }`}
            >
              Saldo fijo
            </button>
          </div>
          <p className="text-xs text-muted pt-1">
            {kind === "monthly" && "Asignar un monto fijo todos los meses sin importar el gasto."}
            {kind === "by_date" && "Acumular un monto para una fecha límite calculando cuotas mensuales."}
            {kind === "balance" && "Mantener al menos un monto disponible de respaldo permanentemente."}
          </p>
        </div>

        {/* Monto Objetivo */}
        <Field
          id="goal-amount"
          name="targetAmount"
          label="Monto Objetivo"
          placeholder="Ej. 500,00"
          inputMode="decimal"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          required
        />

        {/* Fecha Límite si aplica */}
        {kind === "by_date" && (
          <Field
            id="goal-date"
            name="targetDate"
            type="date"
            label="Fecha Límite"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
          />
        )}

        {error && <p role="alert" className="text-sm text-alert">{error}</p>}

        <div className="flex items-center justify-between pt-3 border-t border-line">
          {existingGoal ? (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs min-h-9 px-3"
            >
              Eliminar meta
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar meta"}
            </Button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
