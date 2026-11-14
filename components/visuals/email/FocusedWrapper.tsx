// components/visuals/email/FocusedWrapper.tsx
//
// Dev-only (/lab) helper: CarouselFocusContext is client-only, and
// app/lab/page.tsx is a Server Component, so its Provider can't be used
// there directly — this just wraps children in it.
"use client";

import type { ReactNode } from "react";
import { CarouselFocusContext } from "@/lib/motion/carouselFocus";

export default function FocusedWrapper({ children }: { children: ReactNode }) {
  return <CarouselFocusContext.Provider value={true}>{children}</CarouselFocusContext.Provider>;
}
