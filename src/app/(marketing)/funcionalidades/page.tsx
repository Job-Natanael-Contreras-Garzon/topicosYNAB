import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";

export const metadata = {
  title: "Funcionalidades — Sobres",
  description: "Conoce todas las herramientas integradas en Sobres para administrar tu dinero con precisión.",
};

export default function FuncionalidadesPage() {
  const modules = [
    {
      badge: "Módulo 1 & 2",
      title: "Gestión Integral de Cuentas y Saldos",
      desc: "Administra cuentas corrientes, cajas de ahorro, efectivo, tarjetas de crédito y cuentas de seguimiento de activos/pasivos. Clasifica automáticamente entre cuentas que afectan el presupuesto y cuentas de solo seguimiento patrimonial.",
      icon: "💳",
      details: ["Saldos conciliados (Cleared) y pendientes", "Soporte multidivisa (BOB / USD)", "Historial de transferencias atómicas"],
    },
    {
      badge: "Módulo 3",
      title: "Registro Rápido y Filtrado de Transacciones",
      desc: "Captura movimientos con autocompletado inteligente de beneficiarios. Transfiere fondos entre cuentas sin desbalancear tus categorías y aprueba lotes de transacciones pendientes en un solo clic.",
      icon: "📝",
      details: ["Buscador reactivo por beneficiario o concepto", "Filtro por fecha, categoría y estado de aprobación", "Aprobación masiva y edición directa"],
    },
    {
      badge: "Módulo 4",
      title: "El Núcleo: Presupuesto Base Cero Mensual",
      desc: "El corazón del sistema. Cada centavo recibe un destino claro. Visualiza de inmediato si tu mes está equilibrado con el banner tricolor de Ready to Assign y traslada dinero entre sobres al instante.",
      icon: "✉️",
      details: ["Edición de asignación en línea sin recargas", "Diálogo 'Mover dinero' entre categorías", "Arrastre de saldos disponibles a meses futuros"],
    },
    {
      badge: "Módulo 5 & 6",
      title: "Metas Inteligentes y Panel de Control Diario",
      desc: "Configura metas mensuales, por fecha límite o por saldo objetivo. Nuestro algoritmo amortiza el monto faltante y el botón de auto-asignación fondea tus prioridades automáticamente.",
      icon: "🎯",
      details: ["Barra de progreso visual por categoría", "Botón 'Asignar lo que falta' inteligente", "Dashboard Home con 4 tarjetas de decisión rápida"],
    },
    {
      badge: "Módulo 7",
      title: "Reportes Visuales y Análisis Patrimonial",
      desc: "Comprende exactamente a dónde va tu dinero con visualizaciones de dona, tendencias temporales y la curva histórica de tu patrimonio neto (Activos − Deudas).",
      icon: "📊",
      details: ["Distribución porcentual por rubro", "Tendencia mensual filtrable por categoría", "Evolución de activos vs. pasivos"],
    },
    {
      badge: "Módulo 8 & 9",
      title: "Importador CSV y Calculadora de Préstamos",
      desc: "Importa extractos bancarios de cualquier entidad financiera con deduplicación automática y simula planes de amortización anticipada para liberarte de tus deudas antes.",
      icon: "⚡",
      details: ["Mapeo flexible de columnas y formatos de fecha", "Previsualización antes de importar", "Cálculo de meses y dinero ahorrados en intereses"],
    },
  ];

  return (
    <div className="bg-surface py-16 sm:py-24 text-deep-blue">
      <div className="mx-auto max-w-6xl px-4 space-y-16">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-modern-pink">
            Potencia y Precisión
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-deep-blue">
            Herramientas diseñadas para darte claridad financiera
          </h1>
          <p className="text-base text-muted">
            Cada funcionalidad de Sobres fue concebida para que tomes el control proactivo de tu
            dinero, sin hojas de cálculo complicadas ni suscripciones abusivas.
          </p>
        </div>

        {/* Grilla de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((m, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-card border border-line bg-white p-7 shadow-xs hover:border-modern-pink transition hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{m.icon}</span>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold text-muted border border-line">
                    {m.badge}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-deep-blue font-display">{m.title}</h2>
                <p className="text-xs text-muted leading-relaxed">{m.desc}</p>
              </div>

              <div className="mt-6 border-t border-line/60 pt-4 space-y-2">
                {m.details.map((d, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2 text-xs text-deep-blue">
                    <span className="text-money-green font-bold text-sm">✓</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="rounded-card bg-deep-blue p-8 sm:p-12 text-center text-off-white shadow-xl space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            ¿Listo para poner a trabajar cada centavo?
          </h2>
          <p className="text-sm text-off-white/80 max-w-lg mx-auto">
            Comienza gratis ahora mismo y descubre la tranquilidad de saber exactamente qué cubre tu
            dinero.
          </p>
          <div>
            <LinkButton href="/registro" variant="primary" className="min-h-12 px-8 text-base">
              Crear mi presupuesto gratis
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
