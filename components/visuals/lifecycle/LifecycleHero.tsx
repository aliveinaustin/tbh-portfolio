// components/visuals/lifecycle/LifecycleHero.tsx
"use client";

import { gsap } from "@/lib/motion/gsap";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";
import LifecycleHeroSvg from "@/components/visuals/lifecycle/LifecycleHeroSvg";
import { buildHeroLoop, buildMasterKeyPulse, buildSalesforceLeds, applyHeroReducedState } from "@/components/visuals/lifecycle/buildHeroLoop";

/**
 * The detail-page hero for the Lifecycle & Personalization System study:
 * the whole convergence system — three pathways, their source tables, the
 * merged master record, Salesforce and Journeys + email — fully labelled
 * from the first frame. No beats: blue packets flow continuously along
 * every connector, and every ~3s one pathway traces end to end in red,
 * cycling Website → Application → Legacy. See buildHeroLoop.ts.
 *
 * Three independent timelines, not one — the master key-column pulse and
 * the Salesforce LED cascade both repeat forever on their own (shorter)
 * periods, and GSAP can't nest an infinite-repeat child inside the
 * pathway-trace loop's own repeat:-1 without making ITS duration infinite
 * too (which would stop it from ever wrapping back to Website). All three
 * still play/pause/restart together as one controller.
 */
export default function LifecycleHero() {
  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      const loopTl = gsap.timeline({ repeat: -1 });
      buildHeroLoop(loopTl, scope);

      const keyPulseTl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
      buildMasterKeyPulse(keyPulseTl, scope);

      const ledTl = gsap.timeline({ repeat: -1 });
      buildSalesforceLeds(ledTl, scope);

      const timelines = [loopTl, keyPulseTl, ledTl];
      return {
        controller: {
          play: () => timelines.forEach((t) => t.play()),
          pause: () => timelines.forEach((t) => t.pause()),
          restart: () => timelines.forEach((t) => t.restart()),
        },
        cleanup: () => timelines.forEach((t) => t.kill()),
      };
    },
    reduced: (scope) => applyHeroReducedState(scope),
  });

  // No fixed aspect ratio — the desktop and mobile `<svg>` trees have
  // genuinely different shapes (a wide 4-column map vs. a tall flowing
  // column), so each sizes the panel from its own viewBox via `h-auto
  // w-full` rather than forcing one ratio that would clip the other.
  return (
    <div ref={scopeRef} className="relative w-full rounded-2xl border border-border bg-surface p-6">
      <LifecycleHeroSvg />
      <PauseButton paused={paused} onClick={toggle} label="animation" size="md" className="absolute right-3 bottom-3 z-10" />
    </div>
  );
}
