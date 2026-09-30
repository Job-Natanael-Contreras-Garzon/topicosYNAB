import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";

export const SESSION_COOKIE = "ynab_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Falta SESSION_SECRET (mínimo 32 caracteres) en .env");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Devuelve el userId de la sesión válida, o null. */
export const getSessionUserId = cache(async (): Promise<string | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
});
