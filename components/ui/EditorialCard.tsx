import type { ReactNode } from "react";

type EditorialCardProps = {
    as?: "article" | "div";
    eyebrow?: string;
    meta?: string;
    title: string;
    children: ReactNode;
    tag?: string;
    cta?: { label: string; href: string };
};

export default function EditorialCard({ as: TagType = "article", eyebrow, meta, title, children, tag, cta }: EditorialCardProps) {
    return (
        <TagType className="rounded-2xl border border-border-invert surface-invert bg-surface-invert p-6 text-text-invert lg:p-8">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border-invert pb-4">
                {eyebrow && <span className="text-code text-text-invert-dim">{eyebrow}</span>}
                {meta && <span className="text-code text-text-invert-faint">{meta}</span>}
            </header>
            <h3 className="mb-3 text-2xl font-bold tracking-tight">{title}</h3>
            <p className="mb-6 text-body-sm text-text-invert-muted">{children}</p>
            {(tag || cta) && (
                <footer className="flex flex-wrap items-center justify-between gap-3">
                    {tag && <span className="text-code font-semibold">{tag}</span>}
                    {cta && (
                        <a href={cta.href} className="group inline-flex items-center gap-1.5 text-code font-semibold transition-colors">
                            <span className="underline decoration-text-invert-faint underline-offset-4 transition-colors group-hover:decoration-text-invert">
                                {cta.label}
                            </span>
                            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                                →
                            </span>
                        </a>
                    )}
                </footer>
            )}

        </TagType>
    );
}