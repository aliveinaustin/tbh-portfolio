// components/Work.tsx
import Section from "@/components/ui/Section";
import WorkCarousel from "@/components/WorkCarousel";
import { caseStudies } from "@/lib/case-studies";

export default function Work() {
  return (
    <Section
      id="work"
      eyebrow="Selected Work"
      title="Case Studies"
      bleed={<WorkCarousel studies={caseStudies} />}
    />
  );
}