// components/visuals/lifecycle/LifecycleConvergenceCard.tsx
"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/motion/gsap";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";
import LifecycleConvergenceSvg from "@/components/visuals/lifecycle/LifecycleConvergenceSvg";
import { buildConvergenceBeats, resetConvergence, applyConvergenceSettledState, BEAT_LABELS } from "@/components/visuals/lifecycle/buildConvergenceBeats";

const STEP_LABELS = ["Sources", "Tables", "Master", "Sync", "Personalize"];

/**
 * The carousel-card visual for the Lifecycle & Personalization System
 * study: three subscriber pathways converge into one master record, sync
 * to Salesforce, then personalize an email — Sources → Tables → Master →
 * Sync → Personalize, on an ~11s loop.
 */
export default function LifecycleConvergenceCard() {
  const [activeBeat, setActiveBeat] = useState(0);
  const activeBeatRef = useRef(0);

  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      resetConvergence(scope);

      const tl = gsap.timeline({ repeat: -1, onRepeat: () => resetConvergence(scope) });
      buildConvergenceBeats(tl, scope);

      tl.eventCallback("onUpdate", () => {
        const label = tl.currentLabel();
        // "clear" isn't itself tracked in BEAT_LABELS, so without this it
        // falls through to -1 and the indicator (and mobile's step name)
        // stays stuck on "Personalize" for the whole fade-back-in — right
        // as sources/labels/ghost-tables are visually returning for the
        // next loop. Treating it as "Sources" matches what's actually on
        // screen at that point.
        const i = label === "clear" ? 0 : BEAT_LABELS.indexOf(label as (typeof BEAT_LABELS)[number]);
        if (i !== -1 && i !== activeBeatRef.current) {
          activeBeatRef.current = i;
          setActiveBeat(i);
        }
      });

      return {
        // Not the raw timeline — a defocused carousel slide's refocus
        // restarts from the top (see useLoopingTimeline), and GSAP's own
        // tl.restart() alone would skip the same resetConvergence() pass
        // onRepeat gets on a natural loop wrap, leaving behind whatever
        // mid-beat state the slide was defocused during.
        controller: {
          play: () => tl.play(),
          pause: () => tl.pause(),
          restart: () => {
            resetConvergence(scope);
            tl.restart();
          },
        },
        cleanup: () => tl.kill(),
      };
    },
    // Reduced motion: beat 3's moment — tables shrunk, PREF chips
    // mid-flight, the Subscriber Key already merged. Also reused when a
    // carousel slide defocuses (see useLoopingTimeline) — activeBeatRef
    // has to move with it, not just the React state: onUpdate's own guard
    // compares against the ref, and a restart-on-refocus landing back on
    // "sources" (i=0) would silently skip that first update whenever the
    // ref was already sitting at 0 from however the previous cycle ended,
    // visibly jumping straight to Tables instead of ever showing Sources.
    reduced: (scope) => {
      applyConvergenceSettledState(scope);
      activeBeatRef.current = 2;
      setActiveBeat(2);
    },
  });

  return (
    <div ref={scopeRef} className="relative flex h-full flex-col items-center justify-center gap-3 p-4 sm:gap-6 sm:p-8">
      <div className="w-full">
        <LifecycleConvergenceSvg />
      </div>

      {/* Mobile: a compact indicator (five ticks, the current one longer
          and red, plus its name) replaces the vertical label column —
          that column was most of what made the old layout too tall to
          fit the card's aspect-video panel. */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 sm:hidden" aria-hidden="true">
        <div className="flex items-center gap-1">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={cn("h-1 rounded-full transition-all", i === activeBeat ? "w-6 bg-brand" : "w-3 bg-text-faint/50")} />
          ))}
        </div>
        <span className="text-label text-brand">
          {STEP_LABELS[activeBeat]} · {activeBeat + 1}/{STEP_LABELS.length}
        </span>
      </div>

      <ol aria-hidden="true" className="hidden items-center gap-2 sm:flex">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <span className="w-4 border-t border-dotted border-text-faint" />}
            <span className={cn("text-label transition-colors", i === activeBeat ? "text-text" : "text-text-faint")}>{label}</span>
          </li>
        ))}
      </ol>

      {/* Bottom-right on mobile (32px, alongside the step indicator),
          top-right on desktop (36px, as it's always been) — overriding
          the box size via className rather than the "sm"/"md" size prop
          so the icon itself (set by the prop, not responsively sized)
          doesn't end up mismatched with the box at either breakpoint. */}
      <PauseButton
        paused={paused}
        onClick={toggle}
        label="animation"
        size="md"
        className="absolute right-3 bottom-3 z-10 size-8 sm:top-3 sm:right-3 sm:bottom-auto sm:size-9"
      />
    </div>
  );
}
