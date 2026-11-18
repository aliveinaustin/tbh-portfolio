// components/visuals/lifecycle/LookupBeforeWriteVisual.tsx
"use client";

import { gsap } from "@/lib/motion/gsap";
import { colorVar } from "@/lib/motion/tokens";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";
import { Arrowhead, LookupBox } from "@/components/visuals/lifecycle/primitives";

// Two columns, same repeat-visit event, same ~5s loop: Without lookup
// overwrites first_seen outright; With lookup checks the existing record
// first, so only last_seen moves and first_seen is preserved. Desktop
// runs the columns side by side; mobile stacks them, Without on top.
// Both viewports share one sequence builder (buildColumn) — only the
// geometry (read live from each element's own attributes) differs.

type Column = "without" | "with";

// --- Desktop geometry: two columns side by side ---------------------------
const D_COL_WIDTH = 190;
const D_COL_GAP = 40;
const D_WITHOUT_X = 10;
const D_WITH_X = D_WITHOUT_X + D_COL_WIDTH + D_COL_GAP;
const D_DIVIDER_X = D_WITHOUT_X + D_COL_WIDTH + D_COL_GAP / 2;
const D_LABEL_Y = 14;
const D_PILL = { y: 28, height: 20, width: 160 };
const D_LOOKUP = { y: 84, height: 24, width: 182 };
const D_CARD = { y: 140, height: 64 };
const D_VERDICT_Y = D_CARD.y + D_CARD.height + 22;
const D_VIEWBOX = `0 0 ${D_WITH_X + D_COL_WIDTH + 10} ${D_VERDICT_Y + 24}`;

// --- Mobile geometry: stacked sections, Without on top --------------------
const M_FONT_SCALE = 1.35;
const M_X = 20;
const M_WIDTH = 340;
const M_WITHOUT_TOP = 0;
const M_PILL = { height: 32, width: 220 };
const M_LOOKUP = { height: 40, width: 300 };
const M_CARD_HEIGHT = 100;
const M_WITH_TOP = M_WITHOUT_TOP + 24 + 10 + M_PILL.height + 40 + M_CARD_HEIGHT + 34 + 56;
const M_DIVIDER_Y = M_WITH_TOP - 28;
const M_VIEWBOX_H = M_WITH_TOP + 24 + 10 + M_PILL.height + 40 + M_LOOKUP.height + 40 + M_CARD_HEIGHT + 34 + 20;
const M_VIEWBOX = `0 0 380 ${M_VIEWBOX_H}`;

function Pill({ x, y, width, height, column, fontScale = 1 }: { x: number; y: number; width: number; height: number; column: Column; fontScale?: number }) {
  return (
    <g>
      <rect data-pill={column} x={x} y={y} width={width} height={height} rx={height / 2} fill="var(--color-surface)" stroke="var(--color-text-faint)" strokeWidth={1} />
      <text x={x + width / 2} y={y + height / 2 + 3} textAnchor="middle" fontSize={8 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)" letterSpacing={0.3}>
        REPEAT VISIT · NOV 9
      </text>
    </g>
  );
}

function Card({ x, y, width, height, column, fontScale = 1 }: { x: number; y: number; width: number; height: number; column: Column; fontScale?: number }) {
  const rowH = height / 2;
  const fsY = y + rowH / 2 + 3.5;
  const lsY = y + rowH + rowH / 2 + 3.5;
  const valueX = x + width - 12;
  return (
    <g>
      <rect data-card-border={column} x={x} y={y} width={width} height={height} rx={8} fill="var(--color-surface)" stroke="var(--color-text-faint)" strokeWidth={1} />
      <line x1={x} y1={y + rowH} x2={x + width} y2={y + rowH} stroke="var(--color-border-dim)" strokeWidth={1} />
      <text x={x + 12} y={fsY} fontSize={9 * fontScale} fontFamily="var(--font-mono)" fill="var(--color-text-muted)">
        first_seen
      </text>
      <text x={x + 12} y={lsY} fontSize={9 * fontScale} fontFamily="var(--font-mono)" fill="var(--color-text-muted)">
        last_seen
      </text>
      {column === "with" ? (
        <text x={valueX} y={fsY} textAnchor="end" fontSize={10 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)">
          Mar 2
        </text>
      ) : (
        <>
          {/* The original value — gains a strikethrough once overwritten,
              but the text itself never changes; a separate element reads
              the new one in beside it. */}
          <text data-fs-mar2 x={valueX - 46} y={fsY} textAnchor="end" fontSize={10 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)">
            Mar 2
          </text>
          <line data-fs-strike x1={valueX - 82} y1={fsY - 3.5} x2={valueX - 48} y2={fsY - 3.5} stroke="var(--color-brand)" strokeWidth={1.25} opacity={0} />
          <text data-fs-nov9 x={valueX} y={fsY} textAnchor="end" fontSize={10 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-brand)" opacity={0}>
            Nov 9
          </text>
        </>
      )}
      <text data-ls-value={column} x={valueX} y={lsY} textAnchor="end" fontSize={10 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)">
        Mar 2
      </text>
    </g>
  );
}

function Verdict({ x, width, y, column, fontScale = 1 }: { x: number; width: number; y: number; column: Column; fontScale?: number }) {
  const label = column === "without" ? "ORIGINAL DATE LOST" : "ORIGINAL DATE KEPT";
  const color = column === "without" ? "var(--color-brand)" : "var(--color-text)";
  return (
    <g data-verdict={column} opacity={0}>
      <text x={x + width / 2} y={y} textAnchor="middle" fontSize={9 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill={color} letterSpacing={0.5}>
        {label}
      </text>
      {column === "with" && (
        <path
          // The offset from the text's own center has to scale with
          // fontScale too — "ORIGINAL DATE KEPT" renders proportionally
          // wider on mobile, and a fixed offset (tuned for desktop's
          // smaller text) let the check collide with it there.
          d={`M${x + width / 2 + 68 * fontScale},${y - 3.2} L${x + width / 2 + 73 * fontScale},${y + 1.5} L${x + width / 2 + 82 * fontScale},${y - 7}`}
          fill="none"
          stroke="var(--color-text)"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}

function qa<T extends Element>(scope: ParentNode, selector: string): T[] {
  return gsap.utils.toArray<T>(selector, scope);
}

/** Stage 1 — everything at rest: pills unlit, Lookup unlit and reading
 * just "LOOKUP", both cards at Mar 2 / Mar 2, no lines, no verdicts.
 * Applied once before the live loop, again on every repeat as a safety
 * net behind the animated retract phase, and (with different end values)
 * for reduced motion. */
function resetColumns(scope: ParentNode) {
  const grey = colorVar("text-faint");
  const white = colorVar("text");

  gsap.set(qa(scope, "[data-pill]"), { stroke: grey });
  gsap.set(qa(scope, "[data-lookup-box]"), { stroke: grey, strokeDasharray: "3 3" });
  qa<SVGTextElement>(scope, "[data-lookup-text]").forEach((el) => (el.textContent = "LOOKUP"));
  gsap.set(qa(scope, "[data-lookup-text]"), { fill: grey });
  gsap.set(qa(scope, "[data-card-border]"), { stroke: grey });
  gsap.set(qa(scope, "[data-fs-strike]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-fs-nov9]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-ls-value]"), { fill: white });
  qa<SVGTextElement>(scope, "[data-ls-value]").forEach((el) => (el.textContent = "Mar 2"));
  gsap.set(qa(scope, "[data-verdict]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-arrowhead]"), { opacity: 0 });
  // Collapsed to zero length at each line's own start point, not via
  // drawSVG — DrawSVGPlugin rewrites stroke-dasharray to do its own
  // reveal, which would clobber the dotted pattern these lines are drawn
  // with.
  qa<SVGLineElement>(scope, "[data-line-without], [data-line-with-1], [data-line-with-2]").forEach((el) =>
    gsap.set(el, { attr: { y2: Number(el.getAttribute("y1")) }, stroke: colorVar("blue-light") })
  );
}

/** One column's full sequence — identical logic for both viewports, each
 * element's real coordinates read live from its own attributes so the
 * only thing that differs between desktop and mobile is geometry. */
function buildColumn(tl: gsap.core.Timeline, scope: ParentNode, viewport: "desktop" | "mobile", column: Column) {
  const blueLight = colorVar("blue-light");
  const brand = colorVar("brand");
  const white = colorVar("text");
  const grey = colorVar("text-faint");

  const sel = (s: string) => `[data-viewport='${viewport}'] ${s}`;
  const pill = qa(scope, sel(`[data-pill='${column}']`));
  const card = qa(scope, sel(`[data-card-border='${column}']`));

  if (column === "without") {
    const line = qa<SVGLineElement>(scope, sel("[data-line-without]"))[0];
    const arrow = qa(scope, `[data-arrowhead='${viewport}-without']`);
    const y2 = Number(line.getAttribute("data-y2-final"));
    const fsNov9 = qa(scope, sel("[data-fs-nov9]"));
    const fsStrike = qa(scope, sel("[data-fs-strike]"));
    const lsValue = qa<SVGTextElement>(scope, sel("[data-ls-value='without']"));

    tl.to(pill, { stroke: blueLight, duration: 0.25 }, "stage2").to(line, { attr: { y2 }, duration: 1.0, ease: "none" }, "stage2");

    tl.to(line, { stroke: brand, duration: 0.2 }, "stage3")
      .to(arrow, { opacity: 1, duration: 0.15 }, "stage3")
      .to(card, { stroke: brand, duration: 0.2 }, "stage3")
      .to(fsStrike, { opacity: 1, duration: 0.2 }, "stage3")
      .to(fsNov9, { opacity: 1, duration: 0.2 }, "stage3")
      .to(lsValue, { fill: brand, duration: 0.2 }, "stage3")
      .call(() => lsValue.forEach((el) => (el.textContent = "Nov 9")), undefined, "stage3");
  } else {
    const line1 = qa<SVGLineElement>(scope, sel("[data-line-with-1]"))[0];
    const line2 = qa<SVGLineElement>(scope, sel("[data-line-with-2]"))[0];
    const arrow = qa(scope, `[data-arrowhead='${viewport}-with']`);
    const lookupBox = qa(scope, sel("[data-lookup-box]"));
    const lookupText = qa<SVGTextElement>(scope, sel("[data-lookup-text]"));
    const y2a = Number(line1.getAttribute("data-y2-final"));
    const y2b = Number(line2.getAttribute("data-y2-final"));
    const lsValue = qa<SVGTextElement>(scope, sel("[data-ls-value='with']"));

    tl.to(pill, { stroke: blueLight, duration: 0.25 }, "stage2").to(line1, { attr: { y2: y2a }, duration: 0.8, ease: "none" }, "stage2");
    tl.to(lookupBox, { stroke: blueLight, strokeDasharray: "0 0", duration: 0.2 }, "stage2+=0.8")
      .to(lookupText, { fill: blueLight, duration: 0.2 }, "stage2+=0.8")
      .call(() => lookupText.forEach((el) => (el.textContent = "LOOKUP · MATCH: FIRST_SEEN MAR 2")), undefined, "stage2+=0.8");

    tl.to(line2, { attr: { y2: y2b }, duration: 0.6, ease: "none" }, "stage3")
      .to(arrow, { opacity: 1, duration: 0.15 }, "stage3+=0.6")
      .to(card, { stroke: white, duration: 0.2 }, "stage3+=0.6")
      .to(lsValue, { fill: blueLight, duration: 0.2 }, "stage3+=0.6")
      .call(() => lsValue.forEach((el) => (el.textContent = "Nov 9")), undefined, "stage3+=0.6");
  }

  tl.to(pill, { stroke: grey, duration: 0.2 }, "stage4");
  const verdict = qa(scope, sel(`[data-verdict='${column}']`));
  tl.to(verdict, { opacity: 1, duration: 0.3 }, "stage4+=0.1");
}

/** The closing phase every loop ends on: both columns' lines retract,
 * verdicts fade, cards reset to Mar 2 / Mar 2, Lookup goes back to
 * unlit — animated, not an instant jump, so the loop's own onRepeat snap
 * (a safety net) is never visible. */
function retractColumns(tl: gsap.core.Timeline, scope: ParentNode, position: string | number) {
  const grey = colorVar("text-faint");
  const white = colorVar("text");

  const lines = qa<SVGLineElement>(scope, "[data-line-without], [data-line-with-1], [data-line-with-2]");
  lines.forEach((el) => {
    const y1 = Number(el.getAttribute("y1"));
    tl.to(el, { attr: { y2: y1 }, stroke: colorVar("blue-light"), duration: 0.35 }, position);
  });

  tl.to(qa(scope, "[data-arrowhead]"), { opacity: 0, duration: 0.2 }, position)
    .to(qa(scope, "[data-verdict]"), { opacity: 0, duration: 0.25 }, position)
    .to(qa(scope, "[data-card-border]"), { stroke: grey, duration: 0.3 }, position)
    .to(qa(scope, "[data-fs-strike]"), { opacity: 0, duration: 0.2 }, position)
    .to(qa(scope, "[data-fs-nov9]"), { opacity: 0, duration: 0.2 }, position)
    .to(qa(scope, "[data-ls-value]"), { fill: white, duration: 0.25 }, position)
    .call(() => qa<SVGTextElement>(scope, "[data-ls-value]").forEach((el) => (el.textContent = "Mar 2")), undefined, position)
    .to(qa(scope, "[data-lookup-box]"), { stroke: grey, strokeDasharray: "3 3", duration: 0.25 }, position)
    .to(qa(scope, "[data-lookup-text]"), { fill: grey, duration: 0.25 }, position)
    .call(() => qa<SVGTextElement>(scope, "[data-lookup-text]").forEach((el) => (el.textContent = "LOOKUP")), undefined, `${position}+=0.2`);
}

/** Reduced motion: the stage-4 end state, statically — both cards
 * updated, the struck-through Mar 2 visible in Without, the Lookup step
 * still lit in With, both verdicts visible. */
function applyReducedState(scope: ParentNode) {
  resetColumns(scope);
  const brand = colorVar("brand");
  const white = colorVar("text");
  const blueLight = colorVar("blue-light");
  const grey = colorVar("text-faint");

  gsap.set(qa(scope, "[data-pill]"), { stroke: grey });
  gsap.set(qa(scope, "[data-arrowhead]"), { opacity: 1 });
  gsap.set(qa(scope, "[data-verdict]"), { opacity: 1 });

  qa<SVGLineElement>(scope, "[data-line-without], [data-line-with-1], [data-line-with-2]").forEach((el) =>
    gsap.set(el, { attr: { y2: Number(el.getAttribute("data-y2-final")) } })
  );

  gsap.set(qa(scope, "[data-card-border='without']"), { stroke: brand });
  gsap.set(qa(scope, "[data-fs-strike]"), { opacity: 1 });
  gsap.set(qa(scope, "[data-fs-nov9]"), { opacity: 1 });
  gsap.set(qa(scope, "[data-ls-value='without']"), { fill: brand });
  qa<SVGTextElement>(scope, "[data-ls-value='without']").forEach((el) => (el.textContent = "Nov 9"));

  gsap.set(qa(scope, "[data-card-border='with']"), { stroke: white });
  gsap.set(qa(scope, "[data-lookup-box]"), { stroke: blueLight, strokeDasharray: "0 0" });
  gsap.set(qa(scope, "[data-lookup-text]"), { fill: blueLight });
  qa<SVGTextElement>(scope, "[data-lookup-text]").forEach((el) => (el.textContent = "LOOKUP · MATCH: FIRST_SEEN MAR 2"));
  gsap.set(qa(scope, "[data-ls-value='with']"), { fill: blueLight });
  qa<SVGTextElement>(scope, "[data-ls-value='with']").forEach((el) => (el.textContent = "Nov 9"));
}

export default function LookupBeforeWriteVisual() {
  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      resetColumns(scope);
      const tl = gsap.timeline({ repeat: -1, onRepeat: () => resetColumns(scope) });
      tl.addLabel("stage2", 0.2);
      tl.addLabel("stage3", "stage2+=1.4");
      tl.addLabel("stage4", "stage3+=1.4");
      (["desktop", "mobile"] as const).forEach((vp) => {
        (["without", "with"] as const).forEach((col) => buildColumn(tl, scope, vp, col));
      });
      retractColumns(tl, scope, "stage4+=1.6");
      return {
        controller: {
          play: () => tl.play(),
          pause: () => tl.pause(),
          restart: () => {
            resetColumns(scope);
            tl.restart();
          },
        },
        cleanup: () => tl.kill(),
      };
    },
    reduced: (scope) => applyReducedState(scope),
  });

  return (
    <div ref={scopeRef} className="relative w-full p-4">
      <svg data-viewport="desktop" viewBox={D_VIEWBOX} className="hidden h-auto w-full sm:block" aria-hidden="true">
        <line x1={D_DIVIDER_X} y1={6} x2={D_DIVIDER_X} y2={D_VERDICT_Y + 10} stroke="var(--color-border-dim)" strokeWidth={1} />

        {/* --- Without lookup --- */}
        <text x={D_WITHOUT_X + D_COL_WIDTH / 2} y={D_LABEL_Y} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={0.8}>
          WITHOUT LOOKUP
        </text>
        <Pill x={D_WITHOUT_X + D_COL_WIDTH / 2 - D_PILL.width / 2} y={D_PILL.y} width={D_PILL.width} height={D_PILL.height} column="without" />
        <line
          data-line-without
          x1={D_WITHOUT_X + D_COL_WIDTH / 2}
          y1={D_PILL.y + D_PILL.height}
          x2={D_WITHOUT_X + D_COL_WIDTH / 2}
          y2={D_PILL.y + D_PILL.height}
          stroke="var(--color-blue-light)"
          strokeWidth={1}
          strokeDasharray="3 3"
          data-y2-final={D_CARD.y - 2}
        />
        <Arrowhead tip={D_CARD.y - 2} cross={D_WITHOUT_X + D_COL_WIDTH / 2} direction="down" id="desktop-without" color="var(--color-brand)" />
        <Card x={D_WITHOUT_X} y={D_CARD.y} width={D_COL_WIDTH} height={D_CARD.height} column="without" />
        <Verdict x={D_WITHOUT_X} width={D_COL_WIDTH} y={D_VERDICT_Y} column="without" />

        {/* --- With lookup --- */}
        <text x={D_WITH_X + D_COL_WIDTH / 2} y={D_LABEL_Y} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={0.8}>
          WITH LOOKUP
        </text>
        <Pill x={D_WITH_X + D_COL_WIDTH / 2 - D_PILL.width / 2} y={D_PILL.y} width={D_PILL.width} height={D_PILL.height} column="with" />
        <line
          data-line-with-1
          x1={D_WITH_X + D_COL_WIDTH / 2}
          y1={D_PILL.y + D_PILL.height}
          x2={D_WITH_X + D_COL_WIDTH / 2}
          y2={D_PILL.y + D_PILL.height}
          stroke="var(--color-blue-light)"
          strokeWidth={1}
          strokeDasharray="3 3"
          data-y2-final={D_LOOKUP.y - 2}
        />
        <LookupBox x={D_WITH_X + D_COL_WIDTH / 2 - D_LOOKUP.width / 2} y={D_LOOKUP.y} width={D_LOOKUP.width} height={D_LOOKUP.height} label="LOOKUP" />
        <line
          data-line-with-2
          x1={D_WITH_X + D_COL_WIDTH / 2}
          y1={D_LOOKUP.y + D_LOOKUP.height}
          x2={D_WITH_X + D_COL_WIDTH / 2}
          y2={D_LOOKUP.y + D_LOOKUP.height}
          stroke="var(--color-blue-light)"
          strokeWidth={1}
          strokeDasharray="3 3"
          data-y2-final={D_CARD.y - 2}
        />
        <Arrowhead tip={D_CARD.y - 2} cross={D_WITH_X + D_COL_WIDTH / 2} direction="down" id="desktop-with" color="var(--color-blue-light)" />
        <Card x={D_WITH_X} y={D_CARD.y} width={D_COL_WIDTH} height={D_CARD.height} column="with" />
        <Verdict x={D_WITH_X} width={D_COL_WIDTH} y={D_VERDICT_Y} column="with" />
      </svg>

      <svg data-viewport="mobile" viewBox={M_VIEWBOX} className="h-auto w-full sm:hidden" aria-hidden="true">
        {/* --- Without lookup --- */}
        <text x={M_X + M_WIDTH / 2} y={M_WITHOUT_TOP + 24} textAnchor="middle" fontSize={9 * M_FONT_SCALE} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={0.8}>
          WITHOUT LOOKUP
        </text>
        <Pill x={M_X + M_WIDTH / 2 - M_PILL.width / 2} y={M_WITHOUT_TOP + 44} width={M_PILL.width} height={M_PILL.height} column="without" fontScale={M_FONT_SCALE} />
        <line
          data-line-without
          x1={M_X + M_WIDTH / 2}
          y1={M_WITHOUT_TOP + 44 + M_PILL.height}
          x2={M_X + M_WIDTH / 2}
          y2={M_WITHOUT_TOP + 44 + M_PILL.height}
          stroke="var(--color-blue-light)"
          strokeWidth={1.25}
          strokeDasharray="3 3"
          data-y2-final={M_WITHOUT_TOP + 44 + M_PILL.height + 40 - 2}
        />
        <Arrowhead tip={M_WITHOUT_TOP + 44 + M_PILL.height + 40 - 2} cross={M_X + M_WIDTH / 2} direction="down" id="mobile-without" color="var(--color-brand)" />
        <Card x={M_X} y={M_WITHOUT_TOP + 44 + M_PILL.height + 40} width={M_WIDTH} height={M_CARD_HEIGHT} column="without" fontScale={M_FONT_SCALE} />
        <Verdict x={M_X} width={M_WIDTH} y={M_WITHOUT_TOP + 44 + M_PILL.height + 40 + M_CARD_HEIGHT + 34} column="without" fontScale={M_FONT_SCALE} />

        <line x1={M_X} y1={M_DIVIDER_Y} x2={M_X + M_WIDTH} y2={M_DIVIDER_Y} stroke="var(--color-border-dim)" strokeWidth={1} />

        {/* --- With lookup --- */}
        <text x={M_X + M_WIDTH / 2} y={M_WITH_TOP + 24} textAnchor="middle" fontSize={9 * M_FONT_SCALE} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={0.8}>
          WITH LOOKUP
        </text>
        <Pill x={M_X + M_WIDTH / 2 - M_PILL.width / 2} y={M_WITH_TOP + 44} width={M_PILL.width} height={M_PILL.height} column="with" fontScale={M_FONT_SCALE} />
        <line
          data-line-with-1
          x1={M_X + M_WIDTH / 2}
          y1={M_WITH_TOP + 44 + M_PILL.height}
          x2={M_X + M_WIDTH / 2}
          y2={M_WITH_TOP + 44 + M_PILL.height}
          stroke="var(--color-blue-light)"
          strokeWidth={1.25}
          strokeDasharray="3 3"
          data-y2-final={M_WITH_TOP + 44 + M_PILL.height + 40 - 2}
        />
        <LookupBox x={M_X + M_WIDTH / 2 - M_LOOKUP.width / 2} y={M_WITH_TOP + 44 + M_PILL.height + 40} width={M_LOOKUP.width} height={M_LOOKUP.height} label="LOOKUP" fontScale={M_FONT_SCALE} />
        <line
          data-line-with-2
          x1={M_X + M_WIDTH / 2}
          y1={M_WITH_TOP + 44 + M_PILL.height + 40 + M_LOOKUP.height}
          x2={M_X + M_WIDTH / 2}
          y2={M_WITH_TOP + 44 + M_PILL.height + 40 + M_LOOKUP.height}
          stroke="var(--color-blue-light)"
          strokeWidth={1.25}
          strokeDasharray="3 3"
          data-y2-final={M_WITH_TOP + 44 + M_PILL.height + 40 + M_LOOKUP.height + 40 - 2}
        />
        <Arrowhead
          tip={M_WITH_TOP + 44 + M_PILL.height + 40 + M_LOOKUP.height + 40 - 2}
          cross={M_X + M_WIDTH / 2}
          direction="down"
          id="mobile-with"
          color="var(--color-blue-light)"
        />
        <Card x={M_X} y={M_WITH_TOP + 44 + M_PILL.height + 40 + M_LOOKUP.height + 40} width={M_WIDTH} height={M_CARD_HEIGHT} column="with" fontScale={M_FONT_SCALE} />
        <Verdict x={M_X} width={M_WIDTH} y={M_WITH_TOP + 44 + M_PILL.height + 40 + M_LOOKUP.height + 40 + M_CARD_HEIGHT + 34} column="with" fontScale={M_FONT_SCALE} />
      </svg>

      <PauseButton paused={paused} onClick={toggle} label="animation" className="absolute right-4 bottom-4" />
    </div>
  );
}
