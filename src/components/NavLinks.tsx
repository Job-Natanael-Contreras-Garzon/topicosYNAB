"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentMonth } from "@/lib/months";

// Máximo cinco elementos (ley de Hick).
const ITEMS = [
  { href: "/app", label: "Inicio", match: (p: string) => p === "/app" },
  { href: `/app/presupuesto/${currentMonth()}`, label: "Presupuesto", match: (p: string) => p.startsWith("/app/presupuesto") },
  { href: "/app/reportes", label: "Reportes", match: (p: string) => p.startsWith("/app/reportes") },
  { href: "/app/prestamos", label: "Préstamos", match: (p: string) => p.startsWith("/app/prestamos") },
  { href: "/app/ajustes", label: "Ajustes", match: (p: string) => p.startsWith("/app/ajustes") },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="flex gap-1 md:flex-col">
      {ITEMS.map((it) => {
        const active = it.match(pathname);
        return (
          <Link
            key={it.label}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-10 items-center rounded-field px-3 text-sm font-semibold ${
              active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
