import { LinkButton } from "@/components/ui/Button";

export const metadata = {
  title: "Precios y Modelo Libre — Sobres",
  description: "Conoce nuestro modelo 100% libre, local y sin suscripciones recurrentes.",
};

export default function PreciosPage() {
  return (
    <div className="bg-surface py-16 sm:py-24 text-deep-blue">
      <div className="mx-auto max-w-5xl px-4 space-y-16">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-modern-pink">
            Soberanía Financiera
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-deep-blue">
            Sin suscripciones. Sin ataduras. 100% tuyo.
          </h1>
          <p className="text-base text-muted">
            Creemos que una herramienta para salir de deudas y ahorrar no debería cobrarte cuotas
            mensuales recurrentes que aumenten tus gastos fijos.
          </p>
        </div>

        {/* Tarjeta de Precios */}
        <div className="mx-auto max-w-md rounded-card border-2 border-modern-pink bg-white p-8 shadow-xl text-center space-y-6 relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-modern-pink px-4 py-1 text-xs font-bold text-deep-blue uppercase tracking-wider">
            Edición Universitaria & Soberana
          </div>

          <div className="pt-2">
            <h2 className="text-2xl font-bold font-display text-deep-blue">Acceso Completo</h2>
            <p className="text-xs text-muted mt-1">Todas las funciones incluidas de por vida</p>
          </div>

          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold font-display text-deep-blue">0</span>
            <span className="text-xl font-bold text-money-green">BOB</span>
            <span className="text-xs text-muted">/ para siempre</span>
          </div>

          <ul className="text-left text-xs space-y-3 border-y border-line py-6 text-deep-blue">
            <li className="flex items-center gap-2.5">
              <span className="text-money-green font-bold text-sm">✓</span>
              <span>Cuentas ilimitadas (corrientes, ahorro, crédito, seguimiento)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-money-green font-bold text-sm">✓</span>
              <span>Presupuesto base cero por categorías y grupos colapsables</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-money-green font-bold text-sm">✓</span>
              <span>Metas inteligentes con cálculo dinámico de amortización</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-money-green font-bold text-sm">✓</span>
              <span>Reportes gráficos de gastos, tendencias y patrimonio neto</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-money-green font-bold text-sm">✓</span>
              <span>Importador CSV universal con deduplicación automática</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-money-green font-bold text-sm">✓</span>
              <span>Simulador de préstamos y pagos extraordinarios</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-money-green font-bold text-sm">✓</span>
              <span>Colaboración multiusuario para compartir presupuesto</span>
            </li>
          </ul>

          <div>
            <LinkButton href="/registro" variant="primary" className="w-full min-h-12 text-base">
              Comenzar ahora mismo gratis
            </LinkButton>
          </div>
        </div>

        {/* Comparativa con alternativas comerciales */}
        <div className="rounded-card border border-line bg-white p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-deep-blue font-display text-center">
            ¿Por qué elegir Sobres frente a otras alternativas?
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface/50 text-muted uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Característica</th>
                  <th className="px-4 py-3 text-deep-blue font-bold">Sobres.</th>
                  <th className="px-4 py-3">YNAB® Comercial</th>
                  <th className="px-4 py-3">Hojas de Cálculo (Excel)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                <tr>
                  <td className="px-4 py-3 font-semibold">Costo anual</td>
                  <td className="px-4 py-3 text-money-green font-bold">0 BOB (Gratis)</td>
                  <td className="px-4 py-3 text-alert">$109 USD / año</td>
                  <td className="px-4 py-3">Gratis / Licencia Office</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Privacidad y base de datos</td>
                  <td className="px-4 py-3 font-bold text-deep-blue">Tus datos en tu PostgreSQL</td>
                  <td className="px-4 py-3 text-muted">Servidores de terceros</td>
                  <td className="px-4 py-3 text-muted">Archivos locales desconectados</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Método Base Cero</td>
                  <td className="px-4 py-3 text-money-green font-bold">✓ Nativo y reactivo</td>
                  <td className="px-4 py-3">✓ Nativo</td>
                  <td className="px-4 py-3 text-muted">Requiere fórmulas complejas</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Moneda boliviana (BOB)</td>
                  <td className="px-4 py-3 text-money-green font-bold">✓ Soporte nativo de centavos</td>
                  <td className="px-4 py-3 text-muted">Configuración secundaria</td>
                  <td className="px-4 py-3">Manual</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Importación CSV flexible</td>
                  <td className="px-4 py-3 text-money-green font-bold">✓ Con vista previa y deduplicación</td>
                  <td className="px-4 py-3">✓ Estándar</td>
                  <td className="px-4 py-3 text-muted">Copiar y pegar manual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
