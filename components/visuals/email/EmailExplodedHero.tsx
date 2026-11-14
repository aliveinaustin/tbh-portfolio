// components/visuals/email/EmailExplodedHero.tsx
"use client";

import { gsap } from "@/lib/motion/gsap";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";
import EmailAssemblySvg from "@/components/visuals/email/EmailAssemblySvg";
import { buildFoldBack, applySettledState } from "@/components/visuals/email/buildAssemblyBeats";
import { buildHeroAssembly, buildHeroCallouts, buildHeroExplode } from "@/components/visuals/email/buildHeroTimeline";

/**
 * The detail-page hero for the modular-email study. Builds its own,
 * shorter timeline (~11s) from the same shared primitives as the carousel
 * card rather than replaying the card's: assemble (Template → Rows →
 * Modules → Config, one brand, no palette) → callouts draw in over the
 * finished email → explode into four separated planes → hold → rejoin →
 * fade → loop. See buildHeroTimeline.ts for the sequence itself.
 */
export default function EmailExplodedHero() {
  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      const tl = gsap.timeline({ repeat: -1 });
      buildHeroAssembly(tl, scope);
      buildHeroCallouts(tl, scope);
      buildHeroExplode(tl, scope);
      buildFoldBack(tl, scope);
      return { controller: tl, cleanup: () => tl.kill() };
    },
    // Reduced motion: the finished, assembled, fully-annotated email (the
    // flat view, not exploded) — same settled state as the card's reduced
    // branch, plus every callout drawn and shown rather than mid-trace.
    reduced: (scope) => applySettledState(scope),
  });

  return (
    <div ref={scopeRef} className="relative">
      <EmailAssemblySvg size="hero" />
      <PauseButton paused={paused} onClick={toggle} label="animation" size="md" className="absolute right-3 bottom-3 z-10" />
    </div>
  );
}
