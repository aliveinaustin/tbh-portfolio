// lib/motion/useScrollReveal.ts
"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "@/lib/motion/gsap";
import { DISTANCE, DURATION, EASE } from "@/lib/motion/tokens";

type ScrollRevealOptions = {
  /** Animated-from values. Defaults to a fade + rise. */
  from?: gsap.TweenVars;
  duration?: number;
  ease?: string;
  /** ScrollTrigger start position. */
  start?: string;
  /** Replay every time the element re-enters, instead of once. */
  repeat?: boolean;
  /** Seconds to hold before animating — use the STAGGER tokens to lag behind a sibling. */
  delay?: number;
};

/**
 * Reveals an element on scroll using the shared motion tokens, so every
 * section's entrance shares one timing vocabulary instead of inventing its own.
 * Respects prefers-reduced-motion: the element is left in its resting state
 * (no animation, no scroll-triggered opacity change) when the user has it set.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const {
    from,
    duration = DURATION.base,
    ease = EASE.enter,
    start = "top 80%",
    repeat = false,
    delay = 0,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(el, {
          opacity: 0,
          y: DISTANCE.rise,
          ...from,
          duration,
          ease,
          delay,
          scrollTrigger: {
            trigger: el,
            start,
            once: !repeat,
          },
        });
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
