import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";

export const metadata = {
  title: "Sobres — Presupuesto Base Cero Personal y Familiar",
  description:
    "Dale un trabajo a cada centavo, elimina el estrés financiero y planifica tu futuro con total libertad.",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-surface text-deep-blue">
      {/* 1. SECCIÓN HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-deep-blue via-[#162542] to-[#0d1627] text-off-white py-20 lg:py-28">
        {/* Destellos de iluminación de fondo en paleta vanguardista */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-modern-pink/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-powder-pink/10 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Texto y CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-modern-pink/30 bg-modern-pink/15 px-3.5 py-1 text-xs font-semibold text-modern-pink">
                <span className="h-2 w-2 rounded-full bg-modern-pink animate-pulse" />
                Presupuesto Base Cero Vanguardista
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-display">
                ¿Te preocupa <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-modern-pink to-powder-pink">
                  el dinero?
                </span>
              </h1>

              <p className="max-w-xl text-base sm:text-lg text-off-white/85 leading-relaxed font-sans">
                Dale un trabajo a cada boliviano que ingresa antes de gastarlo. Elimina la incertidumbre
                a fin de mes, conquista tus deudas y ajusta tus planes sin culpa cuando la vida cambie.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <LinkButton
                  href="/registro"
                  variant="primary"
                  className="min-h-12 px-7 text-base shadow-lg shadow-modern-pink/25 hover:scale-[1.02] transition-transform"
                >
                  Empieza gratis hoy
                </LinkButton>
                <LinkButton
                  href="/metodo"
                  variant="outline"
                  className="min-h-12 border-white/20 bg-white/5 text-off-white hover:bg-white/10"
                >
                  Conoce el método →
                </LinkButton>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs text-off-white/70">
                <div className="flex items-center gap-1.5">
                  <span className="text-money-green font-bold">✓</span>
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-money-green font-bold">✓</span>
                  <span>100% privado y local</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-money-green font-bold">✓</span>
                  <span>Sin suscripciones ocultas</span>
                </div>
              </div>
            </div>

            {/* Maqueta de Dispositivo Móvil (Home M6 Mockup) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[320px] rounded-[40px] border-4 border-[#2c3e60] bg-deep-blue p-3 shadow-2xl shadow-black/40 ring-1 ring-white/10 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                {/* Altavoz y cámara */}
                <div className="mx-auto mb-3 h-4 w-28 rounded-full bg-[#0d1627]" />

                {/* Pantalla Simulada del Home */}
                <div className="space-y-3 rounded-[28px] bg-surface p-4 text-deep-blue">
                  {/* Saludo */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted tracking-wider">
                        Mi Presupuesto
                      </p>
                      <p className="text-sm font-extrabold text-deep-blue">Octubre 2026</p>
                    </div>
                    <span className="h-6 w-6 rounded-full bg-deep-blue text-[10px] font-bold text-off-white flex items-center justify-center">
                      S.
                    </span>
                  </div>

                  {/* Banner Ready to Assign */}
                  <div className="rounded-card bg-money-green p-3 text-off-white shadow-xs">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                      Listo para asignar
                    </p>
                    <p className="text-lg font-extrabold tabular-nums">BOB 1.450,00</p>
                    <p className="text-[9px] opacity-80 mt-0.5">Asigna hasta llegar a cero</p>
                  </div>

                  {/* Sobres / Categorías */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Sobres Prioritarios
                    </p>

                    <div className="rounded-field border border-line bg-white p-2 text-xs shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-deep-blue">Alimentación</span>
                        <span className="font-bold text-money-green">BOB 580,00</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-line overflow-hidden">
                        <div className="h-full bg-money-green w-[75%]" />
                      </div>
                    </div>

                    <div className="rounded-field border border-line bg-white p-2 text-xs shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-deep-blue">Alquiler y Luz</span>
                        <span className="font-bold text-money-green">BOB 1.800,00</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-line overflow-hidden">
                        <div className="h-full bg-money-green w-[100%]" />
                      </div>
                    </div>

                    <div className="rounded-field border border-line bg-white p-2 text-xs shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-deep-blue">Meta: Viaje Fin de Año</span>
                        <span className="font-bold text-modern-pink">Falta BOB 250</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-line overflow-hidden">
                        <div className="h-full bg-modern-pink w-[55%]" />
                      </div>
                    </div>
                  </div>

                  {/* Mini barra de navegación */}
                  <div className="flex justify-around border-t border-line pt-2 text-[10px] font-semibold text-muted">
                    <span className="text-modern-pink font-bold">● Inicio</span>
                    <span>Presupuesto</span>
                    <span>Reportes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LAS 4 REGLAS DEL MÉTODO EN PREGUNTAS INTERACTIVAS */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-modern-pink">
              Filosofía Financiera
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold font-display text-deep-blue">
              El método que transforma tu relación con el dinero
            </p>
            <p className="mt-3 text-sm text-muted">
              No se trata de restringirte, sino de decidir conscientemente qué es lo más importante
              para ti antes de que el dinero desaparezca.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-card border border-line bg-surface/30 p-6 space-y-3 hover:border-modern-pink transition shadow-2xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-field bg-deep-blue text-off-white font-extrabold text-sm">
                1
              </span>
              <h3 className="text-lg font-bold text-deep-blue">
                Dale un trabajo a cada boliviano
              </h3>
              <p className="text-xs leading-relaxed text-muted">
                Presupuesta base cero: cada vez que recibes ingresos, asígnalos a tus sobres
                (alquiler, comida, ahorros) hasta que tu saldo por asignar llegue a exactamente cero.
              </p>
            </div>

            <div className="rounded-card border border-line bg-surface/30 p-6 space-y-3 hover:border-modern-pink transition shadow-2xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-field bg-money-green text-off-white font-extrabold text-sm">
                2
              </span>
              <h3 className="text-lg font-bold text-deep-blue">
                Abraza tus gastos reales
              </h3>
              <p className="text-xs leading-relaxed text-muted">
                Los gastos irregulares (seguro anual, mantenimiento del auto, regalos) no son
                sorpresas. Divídelos en cuotas mensuales y nunca más sufrirás por un imprevisto.
              </p>
            </div>

            <div className="rounded-card border border-line bg-surface/30 p-6 space-y-3 hover:border-modern-pink transition shadow-2xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-field bg-modern-pink text-deep-blue font-extrabold text-sm">
                3
              </span>
              <h3 className="text-lg font-bold text-deep-blue">
                Ajusta cuando la vida cambie
              </h3>
              <p className="text-xs leading-relaxed text-muted">
                Si gastaste de más en salidas este fin de semana, no hay culpa ni fracaso. Simplemente
                mueve dinero desde otro sobre y mantén el equilibrio de tu presupuesto intacto.
              </p>
            </div>

            <div className="rounded-card border border-line bg-surface/30 p-6 space-y-3 hover:border-modern-pink transition shadow-2xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-field bg-deep-blue text-off-white font-extrabold text-sm">
                4
              </span>
              <h3 className="text-lg font-bold text-deep-blue">
                Envejece tu dinero
              </h3>
              <p className="text-xs leading-relaxed text-muted">
                Aumenta la distancia entre el día que ganas dinero y el día que lo gastas. El objetivo
                es pagar las cuentas de este mes con los ingresos que ganaste el mes pasado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FUNCIONALIDADES CLAVE */}
      <section className="py-20 bg-surface/50 border-t border-line">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-money-green">
              Herramientas de Precisión
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold font-display text-deep-blue">
              Todo lo que necesitas para tu libertad financiera
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-card border border-line bg-white p-6 shadow-xs space-y-2">
              <span className="text-2xl">✉️</span>
              <h3 className="text-base font-bold text-deep-blue">Presupuesto por Sobres</h3>
              <p className="text-xs text-muted leading-relaxed">
                Asignación reactiva en línea, cálculo instantáneo de saldos disponibles y grupos
                colapsables.
              </p>
            </div>

            <div className="rounded-card border border-line bg-white p-6 shadow-xs space-y-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-base font-bold text-deep-blue">Metas Inteligentes</h3>
              <p className="text-xs text-muted leading-relaxed">
                Metas mensuales, por fecha o saldo objetivo con botón de auto-asignación para fondear
                tus prioridades.
              </p>
            </div>

            <div className="rounded-card border border-line bg-white p-6 shadow-xs space-y-2">
              <span className="text-2xl">📊</span>
              <h3 className="text-base font-bold text-deep-blue">Reportes y Tendencias</h3>
              <p className="text-xs text-muted leading-relaxed">
                Gráficos interactivos de distribución de gasto, evolución mensual y patrimonio neto
                acumulado.
              </p>
            </div>

            <div className="rounded-card border border-line bg-white p-6 shadow-xs space-y-2">
              <span className="text-2xl">📥</span>
              <h3 className="text-base font-bold text-deep-blue">Importador CSV Local</h3>
              <p className="text-xs text-muted leading-relaxed">
                Sube extractos bancarios en cualquier formato con detección automática de duplicados y
                revisión previa.
              </p>
            </div>

            <div className="rounded-card border border-line bg-white p-6 shadow-xs space-y-2">
              <span className="text-2xl">📉</span>
              <h3 className="text-base font-bold text-deep-blue">Calculadora de Préstamos</h3>
              <p className="text-xs text-muted leading-relaxed">
                Simula aportes extra mensuales y descubre cuántos meses e intereses ahorras en tus
                deudas.
              </p>
            </div>

            <div className="rounded-card border border-line bg-white p-6 shadow-xs space-y-2">
              <span className="text-2xl">🔒</span>
              <h3 className="text-base font-bold text-deep-blue">100% Privado y Soberano</h3>
              <p className="text-xs text-muted leading-relaxed">
                Tus datos no se venden ni se comparten con terceros. Ejecución local en tu propia base
                de datos relacional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LLAMADO FINAL A LA ACCIÓN (CTA BANNER) */}
      <section className="bg-deep-blue py-16 text-off-white text-center">
        <div className="mx-auto max-w-4xl px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
            Toma el control de tu futuro financiero hoy mismo
          </h2>
          <p className="text-sm sm:text-base text-off-white/80 max-w-xl mx-auto">
            Únete a la nueva era del presupuesto personal base cero. Sin suscripciones costosas, con
            diseño vanguardista y total privacidad.
          </p>
          <div className="pt-2">
            <LinkButton
              href="/registro"
              variant="primary"
              className="min-h-12 px-8 text-base shadow-lg shadow-modern-pink/30 hover:scale-105 transition-transform"
            >
              Crear mi cuenta gratuita
            </LinkButton>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-line bg-white py-8 text-xs text-muted">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Sobres. Sistema de Presupuesto Base Cero.</p>
          <div className="flex items-center gap-6 font-medium text-deep-blue">
            <Link href="/funcionalidades" className="hover:text-modern-pink transition">
              Funcionalidades
            </Link>
            <Link href="/metodo" className="hover:text-modern-pink transition">
              Método
            </Link>
            <Link href="/precios" className="hover:text-modern-pink transition">
              Precios
            </Link>
            <Link href="/login" className="hover:text-modern-pink transition">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
