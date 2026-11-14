// components/visuals/email/EmailCtaLinkVisual.tsx
"use client";

import { gsap } from "@/lib/motion/gsap";
import { colorVar } from "@/lib/motion/tokens";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";

const CTAS = ["shop", "learn", "join"] as const;
const BRANDS: { id: "A" | "B" | "C"; colorName: string }[] = [
  { id: "A", colorName: "brand" },
  { id: "B", colorName: "blue-light" },
  { id: "C", colorName: "text" },
];
// The "shop" column is the one lookup the loop cycles through — brand A,
// then B, then C — showing the same CTA name resolves a different cell
// per brand. "learn"/"join" stay permanently dim, never picked.
const LOOKUP_COL = 0;
const DIM_OPACITY = 0.4;

const CAMPAIGNS = [
  { id: "spring", value: "spring" },
  { id: "summer", value: "summer" },
  { id: "fall", value: "fall" },
] as const;

const DESKTOP_PREFIX = "/offer?utm_campaign=";
const MOBILE_PREFIX = "utm_campaign=";
const DESKTOP_FONT = 7.5;
const MOBILE_FONT = 13;
// JetBrains Mono's advance width is a fixed 0.6em — exact enough to place
// a caret after a monospace prefix without measuring the rendered text.
const CHAR_WIDTH_RATIO = 0.6;

// --- Desktop geometry -------------------------------------------------
const D_CELL = { width: 56, height: 26 };
const D_GAP_X = 10;
const D_GAP_Y = 8;
const D_GRID_X = 18;
// Tall enough to clear the "LIBRARY · BRAND × CTA" header above (the
// column labels were colliding with it at a tighter offset) and to center
// the grid against the taller tracking panel on the right.
const D_GRID_Y = 36;
function dCellRect(row: number, col: number) {
  return { x: D_GRID_X + col * (D_CELL.width + D_GAP_X), y: D_GRID_Y + row * (D_CELL.height + D_GAP_Y), width: D_CELL.width, height: D_CELL.height };
}
const D_LEFT_WIDTH = D_GRID_X + 3 * D_CELL.width + 2 * D_GAP_X;
const D_LEFT_HEIGHT = D_GRID_Y + 3 * D_CELL.height + 2 * D_GAP_Y;

const D_ROW = { width: 220, height: 32 };
const D_ROW_GAP = 10;
const D_RIGHT_Y = 24;
function dRowRect(i: number) {
  return { x: 0, y: D_RIGHT_Y + i * (D_ROW.height + D_ROW_GAP), width: D_ROW.width, height: D_ROW.height };
}
const D_PILL = { width: 26, height: 14 };

const D_LEFT_X = 10;
const D_PANEL_GAP = 44;
const D_RIGHT_X = D_LEFT_X + D_LEFT_WIDTH + D_PANEL_GAP;
const D_VIEW_W = D_RIGHT_X + D_ROW.width + 12;
const D_VIEW_H = Math.max(D_GRID_Y + D_LEFT_HEIGHT, D_RIGHT_Y + 3 * D_ROW.height + 2 * D_ROW_GAP) + 14;

function dValueX(rowX: number) {
  return rowX + D_PILL.width + 16 + DESKTOP_PREFIX.length * (DESKTOP_FONT * CHAR_WIDTH_RATIO);
}

// --- Mobile geometry ----------------------------------------------------
const M_VIEW_W = 300;
// Row labels sit centered on the same x=14 left margin the tracking
// header/rows use below, not in a wider gutter of their own — the wider
// gutter was reading as the grid not being left-aligned with the block
// below it.
const M_GRID_X = 24;
const M_GRID_Y = 40;
const M_GAP = 8;
// Right edge matches the tracking rows' own right edge (M_VIEW_W - 14)
// below it — sizing off the view width independently left the grid
// narrower and visibly off-center against the full-width rows.
const M_CELL = { width: (M_VIEW_W - 14 - M_GRID_X - 2 * M_GAP) / 3, height: 42 };
function mCellRect(row: number, col: number) {
  return { x: M_GRID_X + col * (M_CELL.width + M_GAP), y: M_GRID_Y + row * (M_CELL.height + M_GAP), width: M_CELL.width, height: M_CELL.height };
}
const M_GRID_BOTTOM = M_GRID_Y + 3 * M_CELL.height + 2 * M_GAP;
const M_ARROW_Y = M_GRID_BOTTOM + 14;
const M_TRACK_HEADER_Y = M_ARROW_Y + 30;
const M_ROW = { x: 14, width: M_VIEW_W - 28, height: 38 };
const M_ROW_GAP = 10;
const M_TRACK_Y = M_TRACK_HEADER_Y + 14;
function mRowRect(i: number) {
  return { x: M_ROW.x, y: M_TRACK_Y + i * (M_ROW.height + M_ROW_GAP), width: M_ROW.width, height: M_ROW.height };
}
const M_PILL = { width: 34, height: 18 };
const M_VIEW_H = M_TRACK_Y + 3 * M_ROW.height + 2 * M_ROW_GAP + 14;

function mValueX(rowX: number) {
  return rowX + 10 + M_PILL.width + 10 + MOBILE_PREFIX.length * (MOBILE_FONT * CHAR_WIDTH_RATIO);
}

/** One "reused artwork, N campaigns" tracking row — a pill, a static
 * prefix and the campaign value that types in, with a caret that tracks
 * where the typed text currently ends. `prefix` differs mobile/desktop;
 * `valueX`/`fontSize` do too, so the caret lands in the right place on
 * both without measuring rendered text. */
function TrackingRow({
  id,
  rect,
  pillSize,
  prefix,
  valueX,
  fontSize,
}: {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
  pillSize: { width: number; height: number };
  prefix: string;
  valueX: number;
  fontSize: number;
}) {
  const pillX = rect.x + 10;
  const pillY = rect.y + (rect.height - pillSize.height) / 2;
  const textY = rect.y + rect.height / 2 + fontSize * 0.33;
  const caretHeight = fontSize * 0.9;
  return (
    <g>
      <rect data-row-border={id} x={rect.x} y={rect.y} width={rect.width} height={rect.height} rx={6} fill="var(--color-surface)" stroke="var(--color-text-faint)" strokeWidth={1} />
      <rect data-pill x={pillX} y={pillY} width={pillSize.width} height={pillSize.height} rx={pillSize.height / 2} fill="var(--color-brand)" />
      <text x={pillX + pillSize.width + 10} y={textY} fontSize={fontSize} fontFamily="var(--font-mono)" fill="var(--color-text-faint)">
        {prefix}
      </text>
      <text data-row-value={id} x={valueX} y={textY} fontSize={fontSize} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-blue-light)" />
      <rect data-row-caret={id} x={valueX} y={textY - caretHeight * 0.8} width={1.4} height={caretHeight} fill="var(--color-blue-light)" opacity={0} />
    </g>
  );
}

function LibraryGrid({ cell, labelFontSize, headerY }: { cell: (row: number, col: number) => { x: number; y: number; width: number; height: number }; labelFontSize: number; headerY: number }) {
  return (
    <>
      {CTAS.map((cta, col) => {
        const r = cell(0, col);
        return (
          <text key={cta} x={r.x + r.width / 2} y={headerY} textAnchor="middle" fontSize={labelFontSize} fontFamily="var(--font-mono)" fill="var(--color-text-faint)">
            {cta}
          </text>
        );
      })}
      {BRANDS.map((brand, row) => {
        const r = cell(row, 0);
        return (
          <text key={brand.id} x={r.x - 10} y={r.y + r.height / 2 + labelFontSize * 0.33} textAnchor="middle" fontSize={labelFontSize} fontFamily="var(--font-mono)" fill="var(--color-text-faint)">
            {brand.id}
          </text>
        );
      })}
      {BRANDS.map((brand, row) =>
        CTAS.map((_cta, col) => {
          const r = cell(row, col);
          const color = `var(--color-${brand.colorName})`;
          if (col !== LOOKUP_COL) {
            return <rect key={`${row}-${col}`} x={r.x} y={r.y} width={r.width} height={r.height} rx={r.height / 2} fill={color} opacity={DIM_OPACITY} />;
          }
          // One of the three cycling lookup cells — same CTA name, a
          // different brand resolves each time.
          return (
            <g key={`${row}-${col}`}>
              <rect data-ring={brand.id} x={r.x - 3} y={r.y - 3} width={r.width + 6} height={r.height + 6} rx={(r.height + 6) / 2} fill="none" stroke="var(--color-text)" strokeWidth={2} opacity={0} />
              <rect data-cell-active={brand.id} x={r.x} y={r.y} width={r.width} height={r.height} rx={r.height / 2} fill={color} opacity={DIM_OPACITY} />
            </g>
          );
        })
      )}
    </>
  );
}

/** Appends one campaign row's reveal — border lights up, its value types
 * in character by character with a caret that tracks the current length,
 * then the border settles back to resting. Each call appends after the
 * previous one (no explicit position), so the three rows always take
 * their turn strictly in sequence, never overlapping. */
function typeRow(tl: gsap.core.Timeline, scope: ParentNode, id: string, value: string) {
  const borders = gsap.utils.toArray<SVGRectElement>(`[data-row-border="${id}"]`, scope);
  const values = gsap.utils.toArray<SVGTextElement>(`[data-row-value="${id}"]`, scope);
  const carets = gsap.utils.toArray<SVGRectElement>(`[data-row-caret="${id}"]`, scope);
  const [desktopValue, mobileValue] = values;
  const [desktopCaret, mobileCaret] = carets;
  if (!desktopValue || !mobileValue || !desktopCaret || !mobileCaret) return;

  const desktopX = Number(desktopCaret.getAttribute("x"));
  const mobileX = Number(mobileCaret.getAttribute("x"));
  const desktopCharWidth = DESKTOP_FONT * CHAR_WIDTH_RATIO;
  const mobileCharWidth = MOBILE_FONT * CHAR_WIDTH_RATIO;
  const blueLight = colorVar("blue-light");
  const faint = colorVar("text-faint");
  const state = { n: 0 };

  tl.to(borders, { stroke: blueLight, strokeWidth: 1.5, duration: 0.2 })
    .set(carets, { opacity: 1 }, "<")
    .to(
      state,
      {
        n: value.length,
        duration: Math.max(value.length * 0.07, 0.2),
        ease: "none",
        onUpdate: () => {
          const n = Math.round(state.n);
          const text = value.slice(0, n);
          desktopValue.textContent = text;
          mobileValue.textContent = text;
          desktopCaret.setAttribute("x", String(desktopX + n * desktopCharWidth));
          mobileCaret.setAttribute("x", String(mobileX + n * mobileCharWidth));
        },
      },
      "<"
    )
    .to(borders, { stroke: faint, strokeWidth: 1, duration: 0.3 }, "+=0.2")
    .to(carets, { opacity: 0, duration: 0.2 }, "<");
}

function resetAll(scope: ParentNode) {
  const faint = colorVar("text-faint");
  const cellActive = gsap.utils.toArray<SVGRectElement>("[data-cell-active]", scope);
  const ring = gsap.utils.toArray<SVGRectElement>("[data-ring]", scope);
  gsap.set(cellActive, { opacity: DIM_OPACITY });
  gsap.set(ring, { opacity: 0, scale: 0.85, transformOrigin: "50% 50%" });

  CAMPAIGNS.forEach(({ id }) => {
    const borders = gsap.utils.toArray<SVGRectElement>(`[data-row-border="${id}"]`, scope);
    const values = gsap.utils.toArray<SVGTextElement>(`[data-row-value="${id}"]`, scope);
    const carets = gsap.utils.toArray<SVGRectElement>(`[data-row-caret="${id}"]`, scope);
    gsap.set(borders, { stroke: faint, strokeWidth: 1 });
    gsap.set(carets, { opacity: 0 });
    values.forEach((v) => (v.textContent = ""));
  });
}

/**
 * Lights one brand's lookup cell — ring and brighten — and recolors every
 * tracking-row pill to match, all at once: swapping which cell is active
 * is what "resolves" a new artwork color for the campaigns below.
 */
function lightCell(tl: gsap.core.Timeline, scope: ParentNode, brandId: string, colorName: string, position?: string | number) {
  const cell = gsap.utils.toArray<SVGRectElement>(`[data-cell-active="${brandId}"]`, scope);
  const ring = gsap.utils.toArray<SVGRectElement>(`[data-ring="${brandId}"]`, scope);
  const pills = gsap.utils.toArray<SVGRectElement>("[data-pill]", scope);
  const color = colorVar(colorName);
  tl.to(cell, { opacity: 1, duration: 0.25, ease: "power2.out" }, position)
    .to(ring, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, "<")
    .to(pills, { fill: color, duration: 0.3 }, "<");
}

/** Dims one brand's lookup cell back to resting — the pills are left
 * alone; they only change when the next lightCell() picks a new brand. */
function dimCell(tl: gsap.core.Timeline, scope: ParentNode, brandId: string) {
  const cell = gsap.utils.toArray<SVGRectElement>(`[data-cell-active="${brandId}"]`, scope);
  const ring = gsap.utils.toArray<SVGRectElement>(`[data-ring="${brandId}"]`, scope);
  tl.to(cell, { opacity: DIM_OPACITY, duration: 0.2 }).to(ring, { opacity: 0, scale: 0.85, duration: 0.2 }, "<");
}

/**
 * Illustrates both button-artwork decisions in one loop: brand A's "shop"
 * cell lights up and every campaign types its tracking value in turn
 * while the pill stays red. Once typing's done, the lookup moves to B,
 * then C — each time every pill recolors to match, instantly, while the
 * already-typed values never change: the artwork can come from any
 * brand's library entry, but the tracking is untouched either way.
 */
export default function EmailCtaLinkVisual() {
  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      resetAll(scope);

      const timeline = gsap.timeline({ repeat: -1, onRepeat: () => resetAll(scope) });

      timeline.to({}, { duration: 0.4 });
      lightCell(timeline, scope, "A", "brand");
      timeline.to({}, { duration: 0.3 });
      CAMPAIGNS.forEach(({ id, value }) => typeRow(timeline, scope, id, value));
      timeline.to({}, { duration: 1 });
      dimCell(timeline, scope, "A");
      lightCell(timeline, scope, "B", "blue-light");
      timeline.to({}, { duration: 1 });
      dimCell(timeline, scope, "B");
      lightCell(timeline, scope, "C", "text");
      timeline.to({}, { duration: 1 });
      dimCell(timeline, scope, "C");
      timeline.to({}, { duration: 0.6 });

      return { controller: timeline, cleanup: () => timeline.kill() };
    },
    // Reduced motion: brand A's lookup resolved, its pill color applied,
    // every row already carrying its final tracking value — one
    // self-consistent picture rather than a frozen mid-cycle frame.
    reduced: (scope) => {
      const cellActive = gsap.utils.toArray<SVGRectElement>('[data-cell-active="A"]', scope);
      const ring = gsap.utils.toArray<SVGRectElement>('[data-ring="A"]', scope);
      const pills = gsap.utils.toArray<SVGRectElement>("[data-pill]", scope);
      gsap.set(cellActive, { opacity: 1 });
      gsap.set(ring, { opacity: 1, scale: 1 });
      gsap.set(pills, { fill: colorVar("brand") });
      CAMPAIGNS.forEach(({ id, value }) => {
        const values = gsap.utils.toArray<SVGTextElement>(`[data-row-value="${id}"]`, scope);
        values.forEach((v) => (v.textContent = value));
      });
    },
  });

  return (
    <div ref={scopeRef} className="relative flex w-full flex-col items-center gap-4 p-6">
      {/* Desktop / tablet: library and tracking side by side. */}
      <svg viewBox={`0 0 ${D_VIEW_W} ${D_VIEW_H}`} className="hidden h-auto w-full sm:block" aria-hidden="true">
        <text x={D_LEFT_X} y={14} fontSize={8} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)" letterSpacing={1}>
          LIBRARY · BRAND × CTA
        </text>
        <LibraryGrid cell={dCellRect} labelFontSize={7} headerY={D_GRID_Y - 6} />

        <g stroke="var(--color-text-faint)" strokeWidth={1} opacity={0.6}>
          <line x1={D_LEFT_X + D_LEFT_WIDTH + 8} y1={D_GRID_Y + D_LEFT_HEIGHT / 2 - 12} x2={D_RIGHT_X - 10} y2={D_GRID_Y + D_LEFT_HEIGHT / 2 - 12} strokeDasharray="3 3" />
          <path d={`M${D_RIGHT_X - 16},${D_GRID_Y + D_LEFT_HEIGHT / 2 - 18} L${D_RIGHT_X - 10},${D_GRID_Y + D_LEFT_HEIGHT / 2 - 12} L${D_RIGHT_X - 16},${D_GRID_Y + D_LEFT_HEIGHT / 2 - 6}`} fill="none" />
        </g>

        <g transform={`translate(${D_RIGHT_X}, 0)`}>
          <text x={0} y={14} fontSize={8} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)" letterSpacing={1}>
            LINK + TRACKING · PER CAMPAIGN
          </text>
          {CAMPAIGNS.map((c, i) => {
            const rect = dRowRect(i);
            return <TrackingRow key={c.id} id={c.id} rect={rect} pillSize={D_PILL} prefix={DESKTOP_PREFIX} valueX={dValueX(rect.x)} fontSize={DESKTOP_FONT} />;
          })}
        </g>
      </svg>

      {/* Mobile: library grid, full width with bigger cells, stacked
          above the tracking rows — the /offer? prefix is dropped since it
          added length without meaning at this size. */}
      <svg viewBox={`0 0 ${M_VIEW_W} ${M_VIEW_H}`} className="h-auto w-full sm:hidden" aria-hidden="true">
        <text x={14} y={14} fontSize={9} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)" letterSpacing={1}>
          LIBRARY · BRAND × CTA
        </text>
        <LibraryGrid cell={mCellRect} labelFontSize={9} headerY={M_GRID_Y - 8} />

        <g stroke="var(--color-text-faint)" strokeWidth={1} opacity={0.6}>
          <line x1={M_VIEW_W / 2} y1={M_ARROW_Y - 10} x2={M_VIEW_W / 2} y2={M_ARROW_Y + 10} strokeDasharray="3 3" />
          <path d={`M${M_VIEW_W / 2 - 6},${M_ARROW_Y + 4} L${M_VIEW_W / 2},${M_ARROW_Y + 10} L${M_VIEW_W / 2 + 6},${M_ARROW_Y + 4}`} fill="none" />
        </g>

        <text x={14} y={M_TRACK_HEADER_Y} fontSize={9} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)" letterSpacing={1}>
          TRACKING · PER CAMPAIGN
        </text>
        {CAMPAIGNS.map((c, i) => {
          const rect = mRowRect(i);
          return <TrackingRow key={c.id} id={c.id} rect={rect} pillSize={M_PILL} prefix={MOBILE_PREFIX} valueX={mValueX(rect.x)} fontSize={MOBILE_FONT} />;
        })}
      </svg>

      <PauseButton paused={paused} onClick={toggle} label="animation" className="absolute right-3 bottom-3" />
    </div>
  );
}
