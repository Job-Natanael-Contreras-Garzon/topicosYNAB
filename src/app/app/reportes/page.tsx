import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Reportes — Sobres" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold">Reportes</h1>
      <EmptyState title="Reportes llega pronto" description="Aquí verás en qué gastas tu dinero: por categoría, tendencia y patrimonio neto (Sprint 5)." />
    </div>
  );
}
