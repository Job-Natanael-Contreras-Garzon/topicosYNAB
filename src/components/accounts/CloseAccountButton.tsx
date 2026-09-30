"use client";

import { useRef, useTransition } from "react";
import { closeAccount } from "@/actions/accounts";
import { Button } from "@/components/ui/Button";

/** Confirmación para una acción destructiva: el foco inicial queda en "Cancelar". */
export function CloseAccountButton({ id, name }: { id: string; name: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <button
        type="button"
        aria-label={`Cerrar cuenta ${name}`}
        title="Cerrar cuenta"
        className="rounded p-1 text-muted hover:bg-line hover:text-navy"
        onClick={() => ref.current?.showModal()}
      >
        ×
      </button>
      <dialog ref={ref} className="m-auto w-[min(92vw,22rem)] rounded-card p-6 text-navy">
        <h2 className="mb-2 text-xl font-bold">¿Cerrar «{name}»?</h2>
        <p className="mb-4 text-muted">
          Se ocultará de la barra lateral, pero conservará todo su historial de movimientos.
        </p>
        <div className="flex justify-end gap-2">
          <Button autoFocus type="button" variant="outline" onClick={() => ref.current?.close()}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await closeAccount(id);
                ref.current?.close();
              })
            }
          >
            Cerrar cuenta
          </Button>
        </div>
      </dialog>
    </>
  );
}
