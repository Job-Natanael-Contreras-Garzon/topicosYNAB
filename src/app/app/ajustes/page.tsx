import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Ajustes — Sobres" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold">Ajustes</h1>
      <EmptyState title="Ajustes llega pronto" description="Preferencias de tu cuenta y del presupuesto." />
    </div>
  );
}
