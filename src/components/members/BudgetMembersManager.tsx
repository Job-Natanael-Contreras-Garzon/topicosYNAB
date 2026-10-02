"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { inviteMemberAction, removeMemberAction } from "@/actions/members";
import type { BudgetMemberInfo } from "@/lib/services/members";

interface Props {
  owner: BudgetMemberInfo;
  members: BudgetMemberInfo[];
  totalCount: number;
  currentUserId: string;
  isOwner: boolean;
}

export function BudgetMembersManager({
  owner,
  members,
  totalCount,
  currentUserId,
  isOwner,
}: Props) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const inviteDialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, isPending] = useActionState(inviteMemberAction, {});
  const [isRemoving, startTransition] = useTransition();

  useEffect(() => {
    if (isInviteOpen) {
      inviteDialogRef.current?.showModal();
    } else {
      inviteDialogRef.current?.close();
    }
  }, [isInviteOpen]);

  // Cerrar diálogo si la invitación fue exitosa
  useEffect(() => {
    if (state.ok) {
      setIsInviteOpen(false);
    }
  }, [state.ok]);

  const handleRemove = (memberId: string, memberName: string) => {
    if (!confirm(`¿Estás seguro de que deseas revocar el acceso a ${memberName}?`)) {
      return;
    }
    startTransition(async () => {
      await removeMemberAction(memberId);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-display text-deep-blue">
            Miembros del Presupuesto
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Colabora en tiempo real con tu familia o equipo. Límite máximo de 6 miembros por presupuesto.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-surface border border-line px-3 py-1 text-xs font-bold text-deep-blue">
            {totalCount} / 6 colaboradores
          </span>

          {isOwner && totalCount < 6 && (
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsInviteOpen(true)}
              className="text-xs"
            >
              + Invitar colaborador
            </Button>
          )}
        </div>
      </div>

      {!isOwner && (
        <div className="rounded-field border border-line bg-surface/50 p-3 text-xs text-muted">
          ℹ️ Tienes acceso de <strong>colaborador</strong> en este presupuesto. Puedes ver, crear y
          editar transacciones, cuentas y asignaciones. Solo el propietario puede invitar o remover
          miembros.
        </div>
      )}

      {/* Lista de Miembros */}
      <div className="rounded-card border border-line bg-white shadow-xs overflow-hidden">
        <div className="divide-y divide-line/60">
          {/* Propietario */}
          <div className="flex items-center justify-between p-4 bg-surface/30">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-deep-blue text-xs font-bold text-off-white">
                {owner.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 truncate">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-deep-blue truncate">{owner.name}</p>
                  {owner.userId === currentUserId && (
                    <span className="text-[10px] text-muted font-semibold">(Tú)</span>
                  )}
                </div>
                <p className="text-xs text-muted truncate">{owner.email}</p>
              </div>
            </div>
            <span className="rounded-full bg-deep-blue px-2.5 py-0.5 text-xs font-semibold text-off-white">
              Propietario
            </span>
          </div>

          {/* Colaboradores Invitados */}
          {members.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">
              No hay colaboradores adicionales en este presupuesto. Invita a alguien de tu confianza
              para presupuestar juntos.
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 transition hover:bg-surface/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-modern-pink text-xs font-bold text-deep-blue">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-deep-blue truncate">{member.name}</p>
                      {member.userId === currentUserId && (
                        <span className="text-[10px] text-muted font-semibold">(Tú)</span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-surface border border-line px-2.5 py-0.5 text-xs font-semibold text-deep-blue">
                    Colaborador
                  </span>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemove(member.id, member.name)}
                      disabled={isRemoving}
                      className="rounded-field border border-alert/30 px-2 py-1 text-xs font-semibold text-alert hover:bg-alert/10 transition disabled:opacity-50"
                    >
                      Revocar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Diálogo Modal de Invitación */}
      <dialog
        ref={inviteDialogRef}
        onClose={() => setIsInviteOpen(false)}
        className="w-full max-w-md rounded-card border border-line bg-white p-6 shadow-2xl backdrop:bg-deep-blue/50"
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h3 className="text-lg font-extrabold font-display text-deep-blue">
            Invitar Colaborador al Presupuesto
          </h3>
          <button
            type="button"
            onClick={() => setIsInviteOpen(false)}
            className="rounded-full p-1 text-muted hover:bg-surface"
          >
            ✕
          </button>
        </div>

        <form action={formAction} className="mt-4 space-y-4">
          <p className="text-xs text-muted">
            Ingresa el correo electrónico del usuario registrado con quien deseas compartir este
            presupuesto.
          </p>

          <Field
            id="member-email"
            label="Correo Electrónico del Usuario"
            name="email"
            type="email"
            placeholder="colaborador@ejemplo.com"
            error={state.fieldErrors?.email}
            required
          />

          {state.error && (
            <div className="rounded-field border border-alert/30 bg-alert/10 p-3 text-xs text-alert font-medium">
              {state.error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? "Agregando..." : "Agregar colaborador"}
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
