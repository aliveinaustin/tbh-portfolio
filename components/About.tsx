// components/About.tsx
import Section from "@/components/ui/Section";
import KvList from "@/components/ui/KvList";
import KvRow from "@/components/ui/KvRow";

export default function About() {
    return (
        <Section id="about" eyebrow="Background" title="About">
            <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
                <div className="flex max-w-prose flex-col gap-5 text-body text-text-muted">
                    <p>I&rsquo;m a front-end developer at GSD&M in Austin, where I&rsquo;ve spent eleven years building the parts of campaigns that have to work everywhere: HTML email and Salesforce Marketing Cloud programs, animated HTML5 display, and the sites they point to.</p>
                    <p>I came to code from the side. I studied aeronautical science at Embry-Riddle, with a minor in computer applications, and hold a commercial multi-engine pilot certificate with an instrument rating. Before development I spent five years in technical support at Dell, four years managing litigation databases under strict chain-of-custody rules, and four years touring full-time as the trombonist in the Austin soul band Roxy Roca, where I also ran the band's 10,000-person email list. That was my first email marketing job, years before it became my actual one.</p>
                    <p>What colleagues point to most is that I catch problems early: a pattern in the source data or a gap in the plan, found during planning instead of in development. I think that comes from a lifelong fascination with process, with how things actually get made, whether it&rsquo;s an instrument approach, a dovetail joint, a mechanical watch or a house going up. It&rsquo;s why I trust checklists and written procedures, and why I have very little patience for systems that report success while doing the wrong thing.</p>
                    <p>Away from work I travel as much as I can, from Nepal and Cambodia to Iceland, Peru and Belize, and many more.</p>
                </div>

                <KvList>
                    <KvRow label="Based" value="Austin, TX" />
                    <KvRow label="Education" value="B.S. Aeronautical Science, Embry-Riddle" />
                    <KvRow label="Minor" value="Computer Applications" />
                    <KvRow label="FAA" value="Commercial Pilot, Multi-Engine, Instrument" />
                </KvList>
            </div>
        </Section>
    );
}