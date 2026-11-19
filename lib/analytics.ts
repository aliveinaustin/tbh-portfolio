// lib/analytics.ts
// Not secret — the website ID ships in every page's HTML regardless, and CI
// has no Doppler to source it from, so hardcoding is simpler than wiring an
// env var in for no real benefit.

export const UMAMI_WEBSITE_ID = "545a09bc-ff9f-4fcd-9452-69252d1147bb";
export const UMAMI_SRC = "https://stats.thomasbrandonhays.com/s.js";

// The full set of tracked events — keeping this as a union (not a bare
// string) means a typo at a call site is a compile error, not a silently
// missing event in Umami's dashboard.
export type AnalyticsEvent = "resume-download" | "outbound-linkedin" | "outbound-github" | "contact-submit";

declare global {
  interface Window {
    umami?: {
      track: (event: string) => void;
    };
  }
}

export function trackEvent(name: AnalyticsEvent) {
  window.umami?.track(name);
}
