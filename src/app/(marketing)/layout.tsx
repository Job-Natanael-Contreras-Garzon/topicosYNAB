import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { getSessionUserId } from "@/lib/session";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const loggedIn = Boolean(await getSessionUserId());
  return (
    <>
      <header className="sticky top-0 z-10 bg-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-display text-2xl font-extrabold text-white">
            Sobres<span className="text-lime">.</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold text-white/80 md:flex">
            <Link href="/funcionalidades" className="hover:text-white">Funcionalidades</Link>
            <Link href="/metodo" className="hover:text-white">Método</Link>
            <Link href="/precios" className="hover:text-white">Precios</Link>
          </nav>
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <LinkButton href="/app" variant="lime">Ir a mi presupuesto</LinkButton>
            ) : (
              <>
                <LinkButton href="/login" variant="ghost" className="text-white hover:bg-white/10">Iniciar sesión</LinkButton>
                <LinkButton href="/registro" variant="lime">Empieza gratis</LinkButton>
              </>
            )}
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
