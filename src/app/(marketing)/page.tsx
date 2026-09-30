import { LinkButton } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <section className="bg-gradient-to-br from-primary to-[#2c33b8] text-white">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <h1 className="max-w-2xl text-5xl font-extrabold leading-tight md:text-[56px]">
          ¿Te preocupa el dinero?
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/85">
          Dale un trabajo a cada boliviano que entra y deja de dudar de tus gastos. Cambia tus planes cuando la vida
          cambie, sin culpa.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <LinkButton href="/registro" variant="lime" className="min-h-12 px-6 text-base">Empieza gratis</LinkButton>
          <span className="text-sm text-white/80">Sin tarjeta de crédito</span>
        </div>
      </div>
    </section>
  );
}
