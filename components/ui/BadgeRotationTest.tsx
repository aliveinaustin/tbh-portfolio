// components/ui/BadgeRotationTest.tsx
//
// Dev-only (/lab) isolation test: the real TbhBadge SVG plus ONLY the
// rotation mechanism from HeroIntro.tsx's startWatermarkRotation() — none
// of HeroIntro's other machinery (sessionStorage, the intro timeline, the
// clip-path scroll listener). See HeroIntro.tsx's own comments on
// startWatermarkRotation for the full story: a CSS-animation version of the
// ambient spin measured clean on CPU but drove Firefox's GPU memory into
// the gigabytes within seconds at rest, and a ScrollTrigger-based version
// of the scroll-linked rotation caused severe memory growth on the full
// homepage (not reproducible here, in isolation) — likely from
// ScrollTrigger's MutationObserver-based auto-refresh retriggering across
// every ScrollTrigger instance on the page in response to the carousel
// card's own continuous SVG mutations. This mirrors the final version:
// plain gsap.set() (not CSS) for rotation, plain scroll-position tracking
// (not ScrollTrigger) for the scroll-linked portion.
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/motion/gsap";

const WATERMARK_IDLE_SPIN_SECONDS = 180;
const WATERMARK_SCROLL_ROTATION_DEG = 360;
const WATERMARK_SCROLL_EASE = 0.06;

// Takes the badge as a prop (not an import) — TbhBadge is server-only
// (reads the SVG file via fs), same reason Hero.tsx passes it into
// HeroIntro this way rather than HeroIntro importing it directly.
export default function BadgeRotationTest({ badge }: { badge: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const q = gsap.utils.selector(overlay);
    const badgeCenter = "663.198 663.252";
    const ccwGroup = [
      ...q("#outer-ring-assembly"),
      ...q("#middle-ring-assembly"),
      ...q("#outer-ring-text"),
      ...q("#outer-arc-segments"),
    ];
    const cwGroup = q("#aperture-segments");
    gsap.set([...ccwGroup, ...cwGroup], { svgOrigin: badgeCenter });

    const rotationState = { idle: 0, scroll: 0 };

    const idleTween = gsap.to(rotationState, {
      idle: "-=360",
      duration: WATERMARK_IDLE_SPIN_SECONDS,
      repeat: -1,
      ease: "none",
    });

    let scrollTarget = 0;
    const computeScrollTarget = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      scrollTarget = -progress * WATERMARK_SCROLL_ROTATION_DEG;
    };
    computeScrollTarget();

    let scrollRafId: number | null = null;
    const onScrollForRotation = () => {
      if (scrollRafId !== null) return;
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        computeScrollTarget();
      });
    };
    window.addEventListener("scroll", onScrollForRotation, { passive: true });
    window.addEventListener("resize", computeScrollTarget, { passive: true });

    const THROTTLE_MS = 24;
    let lastUpdate = 0;
    const applyRotation = () => {
      const now = performance.now();
      if (now - lastUpdate < THROTTLE_MS) return;
      lastUpdate = now;
      rotationState.scroll += (scrollTarget - rotationState.scroll) * WATERMARK_SCROLL_EASE;
      const rotation = rotationState.idle + rotationState.scroll;
      gsap.set(ccwGroup, { rotate: rotation });
      gsap.set(cwGroup, { rotate: -rotation });
    };
    gsap.ticker.add(applyRotation);

    return () => {
      gsap.ticker.remove(applyRotation);
      window.removeEventListener("scroll", onScrollForRotation);
      window.removeEventListener("resize", computeScrollTarget);
      if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
      idleTween.kill();
    };
  }, []);

  return (
    <div ref={overlayRef} className="h-64 w-64">
      {badge}
    </div>
  );
}
