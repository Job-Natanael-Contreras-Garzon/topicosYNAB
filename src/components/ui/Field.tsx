import type { ComponentProps } from "react";

export function Field({
  label,
  error,
  id,
  ...props
}: ComponentProps<"input"> & { label: string; error?: string; id: string }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-h-10 w-full rounded-field border border-line bg-white px-3 text-base outline-none focus:border-primary"
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
