import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy, getNextCaseStudy, type CaseStudy } from "@/lib/case-studies";
import { gearznDeck } from "@/lib/case-visuals";
import { cn } from "@/lib/cn";
import { decisionVisuals } from "@/components/visuals/DecisionVisuals";
import HeroDeck from "@/components/visuals/HeroDeck";
import ResultVideo from "@/components/visuals/ResultVideo";

// Only the slugs from generateStaticParams exist; anything else is a 404
export const dynamicParams = false;

// All case studies share one layout. GearZN is the only one with real
// product screenshots and footage, so it's the only one that gets an actual
// hero visual, a Result video and visual decision rows — other studies get
// placeholders/plain-text equivalents in those slots until they have art.
const GEARZN_SLUG = "headless-commerce-platform";

export function generateStaticParams() {
    return caseStudies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const study = getCaseStudy(slug);
    if (!study) return {};
    return {
        title: study.title,
        description: study.summary,
    };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
    const { slug } = await params;
    const study = getCaseStudy(slug);
    if (!study) notFound();
    const isGearzn = slug === GEARZN_SLUG;

    return (
        <article className="mx-auto w-full max-w-page px-margin pt-8 pb-16">
            <Link href="/#work" className="text-label text-text-muted hover:text-text">
                ← All work
            </Link>

            <Header study={study} isGearzn={isGearzn} />
            <Body study={study} isGearzn={isGearzn} />

            <NextCaseStudy slug={slug} />
        </article>
    );
}

function NextCaseStudy({ slug }: { slug: string }) {
    const next = getNextCaseStudy(slug);
    return (
        <Link
            href={`/work/${next.slug}`}
            className="group mt-20 flex items-center justify-between gap-6 border-t border-border pt-8"
        >
            <span className="flex flex-col gap-2">
                <span className="text-label text-text-muted">Next case study</span>
                <span className="text-subhead text-text">{next.title}</span>
            </span>
            <span
                aria-hidden="true"
                className="shrink-0 text-headline text-text-muted transition-transform motion-safe:group-hover:translate-x-1"
            >
                →
            </span>
        </Link>
    );
}

function Header({ study, isGearzn }: { study: CaseStudy; isGearzn: boolean }) {
    return (
        <header className="mt-8 grid gap-10 border-b border-border pb-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="flex flex-col gap-6">
                <span className="text-label text-text-muted">{study.discipline}</span>
                <h1 className="text-display">{study.title}</h1>
                <p className="text-body max-w-prose text-text-muted">{study.summary}</p>

                <dl className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
                    <Meta label="Role" value={study.role} />
                    <Meta label="Platform" value={study.platform} />
                    {study.client && <Meta label="Client" value={study.client} />}
                    {study.status && <Meta label="Status" value={study.status} />}
                </dl>
            </div>

            {isGearzn ? <HeroDeck screens={gearznDeck} /> : <HeroPlaceholder />}
        </header>
    );
}

// Stand-in for studies that don't have a hero visual yet — matches HeroDeck's
// own backdrop footprint (aspect-16/10, rounded-2xl, border) so swapping a
// real visual in later doesn't reflow anything around it.
function HeroPlaceholder() {
    return (
        <div
            aria-hidden="true"
            className="flex aspect-16/10 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-surface"
        >
            <span className="text-label text-text-faint">Visual in progress</span>
        </div>
    );
}

// Consecutive decisions that share one `visual` key (the two failure-path
// fixes) collapse into a single row with a single animated instance instead
// of two unsynced copies — see components/visuals/DecisionVisuals.tsx.
type DecisionRow =
    | { kind: "visual"; visual: string; decisions: CaseStudy["decisions"] }
    | { kind: "text"; decision: CaseStudy["decisions"][number] };

function groupDecisions(decisions: CaseStudy["decisions"]): DecisionRow[] {
    const rows: DecisionRow[] = [];
    for (const d of decisions) {
        if (!d.visual) {
            rows.push({ kind: "text", decision: d });
            continue;
        }
        const last = rows[rows.length - 1];
        if (last?.kind === "visual" && last.visual === d.visual) {
            last.decisions.push(d);
        } else {
            rows.push({ kind: "visual", visual: d.visual, decisions: [d] });
        }
    }
    return rows;
}

function Body({ study, isGearzn }: { study: CaseStudy; isGearzn: boolean }) {
    const rows = groupDecisions(study.decisions);

    return (
        <div className="flex flex-col gap-16 pt-12">
            <div className="flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:items-start lg:divide-x lg:divide-border">
                <div className="lg:pr-8">
                    <Prose heading="Problem" body={study.problem} />
                </div>
                <div className="lg:pl-8">
                    <Prose heading="Approach" body={study.approach} />
                </div>
            </div>

            {/* No overflow-hidden here: the video's own rounded-xl clips itself,
                and position:sticky on its column wouldn't work at all inside a
                panel that's also a scroll container (which overflow-hidden,
                not just rounded-2xl, would make it). */}
            <section
                className={cn(
                    "surface-invert grid gap-8 rounded-2xl bg-surface-invert p-8 text-text-invert lg:items-start lg:gap-12 lg:p-12",
                    isGearzn && "lg:grid-cols-2"
                )}
            >
                <div className="flex flex-col gap-4">
                    <h2 className="text-subhead text-text-invert-dim">Result</h2>
                    {(study.resultParagraphs ?? [study.result]).map((paragraph) => (
                        <p key={paragraph} className="text-body">
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* 6.5rem matches globals.css's lg scroll-padding-top (the
                    sticky header's own cleared height) so the video never
                    starts out tucked under it. */}
                {isGearzn && (
                    <div className="lg:sticky lg:top-26">
                        <ResultVideo />
                    </div>
                )}
            </section>

            {study.metrics && <MetricsBand metrics={study.metrics} />}

            <ConstraintsGrid items={study.constraints} />

            <section className="flex flex-col gap-10">
                <h2 className="text-subhead">Key decisions</h2>
                {isGearzn ? (
                    <div className="flex flex-col gap-12">
                        {rows.map((row, i) => {
                            if (row.kind === "text") {
                                return (
                                    <div key={row.decision.decision} className="flex max-w-prose flex-col gap-1 border-y border-border py-4">
                                        <p className="text-body font-semibold">{row.decision.decision}</p>
                                        <p className="text-body-sm text-text-muted">{row.decision.reason}</p>
                                    </div>
                                );
                            }

                            const side = rows.slice(0, i).filter((r) => r.kind === "visual").length % 2;

                            const text = (
                                <div className="flex flex-col justify-center gap-6">
                                    {row.decisions.map((d) => (
                                        <div key={d.decision} className="flex flex-col gap-2">
                                            <p className="text-body font-semibold">{d.decision}</p>
                                            <p className="text-body-sm text-text-muted">{d.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            );
                            const visual = <div className="flex items-center justify-center">{decisionVisuals[row.visual]}</div>;

                            return (
                                <div key={`${row.visual}-${i}`} className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
                                    <div className={side === 1 ? "lg:order-2" : undefined}>{text}</div>
                                    <div className={side === 1 ? "lg:order-1" : undefined}>{visual}</div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <dl className="flex flex-col divide-y divide-border border-y border-border">
                        {study.decisions.map((d) => (
                            <div key={d.decision} className="flex flex-col gap-1 py-4">
                                <dt className="text-body font-semibold">{d.decision}</dt>
                                <dd className="text-body-sm text-text-muted">{d.reason}</dd>
                            </div>
                        ))}
                    </dl>
                )}
            </section>

            <LearnedGrid items={study.learned} />

            <div className="max-w-prose">
                <section className="flex flex-col gap-4">
                    <h2 className="text-subhead">Stack</h2>
                    <ul className="flex flex-wrap gap-2">
                        {study.stack.map((item) => (
                            <li key={item} className="rounded-full border border-border px-3 py-1 text-code text-text-muted">
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}

// Each item is "short claim. Explanation." — split once on the first
// sentence boundary so the claim can be set larger than its explanation.
function splitLead(text: string): [string, string] {
    const i = text.indexOf(". ");
    return i === -1 ? [text, ""] : [text.slice(0, i + 1), text.slice(i + 2)];
}

function ConstraintsGrid({ items }: { items: string[] }) {
    return (
        <section className="flex flex-col gap-6">
            <h2 className="text-subhead">Constraints</h2>
            <ul className="grid gap-4 lg:grid-cols-2">
                {items.map((item) => (
                    <li key={item} className="rounded-2xl border border-border p-6 text-body text-text-muted">
                        {item}
                    </li>
                ))}
            </ul>
        </section>
    );
}

function LearnedGrid({ items }: { items: string[] }) {
    return (
        <section className="flex flex-col gap-6">
            <h2 className="text-subhead">What I learned</h2>
            <div className="grid gap-4 lg:grid-cols-2">
                {items.map((item) => {
                    const [lead, rest] = splitLead(item);
                    return (
                        <div key={item} className="flex flex-col gap-3 rounded-2xl border border-border p-6">
                            <p className="text-subhead">{lead}</p>
                            {rest && <p className="text-body text-text-muted">{rest}</p>}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function MetricsBand({ metrics }: { metrics: NonNullable<CaseStudy["metrics"]> }) {
    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-subhead">By the numbers</h2>
            <dl className="grid grid-cols-2 divide-border border border-border sm:grid-cols-4 [&>div]:border-border [&>div:not(:last-child)]:border-r [&>div:not(:last-child)]:border-b sm:[&>div:not(:last-child)]:border-b-0">
                {metrics.map((m) => (
                    <div key={m.caption} className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                        <dd className="text-metric">
                            {m.value}
                            {m.unit && <span className="text-label text-text-muted"> {m.unit}</span>}
                        </dd>
                        <dt className="text-code text-text-muted">{m.caption}</dt>
                    </div>
                ))}
            </dl>
        </section>
    );
}

function Meta({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <dt className="text-label text-text-muted">{label}</dt>
            <dd className="text-body-sm">{value}</dd>
        </div>
    );
}

function Prose({ heading, body }: { heading: string; body: string }) {
    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-subhead">{heading}</h2>
            <p className="text-body text-text-muted">{body}</p>
        </section>
    );
}
