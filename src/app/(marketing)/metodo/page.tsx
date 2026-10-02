import { LinkButton } from "@/components/ui/Button";

export const metadata = {
  title: "El Método — Sobres",
  description: "Aprende las 4 reglas del presupuesto base cero que cambiarán tu relación con el dinero.",
};

export default function MetodoPage() {
  const rules = [
    {
      num: "1",
      title: "Dale un trabajo a cada boliviano",
      subtitle: "Solo presupuesta el dinero que realmente tienes hoy en tus cuentas.",
      description:
        "Olvida presupuestar con dinero que 'esperas recibir a fin de mes'. En el método de Sobres, cuando entra dinero a tu cuenta (sueldo, honorarios, ventas), decides de inmediato el destino de cada centavo: comida, transporte, alquiler o ahorro, hasta que tu saldo por asignar llegue a cero.",
      benefit: "Resultado: Sabes exactamente para qué alcanza tu dinero actual sin especulaciones.",
    },
    {
      num: "2",
      title: "Abraza tus gastos reales",
      subtitle: "Convierte los grandes pagos futuros en cuotas mensuales manejables.",
      description:
        "Los impuestos anuales, la matrícula del colegio, el mantenimiento del vehículo o las fiestas de fin de año no son gastos imprevistos: son gastos inevitables con fecha futura. Al dividir ese costo entre los meses que faltan, apartas una porción cada mes y el pago deja de ser una pesadilla.",
      benefit: "Resultado: Adiós al pánico ante las facturas grandes o estacionales.",
    },
    {
      num: "3",
      title: "Ajusta cuando la vida cambie",
      subtitle: "La flexibilidad es la clave para que un presupuesto no fracase.",
      description:
        "Un presupuesto rígido se rompe ante el primer imprevisto. Si gastaste más de la cuenta en una cena o una emergencia médica, no abandonas el presupuesto: simplemente mueves dinero desde un sobre de menor prioridad (como salidas o ropa) para cubrir la diferencia.",
      benefit: "Resultado: Cero culpa, adaptabilidad total y control constante.",
    },
    {
      num: "4",
      title: "Envejece tu dinero",
      subtitle: "Rompe el ciclo de vivir de quincena en quincena.",
      description:
        "A medida que aplicas las reglas 1, 2 y 3, comienzas a acumular un colchón financiero natural. Con el tiempo, los gastos que pagas hoy se cubren con los ingresos que ganaste el mes pasado o antes, logrando un desfase de 30 días o más que te da libertad absoluta.",
      benefit: "Resultado: Duermes tranquilo sabiendo que tus próximos meses están cubiertos.",
    },
  ];

  return (
    <div className="bg-surface py-16 sm:py-24 text-deep-blue">
      <div className="mx-auto max-w-5xl px-4 space-y-16">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-money-green">
            Presupuesto Proactivo
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-deep-blue">
            Las 4 Reglas del Presupuesto Base Cero
          </h1>
          <p className="text-base text-muted leading-relaxed">
            La mayoría de las personas mira su cuenta bancaria para saber si puede gastar.
            Nosotros te enseñamos a mirar tus <strong>sobres</strong>.
          </p>
        </div>

        {/* Las 4 Reglas */}
        <div className="space-y-8">
          {rules.map((rule) => (
            <div
              key={rule.num}
              className="flex flex-col md:flex-row gap-6 rounded-card border border-line bg-white p-8 shadow-xs hover:border-money-green transition"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-deep-blue text-off-white font-extrabold text-2xl font-display">
                {rule.num}
              </div>

              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-bold text-deep-blue font-display">
                    Regla {rule.num}: {rule.title}
                  </h2>
                  <p className="text-xs font-semibold text-money-green uppercase tracking-wide mt-0.5">
                    {rule.subtitle}
                  </p>
                </div>

                <p className="text-sm text-muted leading-relaxed">{rule.description}</p>

                <div className="rounded-field bg-surface/60 border border-line/80 px-4 py-2.5 text-xs font-medium text-deep-blue flex items-center gap-2">
                  <span className="text-money-green font-bold">✨</span>
                  <span>{rule.benefit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparativa */}
        <div className="rounded-card border border-line bg-white p-8 shadow-xs space-y-6">
          <h2 className="text-2xl font-bold text-deep-blue font-display text-center">
            ¿En qué se diferencia de un presupuesto tradicional?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-field border border-alert/20 bg-alert/5 p-5 space-y-2">
              <h3 className="font-bold text-alert text-base flex items-center gap-2">
                <span>✕</span> Presupuesto Tradicional (Reactivo)
              </h3>
              <ul className="text-xs text-muted space-y-2 list-disc list-inside">
                <li>Presupuesta dinero futuro que aún no ha ingresado.</li>
                <li>Registra gastos después de que ocurrieron para ver "en qué se fue".</li>
                <li>Si te pasas de tu límite, sientes que fracasaste y lo abandonas.</li>
                <li>Mantiene el ciclo de estrés quincena tras quincena.</li>
              </ul>
            </div>

            <div className="rounded-field border border-money-green/30 bg-money-green/5 p-5 space-y-2">
              <h3 className="font-bold text-money-green text-base flex items-center gap-2">
                <span>✓</span> Método Sobres (Proactivo)
              </h3>
              <ul className="text-xs text-deep-blue space-y-2 list-disc list-inside">
                <li>Solo asigna dinero real que ya tienes en tus manos.</li>
                <li>Decides el propósito de cada centavo antes de gastarlo.</li>
                <li>Mueves fondos con flexibilidad sin culpa ni fricción.</li>
                <li>Te prepara con meses de anticipación para gastos grandes.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Banner CTA */}
        <div className="text-center space-y-4 pt-4">
          <p className="text-lg font-bold text-deep-blue">
            Poner en práctica este método toma solo 5 minutos al día.
          </p>
          <div>
            <LinkButton href="/registro" variant="primary" className="min-h-12 px-8 text-base">
              Comenzar con la Regla 1 gratis
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
