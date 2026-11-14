// lib/motion/carouselFocus.ts
//
// Lets a looping visual know whether its carousel slide is the focused one
// — e.g. WorkCarousel's "next" control can leave two slides simultaneously
// ≥60% visible (the IntersectionObserver gate useLoopingTimeline already
// applies), and without this both would keep animating side by side.
// Defaults to true so any visual rendered outside a carousel (case study
// detail pages, etc.) is unaffected.
"use client";

import { createContext, useContext } from "react";

export const CarouselFocusContext = createContext(true);

export function useCarouselFocus() {
  return useContext(CarouselFocusContext);
}
