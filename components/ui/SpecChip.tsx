import type { ReactNode } from "react";
type Variant = "default" | "verified";
type SpecChipProps = {
  children: ReactNode;
  variant?: Variant;
};
const base = "inline-flex items-center rounded-sm border bg-surface px-2 py-1 text-code leading-none";

const variants = {
  default: "border-border text-text-dim",
  verified: "border-ok/30 text-ok",
} satisfies Record<Variant, string>;

export default function SpecChip({ children, variant = "default", }: SpecChipProps) {
  return <span className={`${base} ${variants[variant]}`}>{children}</span>;
}