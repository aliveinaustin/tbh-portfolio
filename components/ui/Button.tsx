import type { ReactNode } from "react";

type Variant = "primary" | "wire" | "primaryInvert";
type ButtonProps = {
  href?: string;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  children: ReactNode;
  brackets?: boolean;
  variant?: Variant;
  onClick?: () => void;
  type?: "button" | "submit";
};

const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-label leading-none transition-colors active:scale-95 sm:w-auto"

const variants = {
  primary: "bg-accent text-bg hover:bg-text-dim",
  wire: "border border-accent/30 text-text hover:bg-accent/10",
  primaryInvert: "bg-text-invert text-surface-invert hover:bg-text-invert-dim",
} satisfies Record<Variant, string>;

export default function Button({ href, icon, iconPosition = "end", children, brackets, variant = "primary", onClick, type = "button", }: ButtonProps) {
  const className = `${base} ${variants[variant]}`;
  const content = (
    <>
      {icon && iconPosition === "start" && <span aria-hidden="true">{icon}</span>}
      {brackets && <span aria-hidden="true">[ </span>}
      {children}
      {brackets && <span aria-hidden="true"> ]</span>}
      {icon && iconPosition === "end" && <span aria-hidden="true">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={className}>
      {content}
    </button>
  );
}