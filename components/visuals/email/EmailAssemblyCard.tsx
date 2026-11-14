// components/visuals/email/EmailAssemblyCard.tsx
"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/motion/gsap";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";
import EmailAssemblySvg from "@/components/visuals/email/EmailAssemblySvg";
import { buildAssemblyBeats, buildFoldBack, applySettledState, BEAT_LABELS } from "@/components/visuals/email/buildAssemblyBeats";

const STEP_LABELS = ["Template", "Rows", "Modules", "Config", "Tested"];

/**
 * The carousel-card visual for the modular-email study: an email assembles
 * itself from an envelope into a tested, branded, dark-mode-ready
 * component system, on a ~10s loop — Template → Rows → Modules → Config →
 * Tested, matching the five layers the decisions below it describe.
 */
export default function EmailAssemblyCard() {
  const [activeBeat, setActiveBeat] = useState(0);
  const activeBeatRef = useRef(0);

  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      const tl = gsap.timeline({ repeat: -1 });
      buildAssemblyBeats(tl, scope);
      buildFoldBack(tl, scope);

      tl.eventCallback("onUpdate", () => {
        const label = tl.currentLabel();
        const i = BEAT_LABELS.indexOf(label as (typeof BEAT_LABELS)[number]);
        if (i !== -1 && i !== activeBeatRef.current) {
          activeBeatRef.current = i;
          setActiveBeat(i);
        }
      });

      // buildFoldBack's own tweens are relative (e.g. "y: -=6"), but
      // buildAssemblyBeats' very first label ("template") explicitly
      // .set()s every element back to its starting opacity/stroke/fill —
      // effectively the same role resetConvergence plays for lifecycle,
      // just baked into the timeline itself instead of a separate
      // function — so tl.restart() lands on a clean beat 1, not whatever
      // reduced()'s settled frame last painted.
      return { controller: { play: () => tl.play(), pause: () => tl.pause(), restart: () => tl.restart() }, cleanup: () => tl.kill() };
    },
    // Reduced motion: the finished, assembled email — state after beat 4,
    // brand A — with every step label shown as complete. Also reused when
    // a carousel slide defocuses (see useLoopingTimeline) — activeBeatRef
    // has to move with it, not just the React state: onUpdate's own guard
    // compares against the ref, and a restart-on-refocus landing back on
    // whatever index the ref was last left at (e.g. 0, "Template," from
    // however the PREVIOUS cycle happened to end) would silently skip
    // that first update, visibly jumping straight to the next beat
    // instead of ever showing Template at all.
    reduced: (scope) => {
      applySettledState(scope);
      activeBeatRef.current = BEAT_LABELS.length - 1;
      setActiveBeat(BEAT_LABELS.length - 1);
    },
  });

  return (
    <div ref={scopeRef} className="relative flex h-full flex-row items-center justify-center gap-3 p-4 sm:flex-col sm:gap-6 sm:p-8">
      {/* Below sm this sits beside the illustration in normal flow — a
          flex sibling, not an absolute overlay guessing at an offset — so
          it properly respects the card's own padding and the pair centers
          as one unit instead of the SVG centering on its own and the
          labels floating independently over it. */}
      <ol aria-hidden="true" className="flex shrink-0 flex-col items-start gap-1 sm:hidden">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex flex-col items-start gap-1">
            {i > 0 && <span className="ml-1 h-2 border-l-2 border-dotted border-text-faint" />}
            <span className={cn("text-label transition-colors", i === activeBeat ? "text-brand" : "text-text-faint")}>{label}</span>
          </li>
        ))}
      </ol>

      <div className="min-w-0 flex-1 sm:w-full sm:flex-none">
        <EmailAssemblySvg size="card" />
      </div>

      <ol aria-hidden="true" className="hidden items-center gap-2 sm:flex">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <span className="w-4 border-t border-dotted border-text-faint" />}
            <span className={cn("text-label transition-colors", i === activeBeat ? "text-text" : "text-text-faint")}>{label}</span>
          </li>
        ))}
      </ol>

      <PauseButton paused={paused} onClick={toggle} label="animation" size="md" className="absolute right-3 bottom-3 z-10" />
    </div>
  );
}
