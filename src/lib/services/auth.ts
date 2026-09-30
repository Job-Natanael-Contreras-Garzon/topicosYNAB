import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

/** Usuario + presupuesto de la sesión actual; redirige a /login si no hay sesión. */
export const requireBudget = cache(async () => {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  // Toda consulta posterior filtra por budgetId (docs/05, decisión 4).
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      budgets: { orderBy: { id: "asc" }, take: 1, select: { id: true, name: true, currency: true } },
    },
  });
  const budget = user?.budgets[0];
  if (!user || !budget) redirect("/login");
  return { user: { id: user.id, name: user.name, email: user.email }, budget };
});
