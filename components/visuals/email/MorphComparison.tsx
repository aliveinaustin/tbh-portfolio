// components/visuals/email/MorphComparison.tsx
//
// Dev-only (/lab) comparison: the envelope→frame shape change EmailAssemblyCard
// and the modular-email hero both drive via GSAP's MorphSVGPlugin, side by
// side with a cheaper native-<rect>-attribute version that targets the same
// geometry without any path interpolation. Firefox testing showed the
// MorphSVG version costing hundreds of ms per frame once actively ticking
// (confirmed via isolated frame-timing measurements) — this exists purely to
// compare the two visually and let a real perf test target each in
// isolation, without touching the production card or hero.
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE } from "@/lib/motion/tokens";
import { LAYOUT } from "@/components/visuals/email/layout";
import { envelopePath, framePath, envelopeRect } from "@/components/visuals/email/primitives";

const FRAME = LAYOUT.frame;
const ENVELOPE = envelopeRect(FRAME);
const VIEWBOX = `0 0 ${FRAME.x * 2 + FRAME.width} ${FRAME.y * 2 + FRAME.height}`;

function MorphVersion() {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("d", envelopePath(FRAME));
    const tl = gsap.timeline({ repeat: -1 });
    tl.to({}, { duration: 1 })
      .to(el, { morphSVG: framePath(FRAME), duration: 1.6, ease: EASE.enter })
      .to({}, { duration: 1 })
      .to(el, { morphSVG: envelopePath(FRAME), duration: 0.6, ease: EASE.exit });
    return () => {
      tl.kill();
    };
  }, []);
  return (
    <svg viewBox={VIEWBOX} className="h-auto w-full max-w-55">
      <path ref={ref} fill="none" stroke="var(--color-brand)" strokeWidth={2} />
    </svg>
  );
}

function RectVersion() {
  const ref = useRef<SVGRectElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(el, { attr: { x: ENVELOPE.x, y: ENVELOPE.y, width: ENVELOPE.width, height: ENVELOPE.height, rx: 10 } })
      .to({}, { duration: 1 })
      .to(el, { attr: { x: FRAME.x, y: FRAME.y, width: FRAME.width, height: FRAME.height, rx: 10 }, duration: 1.6, ease: EASE.enter })
      .to({}, { duration: 1 })
      .to(el, { attr: { x: ENVELOPE.x, y: ENVELOPE.y, width: ENVELOPE.width, height: ENVELOPE.height, rx: 10 }, duration: 0.6, ease: EASE.exit });
    return () => {
      tl.kill();
    };
  }, []);
  return (
    <svg viewBox={VIEWBOX} className="h-auto w-full max-w-55">
      <rect ref={ref} fill="none" stroke="var(--color-brand)" strokeWidth={2} />
    </svg>
  );
}

export default function MorphComparison() {
  return (
    <div className="flex flex-wrap gap-8">
      <div className="flex flex-col items-center gap-2">
        <p className="text-code text-text-faint">A) morphSVG (current)</p>
        <MorphVersion />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-code text-text-faint">B) native rect attr tween</p>
        <RectVersion />
      </div>
    </div>
  );
}
