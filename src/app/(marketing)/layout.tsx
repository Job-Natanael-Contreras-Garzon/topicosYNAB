import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { getSessionUserId } from "@/lib/session";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const loggedIn = Boolean(await getSessionUserId());
  return (
    <>
      <header className="sticky top-0 z-10 bg-deep-blue border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-display text-2xl font-extrabold text-off-white">
            Sobres<span className="text-modern-pink">.</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold text-off-white/80 md:flex">
            <Link href="/funcionalidades" className="hover:text-off-white transition">Funcionalidades</Link>
            <Link href="/metodo" className="hover:text-off-white transition">Método</Link>
            <Link href="/precios" className="hover:text-off-white transition">Precios</Link>
          </nav>
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <LinkButton href="/app" variant="primary">Ir a mi presupuesto</LinkButton>
            ) : (
              <>
                <LinkButton href="/login" variant="ghost" className="text-off-white hover:bg-white/10">
                  Iniciar sesión
                </LinkButton>
                <LinkButton href="/registro" variant="primary">
                  Empieza gratis
                </LinkButton>
              </>
            )}
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
