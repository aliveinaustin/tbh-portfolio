// components/Work.tsx
import type { ReactNode } from "react";
import Section from "@/components/ui/Section";
import WorkCarousel from "@/components/WorkCarousel";
import ScreenDeck from "@/components/visuals/ScreenDeck";
import EmailAssemblyCard from "@/components/visuals/email/EmailAssemblyCard";
import LifecycleConvergenceCard from "@/components/visuals/lifecycle/LifecycleConvergenceCard";
import { caseStudies } from "@/lib/case-studies";
import { gearznDeck } from "@/lib/case-visuals";

// GearZN has real screenshots; the modular-email and lifecycle studies'
// visuals are drawn entirely from geometric primitives (client work, no
// real copy or marks).
const visuals: Record<string, ReactNode> = {
  "headless-commerce-platform": <ScreenDeck screens={gearznDeck} />,
  "modular-email-component-system": <EmailAssemblyCard />,
  "lifecycle-personalization-system": <LifecycleConvergenceCard />,
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