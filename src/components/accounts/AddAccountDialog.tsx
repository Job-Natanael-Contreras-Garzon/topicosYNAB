"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAccount, type AccountFormState } from "@/actions/accounts";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

const initial: AccountFormState = {};

export function AddAccountDialog({ label = "+ Agregar cuenta" }: { label?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(createAccount, initial);

  useEffect(() => {
    if (state.ok) ref.current?.close();
  }, [state]);

  return (
    <>
      <Button variant="ghost" className="w-full justify-start" onClick={() => ref.current?.showModal()}>
        {label}
      </Button>
      <dialog ref={ref} className="m-auto w-[min(92vw,24rem)] rounded-card p-6 text-navy">
        <h2 className="mb-4 text-xl font-bold">Agregar cuenta</h2>
        <form action={action} className="space-y-4" noValidate>
          <Field id="acc-name" name="name" label="Nombre" placeholder="Efectivo" error={state.fieldErrors?.name} required />
          <div className="space-y-1">
            <label htmlFor="acc-type" className="block text-sm font-semibold">Tipo</label>
            <select
              id="acc-type"
              name="type"
              defaultValue="cash"
              className="min-h-10 w-full rounded-field border border-line bg-white px-3"
            >
              <option value="cash">Efectivo</option>
              <option value="checking">Cuenta corriente</option>
              <option value="savings">Cuenta de ahorro</option>
              <option value="credit">Tarjeta de crédito</option>
              <option value="tracking">Seguimiento (no entra al presupuesto)</option>
            </select>
          </div>
          <Field
            id="acc-balance"
            name="balance"
            label="Saldo inicial"
            inputMode="decimal"
            placeholder="1000"
            error={state.fieldErrors?.balance}
          />
          {state.error && <p role="alert" className="text-sm text-alert">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => ref.current?.close()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
