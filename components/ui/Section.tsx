import type { ReactNode } from "react";

type Variant = "dark" | "invert";
type Spacing = "default" | "tight" | "none";
type SectionProps = {
  id: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  variant?: Variant;
  spacing?: Spacing;
};



const variants = {
  dark: { section: "bg-bg text-text", eyebrow: "text-text-muted" },
  invert: { section: "bg-surface-invert text-text-invert", eyebrow: "text-text-faint" },
} satisfies Record<Variant, { section: string; eyebrow: string }>;

const spacings = {
  default: "py-section",
  tight: "py-12",
  none: "",
} satisfies Record<Spacing, string>;

export default function Section({ id, eyebrow, title, children, variant = "dark", spacing = "default" }: SectionProps) {
  const headingId = title ? `${id}-heading` : undefined;
  const v = variants[variant];
  const s = spacings[spacing];
  return (
    <section id={id} aria-labelledby={headingId} className={`${s} ${v.section}`}>
      <div className="max-w-page mx-auto px-margin">
        {(eyebrow || title) && (
          <header className="mb-10 flex flex-col gap-3">
            {eyebrow && <p className={`text-label ${v.eyebrow}`}>{eyebrow}</p>}
            {title && <h2 id={headingId} className="text-headline">{title}</h2>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
