import type { ReactNode } from "react";

/** Estado vacío unificado: ilustración simple, causa y una acción principal. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-white px-6 py-12 text-center">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="8" y="18" width="48" height="30" rx="6" fill="#e3e6f0" />
        <rect x="14" y="24" width="36" height="18" rx="4" fill="#fff" />
        <circle cx="32" cy="33" r="6" fill="#a5e85a" />
      </svg>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="max-w-md text-muted">{description}</p>
      {action}
    </div>
  );
}
