/** Categorías semilla (M4). Se usa al registrar un usuario y en prisma/seed.ts. */
import type { Prisma, PrismaClient } from "@prisma/client";

export const SEED_CATEGORY_TREE: { group: string; categories: string[] }[] = [
  { group: "Gastos fijos", categories: ["Renta", "Servicios", "Internet", "Transporte"] },
  { group: "Gastos variables", categories: ["Comida", "Salidas", "Ropa"] },
  { group: "Metas de ahorro", categories: ["Fondo de emergencia", "Vacaciones"] },
  { group: "Deudas", categories: ["Tarjetas / Préstamos"] },
];

type Client = PrismaClient | Prisma.TransactionClient;

export async function createSeedCategories(client: Client, budgetId: string) {
  for (const [gi, g] of SEED_CATEGORY_TREE.entries()) {
    await client.categoryGroup.create({
      data: {
        budgetId,
        name: g.group,
        sort: gi,
        categories: {
          create: g.categories.map((name, ci) => ({ name, sort: ci })),
        },
      },
    });
  }
}
