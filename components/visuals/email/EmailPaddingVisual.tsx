// components/visuals/email/EmailPaddingVisual.tsx
"use client";

import { gsap } from "@/lib/motion/gsap";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";

type FrameId = "desktop" | "mobile";
type FrameDef = { frame: { x: number; y: number; width: number; height: number }; padding: number; value: string };

// Padding drawn at 0.4x scale (40px/20px → 16/8 SVG units) — the same 2:1
// ratio the real template rule uses, not two arbitrary insets.
const FRAMES: Record<FrameId, FrameDef> = {
  desktop: { frame: { x: 14, y: 16, width: 176, height: 150 }, padding: 16, value: "40" },
  mobile: { frame: { x: 272, y: 16, width: 92, height: 150 }, padding: 8, value: "20" },
};

const TOP_INSET = 18;
const BOX_GAP = 10;
const DIM_GAP = 10; // frame bottom → the dimension-line row below it
const TICK_HALF = 4;

function contentBoxes({ frame, padding }: FrameDef) {
  const contentX = frame.x + padding;
  const contentWidth = frame.width - padding * 2;
  const boxHeight = (frame.height - TOP_INSET * 2 - BOX_GAP) / 2;
  return [
    { x: contentX, y: frame.y + TOP_INSET, width: contentWidth, height: boxHeight },
    { x: contentX, y: frame.y + TOP_INSET + boxHeight + BOX_GAP, width: contentWidth, height: boxHeight },
  ];
}

function dimY({ frame }: FrameDef) {
  return frame.y + frame.height + DIM_GAP;
}

/** One dimension measurement — a bar with a T-tick at each end, drawn at
 * its final x1/x2/y1/y2 for the no-JS/first-paint frame; resetFrame()
 * collapses it (zero-height ticks, bar and ticks pinched to the span's
 * own midpoint) on mount and at the top of every loop. */
function DimensionMarker({ side, x1, x2, y, label }: { side: "left" | "right"; x1: number; x2: number; y: number; label: string }) {
  return (
    <g data-dim={side}>
      <line data-dim-bar x1={x1} y1={y} x2={x2} y2={y} stroke="var(--color-brand)" strokeWidth={1.25} />
      <line data-dim-tick-start x1={x1} y1={y - TICK_HALF} x2={x1} y2={y + TICK_HALF} stroke="var(--color-brand)" strokeWidth={1.25} />
      <line data-dim-tick-end x1={x2} y1={y - TICK_HALF} x2={x2} y2={y + TICK_HALF} stroke="var(--color-brand)" strokeWidth={1.25} />
      <text data-dim-label x={(x1 + x2) / 2} y={y + 16} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-brand)">
        {label}
      </text>
    </g>
  );
}

function Frame({ id }: { id: FrameId }) {
  const def = FRAMES[id];
  const { frame, padding, value } = def;
  const contentX = frame.x + padding;
  const contentRight = frame.x + frame.width - padding;
  const y = dimY(def);

  return (
    <g data-frame={id}>
      <rect x={frame.x} y={frame.y} width={frame.width} height={frame.height} rx={6} fill="var(--color-surface)" stroke="var(--color-text-faint)" strokeWidth={1} />

      {contentBoxes(def).map((box, i) => (
        <rect key={i} data-content-box x={box.x} y={box.y} width={box.width} height={box.height} rx={3} fill="var(--color-surface-high)" stroke="var(--color-text-faint)" strokeWidth={1} />
      ))}

      {/* The padding boundary itself — full frame height, drawn before the
          dimension measurements appear below. */}
      <line data-guide x1={contentX} y1={frame.y} x2={contentX} y2={frame.y + frame.height} stroke="var(--color-brand)" strokeWidth={0.75} strokeDasharray="1.5 4" />
      <line data-guide x1={contentRight} y1={frame.y} x2={contentRight} y2={frame.y + frame.height} stroke="var(--color-brand)" strokeWidth={0.75} strokeDasharray="1.5 4" />

      <DimensionMarker side="left" x1={frame.x} x2={contentX} y={y} label={value} />
      <DimensionMarker side="right" x1={contentRight} x2={frame.x + frame.width} y={y} label={value} />

      <text x={frame.x + frame.width / 2} y={y + 26} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={1}>
        {id.toUpperCase()}
      </text>
    </g>
  );
}

/** Reads one frame's two dimension groups back out of the DOM, keyed by
 * side, so the timeline builder can target each bar/tick/label directly
 * without re-deriving the geometry a second time. */
function getDims(root: ParentNode) {
  const read = (side: "left" | "right") => {
    const g = root.querySelector<SVGGElement>(`[data-dim="${side}"]`);
    return {
      bar: g?.querySelector<SVGLineElement>("[data-dim-bar]") ?? null,
      tickStart: g?.querySelector<SVGLineElement>("[data-dim-tick-start]") ?? null,
      tickEnd: g?.querySelector<SVGLineElement>("[data-dim-tick-end]") ?? null,
      label: g?.querySelector<SVGTextElement>("[data-dim-label]") ?? null,
    };
  };
  return { left: read("left"), right: read("right") };
}

function dimTargets(def: FrameDef) {
  const { frame, padding } = def;
  return {
    left: { x1: frame.x, x2: frame.x + padding },
    right: { x1: frame.x + frame.width - padding, x2: frame.x + frame.width },
  };
}

/**
 * Hard, imperative reset for one frame — plain gsap.set() calls, not part
 * of the recorded timeline. Called once before the timeline is built and
 * again on every repeat (onRepeat), so the "what do these elements look
 * like between loops" question never depends on how GSAP happens to
 * interpolate a tween whose start hasn't been reached yet in the new
 * cycle — that ambiguity was the source of a stray flash at the loop seam.
 */
function resetFrame(scope: ParentNode, id: FrameId) {
  const def = FRAMES[id];
  const root = scope.querySelector(`[data-frame="${id}"]`);
  if (!root) return;

  const boxes = gsap.utils.toArray<SVGRectElement>("[data-content-box]", root);
  const guides = gsap.utils.toArray<SVGLineElement>("[data-guide]", root);
  const dims = getDims(root);
  const targets = dimTargets(def);
  const y = dimY(def);

  gsap.set(boxes, { opacity: 0, y: -4 });
  // Collapsed to zero length at the top, not via drawSVG — DrawSVGPlugin
  // rewrites stroke-dasharray to do its own reveal, which clobbers the
  // dotted pattern these lines are drawn with. Animating the real y2
  // attribute instead never touches stroke-dasharray at all.
  gsap.set(guides, { opacity: 1, attr: { y2: def.frame.y } });

  (["left", "right"] as const).forEach((side) => {
    const dim = dims[side];
    if (!dim.bar || !dim.tickStart || !dim.tickEnd || !dim.label) return;
    const mid = (targets[side].x1 + targets[side].x2) / 2;
    gsap.set([dim.bar, dim.tickStart, dim.tickEnd], { opacity: 1, attr: { x1: mid, x2: mid } });
    // Ticks start pinched to zero height — the mark itself grows in,
    // rather than appearing at full height the instant the reveal starts.
    gsap.set([dim.tickStart, dim.tickEnd], { attr: { y1: y, y2: y } });
    gsap.set(dim.label, { opacity: 0 });
  });
}

/**
 * Appends one frame's reveal sequence — content boxes rise in, the two
 * padding guides draw top to bottom, then each dimension tick grows from
 * zero height in place before both dimension measurements expand out from
 * their shared midpoint to full width, their numbers fading in once they
 * land — at `position` on the shared timeline, so desktop and mobile can
 * overlap instead of repeating the same motion in lockstep. Assumes
 * resetFrame() has already put everything in its starting state.
 */
function revealFrame(tl: gsap.core.Timeline, scope: ParentNode, id: FrameId, position: string | number) {
  const def = FRAMES[id];
  const root = scope.querySelector(`[data-frame="${id}"]`);
  if (!root) return;

  const boxes = gsap.utils.toArray<SVGRectElement>("[data-content-box]", root);
  const guides = gsap.utils.toArray<SVGLineElement>("[data-guide]", root);
  const dims = getDims(root);
  const targets = dimTargets(def);
  const y = dimY(def);
  if (boxes.length === 0 || guides.length === 0 || !dims.left.bar || !dims.right.bar) return;

  const label = `${id}Start`;
  tl.addLabel(label, position)
    .to(boxes, { opacity: 1, y: 0, duration: 0.3, stagger: 0.15, ease: "power2.out" }, `${label}+=0.1`)
    .to(guides, { attr: { y2: def.frame.y + def.frame.height }, duration: 0.4, ease: "none" }, `${label}+=0.6`);

  (["left", "right"] as const).forEach((side) => {
    const dim = dims[side];
    const { x1, x2 } = targets[side];
    if (!dim.bar || !dim.tickStart || !dim.tickEnd || !dim.label) return;
    // The tick marks grow from zero height, in place at the collapsed
    // midpoint, before the bar and both ticks travel outward to full width.
    tl.to([dim.tickStart, dim.tickEnd], { attr: { y1: y - TICK_HALF, y2: y + TICK_HALF }, duration: 0.25, ease: "power2.out" }, `${label}+=1`)
      .to(dim.bar, { attr: { x1, x2 }, duration: 0.4, ease: "power2.out" }, `${label}+=1.3`)
      .to(dim.tickStart, { attr: { x1, x2: x1 }, duration: 0.4, ease: "power2.out" }, "<")
      .to(dim.tickEnd, { attr: { x1: x2, x2 }, duration: 0.4, ease: "power2.out" }, "<")
      .to(dim.label, { opacity: 1, duration: 0.25 }, ">-0.1");
  });
}

/**
 * Illustrates "one horizontal padding model: 40px desktop, 20px mobile" —
 * desktop assembles first; mobile picks up a short beat later, while
 * desktop is still mid-sequence, so the two never repeat the same motion
 * in lockstep.
 */
export default function EmailPaddingVisual() {
  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      resetFrame(scope, "desktop");
      resetFrame(scope, "mobile");

      const timeline = gsap.timeline({
        repeat: -1,
        onRepeat: () => {
          resetFrame(scope, "desktop");
          resetFrame(scope, "mobile");
        },
      });
      revealFrame(timeline, scope, "desktop", 0.4);
      revealFrame(timeline, scope, "mobile", "desktopStart+=0.7");

      const allBoxes = gsap.utils.toArray<SVGRectElement>("[data-content-box]", scope);
      const allGuides = gsap.utils.toArray<SVGLineElement>("[data-guide]", scope);
      const allDimParts = gsap.utils.toArray<SVGLineElement | SVGTextElement>(
        "[data-dim-bar], [data-dim-tick-start], [data-dim-tick-end], [data-dim-label]",
        scope
      );

      timeline
        .to({}, { duration: 1.6 })
        .to([...allBoxes, ...allDimParts], { opacity: 0, duration: 0.4 })
        .to(allGuides, { opacity: 0, duration: 0.3 }, "<");

      return { controller: timeline, cleanup: () => timeline.kill() };
    },
    reduced: (scope) => {
      (["desktop", "mobile"] as const).forEach((id) => {
        const def = FRAMES[id];
        const root = scope.querySelector(`[data-frame="${id}"]`);
        if (!root) return;
        const boxes = gsap.utils.toArray<SVGRectElement>("[data-content-box]", root);
        const guides = gsap.utils.toArray<SVGLineElement>("[data-guide]", root);
        const dims = getDims(root);
        const targets = dimTargets(def);
        gsap.set(boxes, { opacity: 1, y: 0 });
        gsap.set(guides, { opacity: 1, attr: { y2: def.frame.y + def.frame.height } });
        (["left", "right"] as const).forEach((side) => {
          const dim = dims[side];
          if (!dim.bar || !dim.tickStart || !dim.tickEnd || !dim.label) return;
          const { x1, x2 } = targets[side];
          const y = dimY(def);
          gsap.set(dim.bar, { attr: { x1, x2 } });
          gsap.set(dim.tickStart, { attr: { x1, x2: x1, y1: y - TICK_HALF, y2: y + TICK_HALF } });
          gsap.set(dim.tickEnd, { attr: { x1: x2, x2, y1: y - TICK_HALF, y2: y + TICK_HALF } });
          gsap.set(dim.label, { opacity: 1 });
        });
      });
    },
  });

  return (
    <div ref={scopeRef} className="relative flex w-full flex-col items-center gap-4 p-6">
      <svg viewBox="0 0 380 216" className="h-auto w-full max-w-sm" aria-hidden="true">
        <Frame id="desktop" />
        <Frame id="mobile" />
        {/* Decorative, static — desktop's padding rule carries over to mobile. */}
        <g stroke="var(--color-text-faint)" strokeWidth={1} opacity={0.6}>
          <line x1={198} y1={91} x2={258} y2={91} strokeDasharray="3 3" />
          <path d="M252,85 L260,91 L252,97" fill="none" />
        </g>
      </svg>
      <PauseButton paused={paused} onClick={toggle} label="animation" className="absolute right-3 bottom-3" />
    </div>
  );
}
