"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { moveMoneyAction } from "@/actions/budget";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { formatCents, centsToInput } from "@/lib/money";

interface CategoryOption {
  id: string;
  name: string;
  groupName: string;
}

interface Props {
  month: string;
  currency?: string;
  fromCategoryId: string;
  fromCategoryName: string;
  availableCents: number;
  allCategories: CategoryOption[];
  isOpen: boolean;
  onClose: () => void;
}

export function MoveMoneyDialog({
  month,
  currency = "BOB",
  fromCategoryId,
  fromCategoryName,
  availableCents,
  allCategories,
  isOpen,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [toCategoryId, setToCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const otherCategories = allCategories.filter((c) => c.id !== fromCategoryId);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      setError(null);
      // Sugerir el disponible positivo si lo hay
      if (availableCents > 0) {
        setAmount(centsToInput(availableCents));
      } else {
        setAmount("");
      }
      if (otherCategories.length > 0 && !toCategoryId) {
        setToCategoryId(otherCategories[0].id);
      }
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen, availableCents, fromCategoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toCategoryId) {
      setError("Selecciona una categoría de destino");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await moveMoneyAction(fromCategoryId, toCategoryId, month, amount);
      if (res.ok) {
        onClose();
      } else {
        setError(res.error || "No se pudo mover el dinero");
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-[min(92vw,26rem)] rounded-card border border-line bg-surface p-6 text-deep-blue shadow-2xl backdrop:bg-deep-blue/50"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-deep-blue">Mover dinero</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-deep-blue text-lg font-bold p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origen */}
        <div className="rounded-field border border-line bg-white/80 p-3">
          <p className="text-xs font-bold uppercase text-muted">Mover desde</p>
          <p className="text-base font-bold text-deep-blue mt-0.5">{fromCategoryName}</p>
          <p className="text-xs text-muted mt-1">
            Disponible actual:{" "}
            <span
              className={`font-semibold tabular-nums ${
                availableCents >= 0 ? "text-money-green" : "text-alert"
              }`}
            >
              {formatCents(availableCents, currency)}
            </span>
          </p>
        </div>

        {/* Destino */}
        <div className="space-y-1">
          <label htmlFor="mv-target" className="block text-sm font-semibold">
            Mover hacia
          </label>
          <select
            id="mv-target"
            value={toCategoryId}
            onChange={(e) => setToCategoryId(e.target.value)}
            className="min-h-10 w-full rounded-field border border-line bg-white px-3 text-base text-deep-blue"
            required
          >
            {otherCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.groupName} → {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Monto */}
        <Field
          id="mv-amount"
          name="amount"
          label="Monto a transferir"
          placeholder="0,00"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        {error && <p role="alert" className="text-sm text-alert">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-line">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? "Moviendo…" : "Confirmar movimiento"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
