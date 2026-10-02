import "server-only";
import { db } from "@/lib/db";

export interface BudgetMemberInfo {
  id: string; // ID de BudgetMember o "owner"
  userId: string;
  name: string;
  email: string;
  role: "owner" | "member";
  isOwner: boolean;
  createdAt: Date;
}

/**
 * Obtiene la lista completa de colaboradores del presupuesto (incluyendo al propietario).
 */
export async function listBudgetMembers(budgetId: string): Promise<{
  owner: BudgetMemberInfo;
  members: BudgetMemberInfo[];
  totalCount: number;
}> {
  const budget = await db.budget.findUnique({
    where: { id: budgetId },
    include: {
      owner: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!budget) throw new Error("Presupuesto no encontrado");

  const ownerInfo: BudgetMemberInfo = {
    id: `owner-${budget.owner.id}`,
    userId: budget.owner.id,
    name: budget.owner.name,
    email: budget.owner.email,
    role: "owner",
    isOwner: true,
    createdAt: budget.owner.createdAt,
  };

  const membersInfo: BudgetMemberInfo[] = budget.members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: (m.role as any) || "member",
    isOwner: false,
    createdAt: m.createdAt,
  }));

  return {
    owner: ownerInfo,
    members: membersInfo,
    totalCount: 1 + membersInfo.length,
  };
}

/**
 * Invita o agrega un miembro al presupuesto por su correo electrónico (tope de 6 miembros).
 */
export async function addBudgetMemberService(input: {
  budgetId: string;
  currentUserId: string;
  email: string;
  role?: string;
}): Promise<BudgetMemberInfo> {
  const budget = await db.budget.findUnique({
    where: { id: input.budgetId },
    select: { id: true, ownerId: true },
  });

  if (!budget) throw new Error("Presupuesto no encontrado");

  // Regla M11: Solo el propietario original está facultado para invitar o remover miembros
  if (budget.ownerId !== input.currentUserId) {
    throw new Error("Solo el propietario del presupuesto puede invitar nuevos miembros");
  }

  const existingMembersCount = await db.budgetMember.count({
    where: { budgetId: input.budgetId },
  });

  // 1 propietario + miembros <= 6
  if (1 + existingMembersCount >= 6) {
    throw new Error("Límite alcanzado: un presupuesto solo puede tener hasta 6 miembros en total");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const targetUser = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!targetUser) {
    throw new Error(`No se encontró un usuario registrado con el correo ${normalizedEmail}`);
  }

  if (targetUser.id === budget.ownerId) {
    throw new Error("El usuario especificado ya es el propietario de este presupuesto");
  }

  const alreadyMember = await db.budgetMember.findUnique({
    where: {
      budgetId_userId: {
        budgetId: input.budgetId,
        userId: targetUser.id,
      },
    },
  });

  if (alreadyMember) {
    throw new Error("Este usuario ya es colaborador de tu presupuesto");
  }

  const newMember = await db.budgetMember.create({
    data: {
      budgetId: input.budgetId,
      userId: targetUser.id,
      role: input.role || "member",
    },
  });

  return {
    id: newMember.id,
    userId: targetUser.id,
    name: targetUser.name,
    email: targetUser.email,
    role: "member",
    isOwner: false,
    createdAt: newMember.createdAt,
  };
}

/**
 * Revoca el acceso de un colaborador al presupuesto.
 */
export async function removeBudgetMemberService(input: {
  budgetId: string;
  currentUserId: string;
  memberId: string;
}): Promise<{ ok: boolean }> {
  const budget = await db.budget.findUnique({
    where: { id: input.budgetId },
    select: { id: true, ownerId: true },
  });

  if (!budget) throw new Error("Presupuesto no encontrado");

  if (budget.ownerId !== input.currentUserId) {
    throw new Error("Solo el propietario puede revocar el acceso de un miembro");
  }

  const member = await db.budgetMember.findFirst({
    where: { id: input.memberId, budgetId: input.budgetId },
  });

  if (!member) {
    throw new Error("Miembro no encontrado en este presupuesto");
  }

  await db.budgetMember.delete({
    where: { id: member.id },
  });

  return { ok: true };
}
