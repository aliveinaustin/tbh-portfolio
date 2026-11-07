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
