// lib/motion/gsap.ts
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Webfonts swapping in after a trigger measures its position can leave
  // ScrollTrigger holding stale coordinates — most visible when a section is
  // already near the fold on load, before the fonts (and layout) settle.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger };
