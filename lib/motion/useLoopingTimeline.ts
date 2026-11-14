// lib/motion/useLoopingTimeline.ts
"use client";

import { useEffect, useRef, useState, type DependencyList } from "react";
import { gsap } from "@/lib/motion/gsap";
import { useCarouselFocus } from "@/lib/motion/carouselFocus";

export type LoopController = {
  play: () => void;
  pause: () => void;
  /** Optional — restarts the loop from its own beginning (a plain GSAP
   * timeline already has this natively). Used when a defocused carousel
   * slide regains focus: without it, resuming would silently snap back to
   * whatever stale mid-tween point the controller was paused at, undoing
   * the settled frame painted on defocus (see `reduced` below). Omit it
   * for a controller with no well-defined "start" (e.g. ScreenDeck's
   * ambient card-fan loop) — refocus then just resumes in place. */
  restart?: () => void;
};

type UseLoopingTimelineOptions = {
  /** Runs synchronously inside gsap.context(), before either matchMedia
   * branch below — for state that applies regardless of motion preference
   * (e.g. ScreenDeck's fanned resting positions: a reduced-motion visitor
   * still gets a still, fanned deck instead of a flat pile of identical
   * cards, just never an animated one). */
  setup?: (scope: HTMLElement) => void;
  /**
   * Builds the motion-safe animation inside gsap.context()'s own
   * "(prefers-reduced-motion: no-preference)" matchMedia branch. Return the
   * controller this hook should play/pause to gate the loop on visibility
   * and the visitor's own pause choice, plus an optional cleanup (e.g.
   * `timeline.kill()`) run on unmount or before the next rebuild.
   *
   * A plain GSAP timeline works as its own controller (it already has
   * `play`/`pause`); a self-rescheduling `gsap.delayedCall` loop (like
   * ScreenDeck's) instead wants `{ play: () => current.resume(), pause: ()
   * => current.pause() }` reading a closure variable reassigned on each
   * cycle, since the delayedCall itself gets replaced every iteration.
   */
  build: (scope: HTMLElement) => { controller: LoopController; cleanup?: () => void };
  /** Runs instead of `build`, under "(prefers-reduced-motion: reduce)" — set
   * the static, meaningful end state here. No controller: nothing to play.
   * Also reused when a carousel slide loses focus (see `useCarouselFocus`)
   * — painted right after pausing, so a defocused card settles on this same
   * meaningful frame instead of whatever arbitrary point it was mid-tween
   * through, masked by the slide's own opacity dim. */
  reduced?: (scope: HTMLElement) => void;
  /** Rebuilds the whole gsap.context when any of these change — mirrors a
   * normal effect dependency array (e.g. props the animation reads). */
  deps?: DependencyList;
  /** Fires synchronously with the new paused state whenever the visitor
   * toggles play/pause — for a parent that renders its own button
   * elsewhere and needs to know which icon to show. */
  onToggle?: (paused: boolean) => void;
};

/**
 * The rules every looping visual on this site follows: run only while at
 * least 60% visible (IntersectionObserver), respect a visitor's own pause
 * choice across both visibility changes and re-renders, and skip straight
 * to a meaningful static state under prefers-reduced-motion instead of
 * autoplaying. Extracted from ScreenDeck/FailureTrace, which both
 * implemented this same plumbing independently.
 */
export function useLoopingTimeline({ setup, build, reduced, deps = [], onToggle }: UseLoopingTimelineOptions) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const userPaused = useRef(false);
  const controller = useRef<LoopController | null>(null);
  const [paused, setPaused] = useState(false);

  // A carousel can leave two slides simultaneously ≥60% visible (e.g. mid
  // "next" click) — this is the focused one's own slide saying so, so its
  // unfocused neighbor pauses instead of animating alongside it. Read via
  // a ref (like visible/userPaused) since sync() runs from effects and the
  // pause-button handler, not just render.
  const focused = useCarouselFocus();
  const focusedRef = useRef(focused);

  // Reads refs at call time, not render time — safe to call from both the
  // effect (on visibility change) and the pause button's click handler.
  const sync = () => {
    if (!controller.current) return;
    if (visible.current && !userPaused.current && focusedRef.current) controller.current.play();
    else controller.current.pause();
  };

  useEffect(() => {
    const wasFocused = focusedRef.current;
    focusedRef.current = focused;
    const scope = scopeRef.current;

    if (wasFocused && !focused) {
      // Defocusing: pause first so nothing re-renders over the settled
      // frame on the next tick, then snap to it — a hard cut, but one
      // masked by the slide's own opacity-dim transition (see
      // WorkCarousel), so it reads as "faded to a calm resting frame"
      // rather than "froze mid-glitch."
      controller.current?.pause();
      if (scope && reduced) reduced(scope);
    } else if (!wasFocused && focused) {
      // Refocusing: a manual pause should stay paused (on the same
      // settled frame) rather than silently resuming just because the
      // slide came back into focus. Otherwise restart from the top — the
      // controller's own cached position is still the stale pre-defocus
      // point, and simply resuming would jump-cut back to it, undoing the
      // settled frame the instant it ticks.
      if (userPaused.current) {
        sync();
      } else if (controller.current?.restart) {
        controller.current.restart();
        // restart() always resumes playback on its own, regardless of
        // visibility — but focus can flip true slightly before the slide
        // actually crosses the IntersectionObserver's 60% threshold (e.g.
        // mid carousel scroll-snap). Without this, the timeline ticks
        // forward unseen in that gap and can visibly skip past the first
        // beat's hold by the time the slide is actually on screen. sync()
        // re-pauses it immediately if visible.current isn't true yet; the
        // IntersectionObserver's own callback then plays it for real once
        // visibility catches up, starting cleanly from the restarted 0.
        sync();
      } else {
        sync();
      }
    } else {
      sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const ctx = gsap.context(() => {
      setup?.(scope);

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const { controller: c, cleanup } = build(scope);
        controller.current = c;
        sync();
        return () => {
          controller.current = null;
          cleanup?.();
        };
      });

      if (reduced) {
        gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => reduced(scope));
      }
    }, scope);

    // Only animate when at least 60% visible — off screen entirely, or a
    // half-visible neighboring slide in a carousel, both pause it.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        sync();
      },
      { threshold: 0.6 }
    );
    io.observe(scope);

    return () => {
      io.disconnect();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const toggle = () => {
    userPaused.current = !userPaused.current;
    setPaused(userPaused.current);
    sync();
    onToggle?.(userPaused.current);
  };

  return { scopeRef, paused, toggle };
}
