import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-primary text-white hover:bg-primary/90",
  lime: "bg-lime text-navy hover:brightness-95",
  outline: "border border-line bg-white text-navy hover:bg-surface",
  danger: "bg-alert text-white hover:bg-alert/90",
  ghost: "text-navy hover:bg-surface",
} as const;

const base =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-field px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof variants }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
