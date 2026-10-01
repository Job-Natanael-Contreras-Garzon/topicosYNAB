import { formatCents } from "@/lib/money";

interface Props {
  underfundedCents: number;
  progressPercent: number;
  currency?: string;
  isFunded: boolean;
  className?: string;
}

export function GoalProgress({
  underfundedCents,
  progressPercent,
  currency = "BOB",
  isFunded,
  className = "",
}: Props) {
  const percentClamped = Math.min(100, Math.max(0, progressPercent));

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-[11px] leading-tight">
        {isFunded ? (
          <span className="font-semibold text-money-green flex items-center gap-1">
            <span>✓</span> Meta cubierta
          </span>
        ) : (
          <span className="font-medium text-alert flex items-center gap-1">
            <span>•</span> Falta asignar {formatCents(underfundedCents, currency)}
          </span>
        )}
        <span className="font-semibold tabular-nums text-muted">{percentClamped}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFunded
              ? "bg-money-green"
              : percentClamped > 50
              ? "bg-warning"
              : "bg-modern-pink"
          }`}
          style={{ width: `${percentClamped}%` }}
        />
      </div>
    </div>
  );
}
