"use client";

import { useEffect, useRef, useTransition } from "react";
import { deleteTransactionAction } from "@/actions/transactions";
import { Button } from "@/components/ui/Button";

interface Props {
  transaction: {
    id: string;
    payee: string;
    amountCents: number;
    transferPairId: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteTransactionDialog({ transaction, isOpen, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  if (!transaction) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteTransactionAction(transaction.id);
      if (res.ok) {
        onClose();
      } else {
        alert(res.error || "No se pudo eliminar la transacción");
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-[min(92vw,24rem)] rounded-card border border-line bg-surface p-6 text-deep-blue shadow-2xl backdrop:bg-deep-blue/50"
    >
      <h2 className="mb-2 text-xl font-bold font-display text-deep-blue">¿Eliminar movimiento?</h2>
      <p className="text-sm text-muted mb-4">
        ¿Estás seguro de que deseas eliminar el registro de <strong>«{transaction.payee}»</strong>?
        {transaction.transferPairId && (
          <span className="block mt-2 font-medium text-alert">
            Nota: Este movimiento es una transferencia. Al eliminarlo, también se eliminará automáticamente su contraparte enlazada.
          </span>
        )}
      </p>

      <div className="flex justify-end gap-2 pt-2 border-t border-line">
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="button" variant="danger" onClick={handleDelete} disabled={isPending}>
          {isPending ? "Eliminando…" : "Sí, eliminar"}
        </Button>
      </div>
    </dialog>
  );
}
