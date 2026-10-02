import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthenticatedBudget {
  id: string;
  name: string;
  currency: string;
  ownerId: string;
}

async function dbRetry<T>(queryFn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await queryFn();
  } catch (err: any) {
    if (
      retries > 0 &&
      (err?.name === "PrismaClientInitializationError" ||
        err?.message?.includes("Can't reach database server") ||
        err?.code === "P1001")
    ) {
      console.warn("Reintentando conexión con la base de datos tras desconexión temporal...");
      await new Promise((resolve) => setTimeout(resolve, 750));
      return dbRetry(queryFn, retries - 1);
    }
    throw err;
  }
}

/** Usuario + presupuesto de la sesión actual (propietario o miembro colaborador); redirige a /login si no hay sesión. */
export const requireBudget = cache(async () => {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await dbRetry(() =>
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
  );
  if (!user) redirect("/login");

  // Buscar presupuesto donde sea dueño o colaborador (M11: Presupuesto Compartido)
  const budget = await dbRetry(() =>
    db.budget.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        currency: true,
        ownerId: true,
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    })
  );

  if (!budget) redirect("/login");

  const isOwner = budget.ownerId === user.id;
  const role: "owner" | "member" = isOwner ? "owner" : ((budget.members[0]?.role as any) || "member");

  return {
    user: { id: user.id, name: user.name, email: user.email },
    budget: {
      id: budget.id,
      name: budget.name,
      currency: budget.currency,
      ownerId: budget.ownerId,
    },
    role,
    isOwner,
  };
});
