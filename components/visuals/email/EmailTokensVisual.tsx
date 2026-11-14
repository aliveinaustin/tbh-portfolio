// components/visuals/email/EmailTokensVisual.tsx
"use client";

import { gsap } from "@/lib/motion/gsap";
import { colorVar } from "@/lib/motion/tokens";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";

type BrandId = "A" | "B" | "C";
const BRANDS: { id: BrandId; colorName: string }[] = [
  { id: "A", colorName: "brand" },
  { id: "B", colorName: "blue-light" },
  { id: "C", colorName: "text" },
];

const CARD = { width: 108, height: 130 };
const GAP = 26;
const START_X = 18;
const CHIP = { width: 76, height: 18 };
const CHIP_Y = 16;
const LINE_TOP = CHIP_Y + CHIP.height;
const FRAME_Y = 66;
const TOKEN_TRAVEL = FRAME_Y + 16 - CHIP_Y; // ends tucked behind the frame's top edge

function cardX(i: number) {
  return START_X + i * (CARD.width + GAP);
}

/** One card's geometry, in absolute viewBox coordinates. */
function cardLayout(i: number) {
  const x = cardX(i);
  const frame = { x, y: FRAME_Y, width: CARD.width, height: CARD.height };
  const hero = { x: x + 10, y: frame.y + 10, width: CARD.width - 20, height: 52 };
  const heroBarHeight = 8;
  const line1 = { x: hero.x, y: hero.y + hero.height + 12, width: hero.width * 0.8, height: 6 };
  const line2 = { x: hero.x, y: line1.y + 14, width: hero.width * 0.55, height: 6 };
  const buttonWidth = hero.width * 0.55;
  const button = { x: x + (CARD.width - buttonWidth) / 2, y: frame.y + frame.height - 24, width: buttonWidth, height: 14 };
  const chip = { x: x + (CARD.width - CHIP.width) / 2, y: CHIP_Y, width: CHIP.width, height: CHIP.height };
  return { frame, hero, heroBarHeight, line1, line2, button, chip };
}

/** Reads one card's elements back out of the DOM by id. */
function getCard(scope: ParentNode, id: BrandId) {
  const root = scope.querySelector(`[data-card="${id}"]`);
  return {
    root,
    chipGroup: root?.querySelector<SVGGElement>("[data-chip]") ?? null,
    chipBox: root?.querySelector<SVGRectElement>("[data-chip-box]") ?? null,
    chipLabel: root?.querySelector<SVGTextElement>("[data-chip-label]") ?? null,
    line: root?.querySelector<SVGLineElement>("[data-line]") ?? null,
    hero: root?.querySelector<SVGRectElement>("[data-hero]") ?? null,
    heroBar: root?.querySelector<SVGRectElement>("[data-hero-bar]") ?? null,
    button: root?.querySelector<SVGRectElement>("[data-button]") ?? null,
  };
}

/**
 * Hard, imperative reset for one card — plain gsap.set() calls, not part
 * of the recorded timeline, so the loop seam never depends on how GSAP
 * interpolates a tween whose start hasn't been reached yet in the new
 * cycle (see EmailPaddingVisual's buildFrameSequence for why). The shared
 * fade-out at the end of the timeline already brings every value to what's
 * set here, so in steady-state playback this reset is invisible — it only
 * actually does visible work on the very first mount.
 */
function resetCard(scope: ParentNode, id: BrandId) {
  const card = getCard(scope, id);
  if (!card.chipGroup || !card.chipBox || !card.chipLabel || !card.line || !card.hero || !card.heroBar || !card.button) return;

  const faint = colorVar("text-faint");
  gsap.set(card.chipGroup, { y: 0, opacity: 0 });
  gsap.set(card.chipBox, { stroke: faint });
  gsap.set(card.chipLabel, { fill: faint });
  gsap.set(card.line, { stroke: faint, opacity: 0, attr: { y1: LINE_TOP } });
  gsap.set(card.hero, { stroke: faint, drawSVG: "0%" });
  gsap.set(card.heroBar, { fill: faint });
  gsap.set(card.button, { fill: faint });
}

/**
 * Appends one card's reveal sequence at `position`: the token chip and its
 * dashed line fade in already colored, then the chip slides down — the
 * line's own top edge is driven by the exact same progress value as the
 * chip's travel, so it retracts in lockstep and can never outrun (or lag
 * behind) where the chip actually is — until it's tucked behind the frame.
 * The hero image then traces a border in that color, and once it lands,
 * the accent bar and button fill in too. Cards are staggered via
 * `position` so they never repeat the same motion in lockstep.
 */
function revealCard(tl: gsap.core.Timeline, scope: ParentNode, i: number, position: string | number) {
  const brand = BRANDS[i];
  const card = getCard(scope, brand.id);
  if (!card.chipGroup || !card.chipBox || !card.chipLabel || !card.line || !card.hero || !card.heroBar || !card.button) return;

  const color = colorVar(brand.colorName);
  const label = `${brand.id}Start`;
  const travel = { p: 0 };

  tl.addLabel(label, position)
    .set([card.chipBox, card.line], { stroke: color }, label)
    .set(card.chipLabel, { fill: color }, label)
    .to([card.chipGroup, card.line], { opacity: 1, duration: 0.3, ease: "power2.out" }, label)
    .to(
      travel,
      {
        p: 1,
        duration: 0.6,
        ease: "power1.in",
        onUpdate: () => {
          const d = TOKEN_TRAVEL * travel.p;
          gsap.set(card.chipGroup, { y: d });
          card.line?.setAttribute("y1", String(LINE_TOP + d));
        },
      },
      `${label}+=0.35`
    )
    .set(card.hero, { stroke: color }, `${label}+=0.95`)
    .to(card.hero, { drawSVG: "100%", duration: 0.4, ease: "none" }, `${label}+=0.95`)
    .to([card.heroBar, card.button], { fill: color, duration: 0.3 }, `${label}+=1.35`);
}

/**
 * Illustrates "drive brand styling from theme tokens" — three identical
 * modules, greyscale at rest. Each brand's token chip fades in, slides
 * down its own dashed line and tucks behind the card, and as it does the
 * hero image traces a colored border, then its accent bar and button fill
 * in — staggered so the three never move in lockstep, and the whole scene
 * fades back to grey before the loop restarts rather than snapping.
 */
export default function EmailTokensVisual() {
  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      BRANDS.forEach((b) => resetCard(scope, b.id));

      const timeline = gsap.timeline({
        repeat: -1,
        onRepeat: () => BRANDS.forEach((b) => resetCard(scope, b.id)),
      });
      revealCard(timeline, scope, 0, 0.4);
      revealCard(timeline, scope, 1, "AStart+=0.6");
      revealCard(timeline, scope, 2, "BStart+=0.6");

      const heroes = gsap.utils.toArray<SVGRectElement>("[data-hero]", scope);
      const heroBars = gsap.utils.toArray<SVGRectElement>("[data-hero-bar]", scope);
      const buttons = gsap.utils.toArray<SVGRectElement>("[data-button]", scope);
      const chipBoxes = gsap.utils.toArray<SVGRectElement>("[data-chip-box]", scope);
      const chipLabels = gsap.utils.toArray<SVGTextElement>("[data-chip-label]", scope);
      const chipGroups = gsap.utils.toArray<SVGGElement>("[data-chip]", scope);
      const lines = gsap.utils.toArray<SVGLineElement>("[data-line]", scope);
      const faint = colorVar("text-faint");

      timeline
        .to({}, { duration: 2.2 })
        // Reverse of the reveal: the border un-traces back to grey, the
        // accent bar and button fade to grey with it, then the chip and
        // its line fade out — nothing snaps to its reset value, the
        // fade-out already lands exactly there.
        .to(heroes, { stroke: faint, drawSVG: "0%", duration: 0.5 })
        .to([...heroBars, ...buttons], { fill: faint, duration: 0.5 }, "<")
        .to([...chipBoxes, ...lines], { stroke: faint, duration: 0.3 }, "<")
        .to(chipLabels, { fill: faint, duration: 0.3 }, "<")
        .to([...chipGroups, ...lines], { opacity: 0, duration: 0.3 }, ">-0.1");

      return { controller: timeline, cleanup: () => timeline.kill() };
    },
    // Reduced motion: every token already landed — chips stay in their
    // readable resting position (hiding them behind the frame would drop
    // the one piece of text each card carries) but everything's colored,
    // same as the fully-revealed moment mid-loop.
    reduced: (scope) => {
      BRANDS.forEach((brand) => {
        const card = getCard(scope, brand.id);
        if (!card.chipGroup || !card.chipBox || !card.chipLabel || !card.line || !card.hero || !card.heroBar || !card.button) return;
        const color = colorVar(brand.colorName);
        gsap.set(card.chipGroup, { y: 0, opacity: 1 });
        gsap.set(card.chipBox, { stroke: color });
        gsap.set(card.chipLabel, { fill: color });
        gsap.set(card.line, { stroke: color, opacity: 1, attr: { y1: LINE_TOP } });
        gsap.set(card.hero, { stroke: color, drawSVG: "100%" });
        gsap.set(card.heroBar, { fill: color });
        gsap.set(card.button, { fill: color });
      });
    },
  });

  return (
    <div ref={scopeRef} className="relative flex w-full flex-col items-center gap-4 p-6">
      <svg viewBox="0 0 400 226" className="h-auto w-full max-w-md" aria-hidden="true">
        {BRANDS.map((brand, i) => {
          const layout = cardLayout(i);
          return (
            <g key={brand.id} data-card={brand.id}>
              {/* Chip + dashed line painted first so the frame (an opaque
                  fill, drawn after) occludes the chip once it slides down
                  behind it. */}
              <line data-line x1={layout.chip.x + layout.chip.width / 2} y1={LINE_TOP} x2={layout.chip.x + layout.chip.width / 2} y2={layout.frame.y} strokeWidth={1} strokeDasharray="1.5 3" />
              <g data-chip>
                <rect data-chip-box x={layout.chip.x} y={layout.chip.y} width={layout.chip.width} height={layout.chip.height} rx={9} fill="var(--color-surface)" strokeWidth={1} />
                <text
                  data-chip-label
                  x={layout.chip.x + layout.chip.width / 2}
                  y={layout.chip.y + layout.chip.height / 2 + 2.8}
                  textAnchor="middle"
                  fontSize={8.5}
                  fontFamily="var(--font-mono)"
                  fontWeight={700}
                >
                  ACCENT {brand.id}
                </text>
              </g>

              <rect x={layout.frame.x} y={layout.frame.y} width={layout.frame.width} height={layout.frame.height} rx={8} fill="var(--color-surface)" stroke="var(--color-text-faint)" strokeWidth={1} />

              <rect data-hero x={layout.hero.x} y={layout.hero.y} width={layout.hero.width} height={layout.hero.height} rx={3} fill="var(--color-surface-high)" strokeWidth={1.25} />
              <rect data-hero-bar x={layout.hero.x} y={layout.hero.y} width={layout.hero.width} height={layout.heroBarHeight} />

              <rect x={layout.line1.x} y={layout.line1.y} width={layout.line1.width} height={layout.line1.height} rx={3} fill="var(--color-text-faint)" />
              <rect x={layout.line2.x} y={layout.line2.y} width={layout.line2.width} height={layout.line2.height} rx={3} fill="var(--color-text-faint)" />

              <rect data-button x={layout.button.x} y={layout.button.y} width={layout.button.width} height={layout.button.height} rx={7} />

              <text
                x={layout.frame.x + layout.frame.width / 2}
                y={layout.frame.y + layout.frame.height + 18}
                textAnchor="middle"
                fontSize={9}
                fontFamily="var(--font-mono)"
                fontWeight={700}
                fill="var(--color-text)"
                letterSpacing={1}
              >
                BRAND {brand.id}
              </text>
            </g>
          );
        })}
      </svg>
      <PauseButton paused={paused} onClick={toggle} label="animation" className="absolute right-3 bottom-3" />
    </div>
  );
}
