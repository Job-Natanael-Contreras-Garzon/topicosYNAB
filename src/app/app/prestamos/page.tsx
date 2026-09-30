import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Préstamos — Sobres" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold">Préstamos</h1>
      <EmptyState title="Préstamos llega pronto" description="Simula cuánto ahorras en meses e intereses con un pago extra. La lógica ya está en lib/loan.ts; falta la pantalla (Sprint 6)." />
    </div>
  );
}
