// components/Work.tsx
import type { ReactNode } from "react";
import Section from "@/components/ui/Section";
import WorkCarousel from "@/components/WorkCarousel";
import ScreenDeck from "@/components/visuals/ScreenDeck";
import { caseStudies } from "@/lib/case-studies";
import { gearznDeck } from "@/lib/case-visuals";

// Only GearZN has real screenshots — the SFMC studies keep their empty
// panels (gatedArtifacts: client work can't be shown publicly) until they
// have a visual worth showing.
const visuals: Record<string, ReactNode> = {
  "headless-commerce-platform": <ScreenDeck screens={gearznDeck} />,
};

export default function Work() {
  return (
    <Section
      id="work"
      eyebrow="Selected Work"
      title="Case Studies"
      bleed={<WorkCarousel studies={caseStudies} visuals={visuals} />}
    />
  );
}