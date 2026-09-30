"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { createSeedCategories } from "@/lib/seed-data";

export interface AuthState {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre"),
  email: z.string().trim().toLowerCase().email("Correo no válido"),
  password: z.string().min(8, "La contraseña debe tener 8 caracteres o más"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo no válido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});

function fieldErrors(error: z.ZodError): AuthState {
  const out: NonNullable<AuthState["fieldErrors"]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as "name" | "email" | "password";
    out[key] ??= issue.message;
  }
  return { fieldErrors: out };
}

export async function registerUser(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrors(parsed.error);
  const { name, email, password } = parsed.data;

  const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return { fieldErrors: { email: "Ya existe una cuenta con este correo" } };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({ data: { name, email, passwordHash } });
    const budget = await tx.budget.create({
      data: { name: "Mi presupuesto", currency: "BOB", ownerId: created.id },
    });
    await createSeedCategories(tx, budget.id);
    return created;
  });

  await createSession(user.id);
  redirect("/app");
}

export async function loginUser(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrors(parsed.error);
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  // Mismo mensaje para correo inexistente y contraseña errónea (no revelar cuál falló).
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) return { error: "Correo o contraseña incorrectos" };

  await createSession(user.id);
  redirect("/app");
}

export async function logoutUser() {
  await deleteSession();
  redirect("/login");
}
