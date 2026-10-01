"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTransferAction, type TransactionFormState } from "@/actions/transactions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

interface AccountOption {
  id: string;
  name: string;
  onBudget: boolean;
}

interface CategoryGroupOption {
  id: string;
  name: string;
  categories: { id: string; name: string }[];
}

interface Props {
  accounts: AccountOption[];
  categoryGroups: CategoryGroupOption[];
  defaultFromAccountId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const initial: TransactionFormState = {};

export function TransferDialog({
  accounts,
  categoryGroups,
  defaultFromAccountId,
  isOpen,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(createTransferAction, initial);

  const [fromId, setFromId] = useState(defaultFromAccountId || accounts[0]?.id || "");
  const [toId, setToId] = useState(
    accounts.find((a) => a.id !== (defaultFromAccountId || accounts[0]?.id))?.id || ""
  );

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (state.ok) {
      onClose();
    }
  }, [state.ok, onClose]);

  const fromAccount = accounts.find((a) => a.id === fromId);
  const toAccount = accounts.find((a) => a.id === toId);
  const involvesTracking = (fromAccount && !fromAccount.onBudget) || (toAccount && !toAccount.onBudget);

  const defaultDate = new Date().toISOString().split("T")[0];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-[min(94vw,30rem)] rounded-card border border-line bg-surface p-6 text-deep-blue shadow-2xl backdrop:bg-deep-blue/50"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-deep-blue">Transferir entre cuentas</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-deep-blue text-lg font-bold p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        {/* Origen y Destino */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="tr-from" className="block text-sm font-semibold">
              Desde cuenta
            </label>
            <select
              id="tr-from"
              name="fromAccountId"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="min-h-10 w-full rounded-field border border-line bg-white px-3 text-base text-deep-blue"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} {!a.onBudget ? "(Seguimiento)" : ""}
                </option>
              ))}
            </select>
            {state.fieldErrors?.fromAccountId && (
              <p className="text-xs text-alert">{state.fieldErrors.fromAccountId}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="tr-to" className="block text-sm font-semibold">
              Hacia cuenta
            </label>
            <select
              id="tr-to"
              name="toAccountId"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="min-h-10 w-full rounded-field border border-line bg-white px-3 text-base text-deep-blue"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id} disabled={a.id === fromId}>
                  {a.name} {!a.onBudget ? "(Seguimiento)" : ""}
                </option>
              ))}
            </select>
            {state.fieldErrors?.toAccountId && (
              <p className="text-xs text-alert">{state.fieldErrors.toAccountId}</p>
            )}
          </div>
        </div>

        {/* Monto y Fecha */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="tr-amount"
            name="amount"
            label="Monto a transferir"
            placeholder="0,00"
            inputMode="decimal"
            error={state.fieldErrors?.amount}
            required
          />
          <Field
            id="tr-date"
            name="date"
            type="date"
            label="Fecha"
            defaultValue={defaultDate}
            error={state.fieldErrors?.date}
            required
          />
        </div>

        {/* Categoría si involucra cuenta de seguimiento */}
        {involvesTracking && (
          <div className="space-y-1 rounded-field border border-line bg-white/70 p-3">
            <div className="flex items-center justify-between">
              <label htmlFor="tr-category" className="block text-sm font-semibold text-deep-blue">
                Categoría presupuestaria
              </label>
              <span className="text-xs text-muted">Requerida al tocar cuentas de seguimiento</span>
            </div>
            <select
              id="tr-category"
              name="categoryId"
              defaultValue=""
              className="min-h-10 w-full rounded-field border border-line bg-white px-3 text-base text-deep-blue"
            >
              <option value="">-- Elige la categoría que financia o recibe --</option>
              {categoryGroups.map((group) => (
                <optgroup key={group.id} label={group.name}>
                  {group.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {state.fieldErrors?.categoryId && (
              <p className="text-xs text-alert">{state.fieldErrors.categoryId}</p>
            )}
          </div>
        )}

        <Field
          id="tr-memo"
          name="memo"
          label="Nota o motivo (opcional)"
          placeholder="Ahorro del mes, retiro de cajero..."
          error={state.fieldErrors?.memo}
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="tr-cleared"
            name="cleared"
            defaultChecked={true}
            className="h-4 w-4 rounded border-line text-money-green accent-money-green cursor-pointer"
          />
          <label htmlFor="tr-cleared" className="text-sm font-medium text-deep-blue cursor-pointer">
            Marcar ambas transacciones como conciliadas
          </label>
        </div>

        {state.error && <p role="alert" className="text-sm text-alert">{state.error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-line">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="corporate" disabled={pending}>
            {pending ? "Transfiriendo…" : "Registrar transferencia"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
