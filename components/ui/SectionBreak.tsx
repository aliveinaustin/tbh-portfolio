// components/ui/SectionBreak.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "brand" | "muted";
type SectionBreakProps = {
  /** An animated banner creative, once one exists. Until then the break
   * renders as a thin band on its own. */
  children?: ReactNode;
  /** "brand" (default) is the red break between Skills/About — the main,
   * eye-catching one. "muted" uses the badge's secondary gray so the breaks
   * flanking that one (Work→Skills, About→Contact) read as quieter bookends
   * rather than repeating the same loud red three times down the page. */
  variant?: Variant;
};

const variants = {
  brand: "bg-brand",
  muted: "bg-accent-dim",
} satisfies Record<Variant, string>;

/**
 * Full-bleed band marking the transition between two text-dense sections —
 * a thin divider by default, sized to hold a custom animated banner once
 * one's built.
 */
export default function SectionBreak({ children, variant = "brand" }: SectionBreakProps) {
  return (
    <div
      className={cn("w-full", variants[variant], children ? "flex items-center justify-center" : "h-2")}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
