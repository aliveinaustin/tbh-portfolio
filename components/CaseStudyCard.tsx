// components/CaseStudyCard.tsx
import type { ReactNode } from "react";
import type { CaseStudy } from "@/lib/case-studies";

type CaseStudyCardProps = {
    study: CaseStudy;
    visual?: ReactNode;
    headingLevel?: "h2" | "h3";
};

export default function CaseStudyCard({ study, visual, headingLevel: Heading = "h3" }: CaseStudyCardProps) {
    return (
        <article
            className="group relative grid overflow-hidden rounded-2xl border border-border lg:grid-cols-2
                 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
        >
            {/* Text panel */}
            <div className="surface-invert order-last flex flex-col gap-6 bg-surface-invert p-8 text-text-invert lg:order-first lg:p-12">
                <span className="text-label text-text-invert-dim">{study.discipline}</span>

                <Heading className="text-headline">
                    {/* Stretched link: the after: pseudo-element covers the whole card */}
                    <a href={`/work/${study.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {study.title}
                    </a>
                </Heading>

                <p className="text-body text-text-invert-muted">{study.summary}</p>

                <ul className="flex flex-wrap gap-2" aria-label="Stack">
                    {study.stack.slice(0, 4).map((item) => (
                        <li key={item} className="rounded-full border border-border-invert px-3 py-1 text-code text-text-invert-dim">
                            {item}
                        </li>
                    ))}
                </ul>

                <span aria-hidden="true" className="mt-auto inline-flex items-center gap-2 text-label">
                    Read case study
                    <span className="transition-transform motion-safe:group-hover:translate-x-1">→</span>
                </span>
            </div>

            {/* Visual panel */}
            <div aria-hidden="true" className="relative aspect-video bg-surface lg:aspect-auto lg:min-h-96">
                {visual}
            </div>
        </article>
    );
}

function VisualPlaceholder({ index }: { index: string }) {
    return (
        <div className="flex h-full items-center justify-center text-display text-text-faint">
            {index.slice(0, 2)}
        </div>
    );
}