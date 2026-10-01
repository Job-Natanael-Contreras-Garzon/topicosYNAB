import { LinkButton } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <section className="bg-gradient-to-br from-deep-blue via-[#172744] to-[#0d1627] text-off-white">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="inline-flex items-center gap-2 rounded-full bg-powder-pink/15 px-3 py-1 text-xs font-semibold text-modern-pink mb-6">
          <span className="h-2 w-2 rounded-full bg-modern-pink animate-pulse" />
          Nueva Experiencia Vanguardista
        </div>
        <h1 className="max-w-2xl text-5xl font-extrabold leading-tight md:text-[56px] text-off-white">
          ¿Te preocupa el dinero?
        </h1>
        <p className="mt-4 max-w-xl text-lg text-off-white/85">
          Dale un trabajo a cada boliviano que entra y deja de dudar de tus gastos. Cambia tus planes cuando la vida
          cambie, sin culpa.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <LinkButton href="/registro" variant="primary" className="min-h-12 px-6 text-base">
            Empieza gratis
          </LinkButton>
          <span className="text-sm text-off-white/75">Sin tarjeta de crédito · Ejecución local privada</span>
        </div>
      </div>
    </section>
  );
}
