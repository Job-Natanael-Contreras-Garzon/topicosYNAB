"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { formatCents, parseMoneyToCents, centsToInput } from "@/lib/money";

interface Props {
  valueCents: number;
  currency?: string;
  onSave: (cents: number) => Promise<void>;
  ariaLabel?: string;
  className?: string;
}

export function InlineNumberInput({
  valueCents,
  currency = "BOB",
  onSave,
  ariaLabel,
  className = "",
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(centsToInput(valueCents));
  const [optimisticCents, setOptimisticCents] = useState(valueCents);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOptimisticCents(valueCents);
    setTempValue(centsToInput(valueCents));
  }, [valueCents]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commitSave = () => {
    setIsEditing(false);
    const parsed = parseMoneyToCents(tempValue);
    if (parsed === null) {
      // Valor inválido, revertir
      setTempValue(centsToInput(optimisticCents));
      return;
    }
    const newCents = Math.max(0, parsed);
    if (newCents === optimisticCents) return;

    setOptimisticCents(newCents);
    startTransition(async () => {
      try {
        await onSave(newCents);
      } catch {
        // En caso de fallo en el servidor, revertir
        setOptimisticCents(valueCents);
        setTempValue(centsToInput(valueCents));
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setTempValue(centsToInput(optimisticCents));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={commitSave}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        className={`w-28 rounded-field border-2 border-modern-pink bg-white px-2 py-1 text-right text-sm font-semibold tabular-nums text-deep-blue outline-none shadow-sm ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      aria-label={ariaLabel}
      className={`group flex items-center justify-end rounded-field px-2 py-1 text-right text-sm font-semibold tabular-nums text-deep-blue hover:bg-surface/80 hover:ring-1 hover:ring-line transition cursor-pointer ${
        isPending ? "opacity-60" : ""
      } ${className}`}
    >
      <span className="truncate">{formatCents(optimisticCents, currency)}</span>
      <span className="ml-1 opacity-0 group-hover:opacity-60 text-xs text-muted">✎</span>
    </button>
  );
}
