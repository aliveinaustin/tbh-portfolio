// components/visuals/email/EmailDarkCellsVisual.tsx
"use client";

import { gsap } from "@/lib/motion/gsap";
import { colorVar } from "@/lib/motion/tokens";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";

type ColumnId = "implicit" | "explicit";
const COLUMNS: { id: ColumnId; title: string; outcome: string; outcomeColor: string; ringColor: string; darkShades: [string, string] }[] = [
  { id: "implicit", title: "IMPLICIT", outcome: "MISMATCHED SHADES", outcomeColor: "brand", ringColor: "brand", darkShades: ["surface-highest", "surface"] },
  { id: "explicit", title: "EXPLICIT", outcome: "CONSISTENT", outcomeColor: "ok", ringColor: "ok", darkShades: ["surface-high", "surface-high"] },
];
const LIGHT_FILL = "border-invert";

// --- Desktop geometry -----------------------------------------------------
const D_COL_WIDTH = 150;
const D_COL_GAP = 60;
const D_COL_X: Record<ColumnId, number> = { implicit: 20, explicit: 20 + D_COL_WIDTH + D_COL_GAP };
const D_LIGHT_Y = 26;
const D_ROW_HEIGHT = 32;
const D_ARROW_Y = D_LIGHT_Y + D_ROW_HEIGHT + 20;
const D_DARK_Y = D_ARROW_Y + 14;
const D_OUTCOME_Y = D_DARK_Y + D_ROW_HEIGHT + 20;
const D_VIEW_W = D_COL_X.explicit + D_COL_WIDTH + 20;
const D_VIEW_H = D_OUTCOME_Y + 14;
const D_DIVIDER_X = (D_COL_X.implicit + D_COL_WIDTH + D_COL_X.explicit) / 2;

// --- Mobile geometry --------------------------------------------------
const M_VIEW_W = 300;
const M_MARGIN = 14;
const M_LABEL_W = 44;
const M_CELL_X = M_MARGIN + M_LABEL_W;
const M_CELL_WIDTH = M_VIEW_W - M_CELL_X - M_MARGIN;
const M_ROW_HEIGHT = 44;
const M_ROW_GAP = 18;
const M_SECTION_HEIGHT = 24 + M_ROW_HEIGHT + M_ROW_GAP + M_ROW_HEIGHT + 22 + 24;
const M_VIEW_H = M_SECTION_HEIGHT * 2 + 20;

/** The two-cell rectangle shared by the light and dark rows — a pair of
 * adjacent rects with matching stroke so they read as one outlined block
 * with a center divider, not two separate boxes. */
function CellPair({ x, y, width, height, fill }: { x: number; y: number; width: number; height: number; fill: string }) {
  const cellWidth = width / 2;
  return (
    <>
      {[0, 1].map((i) => (
        <rect key={i} x={x + i * cellWidth} y={y} width={cellWidth} height={height} rx={3} fill={fill} stroke="var(--color-border-dim)" strokeWidth={1} />
      ))}
    </>
  );
}

/** A small success checkmark in its own light badge circle, centered over
 * a cell pair — pops in once the "explicit" column settles on its
 * consistent shade. Grouped as one element so a single opacity/scale
 * tween moves the badge and the check together. */
function Checkmark({ id, cx, cy, size }: { id: string; cx: number; cy: number; size: number }) {
  const s = size / 2;
  const r = size * 0.62;
  return (
    <g data-checkmark={id} opacity={0}>
      <circle cx={cx} cy={cy} r={r} fill="var(--color-border-invert)" />
      <path
        d={`M${cx - s * 0.5},${cy + s * 0.02} L${cx - s * 0.12},${cy + s * 0.42} L${cx + s * 0.55},${cy - s * 0.45}`}
        fill="none"
        stroke="var(--ok)"
        strokeWidth={size * 0.14}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function MobileSection({ column, top }: { column: (typeof COLUMNS)[number]; top: number }) {
  const lightY = top + 24;
  const darkY = lightY + M_ROW_HEIGHT + M_ROW_GAP;
  const outcomeY = darkY + M_ROW_HEIGHT + 22;
  return (
    <g>
      <text x={M_MARGIN} y={top} fontSize={11} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)" letterSpacing={1}>
        {column.title}
      </text>
      <text x={M_MARGIN} y={lightY + M_ROW_HEIGHT / 2 + 3} fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-text-faint)" letterSpacing={1}>
        LIGHT
      </text>
      <CellPair x={M_CELL_X} y={lightY} width={M_CELL_WIDTH} height={M_ROW_HEIGHT} fill="var(--color-border-invert)" />
      <text x={M_MARGIN} y={darkY + M_ROW_HEIGHT / 2 + 3} fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-text-faint)" letterSpacing={1}>
        DARK
      </text>
      {[0, 1].map((i) => (
        <rect
          key={i}
          data-dark-cell={column.id}
          data-cell-index={i}
          x={M_CELL_X + i * (M_CELL_WIDTH / 2)}
          y={darkY}
          width={M_CELL_WIDTH / 2}
          height={M_ROW_HEIGHT}
          rx={3}
          fill="var(--color-border-invert)"
          stroke="var(--color-border-dim)"
          strokeWidth={1}
        />
      ))}
      {column.id === "explicit" && <Checkmark id={column.id} cx={M_CELL_X + M_CELL_WIDTH / 2} cy={darkY + M_ROW_HEIGHT / 2} size={M_ROW_HEIGHT * 0.55} />}
      <text
        data-outcome={column.id}
        x={M_CELL_X + M_CELL_WIDTH / 2}
        y={outcomeY}
        textAnchor="middle"
        fontSize={10}
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fill={`var(--${column.outcomeColor})`}
        letterSpacing={1}
        opacity={0}
      >
        {column.outcome}
      </text>
    </g>
  );
}

function resetColumn(scope: ParentNode, id: ColumnId) {
  const cells = gsap.utils.toArray<SVGRectElement>(`[data-dark-cell="${id}"]`, scope);
  const labels = gsap.utils.toArray<SVGTextElement>(`[data-outcome="${id}"]`, scope);
  const checkmarks = gsap.utils.toArray<SVGGElement>(`[data-checkmark="${id}"]`, scope);
  gsap.set(cells, { fill: colorVar(LIGHT_FILL), stroke: colorVar("border-dim"), scale: 1, transformOrigin: "50% 50%" });
  gsap.set(labels, { opacity: 0 });
  // "implicit" has no checkmark — an empty-array target here triggers
  // GSAP's "target not found" console warning.
  if (checkmarks.length > 0) gsap.set(checkmarks, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });
}

function revealColumn(tl: gsap.core.Timeline, scope: ParentNode, column: (typeof COLUMNS)[number], position?: string | number) {
  // Each index selector matches one cell per layout (desktop + mobile) —
  // querying the bare `data-dark-cell` selector and destructuring the
  // first two would silently grab only the desktop pair, since both
  // layouts' cells share that same attribute value. Same reasoning is why
  // the label uses toArray(), not a singular querySelector — that was
  // only ever finding the desktop instance, leaving the mobile label
  // stuck at opacity 0 forever.
  const cells0 = gsap.utils.toArray<SVGRectElement>(`[data-dark-cell="${column.id}"][data-cell-index="0"]`, scope);
  const cells1 = gsap.utils.toArray<SVGRectElement>(`[data-dark-cell="${column.id}"][data-cell-index="1"]`, scope);
  const allCells = gsap.utils.toArray<SVGRectElement>(`[data-dark-cell="${column.id}"]`, scope);
  const labels = gsap.utils.toArray<SVGTextElement>(`[data-outcome="${column.id}"]`, scope);
  if (allCells.length === 0 || labels.length === 0) return;

  const [shade0, shade1] = column.darkShades;
  const ringColor = colorVar(column.ringColor);

  tl.to(cells0, { fill: colorVar(shade0), duration: 0.5, ease: "power2.out" }, position)
    .to(cells1, { fill: colorVar(shade1), duration: 0.5, ease: "power2.out" }, "<")
    .to(allCells, { stroke: ringColor, duration: 0.4 }, "<");
  tl.to(labels, { opacity: 1, duration: 0.3 }, ">-0.15");

  if (column.id === "explicit") {
    // Cells pulse first, settle, then the checkmark pops in — staggered
    // rather than simultaneous, so each beat actually registers instead
    // of the checkmark's pop getting lost inside the cells' own motion.
    const checkmarks = gsap.utils.toArray<SVGGElement>(`[data-checkmark="${column.id}"]`, scope);
    tl.to(allCells, { scale: 1.05, duration: 0.15, ease: "power1.out" }, ">-0.05")
      .to(allCells, { scale: 1, duration: 0.25, ease: "power1.inOut" })
      .to(checkmarks, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.5)" }, "-=0.05");
  }
}

function fadeColumn(tl: gsap.core.Timeline, scope: ParentNode, column: (typeof COLUMNS)[number], position?: string | number) {
  const cells = gsap.utils.toArray<SVGRectElement>(`[data-dark-cell="${column.id}"]`, scope);
  const labels = gsap.utils.toArray<SVGTextElement>(`[data-outcome="${column.id}"]`, scope);
  const checkmarks = gsap.utils.toArray<SVGGElement>(`[data-checkmark="${column.id}"]`, scope);
  if (cells.length === 0 || labels.length === 0) return;

  const light = colorVar(LIGHT_FILL);
  const borderDim = colorVar("border-dim");

  tl.to(labels, { opacity: 0, duration: 0.3 }, position).to(cells, { fill: light, stroke: borderDim, duration: 0.4 }, "<");
  // "implicit" has no checkmark at all — an empty-array target here
  // triggers GSAP's "target not found" console warning, harmless but
  // worth skipping outright. Same position/duration as the cells' own
  // fade so the checkmark disappears at exactly the same time/rate as
  // the grey→white transition, not on its own separate schedule.
  if (checkmarks.length > 0) {
    tl.to(checkmarks, { opacity: 0, scale: 0.4, duration: 0.4 }, "<");
  }
}

/**
 * Illustrates "set explicit table sizes and cell backgrounds" — two
 * neighboring cells in light mode, then a dark-mode switch: left implicit
 * (inherited shades), each cell lands on a visibly different dark tone
 * and the pair rings brand-red, "mismatched shades"; right explicit (a
 * declared background), both land on the same tone, "consistent."
 */
export default function EmailDarkCellsVisual() {
  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      COLUMNS.forEach((c) => resetColumn(scope, c.id));

      const timeline = gsap.timeline({ repeat: -1, onRepeat: () => COLUMNS.forEach((c) => resetColumn(scope, c.id)) });

      timeline.to({}, { duration: 0.6 });
      // "<" aligns the second column with the first's start — only valid
      // once a first call has actually been placed; passing it to every
      // call (including the first) anchored both to the *previous* tween
      // (the hold itself), firing at t=0 instead of after the hold.
      revealColumn(timeline, scope, COLUMNS[0], undefined);
      revealColumn(timeline, scope, COLUMNS[1], "<");
      timeline.to({}, { duration: 2 });
      fadeColumn(timeline, scope, COLUMNS[0], undefined);
      fadeColumn(timeline, scope, COLUMNS[1], "<");
      timeline.to({}, { duration: 0.4 });

      return { controller: timeline, cleanup: () => timeline.kill() };
    },
    // Reduced motion: both columns already in their dark-mode end state —
    // implicit mismatched and ringed, explicit consistent.
    reduced: (scope) => {
      COLUMNS.forEach((column) => {
        const cells0 = gsap.utils.toArray<SVGRectElement>(`[data-dark-cell="${column.id}"][data-cell-index="0"]`, scope);
        const cells1 = gsap.utils.toArray<SVGRectElement>(`[data-dark-cell="${column.id}"][data-cell-index="1"]`, scope);
        const allCells = gsap.utils.toArray<SVGRectElement>(`[data-dark-cell="${column.id}"]`, scope);
        const labels = gsap.utils.toArray<SVGTextElement>(`[data-outcome="${column.id}"]`, scope);
        const checkmarks = gsap.utils.toArray<SVGGElement>(`[data-checkmark="${column.id}"]`, scope);
        const [shade0, shade1] = column.darkShades;
        gsap.set(cells0, { fill: colorVar(shade0) });
        gsap.set(cells1, { fill: colorVar(shade1) });
        gsap.set(allCells, { stroke: colorVar(column.ringColor) });
        gsap.set(labels, { opacity: 1 });
        if (checkmarks.length > 0) gsap.set(checkmarks, { opacity: 1, scale: 1 });
      });
    },
  });

  return (
    <div ref={scopeRef} className="relative flex w-full flex-col items-center gap-4 p-6">
      {/* Desktop / tablet: Implicit and Explicit side by side. */}
      <svg viewBox={`0 0 ${D_VIEW_W} ${D_VIEW_H}`} className="hidden h-auto w-full sm:block" aria-hidden="true">
        <line x1={D_DIVIDER_X} y1={10} x2={D_DIVIDER_X} y2={D_VIEW_H - 10} stroke="var(--color-border-dim)" strokeWidth={1} />
        {COLUMNS.map((column) => {
          const x = D_COL_X[column.id];
          return (
            <g key={column.id}>
              <text x={x + D_COL_WIDTH / 2} y={14} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={1}>
                {column.title}
              </text>
              <CellPair x={x} y={D_LIGHT_Y} width={D_COL_WIDTH} height={D_ROW_HEIGHT} fill="var(--color-border-invert)" />
              <text x={x + D_COL_WIDTH / 2} y={D_ARROW_Y} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--color-text-faint)" letterSpacing={1}>
                DARK MODE ↓
              </text>
              {[0, 1].map((i) => (
                <rect
                  key={i}
                  data-dark-cell={column.id}
                  data-cell-index={i}
                  x={x + i * (D_COL_WIDTH / 2)}
                  y={D_DARK_Y}
                  width={D_COL_WIDTH / 2}
                  height={D_ROW_HEIGHT}
                  rx={3}
                  fill="var(--color-border-invert)"
                  stroke="var(--color-border-dim)"
                  strokeWidth={1}
                />
              ))}
              {column.id === "explicit" && <Checkmark id={column.id} cx={x + D_COL_WIDTH / 2} cy={D_DARK_Y + D_ROW_HEIGHT / 2} size={D_ROW_HEIGHT * 0.6} />}
              <text
                data-outcome={column.id}
                x={x + D_COL_WIDTH / 2}
                y={D_OUTCOME_Y}
                textAnchor="middle"
                fontSize={9}
                fontFamily="var(--font-mono)"
                fontWeight={700}
                fill={`var(--${column.outcomeColor})`}
                letterSpacing={1}
                opacity={0}
              >
                {column.outcome}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Mobile: Implicit above Explicit, LIGHT/DARK rows labeled inline. */}
      <svg viewBox={`0 0 ${M_VIEW_W} ${M_VIEW_H}`} className="h-auto w-full sm:hidden" aria-hidden="true">
        <MobileSection column={COLUMNS[0]} top={14} />
        <line x1={M_MARGIN} y1={M_SECTION_HEIGHT + 2} x2={M_VIEW_W - M_MARGIN} y2={M_SECTION_HEIGHT + 2} stroke="var(--color-border-dim)" strokeWidth={1} />
        <MobileSection column={COLUMNS[1]} top={M_SECTION_HEIGHT + 20} />
      </svg>

      <PauseButton paused={paused} onClick={toggle} label="animation" className="absolute right-3 bottom-3" />
    </div>
  );
}
