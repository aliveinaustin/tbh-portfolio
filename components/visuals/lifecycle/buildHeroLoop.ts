// components/visuals/lifecycle/buildHeroLoop.ts
//
// The hero "Flow map"'s ambient loop. Unlike the card, nothing here has
// beats or a settle-then-reset pass — the whole system sits fully labelled
// and in its resting layout for the entire loop. Two independent motion
// layers run on top of that static map:
//
//  1. Ambient packets: a small pool of dots per connector, continuously
//     relaunched for the whole loop — always `--blue-light`, position only.
//  2. The pathway trace: every ~3s, one pathway (Website → Application →
//     Legacy, repeating) turns `--brand` red end to end — its icon, its
//     source→table connector, its table border, its table→master
//     connector, the (always-on) master→email connector and the email
//     frame border — while a single shared red dot sweeps the same route,
//     then both fade back to baseline before the next pathway's window.
//
// Every color property here returns to its exact JSX-authored baseline
// value by the end of each pathway's window, so the timeline loops clean
// with no separate reset-on-repeat pass needed (contrast buildConvergenceBeats.ts,
// which has real accumulated state to undo every loop).

import { gsap } from "@/lib/motion/gsap";
import { colorVar } from "@/lib/motion/tokens";
import { PATHWAYS, type PathwayId } from "@/components/visuals/lifecycle/layout";

type Viewport = "desktop" | "mobile";
const VIEWPORTS: Viewport[] = ["desktop", "mobile"];

function qa<T extends Element>(scope: ParentNode, selector: string): T[] {
  return gsap.utils.toArray<T>(selector, scope);
}

function qv<T extends Element>(scope: ParentNode, viewport: Viewport, selector: string): T[] {
  const scoped = selector
    .split(",")
    .map((clause) => `[data-viewport="${viewport}"] ${clause.trim()}`)
    .join(", ");
  return gsap.utils.toArray<T>(scoped, scope);
}

function attr(el: Element, name: string): number {
  return Number(el.getAttribute(name));
}

const PATHWAY_WINDOW = 3;
export const HERO_LOOP_DURATION = PATHWAYS.length * PATHWAY_WINDOW;

/** Continuously relaunches a small pool of packets along one connector
 * line, reading its real endpoints live (every connector here is static,
 * but several are genuinely diagonal — the tables never slide to align
 * with master the way the card's do) rather than assuming an axis. */
function flowPackets(tl: gsap.core.Timeline, scope: ParentNode, lineSelector: string, packetSelector: string) {
  VIEWPORTS.forEach((vp) => {
    const line = qv<SVGLineElement>(scope, vp, lineSelector)[0];
    const packets = qv<SVGCircleElement>(scope, vp, packetSelector);
    if (!line || packets.length === 0) return;
    const x1 = attr(line, "x1");
    const y1 = attr(line, "y1");
    const x2 = attr(line, "x2");
    const y2 = attr(line, "y2");
    const travel = 0.55;
    const interval = 0.8;
    let flight = 0;
    for (let t = 0.1 + (vp === "mobile" ? 0.2 : 0); t < HERO_LOOP_DURATION - travel; t += interval, flight++) {
      const packet = packets[flight % packets.length];
      tl.fromTo(packet, { cx: x1, cy: y1, opacity: 0 }, { cx: x2, cy: y2, opacity: 1, duration: travel, ease: "none" }, t).to(
        packet,
        { opacity: 0, duration: 0.15 },
        `>-0.1`
      );
    }
  });
}

/** One pathway's ~3s window: the color pulse on its chain of elements, plus
 * the single shared trace dot sweeping icon → table → master → email. */
function tracePathway(tl: gsap.core.Timeline, scope: ParentNode, pathway: PathwayId, windowStart: number) {
  const brand = colorVar("brand");
  const grey = colorVar("text-faint");
  const blueLight = colorVar("blue-light");
  const white = colorVar("text");

  const icon = qa(scope, `[data-hero-source="${pathway}"]`);
  const label = qa(scope, `[data-hero-source-label="${pathway}"]`);
  const connST = qa(scope, `[data-hero-connector-st="${pathway}"]`);
  const tableFrame = qa(scope, `[data-hero-table="${pathway}"] [data-table-frame]`);
  const connTM = qa(scope, `[data-hero-connector-tm="${pathway}"]`);
  const connME = qa(scope, "[data-hero-connector-me]");
  const emailFrame = qa(scope, "[data-hero-email] [data-email-frame]");

  tl.to(icon, { stroke: brand, duration: 0.2 }, windowStart)
    .to(label, { fill: white, duration: 0.2 }, windowStart)
    .to(connST, { stroke: brand, strokeDasharray: "0 0", opacity: 1, duration: 0.2 }, windowStart)
    .to(tableFrame, { stroke: brand, duration: 0.2 }, windowStart + 0.5)
    .to(connTM, { stroke: brand, strokeDasharray: "0 0", duration: 0.2 }, windowStart + 0.5)
    .to(connME, { stroke: brand, strokeDasharray: "0 0", duration: 0.2 }, windowStart + 1.0)
    .to(emailFrame, { stroke: brand, duration: 0.2 }, windowStart + 1.0);

  const fadeBack = windowStart + 2.5;
  tl.to(icon, { stroke: grey, duration: 0.3 }, fadeBack)
    .to(label, { fill: grey, duration: 0.3 }, fadeBack)
    .to(connST, { stroke: grey, strokeDasharray: "2 2", opacity: 0.6, duration: 0.3 }, fadeBack)
    .to(tableFrame, { stroke: grey, duration: 0.3 }, fadeBack)
    .to(connTM, { stroke: blueLight, strokeDasharray: "2 2", duration: 0.3 }, fadeBack)
    .to(connME, { stroke: blueLight, strokeDasharray: "2 2", duration: 0.3 }, fadeBack)
    .to(emailFrame, { stroke: grey, duration: 0.3 }, fadeBack);

  VIEWPORTS.forEach((vp) => {
    const trace = qv<SVGCircleElement>(scope, vp, "[data-hero-trace]")[0];
    const stLine = qv<SVGLineElement>(scope, vp, `[data-hero-connector-st="${pathway}"]`)[0];
    const tmLine = qv<SVGLineElement>(scope, vp, `[data-hero-connector-tm="${pathway}"]`)[0];
    const meLine = qv<SVGLineElement>(scope, vp, "[data-hero-connector-me]")[0];
    if (!trace || !stLine || !tmLine || !meLine) return;

    tl.set(trace, { cx: attr(stLine, "x1"), cy: attr(stLine, "y1"), opacity: 0 }, windowStart)
      .to(trace, { opacity: 1, duration: 0.1 }, windowStart)
      .to(trace, { cx: attr(stLine, "x2"), cy: attr(stLine, "y2"), duration: 0.35, ease: "none" }, windowStart + 0.1)
      .set(trace, { cx: attr(tmLine, "x1"), cy: attr(tmLine, "y1") }, windowStart + 0.5)
      .to(trace, { cx: attr(tmLine, "x2"), cy: attr(tmLine, "y2"), duration: 0.45, ease: "none" }, windowStart + 0.5)
      .set(trace, { cx: attr(meLine, "x1"), cy: attr(meLine, "y1") }, windowStart + 1.0)
      .to(trace, { cx: attr(meLine, "x2"), cy: attr(meLine, "y2"), duration: 0.5, ease: "none" }, windowStart + 1.0)
      .to(trace, { opacity: 0, duration: 0.2 }, windowStart + 1.6);
  });
}

/** The master record's key column: a staggered fill from grey to blue (top
 * row to bottom), a beat to read it, then back to grey and a pause before
 * repeating — a separate, independently-looping timeline (its own
 * `repeat: -1, repeatDelay`), not nested inside the 9s pathway-trace `tl`,
 * since an infinitely-repeating child would make that timeline's own
 * duration infinite and stop it from ever wrapping back to Website. */
export function buildMasterKeyPulse(tl: gsap.core.Timeline, scope: ParentNode) {
  const grey = colorVar("text-faint");
  const blueLight = colorVar("blue-light");
  const blue = colorVar("blue");

  const header = qa(scope, "[data-key-col-header]");
  const rows = qa(scope, "[data-key-row]");

  // Reset to unfilled right at the start of every loop (including the
  // first) — a plain repeat would otherwise just replay ".to(...blue)"
  // from wherever the fill already sits (already blue after loop 1), which
  // is a no-op and never reads as "filling" again.
  tl.set([...header, ...rows], { fill: grey }, 0)
    .to(header, { fill: blueLight, duration: 0.2 }, 0.1)
    .to(rows, { fill: blue, duration: 0.2, stagger: 0.12 }, 0.2);

  return tl;
}

/** Salesforce's three status LEDs, cascading top → middle → bottom → top
 * forever — green (`--ok`, a server-status color, not blue "data in
 * motion"), same device the card uses during its Sync beat but here
 * ambient and continuous. Its own timeline for the same reason the key
 * pulse is: an infinite-repeat child can't live inside the finite,
 * also-repeating pathway-trace `tl`. */
export function buildSalesforceLeds(tl: gsap.core.Timeline, scope: ParentNode) {
  const on = colorVar("ok");
  const off = colorVar("text-faint");
  const step = 0.3;

  VIEWPORTS.forEach((vp) => {
    for (let i = 0; i < 3; i++) {
      const onLed = qv(scope, vp, `[data-led="${i}"]`);
      // The previous LED in the cascade turns off as this one turns on —
      // on the very first iteration that's LED 2, which is exactly where
      // the cascade left off at the end of the PRIOR loop, so the wrap is
      // seamless with no separate reset step needed.
      const offLed = qv(scope, vp, `[data-led="${(i + 2) % 3}"]`);
      tl.to(onLed, { fill: on, duration: 0.15 }, i * step).to(offLed, { fill: off, duration: 0.15 }, i * step);
    }
  });

  return tl;
}

/** Builds the full ambient loop onto `tl` — ~9s, repeat:-1 is set by the
 * caller. Driven once for both desktop and mobile `<svg>` trees. */
export function buildHeroLoop(tl: gsap.core.Timeline, scope: ParentNode) {
  PATHWAYS.forEach((p) => {
    flowPackets(tl, scope, `[data-hero-connector-st="${p.id}"]`, `[data-hero-packet-st="${p.id}-0"], [data-hero-packet-st="${p.id}-1"], [data-hero-packet-st="${p.id}-2"]`);
    flowPackets(tl, scope, `[data-hero-connector-tm="${p.id}"]`, `[data-hero-packet-tm="${p.id}-0"], [data-hero-packet-tm="${p.id}-1"]`);
  });
  flowPackets(tl, scope, "[data-hero-connector-ms]", "[data-hero-packet-ms]");
  flowPackets(tl, scope, "[data-hero-connector-me]", "[data-hero-packet-me]");

  PATHWAYS.forEach((p, i) => tracePathway(tl, scope, p.id, i * PATHWAY_WINDOW));

  // Pad to the full window so the last pathway's fade-back fully resolves
  // before the loop wraps back to Website.
  tl.to({}, { duration: 0.1 });

  return tl;
}

/** Reduced motion: the map static, Application highlighted end to end —
 * everything else (Website, Legacy, every ambient packet) just sits at its
 * JSX-authored baseline, which is already the "resting" look. */
export function applyHeroReducedState(scope: ParentNode) {
  const brand = colorVar("brand");
  const white = colorVar("text");
  const pathway: PathwayId = "application";

  gsap.set(qa(scope, `[data-hero-source="${pathway}"]`), { stroke: brand });
  gsap.set(qa(scope, `[data-hero-source-label="${pathway}"]`), { fill: white });
  gsap.set(qa(scope, `[data-hero-connector-st="${pathway}"]`), { stroke: brand, strokeDasharray: "0 0", opacity: 1 });
  gsap.set(qa(scope, `[data-hero-table="${pathway}"] [data-table-frame]`), { stroke: brand });
  gsap.set(qa(scope, `[data-hero-connector-tm="${pathway}"]`), { stroke: brand, strokeDasharray: "0 0" });
  gsap.set(qa(scope, "[data-hero-connector-me]"), { stroke: brand, strokeDasharray: "0 0" });
  gsap.set(qa(scope, "[data-hero-email] [data-email-frame]"), { stroke: brand });
}
