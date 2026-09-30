import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Todas las cuentas — Sobres" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold">Todas las cuentas</h1>
      <EmptyState title="Todas las cuentas llega pronto" description="Aquí verás todos tus movimientos juntos. La tabla de transacciones se construye en el Sprint 2." />
    </div>
  );
}
