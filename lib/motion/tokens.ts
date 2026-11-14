// lib/motion/tokens.ts
// Shared motion vocabulary — every section's scroll animation should pull
// from these instead of picking its own numbers, so the site moves at one tempo.

export const EASE = {
  enter: "power3.out",
  exit: "power2.in",
} as const;

export const DURATION = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
} as const;

export const DISTANCE = {
  rise: 32, // px — default vertical entrance offset
  slide: 64, // px — default horizontal entrance offset
} as const;

export const STAGGER = {
  content: 0.15, // seconds a section's content lags behind its heading
} as const;

/** Reads a CSS custom property's resolved value (e.g. "brand" → the
 * current theme's --brand) — for GSAP color tweens, which animate actual
 * color values, not Tailwind classes. Same lookup FailureTrace already did
 * inline; shared here now that more visuals need it. */
export function colorVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}
