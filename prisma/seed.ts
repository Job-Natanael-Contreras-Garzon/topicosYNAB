/**
 * Semilla: usuario de prueba con cuentas, categorías y tres meses de movimientos.
 * Ejecutar con: npx prisma db seed
 * Usuario: demo@sobres.test / demo12345
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createSeedCategories } from "../src/lib/seed-data";

const prisma = new PrismaClient();

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

async function main() {
  const email = "demo@sobres.test";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Borra los datos del demo para poder resembrar de forma idempotente.
    const budgets = await prisma.budget.findMany({ where: { ownerId: existing.id }, select: { id: true } });
    for (const { id: budgetId } of budgets) {
      await prisma.transaction.deleteMany({ where: { account: { budgetId } } });
      await prisma.monthlyAssignment.deleteMany({ where: { category: { group: { budgetId } } } });
      await prisma.goal.deleteMany({ where: { category: { group: { budgetId } } } });
      await prisma.category.deleteMany({ where: { group: { budgetId } } });
      await prisma.categoryGroup.deleteMany({ where: { budgetId } });
      await prisma.account.deleteMany({ where: { budgetId } });
      await prisma.budget.delete({ where: { id: budgetId } });
    }
    await prisma.user.delete({ where: { id: existing.id } });
  }

  const user = await prisma.user.create({
    data: { email, name: "Usuaria Demo", passwordHash: await bcrypt.hash("demo12345", 12) },
  });
  const budget = await prisma.budget.create({
    data: { name: "Mi presupuesto", currency: "BOB", ownerId: user.id },
  });
  await createSeedCategories(prisma, budget.id);

  const cats = await prisma.category.findMany({ where: { group: { budgetId: budget.id } } });
  const cat = (name: string) => {
    const c = cats.find((x) => x.name === name);
    if (!c) throw new Error(`Falta la categoría ${name}`);
    return c.id;
  };

  const banco = await prisma.account.create({
    data: { budgetId: budget.id, name: "Banco", type: "checking", onBudget: true },
  });
  const efectivo = await prisma.account.create({
    data: { budgetId: budget.id, name: "Efectivo", type: "cash", onBudget: true },
  });
  await prisma.account.create({
    data: { budgetId: budget.id, name: "Inversión", type: "tracking", onBudget: false },
  });

  const now = new Date();
  const months = [-2, -1, 0].map((delta) => {
    const d = new Date(now.getFullYear(), now.getMonth() + delta, 1);
    return { y: d.getFullYear(), m: d.getMonth() + 1, key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
  });

  // Montos en centavos.
  const assignPlan: Record<string, number> = {
    Renta: 150000, Servicios: 30000, Internet: 18000, Transporte: 25000,
    Comida: 90000, Salidas: 25000, Ropa: 15000, "Fondo de emergencia": 30000, Vacaciones: 20000,
  };
  const spendPlan: [string, number, number][] = [
    ["Renta", 150000, 3], ["Servicios", 27500, 8], ["Internet", 18000, 10], ["Transporte", 21000, 12],
    ["Comida", 34000, 6], ["Comida", 29500, 14], ["Comida", 18000, 22],
    ["Salidas", 12000, 18], ["Salidas", 9500, 25], ["Ropa", 10000, 20],
  ];

  for (const [i, mo] of months.entries()) {
    if (i === 0) {
      await prisma.transaction.create({
        data: { accountId: banco.id, date: utc(mo.y, mo.m, 1), amountCents: 300000, payee: "Saldo inicial", cleared: true },
      });
    }
    await prisma.transaction.create({
      data: { accountId: banco.id, date: utc(mo.y, mo.m, 1), amountCents: 400000, payee: "Sueldo", cleared: true },
    });
    for (const [name, cents] of Object.entries(assignPlan)) {
      await prisma.monthlyAssignment.create({ data: { categoryId: cat(name), month: mo.key, assignedCents: cents } });
    }
    for (const [name, cents, day] of spendPlan) {
      const isCash = name === "Comida" && day === 22;
      await prisma.transaction.create({
        data: {
          accountId: isCash ? efectivo.id : banco.id,
          categoryId: cat(name),
          date: utc(mo.y, mo.m, day),
          amountCents: -cents,
          payee: name === "Renta" ? "Propietario" : name === "Comida" ? "Supermercado" : name,
          cleared: i < 2,
        },
      });
    }
    if (i === 1) {
      // Transferencia Banco -> Efectivo (dos filas enlazadas, sin categoría: no toca el presupuesto).
      const pair = `seed-transfer-${mo.key}`;
      await prisma.transaction.createMany({
        data: [
          { accountId: banco.id, date: utc(mo.y, mo.m, 15), amountCents: -20000, payee: "Transferencia a Efectivo", transferPairId: pair, cleared: true },
          { accountId: efectivo.id, date: utc(mo.y, mo.m, 15), amountCents: 20000, payee: "Transferencia desde Banco", transferPairId: pair, cleared: true },
        ],
      });
    }
  }

  console.log("Semilla lista → demo@sobres.test / demo12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
