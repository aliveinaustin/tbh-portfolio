// components/Work.tsx
import Section from "@/components/ui/Section";
import CaseStudyCard from "@/components/CaseStudyCard";
import { caseStudies } from "@/lib/case-studies";

export default function Work() {
  return (
    <Section id="work" eyebrow="Selected Work" title="Case Studies">
      <div className="flex flex-col gap-8">
        {caseStudies.map((study) => (
          <CaseStudyCard key={study.slug} study={study} />
        ))}
      </div>
    </Section>
  );
}