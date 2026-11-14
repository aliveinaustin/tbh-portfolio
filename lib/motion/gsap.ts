// lib/motion/gsap.ts
"use client";

import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

// ScrollTrigger was removed from this registration — it was previously used
// by HeroIntro's watermark rotation and Section.tsx's scroll-entrance
// reveals, but its own MutationObserver-based auto-refresh (which
// re-measures every active trigger's position on any DOM change that might
// affect layout) was found, via Firefox memory profiling, to retrigger
// repeatedly against this page's continuously-animating hero watermark and
// carousel cards — several still-armed `once: true` instances compounding
// into severe memory growth even with no scrolling happening. Both call
// sites now use plain IntersectionObserver / manual scroll-position
// tracking instead, which is what every other looping visual in this
// codebase already used for its own visibility gating.
if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin);
}

export { gsap };
