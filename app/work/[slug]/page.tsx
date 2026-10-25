import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";

// Only the slugs from generateStaticParams exist; anything else is a 404
export const dynamicParams = false;

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

    return (
        <article className="mx-auto w-full max-w-page px-margin pt-8 pb-section">
            <Link href="/#work" className="text-label text-text-muted hover:text-text">
                ← All work
            </Link>

            {/* Header */}
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
        </article>
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