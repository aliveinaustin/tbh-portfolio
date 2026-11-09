import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy, type CaseStudy } from "@/lib/case-studies";
import { gearznDeck } from "@/lib/case-visuals";
import { decisionVisuals } from "@/components/visuals/DecisionVisuals";
import HeroDeck from "@/components/visuals/HeroDeck";
import ResultVideo from "@/components/visuals/ResultVideo";

// Only the slugs from generateStaticParams exist; anything else is a 404
export const dynamicParams = false;

// GearZN is the only study with real product screenshots, so it's the only
// one that gets the visual treatment below — the two SFMC studies render
// through the exact same header/body structure this page always had.
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
        <article className="mx-auto w-full max-w-page px-margin pt-8 pb-section">
            <Link href="/#work" className="text-label text-text-muted hover:text-text">
                ← All work
            </Link>

            {isGearzn ? <GearznHeader study={study} /> : <DefaultHeader study={study} />}
            {isGearzn ? <GearznBody study={study} /> : <DefaultBody study={study} />}
        </article>
    );
}

function DefaultHeader({ study }: { study: CaseStudy }) {
    return (
        <header className="mt-8 flex flex-col gap-6 border-b border-border pb-10">
            <span className="text-label text-text-muted">{study.discipline}</span>
            <h1 className="text-display">{study.title}</h1>
            <p className="text-body max-w-prose text-text-muted">{study.summary}</p>

            <dl className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                <Meta label="Role" value={study.role} />
                <Meta label="Platform" value={study.platform} />
                {study.client && <Meta label="Client" value={study.client} />}
                {study.status && <Meta label="Status" value={study.status} />}
            </dl>
        </header>
    );
}

function DefaultBody({ study }: { study: CaseStudy }) {
    return (
        <div className="flex max-w-prose flex-col gap-12 pt-12">
            <Prose heading="Problem" body={study.problem} />
            <Prose heading="Approach" body={study.approach} />
            <Prose heading="Result" body={study.result} />

            {study.metrics && (
                <section className="flex flex-col gap-4">
                    <h2 className="text-subhead">By the numbers</h2>
                    <dl className="grid grid-cols-2 gap-6">
                        {study.metrics.map((m) => (
                            <div key={m.caption} className="flex flex-col gap-1">
                                <dt className="text-code text-text-muted">{m.caption}</dt>
                                <dd className="text-metric">
                                    {m.value}
                                    {m.unit && <span className="text-label text-text-muted"> {m.unit}</span>}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            <ListSection heading="Constraints" items={study.constraints} />

            <section className="flex flex-col gap-4">
                <h2 className="text-subhead">Key decisions</h2>
                <dl className="flex flex-col divide-y divide-border border-y border-border">
                    {study.decisions.map((d) => (
                        <div key={d.decision} className="flex flex-col gap-1 py-4">
                            <dt className="text-body font-semibold">{d.decision}</dt>
                            <dd className="text-body-sm text-text-muted">{d.reason}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <ListSection heading="What I learned" items={study.learned} />

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
    );
}

function GearznHeader({ study }: { study: CaseStudy }) {
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

            <HeroDeck screens={gearznDeck} />
        </header>
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

function GearznBody({ study }: { study: CaseStudy }) {
    const rows = groupDecisions(study.decisions);
    let visualIndex = 0;

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
            <section className="surface-invert grid gap-8 rounded-2xl bg-surface-invert p-8 text-text-invert lg:grid-cols-2 lg:items-start lg:gap-12 lg:p-12">
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
                <div className="lg:sticky lg:top-26">
                    <ResultVideo />
                </div>
            </section>

            {study.metrics && <MetricsBand metrics={study.metrics} />}

            <div className="max-w-prose">
                <ListSection heading="Constraints" items={study.constraints} />
            </div>

            <section className="flex flex-col gap-10">
                <h2 className="text-subhead">Key decisions</h2>
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

                        const side = visualIndex % 2;
                        visualIndex += 1;

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
            </section>

            <div className="flex max-w-prose flex-col gap-12">
                <ListSection heading="What I learned" items={study.learned} />

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

function ListSection({ heading, items }: { heading: string; items: string[] }) {
    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-subhead">{heading}</h2>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-body text-text-muted marker:text-text-faint">
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </section>
    );
}
