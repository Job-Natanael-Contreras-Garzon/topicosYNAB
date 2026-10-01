import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-modern-pink text-deep-blue font-bold hover:brightness-95 shadow-sm shadow-modern-pink/20",
  corporate: "bg-money-green text-off-white hover:brightness-110 shadow-sm",
  lime: "bg-modern-pink text-deep-blue font-bold hover:brightness-95",
  outline: "border border-line bg-white text-deep-blue hover:bg-powder-pink/30",
  danger: "bg-alert text-white hover:bg-alert/90",
  ghost: "text-deep-blue hover:bg-powder-pink/20",
} as const;

const base =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-field px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";

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
