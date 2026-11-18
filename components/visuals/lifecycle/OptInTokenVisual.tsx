// components/visuals/lifecycle/OptInTokenVisual.tsx
"use client";

import { gsap } from "@/lib/motion/gsap";
import { colorVar } from "@/lib/motion/tokens";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";
import { Arrowhead, LookupBox, PillCheck } from "@/components/visuals/lifecycle/primitives";

// One Confirmed state, not two — a repeat visit's line runs back into the
// very same pill, not a second one. Stage 4: the repeat visit's line
// draws to a Status check (reusing LookupBeforeWriteVisual's lookup-box
// styling), which lights and briefly holds. A red Pending ghost — the
// reset the old system would have done — flashes on a short stub off the
// check, gets struck through, and fades, then the line continues into
// Confirmed, whose check pulses once.

type PillId = "signup" | "pending" | "confirmed" | "repeat";

// --- Desktop geometry -------------------------------------------------------
// Kept tight (viewBox ~525 wide) to match IdentityFallbackVisual/
// LookupBeforeWriteVisual's scale — a wider canvas at the same raw
// fontSize renders text visibly smaller, which is what made this one
// read small next to its siblings even after the font-size pass.
const D_PILL_H = 28;
const D_ROW1_Y = 36;
const D_SIGNUP = { x: 8, width: 80 };
const D_PENDING = { x: 102, width: 80 };
const D_TOKEN = { x: 196, y: D_ROW1_Y + 3, width: 60, height: 22 };
const D_RING = { cx: 280, cy: D_ROW1_Y + D_PILL_H / 2, r: 10 };
const D_TOK_CONF_LINE_START = 388;
const D_CONFIRMED = { x: 402, width: 108 };
const D_VIEWBOX_W = D_CONFIRMED.x + D_CONFIRMED.width + 16;
const D_DIVIDER_Y = D_ROW1_Y + D_PILL_H + 34;
const D_ROW2_Y = D_DIVIDER_Y + 34;
const D_REPEAT = { x: 8, width: 100 };
const D_CHECK = { x: 192, y: D_ROW2_Y + 2, width: 180, height: 24 };
const D_BEND_X = D_CONFIRMED.x + D_CONFIRMED.width / 2;
const D_GHOST = { width: 90, height: 22 };
const D_GHOST_STUB = 20;
const D_GHOST_X = D_CHECK.x + D_CHECK.width / 2 - D_GHOST.width / 2;
const D_GHOST_Y = D_CHECK.y + D_CHECK.height + D_GHOST_STUB;
const D_VIEWBOX_H = D_GHOST_Y + D_GHOST.height + 16;
const D_VIEWBOX = `0 0 ${D_VIEWBOX_W} ${D_VIEWBOX_H}`;

// --- Mobile geometry: single column -----------------------------------------
// Every pill, the ring and every vertical connector share one SPINE_X so
// the column reads centered and the arrows run straight through the
// countdown ring's own center rather than its pill's nominal midpoint —
// the ring's cx used to be derived from the token's width instead of
// this shared spine, which is what put the arrows to its left.
const M_FONT_SCALE = 1.35;
const SPINE_X = 187;
const M_PILL_W = 220;
const M_X = SPINE_X - M_PILL_W / 2;
const M_PILL_H = 40;
const M_SIGNUP_Y = 20;
const M_PENDING_Y = M_SIGNUP_Y + M_PILL_H + 46;
const M_TOKEN = { y: M_PENDING_Y + M_PILL_H + 50, width: 84, height: 30 };
const M_RING = { cx: SPINE_X, cy: M_TOKEN.y + M_TOKEN.height / 2, r: 15 };
const M_CONFIRMED_Y = M_TOKEN.y + M_TOKEN.height + 46;
const M_CHECK = { x: 20, y: M_CONFIRMED_Y + M_PILL_H + 40, width: 240, height: 36 };
const M_REPEAT_Y = M_CHECK.y + M_CHECK.height + 40;
const M_GHOST = { width: 78, height: 24 };
const M_GHOST_STUB = 16;
const M_GHOST_X = M_CHECK.x + M_CHECK.width + M_GHOST_STUB;
const M_GHOST_Y = M_CHECK.y + (M_CHECK.height - M_GHOST.height) / 2;
const M_VIEWBOX_W = 374;
const M_VIEWBOX_H = M_REPEAT_Y + M_PILL_H + 20;
const M_VIEWBOX = `0 0 ${M_VIEWBOX_W} ${M_VIEWBOX_H}`;

function StatePill({
  id,
  x,
  y,
  width,
  height,
  label,
  withCheck,
  fontScale = 1,
}: {
  id: PillId;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  withCheck?: boolean;
  fontScale?: number;
}) {
  return (
    <g>
      <rect data-pill={id} x={x} y={y} width={width} height={height} rx={height / 2} fill="var(--color-surface)" stroke="var(--color-border-dim)" strokeWidth={1} />
      <text
        data-pill-text={id}
        x={x + width / 2 - (withCheck ? 8 * fontScale : 0)}
        y={y + height / 2 + 3}
        textAnchor="middle"
        fontSize={8.5 * fontScale}
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fill="var(--color-border-dim)"
        letterSpacing={0.3}
      >
        {label}
      </text>
      {withCheck && (
        <g data-pill-check={id} opacity={0} transform="translate(0, 0)">
          <PillCheck x={x + width - 26 * fontScale} y={y + height / 2 - 7} width={14} height={14} />
        </g>
      )}
    </g>
  );
}

function TokenChip({ x, y, width, height, fontScale = 1 }: { x: number; y: number; width: number; height: number; fontScale?: number }) {
  return (
    <g>
      <rect data-token-box x={x} y={y} width={width} height={height} rx={5} fill="var(--color-surface)" stroke="var(--color-border-dim)" strokeWidth={1} strokeDasharray="3 3" />
      <text data-token-text x={x + width / 2} y={y + height / 2 + 3} textAnchor="middle" fontSize={8.5 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-border-dim)" letterSpacing={0.3}>
        TOKEN
      </text>
    </g>
  );
}

function CountdownRing({ cx, cy, r, fontScale = 1 }: { cx: number; cy: number; r: number; fontScale?: number }) {
  const circumference = 2 * Math.PI * r;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border-dim)" strokeWidth={2} />
      <circle
        data-ring-arc
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--color-border-dim)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={0}
        transform={`rotate(-90, ${cx}, ${cy})`}
      />
      <text data-caption x={cx + r + 12 * fontScale} y={cy + 3} fontSize={7.5 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-border-dim)" letterSpacing={0.5}>
        EXPIRES IF UNUSED
      </text>
    </g>
  );
}

/** A struck-through, dashed-red ghost of the old "reset to Pending" —
 * hangs off the Status check on its own short stub, flashes in, gets
 * struck through left-to-right, then fades. */
function GhostPending({ x, y, width, height, fontScale = 1 }: { x: number; y: number; width: number; height: number; fontScale?: number }) {
  const cy = y + height / 2;
  return (
    <g data-ghost-pending opacity={0}>
      <rect x={x} y={y} width={width} height={height} rx={height / 2} fill="none" stroke="var(--color-brand)" strokeWidth={1} strokeDasharray="3 3" />
      <text x={x + width / 2} y={cy + 3} textAnchor="middle" fontSize={7.5 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-brand)" letterSpacing={0.3}>
        PENDING
      </text>
      <line data-ghost-strike x1={x + 8} y1={cy} x2={x + 8} y2={cy} stroke="var(--color-brand)" strokeWidth={1.25} data-x2-final={x + width - 8} />
    </g>
  );
}

function qa<T extends Element>(scope: ParentNode, selector: string): T[] {
  return gsap.utils.toArray<T>(selector, scope);
}

const CONNECTOR_SELECTOR =
  "[data-line-su-pe], [data-line-pe-tok], [data-line-tok-conf], [data-line-repeat-check], [data-line-check-conf], [data-line-check-conf-1], [data-line-check-conf-2], [data-line-check-ghost]";

/** Collapses a connector line to a single point at its own start — reads
 * which axis varies from data-axis rather than assuming one, since
 * desktop's rows run horizontally but mobile's single column runs
 * vertically. */
function collapseLine(el: SVGLineElement) {
  const axis = el.getAttribute("data-axis");
  if (axis === "y") gsap.set(el, { attr: { y2: Number(el.getAttribute("y1")) } });
  else gsap.set(el, { attr: { x2: Number(el.getAttribute("x1")) } });
}

/** Draws a connector line to its true target — read from the preserved
 * data-x2-final/data-y2-final attribute, not the live (collapsed) one. */
function drawLine(tl: gsap.core.Timeline, el: SVGLineElement, duration: number, position: string | number) {
  const axis = el.getAttribute("data-axis");
  if (axis === "y") tl.to(el, { attr: { y2: Number(el.getAttribute("data-y2-final")) }, duration, ease: "none" }, position);
  else tl.to(el, { attr: { x2: Number(el.getAttribute("data-x2-final")) }, duration, ease: "none" }, position);
}

/** Stage 1 — everything unlit, ring full, no lines, no ghost, no check. */
function resetAll(scope: ParentNode) {
  const dim = colorVar("border-dim");

  gsap.set(qa(scope, "[data-pill]"), { stroke: dim });
  gsap.set(qa(scope, "[data-pill-text]"), { fill: dim });
  gsap.set(qa(scope, "[data-pill-check]"), { opacity: 0, scale: 1, transformOrigin: "50% 50%" });
  gsap.set(qa(scope, "[data-token-box]"), { stroke: dim, strokeDasharray: "3 3" });
  gsap.set(qa(scope, "[data-token-text]"), { fill: dim });
  gsap.set(qa(scope, "[data-ring-arc]"), { stroke: dim, strokeDashoffset: 0 });
  gsap.set(qa(scope, "[data-caption]"), { fill: dim });
  gsap.set(qa(scope, "[data-lookup-box]"), { stroke: dim, strokeDasharray: "3 3" });
  gsap.set(qa(scope, "[data-lookup-text]"), { fill: dim });
  gsap.set(qa(scope, "[data-ghost-pending]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-ghost-strike]"), { opacity: 1 });
  gsap.set(qa(scope, "[data-line-check-ghost]"), { opacity: 1 });
  gsap.set(qa(scope, "[data-arrowhead]"), { opacity: 0 });
  qa<SVGLineElement>(scope, "[data-ghost-strike]").forEach(collapseLine);
  qa<SVGLineElement>(scope, CONNECTOR_SELECTOR).forEach(collapseLine);
}

/** One viewport's full sequence. Desktop and mobile share identical
 * relative timing; only the geometry (read live from each element's own
 * attributes) and whether the repeat-visit connector bends differ. */
function buildSequence(tl: gsap.core.Timeline, scope: ParentNode, viewport: "desktop" | "mobile") {
  const dim = colorVar("border-dim");
  const faint = colorVar("text-faint");
  const muted = colorVar("text-muted");
  const white = colorVar("text");
  const blueLight = colorVar("blue-light");

  const sel = (s: string) => `[data-viewport='${viewport}'] ${s}`;
  const signup = qa(scope, sel("[data-pill='signup']"));
  const signupText = qa(scope, sel("[data-pill-text='signup']"));
  const pending = qa(scope, sel("[data-pill='pending']"));
  const pendingText = qa(scope, sel("[data-pill-text='pending']"));
  const confirmed = qa(scope, sel("[data-pill='confirmed']"));
  const confirmedText = qa(scope, sel("[data-pill-text='confirmed']"));
  const confirmedCheck = qa(scope, sel("[data-pill-check='confirmed']"));
  const repeat = qa(scope, sel("[data-pill='repeat']"));
  const repeatText = qa(scope, sel("[data-pill-text='repeat']"));
  const tokenBox = qa(scope, sel("[data-token-box]"));
  const tokenText = qa(scope, sel("[data-token-text]"));
  const ringArc = qa<SVGCircleElement>(scope, sel("[data-ring-arc]"))[0];
  const caption = qa(scope, sel("[data-caption]"));
  const checkBox = qa(scope, sel("[data-lookup-box]"));
  const checkText = qa(scope, sel("[data-lookup-text]"));
  const ghost = qa(scope, sel("[data-ghost-pending]"));
  const ghostStrike = qa<SVGLineElement>(scope, sel("[data-ghost-strike]"))[0];
  const arrowSuPe = qa(scope, `[data-arrowhead='${viewport}-su-pe']`);
  const arrowPeTok = qa(scope, `[data-arrowhead='${viewport}-pe-tok']`);
  const arrowTokConf = qa(scope, `[data-arrowhead='${viewport}-tok-conf']`);
  const arrowRepeatCheck = qa(scope, `[data-arrowhead='${viewport}-repeat-check']`);
  const arrowCheckConf = qa(scope, `[data-arrowhead='${viewport}-check-conf']`);

  const lineSuPe = qa<SVGLineElement>(scope, sel("[data-line-su-pe]"))[0];
  const linePeTok = qa<SVGLineElement>(scope, sel("[data-line-pe-tok]"))[0];
  const lineTokConf = qa<SVGLineElement>(scope, sel("[data-line-tok-conf]"))[0];
  const lineRepeatCheck = qa<SVGLineElement>(scope, sel("[data-line-repeat-check]"))[0];
  const lineCheckGhost = qa<SVGLineElement>(scope, sel("[data-line-check-ghost]"))[0];
  const lineCheckConf = qa<SVGLineElement>(scope, sel("[data-line-check-conf]"))[0];
  const lineCheckConf1 = qa<SVGLineElement>(scope, sel("[data-line-check-conf-1]"))[0];
  const lineCheckConf2 = qa<SVGLineElement>(scope, sel("[data-line-check-conf-2]"))[0];

  const circumference = 2 * Math.PI * Number(ringArc.getAttribute("r"));

  // --- Stage 2: Sign-up -> Pending, token issued --------------------------
  tl.to(signup, { stroke: faint, duration: 0.2 }, "stage2").to(signupText, { fill: faint, duration: 0.2 }, "stage2");
  drawLine(tl, lineSuPe, 0.5, "stage2+=0.2");
  tl.to(arrowSuPe, { opacity: 1, duration: 0.15 }, "stage2+=0.7");
  tl.to(pending, { stroke: muted, duration: 0.2 }, "stage2+=0.7").to(pendingText, { fill: muted, duration: 0.2 }, "stage2+=0.7");
  drawLine(tl, linePeTok, 0.3, "stage2+=0.8");
  tl.to(arrowPeTok, { opacity: 1, duration: 0.15 }, "stage2+=1.1");
  tl.to(tokenBox, { stroke: blueLight, strokeDasharray: "0 0", duration: 0.2 }, "stage2+=1.1")
    .to(tokenText, { fill: white, duration: 0.2 }, "stage2+=1.1")
    .to(ringArc, { stroke: blueLight, duration: 0.2 }, "stage2+=1.1")
    .to(caption, { fill: blueLight, duration: 0.2 }, "stage2+=1.1");
  // Drains continuously from the moment it lights until Confirmed
  // actually arrives in stage 3 (below) — the duration is picked so it
  // lands on "about half" at that exact instant, not an organically
  // interrupted tween.
  tl.to(ringArc, { strokeDashoffset: circumference * 0.5, duration: 1.0, ease: "none" }, "stage2+=1.1");

  // --- Stage 3: token used in time -----------------------------------------
  drawLine(tl, lineTokConf, 0.4, "stage3+=0.1");
  tl.to(arrowTokConf, { opacity: 1, duration: 0.15 }, "stage3+=0.5");
  tl.to(confirmed, { stroke: white, duration: 0.2 }, "stage3+=0.5")
    .to(confirmedText, { fill: white, duration: 0.2 }, "stage3+=0.5")
    .to(confirmedCheck, { opacity: 1, duration: 0.2 }, "stage3+=0.5")
    .to(pending, { stroke: dim, duration: 0.2 }, "stage3+=0.5")
    .to(pendingText, { fill: dim, duration: 0.2 }, "stage3+=0.5");

  // --- Stage 4: repeat visit, status check, the reset that doesn't happen --
  tl.to(repeat, { stroke: blueLight, duration: 0.2 }, "stage4").to(repeatText, { fill: blueLight, duration: 0.2 }, "stage4");
  drawLine(tl, lineRepeatCheck, 0.35, "stage4+=0.2");
  tl.to(arrowRepeatCheck, { opacity: 1, duration: 0.15 }, "stage4+=0.55");
  tl.to(checkBox, { stroke: blueLight, strokeDasharray: "0 0", duration: 0.15 }, "stage4+=0.55").to(
    checkText,
    { fill: blueLight, duration: 0.15 },
    "stage4+=0.55"
  );

  // The old reset, held on screen long enough to actually read before it
  // gets struck through and fades — the stub fades together with the
  // ghost (not left behind drawn) since it's included in the same tween.
  drawLine(tl, lineCheckGhost, 0.15, "stage4+=0.7");
  tl.to(ghost, { opacity: 1, duration: 0.15 }, "stage4+=0.85");
  tl.to(ghostStrike, { attr: { x2: Number(ghostStrike.getAttribute("data-x2-final")) }, duration: 0.35, ease: "none" }, "stage4+=1.9");
  tl.to([ghost, lineCheckGhost], { opacity: 0, duration: 0.3 }, "stage4+=2.75");

  if (lineCheckConf1 && lineCheckConf2) {
    drawLine(tl, lineCheckConf1, 0.2, "stage4+=3.05");
    drawLine(tl, lineCheckConf2, 0.15, "stage4+=3.25");
  } else if (lineCheckConf) {
    drawLine(tl, lineCheckConf, 0.35, "stage4+=3.05");
  }
  tl.to(arrowCheckConf, { opacity: 1, duration: 0.15 }, "stage4+=3.4");
  tl.to(confirmedCheck, { scale: 1.3, duration: 0.15, transformOrigin: "50% 50%" }, "stage4+=3.4").to(
    confirmedCheck,
    { scale: 1, duration: 0.2 },
    "stage4+=3.55"
  );
}

/** The closing phase every loop ends on: lines retract, states dim back
 * to unlit, the ring refills, the check un-pulses — animated, not an
 * instant jump, so the loop's own onRepeat snap (a safety net) is never
 * visible. */
function retractAll(tl: gsap.core.Timeline, scope: ParentNode, position: string | number) {
  const dim = colorVar("border-dim");

  qa<SVGLineElement>(scope, CONNECTOR_SELECTOR).forEach((el) => {
    const axis = el.getAttribute("data-axis");
    if (axis === "y") tl.to(el, { attr: { y2: Number(el.getAttribute("y1")) }, duration: 0.35 }, position);
    else tl.to(el, { attr: { x2: Number(el.getAttribute("x1")) }, duration: 0.35 }, position);
  });
  qa<SVGLineElement>(scope, "[data-ghost-strike]").forEach((el) =>
    tl.to(el, { attr: { x2: Number(el.getAttribute("x1")) }, duration: 0.2 }, position)
  );

  tl.to(qa(scope, "[data-arrowhead]"), { opacity: 0, duration: 0.2 }, position)
    .to(qa(scope, "[data-pill]"), { stroke: dim, duration: 0.3 }, position)
    .to(qa(scope, "[data-pill-text]"), { fill: dim, duration: 0.3 }, position)
    .to(qa(scope, "[data-pill-check]"), { opacity: 0, duration: 0.2 }, position)
    .to(qa(scope, "[data-token-box]"), { stroke: dim, strokeDasharray: "3 3", duration: 0.3 }, position)
    .to(qa(scope, "[data-token-text]"), { fill: dim, duration: 0.3 }, position)
    .to(qa(scope, "[data-ring-arc]"), { stroke: dim, strokeDashoffset: 0, duration: 0.35 }, position)
    .to(qa(scope, "[data-caption]"), { fill: dim, duration: 0.3 }, position)
    .to(qa(scope, "[data-lookup-box]"), { stroke: dim, strokeDasharray: "3 3", duration: 0.3 }, position)
    .to(qa(scope, "[data-lookup-text]"), { fill: dim, duration: 0.3 }, position)
    .to(qa(scope, "[data-ghost-pending]"), { opacity: 0, duration: 0.2 }, position);
}

/** Reduced motion: the stage-4 end state, statically — every state lit,
 * the ring frozen at half, the check lit and connected into Confirmed,
 * and the struck-through ghost visible on its stub. */
function applyReducedState(scope: ParentNode) {
  resetAll(scope);
  const faint = colorVar("text-faint");
  const white = colorVar("text");
  const blueLight = colorVar("blue-light");
  const dim = colorVar("border-dim");

  gsap.set(qa(scope, "[data-pill='signup']"), { stroke: faint });
  gsap.set(qa(scope, "[data-pill-text='signup']"), { fill: faint });
  gsap.set(qa(scope, "[data-pill='pending']"), { stroke: dim });
  gsap.set(qa(scope, "[data-pill-text='pending']"), { fill: dim });
  gsap.set(qa(scope, "[data-pill='confirmed']"), { stroke: white });
  gsap.set(qa(scope, "[data-pill-text='confirmed']"), { fill: white });
  gsap.set(qa(scope, "[data-pill-check='confirmed']"), { opacity: 1 });
  gsap.set(qa(scope, "[data-pill='repeat']"), { stroke: blueLight });
  gsap.set(qa(scope, "[data-pill-text='repeat']"), { fill: blueLight });
  gsap.set(qa(scope, "[data-token-box]"), { stroke: blueLight, strokeDasharray: "0 0" });
  gsap.set(qa(scope, "[data-token-text]"), { fill: white });
  gsap.set(qa(scope, "[data-caption]"), { fill: blueLight });
  gsap.set(qa(scope, "[data-lookup-box]"), { stroke: blueLight, strokeDasharray: "0 0" });
  gsap.set(qa(scope, "[data-lookup-text]"), { fill: blueLight });
  gsap.set(qa(scope, "[data-ghost-pending]"), { opacity: 1 });
  gsap.set(qa(scope, "[data-arrowhead]"), { opacity: 1 });

  qa<SVGCircleElement>(scope, "[data-ring-arc]").forEach((el) => {
    const circumference = 2 * Math.PI * Number(el.getAttribute("r"));
    gsap.set(el, { stroke: blueLight, strokeDashoffset: circumference * 0.5 });
  });

  qa<SVGLineElement>(scope, CONNECTOR_SELECTOR).forEach((el) => {
    const axis = el.getAttribute("data-axis");
    if (axis === "y") gsap.set(el, { attr: { y2: Number(el.getAttribute("data-y2-final")) } });
    else gsap.set(el, { attr: { x2: Number(el.getAttribute("data-x2-final")) } });
  });
  qa<SVGLineElement>(scope, "[data-ghost-strike]").forEach((el) => gsap.set(el, { attr: { x2: Number(el.getAttribute("data-x2-final")) } }));
}

export default function OptInTokenVisual() {
  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      resetAll(scope);
      const tl = gsap.timeline({ repeat: -1, onRepeat: () => resetAll(scope) });
      tl.addLabel("stage2", 0.2);
      tl.addLabel("stage3", "stage2+=1.6");
      tl.addLabel("stage4", "stage3+=1.6");
      (["desktop", "mobile"] as const).forEach((vp) => buildSequence(tl, scope, vp));
      retractAll(tl, scope, "stage4+=4.1");
      return {
        controller: {
          play: () => tl.play(),
          pause: () => tl.pause(),
          restart: () => {
            resetAll(scope);
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
        <StatePill id="signup" x={D_SIGNUP.x} y={D_ROW1_Y} width={D_SIGNUP.width} height={D_PILL_H} label="SIGN-UP" />
        <line
          data-line-su-pe
          data-axis="x"
          x1={D_SIGNUP.x + D_SIGNUP.width}
          y1={D_ROW1_Y + D_PILL_H / 2}
          x2={D_SIGNUP.x + D_SIGNUP.width}
          y2={D_ROW1_Y + D_PILL_H / 2}
          stroke="var(--color-text-faint)"
          strokeWidth={1.25}
          data-x2-final={D_PENDING.x - 2}
        />
        <Arrowhead tip={D_PENDING.x - 3} cross={D_ROW1_Y + D_PILL_H / 2} direction="right" id="desktop-su-pe" color="var(--color-text-faint)" />

        <StatePill id="pending" x={D_PENDING.x} y={D_ROW1_Y} width={D_PENDING.width} height={D_PILL_H} label="PENDING" />
        <line
          data-line-pe-tok
          data-axis="x"
          x1={D_PENDING.x + D_PENDING.width}
          y1={D_ROW1_Y + D_PILL_H / 2}
          x2={D_PENDING.x + D_PENDING.width}
          y2={D_ROW1_Y + D_PILL_H / 2}
          stroke="var(--color-blue-light)"
          strokeWidth={1}
          strokeDasharray="3 3"
          data-x2-final={D_TOKEN.x - 2}
        />
        <Arrowhead tip={D_TOKEN.x - 3} cross={D_ROW1_Y + D_PILL_H / 2} direction="right" id="desktop-pe-tok" color="var(--color-blue-light)" />

        <TokenChip x={D_TOKEN.x} y={D_TOKEN.y} width={D_TOKEN.width} height={D_TOKEN.height} />
        <CountdownRing cx={D_RING.cx} cy={D_RING.cy} r={D_RING.r} />
        <line
          data-line-tok-conf
          data-axis="x"
          x1={D_TOK_CONF_LINE_START}
          y1={D_ROW1_Y + D_PILL_H / 2}
          x2={D_TOK_CONF_LINE_START}
          y2={D_ROW1_Y + D_PILL_H / 2}
          stroke="var(--color-blue-light)"
          strokeWidth={1}
          strokeDasharray="3 3"
          data-x2-final={D_CONFIRMED.x - 2}
        />
        <Arrowhead tip={D_CONFIRMED.x - 3} cross={D_ROW1_Y + D_PILL_H / 2} direction="right" id="desktop-tok-conf" color="var(--color-blue-light)" />

        <StatePill id="confirmed" x={D_CONFIRMED.x} y={D_ROW1_Y} width={D_CONFIRMED.width} height={D_PILL_H} label="CONFIRMED" withCheck />

        <line x1={0} y1={D_DIVIDER_Y} x2={D_VIEWBOX_W} y2={D_DIVIDER_Y} stroke="var(--color-border-dim)" strokeWidth={1} />

        <StatePill id="repeat" x={D_REPEAT.x} y={D_ROW2_Y} width={D_REPEAT.width} height={D_PILL_H} label="REPEAT VISIT" />
        <line
          data-line-repeat-check
          data-axis="x"
          x1={D_REPEAT.x + D_REPEAT.width}
          y1={D_ROW2_Y + D_PILL_H / 2}
          x2={D_REPEAT.x + D_REPEAT.width}
          y2={D_ROW2_Y + D_PILL_H / 2}
          stroke="var(--color-blue-light)"
          strokeWidth={1}
          strokeDasharray="3 3"
          data-x2-final={D_CHECK.x - 2}
        />
        <Arrowhead tip={D_CHECK.x - 3} cross={D_ROW2_Y + D_PILL_H / 2} direction="right" id="desktop-repeat-check" color="var(--color-blue-light)" />

        <LookupBox x={D_CHECK.x} y={D_CHECK.y} width={D_CHECK.width} height={D_CHECK.height} label="STATUS: ALREADY CONFIRMED" />

        <line
          data-line-check-ghost
          data-axis="y"
          x1={D_CHECK.x + D_CHECK.width / 2}
          y1={D_CHECK.y + D_CHECK.height}
          x2={D_CHECK.x + D_CHECK.width / 2}
          y2={D_CHECK.y + D_CHECK.height}
          stroke="var(--color-brand)"
          strokeWidth={1}
          strokeDasharray="2 2"
          data-y2-final={D_GHOST_Y - 2}
        />
        <GhostPending x={D_GHOST_X} y={D_GHOST_Y} width={D_GHOST.width} height={D_GHOST.height} />

        <line
          data-line-check-conf-1
          data-axis="x"
          x1={D_CHECK.x + D_CHECK.width}
          y1={D_ROW2_Y + D_PILL_H / 2}
          x2={D_CHECK.x + D_CHECK.width}
          y2={D_ROW2_Y + D_PILL_H / 2}
          stroke="var(--color-blue-light)"
          strokeWidth={1}
          strokeDasharray="3 3"
          data-x2-final={D_BEND_X}
        />
        <line
          data-line-check-conf-2
          data-axis="y"
          x1={D_BEND_X}
          y1={D_ROW2_Y + D_PILL_H / 2}
          x2={D_BEND_X}
          y2={D_ROW2_Y + D_PILL_H / 2}
          stroke="var(--color-blue-light)"
          strokeWidth={1}
          strokeDasharray="3 3"
          data-y2-final={D_ROW1_Y + D_PILL_H + 2}
        />
        <Arrowhead tip={D_ROW1_Y + D_PILL_H + 1} cross={D_BEND_X} direction="up" id="desktop-check-conf" color="var(--color-blue-light)" />
      </svg>

      <svg data-viewport="mobile" viewBox={M_VIEWBOX} className="h-auto w-full sm:hidden" aria-hidden="true">
        <StatePill id="signup" x={M_X} y={M_SIGNUP_Y} width={M_PILL_W} height={M_PILL_H} label="SIGN-UP" fontScale={M_FONT_SCALE} />
        <line
          data-line-su-pe
          data-axis="y"
          x1={M_X + M_PILL_W / 2}
          y1={M_SIGNUP_Y + M_PILL_H}
          x2={M_X + M_PILL_W / 2}
          y2={M_SIGNUP_Y + M_PILL_H}
          stroke="var(--color-text-faint)"
          strokeWidth={1.5}
          data-y2-final={M_PENDING_Y - 2}
        />
        <Arrowhead tip={M_PENDING_Y - 3} cross={M_X + M_PILL_W / 2} direction="down" id="mobile-su-pe" color="var(--color-text-faint)" />

        <StatePill id="pending" x={M_X} y={M_PENDING_Y} width={M_PILL_W} height={M_PILL_H} label="PENDING" fontScale={M_FONT_SCALE} />
        <line
          data-line-pe-tok
          data-axis="y"
          x1={M_X + M_PILL_W / 2}
          y1={M_PENDING_Y + M_PILL_H}
          x2={M_X + M_PILL_W / 2}
          y2={M_PENDING_Y + M_PILL_H}
          stroke="var(--color-blue-light)"
          strokeWidth={1.25}
          strokeDasharray="3 3"
          data-y2-final={M_TOKEN.y - 2}
        />
        <Arrowhead tip={M_TOKEN.y - 3} cross={M_X + M_PILL_W / 2} direction="down" id="mobile-pe-tok" color="var(--color-blue-light)" />

        <TokenChip x={M_X} y={M_TOKEN.y} width={M_TOKEN.width} height={M_TOKEN.height} fontScale={M_FONT_SCALE} />
        <CountdownRing cx={M_RING.cx} cy={M_RING.cy} r={M_RING.r} fontScale={M_FONT_SCALE} />
        <line
          data-line-tok-conf
          data-axis="y"
          x1={M_X + M_PILL_W / 2}
          y1={M_TOKEN.y + M_TOKEN.height}
          x2={M_X + M_PILL_W / 2}
          y2={M_TOKEN.y + M_TOKEN.height}
          stroke="var(--color-blue-light)"
          strokeWidth={1.25}
          strokeDasharray="3 3"
          data-y2-final={M_CONFIRMED_Y - 2}
        />
        <Arrowhead tip={M_CONFIRMED_Y - 3} cross={M_X + M_PILL_W / 2} direction="down" id="mobile-tok-conf" color="var(--color-blue-light)" />

        <StatePill id="confirmed" x={M_X} y={M_CONFIRMED_Y} width={M_PILL_W} height={M_PILL_H} label="CONFIRMED" withCheck fontScale={M_FONT_SCALE} />

        <line
          data-line-repeat-check
          data-axis="y"
          x1={M_X + M_PILL_W / 2}
          y1={M_REPEAT_Y}
          x2={M_X + M_PILL_W / 2}
          y2={M_REPEAT_Y}
          stroke="var(--color-blue-light)"
          strokeWidth={1.25}
          strokeDasharray="3 3"
          data-y2-final={M_CHECK.y + M_CHECK.height + 2}
        />
        <Arrowhead tip={M_CHECK.y + M_CHECK.height + 1} cross={M_X + M_PILL_W / 2} direction="up" id="mobile-repeat-check" color="var(--color-blue-light)" />

        <LookupBox x={M_CHECK.x} y={M_CHECK.y} width={M_CHECK.width} height={M_CHECK.height} label="STATUS: ALREADY CONFIRMED" fontScale={M_FONT_SCALE} />

        <line
          data-line-check-ghost
          data-axis="x"
          x1={M_CHECK.x + M_CHECK.width}
          y1={M_GHOST_Y + M_GHOST.height / 2}
          x2={M_CHECK.x + M_CHECK.width}
          y2={M_GHOST_Y + M_GHOST.height / 2}
          stroke="var(--color-brand)"
          strokeWidth={1}
          strokeDasharray="2 2"
          data-x2-final={M_GHOST_X - 2}
        />
        <GhostPending x={M_GHOST_X} y={M_GHOST_Y} width={M_GHOST.width} height={M_GHOST.height} fontScale={M_FONT_SCALE} />

        <line
          data-line-check-conf
          data-axis="y"
          x1={M_X + M_PILL_W / 2}
          y1={M_CHECK.y}
          x2={M_X + M_PILL_W / 2}
          y2={M_CHECK.y}
          stroke="var(--color-blue-light)"
          strokeWidth={1.25}
          strokeDasharray="3 3"
          data-y2-final={M_CONFIRMED_Y + M_PILL_H + 2}
        />
        <Arrowhead tip={M_CONFIRMED_Y + M_PILL_H + 1} cross={M_X + M_PILL_W / 2} direction="up" id="mobile-check-conf" color="var(--color-blue-light)" />

        <StatePill id="repeat" x={M_X} y={M_REPEAT_Y} width={M_PILL_W} height={M_PILL_H} label="REPEAT VISIT" fontScale={M_FONT_SCALE} />
      </svg>

      <PauseButton paused={paused} onClick={toggle} label="animation" className="absolute right-4 bottom-4" />
    </div>
  );
}
