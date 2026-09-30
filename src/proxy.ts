import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Guardián de rutas (en Next.js 16 "middleware" se llama "proxy").
 * Protege /app y redirige a /login si no hay sesión válida.
 * Las páginas y acciones vuelven a validar la sesión: esto es solo una barrera optimista.
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("ynab_session")?.value;
  let valid = false;
  if (token && process.env.SESSION_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET));
      valid = true;
    } catch {
      valid = false;
    }
  }

  const { pathname } = request.nextUrl;
  const isPrivate = pathname === "/app" || pathname.startsWith("/app/");
  const isAuthPage = pathname === "/login" || pathname === "/registro";

  if (isPrivate && !valid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthPage && valid) {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/registro"],
};
