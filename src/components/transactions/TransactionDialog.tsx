"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTransactionAction, updateTransactionAction, type TransactionFormState } from "@/actions/transactions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { centsToInput } from "@/lib/money";

interface AccountOption {
  id: string;
  name: string;
}

interface CategoryGroupOption {
  id: string;
  name: string;
  categories: { id: string; name: string }[];
}

interface TransactionData {
  id?: string;
  accountId: string;
  kind: "expense" | "income";
  amountCents: number;
  date: string; // YYYY-MM-DD
  payee: string;
  memo?: string;
  categoryId?: string | null;
  cleared?: boolean;
}

interface Props {
  accounts: AccountOption[];
  categoryGroups: CategoryGroupOption[];
  defaultAccountId?: string;
  transactionToEdit?: TransactionData | null;
  isOpen: boolean;
  onClose: () => void;
}

const initial: TransactionFormState = {};

export function TransactionDialog({
  accounts,
  categoryGroups,
  defaultAccountId,
  transactionToEdit,
  isOpen,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isEditing = Boolean(transactionToEdit?.id);

  const [kind, setKind] = useState<"expense" | "income">(transactionToEdit?.kind || "expense");
  const [state, formAction, pending] = useActionState(
    isEditing ? updateTransactionAction : createTransactionAction,
    initial
  );

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (transactionToEdit) {
      setKind(transactionToEdit.kind);
    } else {
      setKind("expense");
    }
  }, [transactionToEdit]);

  useEffect(() => {
    if (state.ok) {
      onClose();
    }
  }, [state.ok, onClose]);

  const defaultDate = transactionToEdit?.date || new Date().toISOString().split("T")[0];
  const defaultAmount = transactionToEdit ? centsToInput(Math.abs(transactionToEdit.amountCents)) : "";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-[min(94vw,30rem)] rounded-card border border-line bg-surface p-6 text-deep-blue shadow-2xl backdrop:bg-deep-blue/50"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-deep-blue">
          {isEditing ? "Editar movimiento" : "Nuevo movimiento"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-deep-blue text-lg font-bold p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        {isEditing && <input type="hidden" name="id" value={transactionToEdit?.id} />}

        {/* Toggle Gasto vs Ingreso */}
        <div className="flex rounded-field border border-line p-1 bg-white">
          <button
            type="button"
            onClick={() => setKind("expense")}
            className={`flex-1 rounded-field py-1.5 text-sm font-semibold transition cursor-pointer ${
              kind === "expense"
                ? "bg-deep-blue text-off-white shadow-sm"
                : "text-muted hover:text-deep-blue"
            }`}
          >
            Gasto (Salida)
          </button>
          <button
            type="button"
            onClick={() => setKind("income")}
            className={`flex-1 rounded-field py-1.5 text-sm font-semibold transition cursor-pointer ${
              kind === "income"
                ? "bg-money-green text-off-white shadow-sm"
                : "text-muted hover:text-deep-blue"
            }`}
          >
            Ingreso (Entrada)
          </button>
        </div>
        <input type="hidden" name="kind" value={kind} />

        {/* Cuenta */}
        <div className="space-y-1">
          <label htmlFor="tx-account" className="block text-sm font-semibold">
            Cuenta
          </label>
          <select
            id="tx-account"
            name="accountId"
            defaultValue={transactionToEdit?.accountId || defaultAccountId || accounts[0]?.id}
            className="min-h-10 w-full rounded-field border border-line bg-white px-3 text-base text-deep-blue"
            required
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.accountId && (
            <p className="text-xs text-alert">{state.fieldErrors.accountId}</p>
          )}
        </div>

        {/* Monto y Fecha en dos columnas */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="tx-amount"
            name="amount"
            label="Monto"
            placeholder="0,00"
            inputMode="decimal"
            defaultValue={defaultAmount}
            error={state.fieldErrors?.amount}
            required
          />
          <Field
            id="tx-date"
            name="date"
            type="date"
            label="Fecha"
            defaultValue={defaultDate}
            error={state.fieldErrors?.date}
            required
          />
        </div>

        {/* Beneficiario */}
        <Field
          id="tx-payee"
          name="payee"
          label={kind === "expense" ? "Beneficiario / Establecimiento" : "Origen / Pagador"}
          placeholder={kind === "expense" ? "Supermercado, Alquiler..." : "Sueldo, Transferencia..."}
          defaultValue={transactionToEdit?.payee || ""}
          error={state.fieldErrors?.payee}
          required
        />

        {/* Categoría */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="tx-category" className="block text-sm font-semibold">
              Categoría
            </label>
            {kind === "income" && (
              <span className="text-xs text-muted">Opcional (sin categoría = Ready to Assign)</span>
            )}
          </div>
          <select
            id="tx-category"
            name="categoryId"
            defaultValue={transactionToEdit?.categoryId || (kind === "income" ? "" : "")}
            className="min-h-10 w-full rounded-field border border-line bg-white px-3 text-base text-deep-blue"
          >
            {kind === "income" ? (
              <option value="">Listo para asignar (Ready to Assign)</option>
            ) : (
              <option value="">-- Selecciona una categoría obligatoria --</option>
            )}
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

        {/* Memo / Nota */}
        <Field
          id="tx-memo"
          name="memo"
          label="Nota o detalle (opcional)"
          placeholder="Compra semanal, factura..."
          defaultValue={transactionToEdit?.memo || ""}
          error={state.fieldErrors?.memo}
        />

        {/* Estado Conciliado (Cleared) */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="tx-cleared"
            name="cleared"
            defaultChecked={transactionToEdit?.cleared ?? true}
            className="h-4 w-4 rounded border-line text-money-green accent-money-green cursor-pointer"
          />
          <label htmlFor="tx-cleared" className="text-sm font-medium text-deep-blue cursor-pointer">
            Movimiento ya conciliado con el banco / en efectivo
          </label>
        </div>

        {state.error && <p role="alert" className="text-sm text-alert">{state.error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-line">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Guardando…" : isEditing ? "Actualizar" : "Guardar movimiento"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
