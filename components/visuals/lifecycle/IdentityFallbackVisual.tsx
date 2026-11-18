// components/visuals/lifecycle/IdentityFallbackVisual.tsx
"use client";

import { gsap } from "@/lib/motion/gsap";
import { colorVar } from "@/lib/motion/tokens";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";
import { KeyIcon, IdentityBadge, PillCheck, Arrowhead } from "@/components/visuals/lifecycle/primitives";

// Two subscriber records converge on the same Subscriber Key table — the
// same four-stage sequence on both viewports, desktop running its lanes
// left to right and mobile top to bottom:
//  1. Start: Record 1 sits level with the 003…A7 row; Record 2 sits level
//     with the empty slot below the table's last row (where its own row
//     will appear once it lands). Record 2's ID badge is dashed (missing).
//  2. Record 1 travels: its card brightens, a solid white line draws
//     toward the table with an ID chip riding the tip, aimed at A7.
//  3. Record 1 lands (table edge, arrowhead, A7 → Preserved); Record 2
//     reroutes: a dashed blue line with an @ chip draws to the Fallback:
//     email box, which lights — no ID, so it can't go straight in.
//  4. Record 2 accepted: the dashed line continues out of the box to the
//     table edge (arrowhead), and a new sam@… row is appended at the
//     bottom → Accepted. Hold, then both lines retract, highlights fade,
//     the new row collapses, and the loop restarts.
//
// The table's own header is two static text labels, KEY and FIELDS, never
// animated — the only things that change inside it are a row lighting up
// and the new row appearing.

type RowId = "a7" | "c2" | "f9" | "sam";
const ROWS: { id: RowId; value: string }[] = [
  { id: "a7", value: "003…A7" },
  { id: "c2", value: "003…C2" },
  { id: "f9", value: "003…F9" },
  { id: "sam", value: "sam@…" },
];

// --- Desktop geometry ----------------------------------------------------
// Each record is vertically aligned with its own target row — Record 1
// with A7, Record 2 with the not-yet-rendered 4th slot — so every line
// runs dead horizontal from the card's right edge to the table, with no
// bend anywhere. The fallback box sits directly on Record 2's line.
const D_VIEWBOX = "0 0 530 210";
const D_RECORD_X = 16;
// Tall enough that the label has real clearance below the badges, not
// just whatever proportional gap the shared Record layout leaves at a
// smaller card size (mobile's own card is already tall enough).
const D_RECORD = { width: 130, height: 64 };
const D_LINE_X1 = D_RECORD_X + D_RECORD.width;
const D_ID_COL = 90;
const D_STATUS_COL = 140;
const D_TABLE = { x: 290, width: D_ID_COL + D_STATUS_COL };
const D_HEADING_Y = 20;
const D_TABLE_Y = 40;
const D_HEADER_ROW_H = 18;
const D_ROW_H = 28;
const D_ROW_CENTER = (i: number) => D_TABLE_Y + D_HEADER_ROW_H + i * D_ROW_H + D_ROW_H / 2;
const D_RECORD1_Y = D_ROW_CENTER(0); // A7
const D_RECORD2_Y = D_ROW_CENTER(3); // the empty slot below F9
const D_FALLBACK = { x: (D_LINE_X1 + (D_TABLE.x - 2)) / 2 - 47, y: D_RECORD2_Y - 12, width: 94, height: 24 };
// Short enough to clear "PRESERVED"/"ACCEPTED" with real margin — 0.5 of
// the column ran straight into the text, and bumping the status text's
// own font size later (8.5) ate back most of 0.38's margin too.
const D_FIELDS_BAR_WIDTH = D_STATUS_COL * 0.28;
const D_FRAME_H_3 = D_HEADER_ROW_H + 3 * D_ROW_H;
const D_FRAME_H_4 = D_HEADER_ROW_H + 4 * D_ROW_H;

// --- Mobile geometry: two lanes, growing table ----------------------------
// Mobile's viewBox (380 units wide) renders at a CSS width much closer to
// its own unit width than desktop's (530 units, inside a roughly
// 592px-wide lg:grid-cols-2 column — a ~1.12x upscale). Mobile's single
// full-width column is closer to ~342px — a ~0.90x DOWNSCALE. The same
// SVG-unit font size therefore lands visibly smaller in real pixels on
// mobile; this multiplier (desktop's effective scale over mobile's,
// ~1.12/0.90, rounded up a bit for legibility) corrects for it. Recheck
// this if either viewBox or the page's column widths change — the other
// lifecycle visuals (hero, card) hit the exact same gap.
const M_FONT_SCALE = 1.35;
const M_VIEWBOX = "0 0 380 600";
const M_RECORD = { y: 20, width: 150, height: 90 };
const M_RECORD1_X = 20;
const M_RECORD2_X = 210;
const M_FALLBACK = { x: 210, y: 220, width: 150, height: 50 };
const M_ID_COL = 140;
const M_STATUS_COL = 200;
const M_TABLE = { x: 20, width: M_ID_COL + M_STATUS_COL, y: 330 };
// Record 1's own line runs further right than the card's own center —
// dead-center collides with the "SUBSCRIBER KEY" heading above the table.
// Pulled back from the card's own right edge (170) so it exits the
// straight part of the border, not the rounded corner (which curves
// inward starting at 170 - rx).
// The card's own true right edge (M_RECORD1_X + M_RECORD.width) — clears
// the "SUBSCRIBER KEY" heading with room to spare. The line now starts
// from a point ON that straight edge (see its y1 below), not the card's
// bottom border, which is what made it look disconnected: x=170 at
// y=bottom sits exactly in the rounded corner's missing square corner,
// a point the actual border path never touches.
const M_R1_LINE_X = M_RECORD1_X + M_RECORD.width;
const M_HEADER_ROW_H = 24;
const M_ROW_H = 50;
const M_HEADING_Y = 310;
const M_FIELDS_BAR_WIDTH = M_STATUS_COL * 0.4;
const M_FRAME_H_3 = M_HEADER_ROW_H + 3 * M_ROW_H;
const M_FRAME_H_4 = M_HEADER_ROW_H + 4 * M_ROW_H;

// Mobile's viewBox renders at a narrower effective CSS width than
// desktop's (its container is much closer to the viewBox's own unit
// width), so the same SVG-unit font size lands visibly smaller in real
// pixels there. `fontScale` lets each shared shape compensate — desktop
// passes nothing (1), mobile passes a multiplier — rather than every
// text element needing two hand-tuned sizes.
function Record({
  x,
  y,
  width,
  height,
  id,
  hasId,
  fontScale = 1,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  id: "1" | "2";
  hasId: boolean;
  fontScale?: number;
}) {
  const badgeY = y + height * 0.28;
  return (
    <g>
      <rect data-record-card={id} x={x} y={y} width={width} height={height} rx={10} fill="none" stroke="var(--color-text-faint)" strokeWidth={1} />
      {/* Only a badge that actually holds a value brightens with the
          card — Record 2's dashed "ID" badge stays dim on purpose, the
          contrast being the point (it has no ID, only an email). */}
      <g data-record-badge={!hasId ? undefined : `${id}-id`} transform={`translate(${x + width / 2 - 34}, ${badgeY})`}>
        <IdentityBadge x={0} y={0} width={30} height={19} label="ID" dashed={!hasId} fontSize={8.5 * fontScale} />
      </g>
      <g data-record-badge={`${id}-at`} transform={`translate(${x + width / 2 + 6}, ${badgeY})`}>
        <IdentityBadge x={0} y={0} width={28} height={19} label="@" fontSize={8.5 * fontScale} />
      </g>
      <text x={x + width / 2} y={y + height - 13} textAnchor="middle" fontSize={9 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)" letterSpacing={0.4}>
        {hasId ? "RECORD 1" : "RECORD 2"}
      </text>
    </g>
  );
}

/** A rounded rect, not a pill — `rx` stays small regardless of height. */
function FallbackBox({ x, y, width, height, fontScale = 1 }: { x: number; y: number; width: number; height: number; fontScale?: number }) {
  return (
    <g data-fallback-group>
      {/* Dim by default — it flashes to blue-light only once the chip
          actually reaches it (see pulseFallback), not from frame 1. */}
      <rect data-fallback-box x={x} y={y} width={width} height={height} rx={5} fill="var(--color-surface)" stroke="var(--color-text-faint)" strokeWidth={1} strokeDasharray="3 3" />
      <text data-fallback-text x={x + width / 2} y={y + height / 2 + 2.6} textAnchor="middle" fontSize={8.5 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)" letterSpacing={0}>
        FALLBACK: EMAIL
      </text>
    </g>
  );
}

function Row({
  x,
  y,
  width,
  rowH,
  idColWidth,
  fieldsBarWidth,
  row,
  first,
  fontScale = 1,
}: {
  x: number;
  y: number;
  width: number;
  rowH: number;
  idColWidth: number;
  fieldsBarWidth: number;
  row: { id: RowId; value: string };
  first: boolean;
  fontScale?: number;
}) {
  const cy = y + rowH / 2;
  const fieldsX = x + idColWidth + 10;
  // sam@…'s row starts hidden in the markup itself, not only via the
  // later gsap.set in resetIdentityFallback — otherwise it's fully
  // visible (opacity 1 is the SVG default) for the brief window between
  // first paint and the GSAP effect running, which reads as a flash on
  // every cold load.
  return (
    <g data-row={row.id} opacity={row.id === "sam" ? 0 : undefined}>
      <rect data-row-bg={row.id} x={x} y={y} width={width} height={rowH} fill="var(--color-surface)" />
      {!first && <line x1={x} y1={y} x2={x + width} y2={y} stroke="var(--color-border-dim)" strokeWidth={1} />}
      <text data-row-value={row.id} x={x + 10} y={cy + 4} fontSize={11 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)">
        {row.value}
      </text>
      {/* A placeholder field value, same for every row regardless of
          state — not a loading indicator, so it never hides or resizes. */}
      <rect x={fieldsX} y={cy - 2} width={fieldsBarWidth} height={4} rx={2} fill="var(--color-border-dim)" />
      <text
        data-row-status={row.id}
        x={x + width - 28}
        y={cy + 4}
        textAnchor="end"
        fontSize={8.5 * fontScale}
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fill="var(--color-text)"
        letterSpacing={0.3}
        opacity={0}
      />
      <g data-row-check={row.id} opacity={0}>
        <PillCheck x={x + width - 20} y={cy - 7} width={14} height={14} />
      </g>
    </g>
  );
}

function KeyTable({
  x,
  width,
  idColWidth,
  tableY,
  headerRowH,
  rowH,
  fieldsBarWidth,
  headingY,
  clipId,
  frameHeight,
  fontScale = 1,
}: {
  x: number;
  width: number;
  idColWidth: number;
  tableY: number;
  headerRowH: number;
  rowH: number;
  fieldsBarWidth: number;
  headingY: number;
  clipId: string;
  frameHeight: number;
  fontScale?: number;
}) {
  return (
    <>
      {/* Row backgrounds are plain sharp-cornered rects, so without this
          clip the top/bottom rows' corners poke out past the frame's own
          rounded ones. Sized to the full (4-row) table — the still-hidden
          4th row being clipped slightly larger than the current border
          doesn't show. */}
      <clipPath id={clipId}>
        <rect x={x} y={tableY} width={width} height={headerRowH + ROWS.length * rowH} rx={6} />
      </clipPath>
      <g transform={`translate(${x}, ${headingY})`}>
        <KeyIcon cx={7} cy={0} size={12} color="var(--color-blue-light)" />
      </g>
      <text x={x + 18} y={headingY + 3} fontSize={10 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-blue-light)" letterSpacing={0.5}>
        SUBSCRIBER KEY
      </text>
      <g clipPath={`url(#${clipId})`}>
        {/* Plain column headers, never animated — KEY is blue like the
            key icon/label above (the point of this whole decision);
            FIELDS is just structure. */}
        <text x={x + 10} y={tableY + headerRowH / 2 + 4} fontSize={8.5 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-blue-light)" letterSpacing={0.8}>
          KEY
        </text>
        <text x={x + idColWidth + 10} y={tableY + headerRowH / 2 + 4} fontSize={8.5 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)" letterSpacing={0.8}>
          FIELDS
        </text>
        <line x1={x} y1={tableY + headerRowH} x2={x + width} y2={tableY + headerRowH} stroke="var(--color-border-dim)" strokeWidth={1} />
        {ROWS.map((row, i) => (
          <Row key={row.id} x={x} y={tableY + headerRowH + i * rowH} width={width} rowH={rowH} idColWidth={idColWidth} fieldsBarWidth={fieldsBarWidth} row={row} first={i === 0} fontScale={fontScale} />
        ))}
      </g>
      <rect data-table-frame x={x} y={tableY} width={width} height={frameHeight} rx={6} fill="none" stroke="var(--color-text)" strokeWidth={1} />
    </>
  );
}

function qa<T extends Element>(scope: ParentNode, selector: string): T[] {
  return gsap.utils.toArray<T>(selector, scope);
}

/** Stage 1 — nothing landed yet: cards at rest, no lines, no arrowheads,
 * the table at its 3-row resting height with no sam@ row. Applied once
 * before the live loop and again on every repeat (a safety net behind the
 * animated retract phase each build already ends on). */
function resetIdentityFallback(scope: ParentNode) {
  const grey = colorVar("text-faint");
  const surface = colorVar("surface");

  gsap.set(qa(scope, "[data-record-card]"), { stroke: grey });
  gsap.set(qa(scope, "[data-record-badge] rect"), { stroke: grey });
  gsap.set(qa(scope, "[data-record-badge] text"), { fill: grey });
  gsap.set(qa(scope, "[data-r1-line]"), { drawSVG: "0%", stroke: grey });
  gsap.set(qa(scope, "[data-r1-chip]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-arrowhead]"), { opacity: 0 });
  // Collapsed to zero length at each line's own start point, not via
  // drawSVG — DrawSVGPlugin rewrites stroke-dasharray to do its own
  // reveal, which would clobber the dotted pattern these lines are drawn
  // with. Read live (not a stored constant) since both desktop (one
  // single line) and mobile (two segments) share this one function.
  qa<SVGLineElement>(scope, "[data-r2-line], [data-r2-line-1]").forEach((el) => gsap.set(el, { attr: { x2: Number(el.getAttribute("x1")), y2: Number(el.getAttribute("y1")) } }));
  qa<SVGLineElement>(scope, "[data-r2-line-2]").forEach((el) => gsap.set(el, { attr: { x2: Number(el.getAttribute("x1")), y2: Number(el.getAttribute("y1")) } }));
  gsap.set(qa(scope, "[data-r2-chip]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-fallback-box]"), { strokeDasharray: "3 3", stroke: grey });
  gsap.set(qa(scope, "[data-fallback-text]"), { fill: grey });
  gsap.set(qa(scope, "[data-fallback-group]"), { scale: 1, transformOrigin: "50% 50%" });
  gsap.set(qa(scope, "[data-row-bg]"), { fill: surface });
  gsap.set(qa(scope, "[data-row-value]"), { fill: grey });
  gsap.set(qa(scope, "[data-row-status]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-row-check]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-viewport='desktop'] [data-table-frame]"), { attr: { height: D_FRAME_H_3 } });
  gsap.set(qa(scope, "[data-viewport='mobile'] [data-table-frame]"), { attr: { height: M_FRAME_H_3 } });
  gsap.set(qa(scope, "[data-row='sam']"), { opacity: 0 });
}

function landRow(tl: gsap.core.Timeline, scope: ParentNode, id: RowId, label: string, position: string | number) {
  const white = colorVar("text");
  const blue = id === "sam" ? colorVar("blue-light") : white;
  const bg = qa(scope, `[data-row-bg="${id}"]`);
  const value = qa(scope, `[data-row-value="${id}"]`);
  const status = qa<SVGTextElement>(scope, `[data-row-status="${id}"]`);
  const check = qa(scope, `[data-row-check="${id}"]`);

  tl.to(bg, { fill: colorVar("surface-high"), duration: 0.25 }, position)
    .to(value, { fill: blue, duration: 0.25 }, position)
    .call(() => status.forEach((el) => (el.textContent = label)), undefined, position)
    .to(status, { opacity: 1, duration: 0.25 }, position)
    .to(check, { opacity: 1, duration: 0.25 }, position);
}

/** Brightens a record's own ID/@ badges in step with its card border.
 * Only badges tagged `data-record-badge` brighten — Record 2's dashed
 * "ID" badge was deliberately left untagged (see Record) so it stays
 * dim, the contrast against its own brightened "@" being the point. */
function brightenBadges(tl: gsap.core.Timeline, scope: ParentNode, viewport: "desktop" | "mobile", recordId: "1" | "2", white: string, position: string | number) {
  const rects = qa(scope, `[data-viewport='${viewport}'] [data-record-badge^='${recordId}-'] rect`);
  const text = qa(scope, `[data-viewport='${viewport}'] [data-record-badge^='${recordId}-'] text`);
  tl.to(rects, { stroke: white, duration: 0.2 }, position).to(text, { fill: white, duration: 0.2 }, position);
}

/** The fallback box's own arrival cue — dim until now, it flashes to
 * blue-light right as the chip reaches it, border goes from dashed to
 * solid, and the whole group pulse-scales once. */
function pulseFallback(tl: gsap.core.Timeline, scope: ParentNode, viewport: "desktop" | "mobile", position: string | number) {
  const blueLight = colorVar("blue-light");
  const box = qa(scope, `[data-viewport='${viewport}'] [data-fallback-box]`);
  const text = qa(scope, `[data-viewport='${viewport}'] [data-fallback-text]`);
  const group = qa(scope, `[data-viewport='${viewport}'] [data-fallback-group]`);
  tl.to(box, { stroke: blueLight, strokeDasharray: "0 0", duration: 0.2 }, position)
    .to(text, { fill: blueLight, duration: 0.2 }, position)
    .to(group, { scale: 1.08, duration: 0.15, transformOrigin: "50% 50%" }, position)
    .to(group, { scale: 1, duration: 0.2 }, ">");
}

/** The closing phase every loop ends on: both lines retract toward their
 * own records, highlights fade, the new row collapses away — an animated
 * mirror of resetIdentityFallback rather than an instant jump, so the
 * loop's own onRepeat snap (which still runs as a safety net) is never
 * visible. */
function retract(tl: gsap.core.Timeline, scope: ParentNode, viewport: "desktop" | "mobile", frameHeight3: number, position: string | number) {
  const grey = colorVar("text-faint");
  const surface = colorVar("surface");

  const r1Line = qa(scope, `[data-viewport='${viewport}'] [data-r1-line]`);
  const r2Lines = qa<SVGLineElement>(scope, `[data-viewport='${viewport}'] [data-r2-line], [data-viewport='${viewport}'] [data-r2-line-1], [data-viewport='${viewport}'] [data-r2-line-2]`);
  const frame = qa(scope, `[data-viewport='${viewport}'] [data-table-frame]`);
  const samRow = qa(scope, `[data-viewport='${viewport}'] [data-row='sam']`);
  const fallbackBox = qa(scope, `[data-viewport='${viewport}'] [data-fallback-box]`);
  const fallbackText = qa(scope, `[data-viewport='${viewport}'] [data-fallback-text]`);
  const cards = qa(scope, `[data-viewport='${viewport}'] [data-record-card]`);
  const badgeRects = qa(scope, `[data-viewport='${viewport}'] [data-record-badge] rect`);
  const badgeText = qa(scope, `[data-viewport='${viewport}'] [data-record-badge] text`);
  const arrows = qa(scope, `[data-viewport='${viewport}'] [data-arrowhead]`);

  tl.to(r1Line, { drawSVG: "0%", stroke: grey, duration: 0.35 }, position)
    .to(cards, { stroke: grey, duration: 0.3 }, position)
    .to(badgeRects, { stroke: grey, duration: 0.3 }, position)
    .to(badgeText, { fill: grey, duration: 0.3 }, position)
    .to(fallbackBox, { stroke: grey, strokeDasharray: "3 3", duration: 0.2 }, position)
    .to(fallbackText, { fill: grey, duration: 0.2 }, position)
    .to(frame, { attr: { height: frameHeight3 }, duration: 0.35 }, position)
    .to(samRow, { opacity: 0, duration: 0.25 }, position)
    .to(arrows, { opacity: 0, duration: 0.2 }, position);

  r2Lines.forEach((el) => {
    const x1 = Number(el.getAttribute("x1"));
    const y1 = Number(el.getAttribute("y1"));
    tl.to(el, { attr: { x2: x1, y2: y1 }, duration: 0.35 }, position);
  });

  (["a7", "sam"] as const).forEach((id) => {
    tl.to(qa(scope, `[data-row-bg="${id}"]`), { fill: surface, duration: 0.3 }, position)
      .to(qa(scope, `[data-row-value="${id}"]`), { fill: grey, duration: 0.3 }, position)
      .to(qa(scope, `[data-row-status="${id}"]`), { opacity: 0, duration: 0.2 }, position)
      .to(qa(scope, `[data-row-check="${id}"]`), { opacity: 0, duration: 0.2 }, position);
  });
}

function buildDesktop(tl: gsap.core.Timeline, scope: ParentNode) {
  const r1Line = qa<SVGLineElement>(scope, "[data-viewport='desktop'] [data-r1-line]")[0];
  const r1Chip = qa<SVGGElement>(scope, "[data-viewport='desktop'] [data-r1-chip]")[0];
  const r1Arrow = qa(scope, "[data-arrowhead='desktop-r1']");
  const r2Line1 = qa<SVGLineElement>(scope, "[data-viewport='desktop'] [data-r2-line-1]")[0];
  const r2Line2 = qa<SVGLineElement>(scope, "[data-viewport='desktop'] [data-r2-line-2]")[0];
  const r2Chip = qa<SVGGElement>(scope, "[data-viewport='desktop'] [data-r2-chip]")[0];
  const r2Arrow = qa(scope, "[data-arrowhead='desktop-r2']");
  const card1 = qa(scope, "[data-viewport='desktop'] [data-record-card='1']");
  const card2 = qa(scope, "[data-viewport='desktop'] [data-record-card='2']");
  const frame = qa(scope, "[data-viewport='desktop'] [data-table-frame]");
  const samRow = qa(scope, "[data-viewport='desktop'] [data-row='sam']");
  if (!r1Line || !r2Line1 || !r2Line2) return;

  const white = colorVar("text");
  const r1x1 = Number(r1Line.getAttribute("x1"));
  const r1y1 = Number(r1Line.getAttribute("y1"));
  const r1x2 = Number(r1Line.getAttribute("x2"));
  const r2x1 = Number(r2Line1.getAttribute("x1"));
  const r2y1 = Number(r2Line1.getAttribute("y1"));
  const r2x2 = Number(r2Line1.getAttribute("data-x2-final"));
  const r2bx2 = Number(r2Line2.getAttribute("data-x2-final"));

  tl.to(card1, { stroke: white, duration: 0.2 }, "start")
    .to(r1Line, { stroke: white, duration: 0.2 }, "start")
    .to(r1Line, { drawSVG: "100%", duration: 0.9, ease: "none" }, "start")
    .fromTo(r1Chip, { x: r1x1, y: r1y1, opacity: 1 }, { x: r1x2, y: r1y1, duration: 0.9, ease: "none" }, "start")
    .to(r1Chip, { opacity: 0, duration: 0.15 }, "start+=0.85")
    .to(r1Arrow, { opacity: 1, duration: 0.15 }, "start+=0.85");
  brightenBadges(tl, scope, "desktop", "1", white, "start");
  landRow(tl, scope, "a7", "PRESERVED", "start+=0.9");

  tl.to(card2, { stroke: white, duration: 0.2 }, "start+=0.4").to(r2Line1, { attr: { x2: r2x2, y2: r2y1 }, duration: 0.8, ease: "none" }, "start+=0.4");
  brightenBadges(tl, scope, "desktop", "2", white, "start+=0.4");
  pulseFallback(tl, scope, "desktop", "start+=1.2");

  // The chip's own travel spans both legs in one continuous move — it
  // passes straight over the fallback box (rendered beneath it) rather
  // than stopping and fading there, then continues on to the table.
  tl.fromTo(r2Chip, { x: r2x1, y: r2y1, opacity: 1 }, { x: r2bx2, y: r2y1, duration: 1.4, ease: "none" }, "start+=0.4").to(r2Chip, { opacity: 0, duration: 0.15 }, "start+=1.75");

  tl.to(r2Line2, { attr: { x2: r2bx2, y2: r2y1 }, duration: 0.6, ease: "none" }, "start+=1.2")
    .to(r2Arrow, { opacity: 1, duration: 0.15 }, "start+=1.8")
    .to(frame, { attr: { height: D_FRAME_H_4 }, duration: 0.35, ease: "power2.out" }, "start+=1.8")
    .to(samRow, { opacity: 1, duration: 0.3 }, "start+=1.95");
  landRow(tl, scope, "sam", "ACCEPTED", "start+=2.05");

  retract(tl, scope, "desktop", D_FRAME_H_3, "start+=3.6");
}

function buildMobile(tl: gsap.core.Timeline, scope: ParentNode) {
  const r1Line = qa<SVGLineElement>(scope, "[data-viewport='mobile'] [data-r1-line]")[0];
  const r1Chip = qa<SVGGElement>(scope, "[data-viewport='mobile'] [data-r1-chip]")[0];
  const r1Arrow = qa(scope, "[data-arrowhead='mobile-r1']");
  const r2Line1 = qa<SVGLineElement>(scope, "[data-viewport='mobile'] [data-r2-line-1]")[0];
  const r2Line2 = qa<SVGLineElement>(scope, "[data-viewport='mobile'] [data-r2-line-2]")[0];
  const r2Chip = qa<SVGGElement>(scope, "[data-viewport='mobile'] [data-r2-chip]")[0];
  const r2Arrow = qa(scope, "[data-arrowhead='mobile-r2']");
  const card1 = qa(scope, "[data-viewport='mobile'] [data-record-card='1']");
  const card2 = qa(scope, "[data-viewport='mobile'] [data-record-card='2']");
  const frame = qa(scope, "[data-viewport='mobile'] [data-table-frame]");
  const samRow = qa(scope, "[data-viewport='mobile'] [data-row='sam']");
  if (!r1Line || !r2Line1 || !r2Line2) return;

  const white = colorVar("text");
  const r1x1 = Number(r1Line.getAttribute("x1"));
  const r1y1 = Number(r1Line.getAttribute("y1"));
  const r1x2 = Number(r1Line.getAttribute("x2"));
  const r1y2 = Number(r1Line.getAttribute("y2"));
  const r2x1 = Number(r2Line1.getAttribute("x1"));
  const r2y1 = Number(r2Line1.getAttribute("y1"));
  const r2x2 = Number(r2Line1.getAttribute("data-x2-final"));
  const r2y2 = Number(r2Line1.getAttribute("data-y2-final"));
  const r2bx2 = Number(r2Line2.getAttribute("data-x2-final"));
  const r2by2 = Number(r2Line2.getAttribute("data-y2-final"));

  tl.to(card1, { stroke: white, duration: 0.2 }, "start")
    .to(r1Line, { stroke: white, duration: 0.2 }, "start")
    .to(r1Line, { drawSVG: "100%", duration: 1.0, ease: "none" }, "start")
    .fromTo(r1Chip, { x: r1x1, y: r1y1, opacity: 1 }, { x: r1x2, y: r1y2, duration: 1.0, ease: "none" }, "start")
    .to(r1Chip, { opacity: 0, duration: 0.15 }, "start+=0.95")
    .to(r1Arrow, { opacity: 1, duration: 0.15 }, "start+=0.95");
  brightenBadges(tl, scope, "mobile", "1", white, "start");
  landRow(tl, scope, "a7", "PRESERVED", "start+=1.0");

  tl.to(card2, { stroke: white, duration: 0.2 }, "start+=0.45").to(r2Line1, { attr: { x2: r2x2, y2: r2y2 }, duration: 0.85, ease: "none" }, "start+=0.45");
  brightenBadges(tl, scope, "mobile", "2", white, "start+=0.45");
  pulseFallback(tl, scope, "mobile", "start+=1.3");

  // Spans both legs (table y1 → fallback y → table y2) in one continuous
  // move — the chip passes over the box (rendered beneath it) instead of
  // stopping and fading there, then continues down to the table.
  tl.fromTo(r2Chip, { x: r2x1, y: r2y1, opacity: 1 }, { x: r2x1, y: r2by2, duration: 1.45, ease: "none" }, "start+=0.45").to(r2Chip, { opacity: 0, duration: 0.15 }, "start+=1.8");

  tl.to(r2Line2, { attr: { x2: r2bx2, y2: r2by2 }, duration: 0.6, ease: "none" }, "start+=1.3")
    .to(r2Arrow, { opacity: 1, duration: 0.15 }, "start+=1.9")
    .to(frame, { attr: { height: M_FRAME_H_4 }, duration: 0.35, ease: "power2.out" }, "start+=1.9")
    .to(samRow, { opacity: 1, duration: 0.3 }, "start+=2.05");
  landRow(tl, scope, "sam", "ACCEPTED", "start+=2.15");

  retract(tl, scope, "mobile", M_FRAME_H_3, "start+=3.7");
}

/** Reduced motion: both rows already marked — Preserved and Accepted —
 * the table already grown to its full four rows (the stage-4 end state
 * doubles as this frame). */
function applyReducedState(scope: ParentNode) {
  resetIdentityFallback(scope);
  const white = colorVar("text");
  const surfaceHigh = colorVar("surface-high");

  gsap.set(qa(scope, "[data-r1-line]"), { drawSVG: "100%" });
  gsap.set(qa(scope, "[data-arrowhead]"), { opacity: 1 });
  gsap.set(qa(scope, "[data-fallback-box]"), { strokeDasharray: "0 0" });
  qa<SVGLineElement>(scope, "[data-viewport='desktop'] [data-r2-line-1]").forEach((el) =>
    gsap.set(el, { attr: { x2: Number(el.getAttribute("data-x2-final")), y2: Number(el.getAttribute("y1")) } })
  );
  ["desktop", "mobile"].forEach((vp) => {
    const r2Line2 = qa<SVGLineElement>(scope, `[data-viewport='${vp}'] [data-r2-line-2]`)[0];
    if (r2Line2) gsap.set(r2Line2, { attr: { x2: Number(r2Line2.getAttribute("data-x2-final")), y2: Number(r2Line2.getAttribute("data-y2-final")) } });
  });
  qa<SVGLineElement>(scope, "[data-viewport='mobile'] [data-r2-line-1]").forEach((el) =>
    gsap.set(el, { attr: { x2: Number(el.getAttribute("data-x2-final")), y2: Number(el.getAttribute("data-y2-final")) } })
  );
  gsap.set(qa(scope, "[data-viewport='desktop'] [data-table-frame]"), { attr: { height: D_FRAME_H_4 } });
  gsap.set(qa(scope, "[data-viewport='mobile'] [data-table-frame]"), { attr: { height: M_FRAME_H_4 } });
  gsap.set(qa(scope, "[data-row='sam']"), { opacity: 1 });

  (["a7", "sam"] as const).forEach((id) => {
    gsap.set(qa(scope, `[data-row-bg="${id}"]`), { fill: surfaceHigh });
    gsap.set(qa(scope, `[data-row-value="${id}"]`), { fill: id === "sam" ? colorVar("blue-light") : white });
    qa<SVGTextElement>(scope, `[data-row-status="${id}"]`).forEach((el) => (el.textContent = id === "sam" ? "ACCEPTED" : "PRESERVED"));
    gsap.set(qa(scope, `[data-row-status="${id}"]`), { opacity: 1 });
    gsap.set(qa(scope, `[data-row-check="${id}"]`), { opacity: 1 });
  });
}

export default function IdentityFallbackVisual() {
  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      resetIdentityFallback(scope);
      const tl = gsap.timeline({ repeat: -1, onRepeat: () => resetIdentityFallback(scope) });
      tl.addLabel("start", 0.2);
      buildDesktop(tl, scope);
      buildMobile(tl, scope);
      return {
        controller: {
          play: () => tl.play(),
          pause: () => tl.pause(),
          restart: () => {
            resetIdentityFallback(scope);
            tl.restart();
          },
        },
        cleanup: () => tl.kill(),
      };
    },
    reduced: (scope) => applyReducedState(scope),
  });

  // Padding (not just the bare SVGs) gives the absolutely-positioned pause
  // button room in the corner instead of sitting on top of the table.
  return (
    <div ref={scopeRef} className="relative w-full p-4">
      <svg data-viewport="desktop" viewBox={D_VIEWBOX} className="hidden h-auto w-full sm:block" aria-hidden="true">
        <Record x={D_RECORD_X} y={D_RECORD1_Y - D_RECORD.height / 2} width={D_RECORD.width} height={D_RECORD.height} id="1" hasId />
        <Record x={D_RECORD_X} y={D_RECORD2_Y - D_RECORD.height / 2} width={D_RECORD.width} height={D_RECORD.height} id="2" hasId={false} />
        <KeyTable
          x={D_TABLE.x}
          width={D_TABLE.width}
          idColWidth={D_ID_COL}
          tableY={D_TABLE_Y}
          headerRowH={D_HEADER_ROW_H}
          rowH={D_ROW_H}
          fieldsBarWidth={D_FIELDS_BAR_WIDTH}
          headingY={D_HEADING_Y}
          clipId="identity-fallback-clip-desktop"
          frameHeight={D_FRAME_H_3}
        />

        {/* Matches the card border's own strokeWidth (1) — a thicker line
            looked like a weight mismatch right where it meets the card. */}
        {/* Grey by default, not white — it brightens in step with the
            card (see buildDesktop) rather than starting white while the
            card is still mid-brighten, which showed as a color mismatch
            right where the two met. */}
        <line data-r1-line x1={D_LINE_X1} y1={D_RECORD1_Y} x2={D_TABLE.x - 2} y2={D_RECORD1_Y} stroke="var(--color-text-faint)" strokeWidth={1} />
        <g data-r1-chip opacity={0}>
          <IdentityBadge x={-19} y={-9.5} width={38} height={19} label="ID" fontSize={8.5} color="var(--color-text)" />
        </g>
        <Arrowhead tip={D_TABLE.x - 3} cross={D_RECORD1_Y} direction="right" id="desktop-r1" color="var(--color-text)" />

        {/* Two segments: Record 2's own line, then the fallback box's
            exit line — Record 2's line literally stops inside the box
            (per the stage comps), not a continuous run the box overlays. */}
        <line
          data-r2-line-1
          x1={D_LINE_X1}
          y1={D_RECORD2_Y}
          x2={D_LINE_X1}
          y2={D_RECORD2_Y}
          stroke="var(--color-blue-light)"
          strokeWidth={1}
          strokeDasharray="3 3"
          data-x2-final={D_FALLBACK.x + D_FALLBACK.width / 2}
        />
        <line
          data-r2-line-2
          x1={D_FALLBACK.x + D_FALLBACK.width}
          y1={D_RECORD2_Y}
          x2={D_FALLBACK.x + D_FALLBACK.width}
          y2={D_RECORD2_Y}
          stroke="var(--color-blue-light)"
          strokeWidth={1}
          strokeDasharray="3 3"
          data-x2-final={D_TABLE.x - 2}
          data-y2-final={D_RECORD2_Y}
        />
        <Arrowhead tip={D_TABLE.x - 3} cross={D_RECORD2_Y} direction="right" id="desktop-r2" color="var(--color-blue-light)" />
        <FallbackBox {...D_FALLBACK} />
        {/* Rendered after the box so it visually overlays "FALLBACK:
            EMAIL" as it passes over, not hidden behind it. */}
        <g data-r2-chip opacity={0}>
          <IdentityBadge x={-15} y={-9.5} width={30} height={19} label="@" fontSize={8.5} color="var(--color-blue-light)" />
        </g>
      </svg>

      <svg data-viewport="mobile" viewBox={M_VIEWBOX} className="h-auto w-full sm:hidden" aria-hidden="true">
        <Record x={M_RECORD1_X} y={M_RECORD.y} width={M_RECORD.width} height={M_RECORD.height} id="1" hasId fontScale={M_FONT_SCALE} />
        <Record x={M_RECORD2_X} y={M_RECORD.y} width={M_RECORD.width} height={M_RECORD.height} id="2" hasId={false} fontScale={M_FONT_SCALE} />
        <KeyTable
          x={M_TABLE.x}
          width={M_TABLE.width}
          idColWidth={M_ID_COL}
          tableY={M_TABLE.y}
          headerRowH={M_HEADER_ROW_H}
          rowH={M_ROW_H}
          fieldsBarWidth={M_FIELDS_BAR_WIDTH}
          headingY={M_HEADING_Y}
          clipId="identity-fallback-clip-mobile"
          frameHeight={M_FRAME_H_3}
          fontScale={M_FONT_SCALE}
        />

        {/* y1 sits on the card's straight right edge (rx=10 rounds the
            bottom 10 units away), not the bottom border itself. */}
        <line data-r1-line x1={M_R1_LINE_X} y1={M_RECORD.y + M_RECORD.height - 15} x2={M_R1_LINE_X} y2={M_TABLE.y - 2} stroke="var(--color-text-faint)" strokeWidth={1} />
        <g data-r1-chip opacity={0}>
          <IdentityBadge x={-19} y={-9.5} width={38} height={19} label="ID" fontSize={8.5 * M_FONT_SCALE} color="var(--color-text)" />
        </g>
        <Arrowhead tip={M_TABLE.y - 3} cross={M_R1_LINE_X} direction="down" id="mobile-r1" color="var(--color-text)" />

        <line
          data-r2-line-1
          x1={M_RECORD2_X + M_RECORD.width / 2}
          y1={M_RECORD.y + M_RECORD.height}
          x2={M_RECORD2_X + M_RECORD.width / 2}
          y2={M_FALLBACK.y}
          stroke="var(--color-blue-light)"
          strokeWidth={1.25}
          strokeDasharray="3 3"
          data-x2-final={M_RECORD2_X + M_RECORD.width / 2}
          data-y2-final={M_FALLBACK.y}
        />
        <line
          data-r2-line-2
          x1={M_RECORD2_X + M_RECORD.width / 2}
          y1={M_FALLBACK.y + M_FALLBACK.height}
          x2={M_RECORD2_X + M_RECORD.width / 2}
          y2={M_FALLBACK.y + M_FALLBACK.height}
          stroke="var(--color-blue-light)"
          strokeWidth={1.25}
          strokeDasharray="3 3"
          data-x2-final={M_RECORD2_X + M_RECORD.width / 2}
          data-y2-final={M_TABLE.y - 2}
        />
        <Arrowhead tip={M_TABLE.y - 3} cross={M_RECORD2_X + M_RECORD.width / 2} direction="down" id="mobile-r2" color="var(--color-blue-light)" />
        <FallbackBox {...M_FALLBACK} fontScale={M_FONT_SCALE} />
        {/* Rendered after the box so it visually overlays "FALLBACK:
            EMAIL" as it passes over, not hidden behind it. */}
        <g data-r2-chip opacity={0}>
          <IdentityBadge x={-15} y={-9.5} width={30} height={19} label="@" fontSize={8.5 * M_FONT_SCALE} color="var(--color-blue-light)" />
        </g>
      </svg>

      <PauseButton paused={paused} onClick={toggle} label="animation" className="absolute right-4 bottom-4" />
    </div>
  );
}
