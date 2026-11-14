// components/visuals/lifecycle/buildConvergenceBeats.ts
//
// The Convergence card's five-beat timeline — Sources → Tables → Master →
// Sync → Personalize, ~11s total. Desktop and mobile share one timeline
// (same labels, same beat timing) but diverge wherever their geometry
// genuinely differs (packet travel axis, whether tables shrink at all),
// so those parts are built per-viewport via `qv()`; everything else
// (color/opacity-only tweens with no coordinates) is viewport-agnostic
// and built once via `qa()`, driving both `<svg>` trees together.

import { gsap } from "@/lib/motion/gsap";
import { colorVar, EASE } from "@/lib/motion/tokens";
import {
  PATHWAYS,
  SYNC_STEPS,
  type PathwayId,
  D_TABLE,
  D_TABLE_COVER_X,
  D_CONNECTOR_ST_X1,
  D_MASTER,
  D_MASTER_SYNC_SHIFT,
  D_BADGE_Y,
  D_SALESFORCE,
  D_SALESFORCE_SLIDE_OFFSET,
  D_EMAIL,
  M_BADGE_X,
  M_BADGE_Y,
  M_SOURCE_ROW_Y,
  M_SOURCE_SIZE,
  M_TABLE_ROW_Y,
  M_TABLE_MASTER_Y,
  M_MASTER_COMPACT,
  M_EMAIL,
} from "@/components/visuals/lifecycle/layout";

// How far right of its resting x the master record starts before sliding
// in — comfortably inside the (wider) 380-unit viewBox.
const MASTER_SLIDE_OFFSET = 90;

type Viewport = "desktop" | "mobile";
const VIEWPORTS: Viewport[] = ["desktop", "mobile"];

function qa<T extends Element>(scope: ParentNode, selector: string): T[] {
  return gsap.utils.toArray<T>(selector, scope);
}

function qv<T extends Element>(scope: ParentNode, viewport: Viewport, selector: string): T[] {
  // `selector` may itself be a comma-separated list (e.g. pulseSource's
  // three packet indices) — prefix every clause, not just the first, or
  // the un-prefixed clauses match both viewports' elements at once.
  const scoped = selector
    .split(",")
    .map((clause) => `[data-viewport="${viewport}"] ${clause.trim()}`)
    .join(", ");
  return gsap.utils.toArray<T>(scoped, scope);
}

const GREETING_TEXT = "Hi, Sam";

/** Every element's starting state — plain gsap.set(), not part of the
 * recorded timeline, so the loop seam never depends on how GSAP
 * interpolates a tween whose start hasn't been reached yet in the new
 * cycle (see the modular-email study's padding/tokens visuals for why
 * that ambiguity matters). Called once before the timeline is built and
 * again on every repeat. */
export function resetConvergence(scope: ParentNode) {
  const grey = colorVar("text-faint");

  gsap.set(qa(scope, "[data-source]"), { stroke: grey, opacity: 1 });
  gsap.set(qa(scope, "[data-source-label]"), { fill: grey, opacity: 1 });
  // Scoped to a `[data-table]` ancestor — the three pathway tables, not
  // the master record's own DataTable, which renders the same
  // `data-table-frame`/`data-table-content` elements but lives inside
  // `[data-master]` and should always start fully revealed. text-faint at
  // 0.65 (not border-dim at 0.5) — the ghost cells were hard to make out,
  // especially at mobile's smaller size; matches DataTable's own default.
  gsap.set(qa(scope, "[data-table] [data-table-frame]"), { stroke: grey, strokeDasharray: "3 3", opacity: 0.65 });
  gsap.set(qa(scope, "[data-table] [data-table-content]"), { opacity: 0 });
  // The wrapper's own opacity (not just its frame/content) — mobile fades
  // the whole table out at the start of Sync (see buildConvergenceBeats),
  // which otherwise carries into the next loop and never comes back.
  gsap.set(qa(scope, "[data-table]"), { opacity: 1 });
  gsap.set(qa(scope, "[data-connector-tm], [data-connector-ms]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-packet-st], [data-packet-ms], [data-packet-me]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-pref-chip], [data-id-badge], [data-at-badge], [data-key-icon]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-master], [data-master-compact], [data-salesforce], [data-email], [data-pref-block]"), { opacity: 0 });
  // Desktop's master record starts off to the right and slides in during
  // beat 3; mobile's doesn't move, only fades, so it's reset separately.
  gsap.set(qv(scope, "desktop", "[data-master]"), { x: MASTER_SLIDE_OFFSET });
  gsap.set(qv(scope, "mobile", "[data-master]"), { x: 0 });
  // Master's key column starts looking like any other column — it only
  // turns blue row by row as each pathway's PREF chip lands. Mobile is
  // scoped to `[data-master]` specifically (beat 3's large version) —
  // `[data-master-compact]` renders the exact same `data-key-row`
  // attributes (same DataTable primitive, keyColumn on), and an
  // unscoped selector would reset/animate both at once.
  gsap.set(qa(scope, "[data-master] [data-key-col-header]"), { fill: colorVar("text") });
  gsap.set(qa(scope, "[data-master] [data-key-row]"), { fill: grey });
  // Desktop's Salesforce starts off to the right too — it slides in as
  // master slides further left at the start of the Sync beat; mobile's
  // just fades in place, so it's reset separately.
  gsap.set(qv(scope, "desktop", "[data-salesforce]"), { x: D_SALESFORCE_SLIDE_OFFSET });
  gsap.set(qv(scope, "mobile", "[data-salesforce]"), { x: 0 });
  gsap.set(qa(scope, "[data-sync-group]"), { opacity: 0, y: 8 });
  gsap.set(qa(scope, "[data-sync-box]"), { stroke: grey, strokeDasharray: "3 3", opacity: 0.6 });
  gsap.set(qa(scope, "[data-sync-check]"), { opacity: 0 });
  // Desktop's Salesforce LEDs reset to off; mobile's just sit static grey
  // (its cascade isn't built out yet).
  gsap.set(qv(scope, "desktop", "[data-led]"), { fill: grey });
  // Beat-1 connector fades to 0 in beat 3 (see convergeTable) and is
  // otherwise only re-shown by the "clear" phase's animated fade — this
  // is the baseline safety net for it between loops, both viewports.
  gsap.set(qa(scope, "[data-connector-st]"), { opacity: 0.6 });
  gsap.set(qa(scope, "[data-mobile-sync-label]"), { opacity: 0 });

  const greetings = qa<SVGTextElement>(scope, "[data-greeting]");
  greetings.forEach((g) => (g.textContent = ""));
  const syncLabels = qa<SVGTextElement>(scope, "[data-mobile-sync-label]");
  syncLabels.forEach((g) => (g.textContent = ""));

  VIEWPORTS.forEach((vp) => {
    const tables = qv<SVGGElement>(scope, vp, "[data-table]");
    gsap.set(tables, { x: 0, y: 0, scale: 1, transformOrigin: "0% 0%" });
  });
}

/** Lights one pathway's source icon red and sends a short trail of
 * packets along its connector into the table. Desktop travels along x
 * (cy is already fixed in the JSX); mobile travels along y (cx fixed). */
function pulseSource(tl: gsap.core.Timeline, scope: ParentNode, pathway: PathwayId, labelOffset: number) {
  // Always relative to "sources" by a plain number — never a pre-built
  // "sources+=X" string — so the per-packet stagger below can add its
  // own offset with arithmetic instead of string concatenation (which
  // silently produces an invalid double "+=" position for every pathway
  // after the first).
  const position = labelOffset === 0 ? "sources" : `sources+=${labelOffset}`;
  const brand = colorVar("brand");
  const white = colorVar("text");
  const grey = colorVar("text-faint");
  const source = qa(scope, `[data-source="${pathway}"]`);
  const label = qa(scope, `[data-source-label="${pathway}"]`);

  // Icon turns brand-red (the active-pathway color); the label turns
  // white (a value being read, not an error state) rather than doubling
  // the red onto two overlapping elements.
  tl.to(source, { stroke: brand, duration: 0.15 }, position)
    .to(label, { fill: white, duration: 0.15 }, "<")
    .to(source, { stroke: grey, duration: 0.3 }, "+=0.35")
    .to(label, { fill: grey, duration: 0.3 }, "<");

  VIEWPORTS.forEach((vp) => {
    const packets = qv<SVGCircleElement>(scope, vp, `[data-packet-st="${pathway}-0"], [data-packet-st="${pathway}-1"], [data-packet-st="${pathway}-2"]`);
    if (packets.length === 0) return;
    const axis = vp === "desktop" ? "cx" : "cy";
    const from = vp === "desktop" ? D_CONNECTOR_ST_X1[pathway] : M_SOURCE_ROW_Y + M_SOURCE_SIZE + 3;
    const to = vp === "desktop" ? D_TABLE.x - 3 : M_TABLE_ROW_Y - 3;
    packets.forEach((packet, i) => {
      tl.fromTo(packet, { [axis]: from, opacity: 0 }, { [axis]: to, opacity: 1, duration: 0.45, ease: "none" }, `sources+=${labelOffset + 0.1 + i * 0.13}`).to(
        packet,
        { opacity: 0, duration: 0.15 },
        ">-0.1"
      );
    });
  });
}

/** The moment, relative to a pulseSource call's own `position`, that its
 * first packet actually touches the table — the cue the table's reveal
 * should be chained to, rather than a separately-staggered beat. */
const PACKET_ARRIVAL_OFFSET = 0.1 + 0.45;

/** Reveals one pathway's table — the ghost frame resolves to solid and
 * its header/body bars fade in — at `position`. */
function revealTable(tl: gsap.core.Timeline, scope: ParentNode, pathway: PathwayId, position: string | number) {
  const grey = colorVar("text-faint");
  const frame = qa(scope, `[data-table="${pathway}"] [data-table-frame]`);
  const content = qa(scope, `[data-table="${pathway}"] [data-table-content]`);
  tl.to(frame, { stroke: grey, strokeDasharray: "0 0", opacity: 1, duration: 0.35 }, position).to(content, { opacity: 1, duration: 0.35 }, "<+=0.1");
}

/** Translates one pathway's table left — full size, no scale — until it
 * covers its own source icon/label (desktop only; mobile's tables are
 * already small and stay put), and reveals the now-static table→master
 * connector alongside it. The connector's endpoints are fixed in the
 * JSX at their final positions, so revealing it here is just an opacity
 * tween — it doesn't move again once the table/master settle. */
function convergeTable(tl: gsap.core.Timeline, scope: ParentNode, pathway: PathwayId, labelOffset: number) {
  // Built from a plain numeric offset (not a pre-formatted relative
  // string), matching flowPrefChip's own fix — one of the mobile tweens
  // below needs to add its own small delay on top of this, and
  // concatenating onto an already-relative "master+=X" string produces
  // the same invalid double "+=" position that bug caused elsewhere.
  const position = labelOffset === 0 ? "master" : `master+=${labelOffset}`;

  const desktopTable = qv<SVGGElement>(scope, "desktop", `[data-table="${pathway}"]`);
  tl.to(desktopTable, { x: D_TABLE_COVER_X - D_TABLE.x, duration: 0.5, ease: EASE.enter }, position);
  tl.to(qv(scope, "desktop", `[data-connector-tm="${pathway}"]`), { opacity: 1, duration: 0.35 }, position);

  // Mobile: the table slides UP (not left) to the top of the frame once
  // the source row above it is gone — there's nothing to cover, so no
  // scale or x move needed, just room being vacated above it.
  const mobileTable = qv<SVGGElement>(scope, "mobile", `[data-table="${pathway}"]`);
  tl.to(mobileTable, { y: M_TABLE_MASTER_Y - M_TABLE_ROW_Y, duration: 0.4, ease: EASE.enter }, position);
  // Revealed slightly after the table's own move finishes, not at the
  // same instant — the connector's endpoints are fixed at the table's
  // FINAL (raised) position, so revealing it mid-move would show it
  // floating below the table until the move catches up.
  tl.to(qv(scope, "mobile", `[data-connector-tm="${pathway}"]`), { opacity: 1, duration: 0.3 }, `master+=${labelOffset + 0.3}`);
  tl.to(qv(scope, "mobile", `[data-source="${pathway}"], [data-source-label="${pathway}"]`), { opacity: 0, duration: 0.3 }, position);
  tl.to(qv(scope, "mobile", `[data-connector-st="${pathway}"]`), { opacity: 0, duration: 0.25 }, position);
  // Desktop only — the connector's near end tracks the table's trailing
  // edge as it slides (mobile's connector-tm has different geometry
  // since its tables never move), otherwise the dashed line is visible
  // cutting straight through the table's body while it's mid-slide.
  // immediateRender:false matters here — fromTo() otherwise renders its
  // FROM value onto the DOM the instant this line runs (at build time,
  // long before "position" is ever reached in playback), permanently
  // overwriting the JSX's resting x1 and corrupting flowPrefChip's later
  // live read of this same connector's endpoints.
  tl.fromTo(
    qv(scope, "desktop", `[data-connector-tm="${pathway}"]`),
    { attr: { x1: D_TABLE.x + D_TABLE.width + 2 } },
    { attr: { x1: D_TABLE_COVER_X + D_TABLE.width + 2 }, duration: 0.5, ease: EASE.enter, immediateRender: false },
    position
  );
  // The beat-1 source→table connector is now stale — its far end stays
  // anchored at the table's old (unshifted) position, so once the table
  // slides away it pokes out past the table's new, further-left edge.
  tl.to(qv(scope, "desktop", `[data-connector-st="${pathway}"]`), { opacity: 0, duration: 0.25 }, position);
  // The table only physically overlaps the source icon/label, it doesn't
  // guarantee full coverage — "APPLICATION" is wider than the table's own
  // covering span and its tail end would otherwise peek out from under
  // the table's right edge. Fade the source out explicitly instead of
  // relying on paint order alone.
  tl.to(qv(scope, "desktop", `[data-source="${pathway}"], [data-source-label="${pathway}"]`), { opacity: 0, duration: 0.3 }, position);
}

/** Slides the master record in from the right (desktop only) while
 * fading it in; mobile's master just fades in place. */
function slideInMaster(tl: gsap.core.Timeline, scope: ParentNode, position: string | number) {
  const desktopMaster = qv<SVGGElement>(scope, "desktop", "[data-master]");
  const mobileMaster = qv<SVGGElement>(scope, "mobile", "[data-master]");
  tl.to(desktopMaster, { x: 0, opacity: 1, duration: 0.6, ease: EASE.enter }, position);
  tl.to(mobileMaster, { opacity: 1, duration: 0.4 }, position);
}

/** Sends one pathway's PREF chip left-to-right along its (now static)
 * table→master connector, reading the connector's own real endpoints so
 * the chip's travel always matches wherever it actually points. */
function flowPrefChip(tl: gsap.core.Timeline, scope: ParentNode, pathway: PathwayId, baseOffset: number) {
  // Built from a plain numeric offset (not a pre-formatted relative
  // string) specifically so the arrival position below can add the
  // travel duration with plain arithmetic — concatenating another "+="
  // onto an already-relative "master+=X" string silently produces an
  // invalid GSAP position ("master+=X+=Y") that gets misplaced.
  const position = `master+=${baseOffset}`;
  const travelDuration = 0.9;
  const arrival = `master+=${baseOffset + travelDuration}`;

  const chips = qa(scope, `[data-pref-chip="${pathway}"]`);
  tl.to(chips, { opacity: 1, duration: 0.15 }, position);

  VIEWPORTS.forEach((vp) => {
    const chip = qv<SVGGElement>(scope, vp, `[data-pref-chip="${pathway}"]`);
    const connector = qv<SVGLineElement>(scope, vp, `[data-connector-tm="${pathway}"]`)[0];
    if (chip.length === 0 || !connector) return;
    const x1 = Number(connector.getAttribute("x1"));
    const y1 = Number(connector.getAttribute("y1"));
    const x2 = Number(connector.getAttribute("x2"));
    const y2 = Number(connector.getAttribute("y2"));
    gsap.set(chip, { x: x1 - 12, y: y1 - 5 });
    tl.to(chip, { x: x2 - 12, y: y2 - 5, duration: travelDuration, ease: "none" }, position).to(chip, { opacity: 0, duration: 0.15 }, ">-0.1");
  });

  // Master's key column starts looking like any other column (see
  // resetConvergence) and only turns blue, row by row, the moment each
  // pathway's own chip actually lands — not before. Both viewports;
  // scoped to `[data-master]` so `[data-master-compact]`'s identical
  // attributes (same primitive) don't also get swept up.
  const rowIndex = PATHWAYS.findIndex((p) => p.id === pathway);
  tl.to(qa(scope, `[data-master] [data-key-row="${rowIndex}"]`), { fill: colorVar("blue"), duration: 0.25 }, arrival);
  if (rowIndex === 0) {
    tl.to(qa(scope, "[data-master] [data-key-col-header]"), { fill: colorVar("blue-light"), duration: 0.25 }, arrival);
  }
}

/** Builds the Convergence card's full five-beat timeline onto `tl`,
 * driving both the desktop and mobile `<svg>` trees at once. */
export function buildConvergenceBeats(tl: gsap.core.Timeline, scope: ParentNode) {
  const white = colorVar("text");
  const grey = colorVar("text-faint");

  // --- Beat 1 · Sources (0.0–2.0s) -----------------------------------------
  // Each table's reveal is chained to its OWN packet's arrival (not a
  // separately-staggered pass after all three have already landed) — the
  // dot hitting the table is what turns it white, pathway by pathway.
  tl.addLabel("sources", 0);
  PATHWAYS.forEach((p, i) => {
    const offset = i * 0.55;
    pulseSource(tl, scope, p.id, offset);
    revealTable(tl, scope, p.id, `sources+=${offset + PACKET_ARRIVAL_OFFSET}`);
  });

  // --- Beat 2 · Tables (2.0–4.2s) -------------------------------------------
  // Label kept for the UI's beat indicator, timed to when the last
  // pathway's own reveal actually fires above.
  tl.addLabel("tables", `sources+=${2 * 0.55 + PACKET_ARRIVAL_OFFSET}`);

  // --- Beat 3 · Master (4.2–6.4s) --------------------------------------------
  // Only two large elements on screen at once: the tables translate left
  // to cover their own source row, the master record slides in from the
  // right at the same time, and the (now static) connector between them
  // is revealed alongside — only once both have settled do the PREF
  // chips travel along it into master.
  tl.addLabel("master", "tables+=2.2");
  PATHWAYS.forEach((p, i) => convergeTable(tl, scope, p.id, i * 0.12));
  slideInMaster(tl, scope, "master");
  PATHWAYS.forEach((p, i) => flowPrefChip(tl, scope, p.id, 0.85 + i * 0.08));

  // Timed so there's an actual beat to read "ID"/"@" before they move —
  // fade-in and merge used to start at the same instant, so the badges
  // began sliding together while still barely visible.
  const BADGE_FADE_IN = 2.2;
  const BADGE_FADE_DURATION = 0.25;
  const BADGE_READ_HOLD = 1.1; // sit fully visible, separated, readable
  const BADGE_MERGE_START = BADGE_FADE_IN + BADGE_FADE_DURATION + BADGE_READ_HOLD;
  const BADGE_MERGE_DURATION = 0.4;
  const BADGE_MERGE_END = BADGE_MERGE_START + BADGE_MERGE_DURATION;
  const BADGE_FADEOUT_DURATION = 0.2;
  const BADGE_FADEOUT_END = BADGE_MERGE_END + BADGE_FADEOUT_DURATION;
  const KEY_POPIN_DURATION = 0.5;
  const KEY_POPIN_END = BADGE_FADEOUT_END + KEY_POPIN_DURATION;

  const idBadge = qa(scope, "[data-id-badge]");
  const atBadge = qa(scope, "[data-at-badge]");
  const keyIcon = qa(scope, "[data-key-icon]");
  tl.to(idBadge, { opacity: 1, duration: BADGE_FADE_DURATION }, `master+=${BADGE_FADE_IN}`).to(atBadge, { opacity: 1, duration: BADGE_FADE_DURATION }, "<");
  VIEWPORTS.forEach((vp) => {
    const id = qv<SVGGElement>(scope, vp, "[data-id-badge]")[0];
    const at = qv<SVGGElement>(scope, vp, "[data-at-badge]")[0];
    const key = qv<SVGGElement>(scope, vp, "[data-key-icon]")[0];
    if (!id || !at || !key) return;
    // The key glyph's own markup is now wrapped in a static outer <g
    // transform="translate(keyCx, keyCy)"> (see LifecycleConvergenceSvg),
    // drawn at local (0,0) — so this is just the same known layout
    // constant, not a DOM measurement, and the pop-in below can scale
    // around "0 0" with zero origin ambiguity.
    const keyCx = vp === "desktop" ? D_MASTER.x + D_MASTER.width / 2 : M_BADGE_X;
    const keyCy = vp === "desktop" ? D_BADGE_Y : M_BADGE_Y;
    gsap.set(id, { x: keyCx - 34, y: keyCy - 7 });
    gsap.set(at, { x: keyCx + 12, y: keyCy - 7 });
    // Both badges converge on the exact same point — a full overlap,
    // not a side-by-side landing — before they fade for the key.
    const mergeX = keyCx - 11;
    tl.to(id, { x: mergeX, duration: BADGE_MERGE_DURATION, ease: EASE.enter }, `master+=${BADGE_MERGE_START}`).to(
      at,
      { x: mergeX, duration: BADGE_MERGE_DURATION, ease: EASE.enter },
      "<"
    );

    // The key pops in only once the badges have fully faded out — not at
    // "<" (which, despite the intent, actually aligns with the MERGE
    // tween added right before this, since that's the most recently
    // inserted animation at this point in the code, not the fade-out
    // added later) — so without an explicit position here the two
    // visibly overlapped for a beat.
    // transformOrigin:"center" resolves against the element's own
    // getBBox() — KeyIcon's cx is now nudged +1.1 (see its own JSX) so
    // that bbox center lands exactly on the static wrapper's local (0,0),
    // which is what makes "center" land correctly here. A literal
    // "0px 0px" string resolves against the bbox's top-left corner for
    // SVG, not the coordinate-space origin, and left a small residual
    // drift during the tween.
    tl.fromTo(
      key,
      { opacity: 0, scale: 0.4, transformOrigin: "center" },
      { opacity: 1, scale: 1, duration: KEY_POPIN_DURATION, ease: "back.out(2.2)", immediateRender: false },
      `master+=${BADGE_FADEOUT_END}`
    );
  });
  tl.to([idBadge, atBadge], { opacity: 0, duration: BADGE_FADEOUT_DURATION }, `master+=${BADGE_MERGE_END}`);

  // --- Beat 4 · Sync (6.4–~10.9s) ----------------------------------------------
  // Master slides further left (desktop), trailing a dashed connector
  // whose far end "pulls" Salesforce in from the right — both ends of
  // that connector move in lockstep with the two slides. Once Salesforce
  // settles, the status bar rises in, and the six steps get a full,
  // unhurried pass before Salesforce — not fading prematurely — a brief
  // pause after LOGGING, and only then the swap to email.
  // "sync" has to sit far enough past the key's own pop-in (which doesn't
  // finish until KEY_POPIN_END) for the fade-out below to get a clean,
  // non-overlapping window; otherwise the two tweens fight over the same
  // opacity property and whichever one's window ends LATER wins outright,
  // leaving the key stuck visible (the pop-in, previously).
  tl.addLabel("sync", `master+=${KEY_POPIN_END + 0.35}`);

  // The key icon has nothing left under it once master slides away —
  // fade it out just ahead of that slide rather than leaving it
  // stranded in empty space.
  tl.to(keyIcon, { opacity: 0, duration: 0.3 }, "sync-=0.3");

  const desktopMasterSync = qv<SVGGElement>(scope, "desktop", "[data-master]");
  tl.to(desktopMasterSync, { x: D_MASTER_SYNC_SHIFT, duration: 0.6, ease: EASE.enter }, "sync");

  // Mobile: beat 3's full-width master crossfades to the compact
  // left-column version that beats 4-5 share — a separate element, not a
  // resize, so neither one's strokes/corners get distorted.
  tl.to(qv(scope, "mobile", "[data-master]"), { opacity: 0, duration: 0.3 }, "sync");
  tl.to(qv(scope, "mobile", "[data-master-compact]"), { opacity: 1, duration: 0.4 }, "sync+=0.1");
  // Mobile's beat 3 tables/badges/connectors have nowhere left to live
  // once the frame switches to the two-column sync layout — unlike
  // desktop, which keeps its tables visible as a standing backdrop for
  // the rest of the card, mobile's comp drops them entirely from here on.
  tl.to(qv(scope, "mobile", "[data-table]"), { opacity: 0, duration: 0.3 }, "sync");
  tl.to(qv(scope, "mobile", "[data-connector-tm], [data-pref-chip]"), { opacity: 0, duration: 0.2 }, "sync");

  const desktopSalesforce = qv<SVGGElement>(scope, "desktop", "[data-salesforce]");
  const mobileSalesforce = qv<SVGGElement>(scope, "mobile", "[data-salesforce]");
  tl.to(desktopSalesforce, { x: 0, opacity: 1, duration: 0.6, ease: EASE.enter }, "sync");
  tl.to(mobileSalesforce, { opacity: 1, duration: 0.3 }, "sync");

  // Desktop's connector endpoints are themselves mid-animation (both the
  // master and Salesforce ends are sliding), computed from the known
  // start/settled positions directly; mobile's connector never moves, so
  // it's a plain opacity fade.
  const desktopConnectorMs = qv<SVGLineElement>(scope, "desktop", "[data-connector-ms]");
  tl.fromTo(
    desktopConnectorMs,
    { attr: { x1: D_MASTER.x + D_MASTER.width + 2, x2: D_SALESFORCE.x + D_SALESFORCE_SLIDE_OFFSET - 2 }, opacity: 0 },
    {
      attr: { x1: D_MASTER.x + D_MASTER_SYNC_SHIFT + D_MASTER.width + 2, x2: D_SALESFORCE.x - 2 },
      opacity: 1,
      duration: 0.6,
      ease: EASE.enter,
      immediateRender: false,
    },
    "sync"
  );
  tl.to(qv(scope, "mobile", "[data-connector-ms]"), { opacity: 1, duration: 0.3 }, "sync");

  // Status bar rises in (opacity + a small +Y settle) once Salesforce has
  // actually landed, not at the same moment it starts sliding in.
  const syncGroup = qa(scope, "[data-sync-group]");
  tl.fromTo(syncGroup, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: EASE.enter }, "sync+=0.6");

  // Timing is computed up front (not derived from the forEach below) so
  // the packet/LED loops, which need to know where to stop, don't have
  // to wait on it.
  const SYNC_STEP_START = 1.1;
  const SYNC_STEP_GAP = 0.45;
  const STEP_PULSE = 0.2; // one half of the in-progress pill's yoyo pulse
  const STEP_TOTAL = 0.2 + STEP_PULSE * 2 + 0.2; // reveal + full pulse + settle-to-white
  const lastStepDone = SYNC_STEP_START + (SYNC_STEPS.length - 1) * SYNC_STEP_GAP + STEP_TOTAL;
  const swapStart = lastStepDone + 0.6; // a beat to sit on LOGGING before the swap

  // A packet repeats along the master↔Salesforce connector for as long
  // as data is actively syncing — not a one-off pulse — stopping with
  // enough lead time for the last flight to land before the fade-out.
  const msY = D_SALESFORCE.y + D_SALESFORCE.height / 2;
  const msX1 = D_MASTER.x + D_MASTER_SYNC_SHIFT + D_MASTER.width + 2;
  const msX2 = D_SALESFORCE.x - 2;
  const desktopMsPackets = qv<SVGCircleElement>(scope, "desktop", "[data-packet-ms]");
  const packetCascadeEnd = swapStart - 0.7;
  for (let t = 0.7, flight = 0; t < packetCascadeEnd; t += 0.5, flight++) {
    const packet = desktopMsPackets[flight % desktopMsPackets.length];
    if (!packet) break;
    tl.fromTo(packet, { cx: msX1, cy: msY, opacity: 0 }, { cx: msX2, cy: msY, opacity: 1, duration: 0.5, ease: "none" }, `sync+=${t}`).to(
      packet,
      { opacity: 0, duration: 0.15 },
      ">-0.1"
    );
  }
  // Mobile's connector never moves, so a single live-read pulse (not a
  // repeating one — its cascade isn't built out yet) is enough for now.
  const mobileMsConnector = qv<SVGLineElement>(scope, "mobile", "[data-connector-ms]")[0];
  const mobileMsPackets = qv<SVGCircleElement>(scope, "mobile", "[data-packet-ms]");
  if (mobileMsConnector && mobileMsPackets.length > 0) {
    const x1 = Number(mobileMsConnector.getAttribute("x1"));
    const y1 = Number(mobileMsConnector.getAttribute("y1"));
    const x2 = Number(mobileMsConnector.getAttribute("x2"));
    const y2 = Number(mobileMsConnector.getAttribute("y2"));
    mobileMsPackets.forEach((packet, i) => {
      tl.fromTo(packet, { cx: x1, cy: y1, opacity: 0 }, { cx: x2, cy: y2, opacity: 1, duration: 0.5, ease: "none" }, `sync+=${0.7 + i * 0.25}`).to(
        packet,
        { opacity: 0, duration: 0.15 },
        ">-0.1"
      );
    });
  }

  // Salesforce's three LEDs cascade top→middle→bottom→top, the previous
  // one blinking off as the next blinks on, for the same window the
  // packets are flowing. Green (--ok), not blue — these read as a server
  // status light, not as data-in-motion (which is what blue means
  // everywhere else in this system).
  const ledOn = colorVar("ok");
  const ledCascadeEnd = swapStart - 0.6;
  let lastLedIndex = 0;
  let lastLedOnTime = 0.7;
  for (let t = 0.7, i = 0; t < ledCascadeEnd; t += 0.3, i++) {
    const onLed = qv(scope, "desktop", `[data-led="${i % 3}"]`);
    const offLed = qv(scope, "desktop", `[data-led="${(i + 2) % 3}"]`);
    tl.to(onLed, { fill: ledOn, duration: 0.15 }, `sync+=${t}`);
    tl.to(offLed, { fill: grey, duration: 0.15 }, `sync+=${t}`);
    lastLedIndex = i % 3;
    lastLedOnTime = t;
  }
  // The loop above only ever turns an LED OFF as part of lighting the
  // NEXT one — there's no trailing iteration after the last "on", so
  // without this the final LED in the cascade stayed lit for the rest of
  // the beat instead of blinking off like every other one did.
  tl.to(qv(scope, "desktop", `[data-led="${lastLedIndex}"]`), { fill: grey, duration: 0.15 }, `sync+=${lastLedOnTime + 0.3}`);

  // Six steps, starting after the status bar has risen in. The
  // in-progress state is a blue-tint pulse, not red — red stays reserved
  // for failure elsewhere in this study (the layer-rollout decision
  // visual), so reusing it here for "currently running" would give the
  // same color two meanings.
  const blueLight = colorVar("blue-light");
  const mobileSyncLabel = qa<SVGTextElement>(scope, "[data-mobile-sync-label]");
  SYNC_STEPS.forEach((step, i) => {
    const box = qa(scope, `[data-sync-box="${step}"]`);
    const check = qa(scope, `[data-sync-check="${step}"]`);
    const position = `sync+=${SYNC_STEP_START + i * SYNC_STEP_GAP}`;
    tl.to(box, { stroke: blueLight, strokeDasharray: "0 0", opacity: 1, duration: 0.2 }, position)
      .to(box, { opacity: 0.55, duration: STEP_PULSE, ease: "sine.inOut", yoyo: true, repeat: 1 }, ">")
      .to(box, { stroke: white, opacity: 1, duration: 0.2 }, ">")
      .to(check, { opacity: 1, duration: 0.2 }, "<");
    // Mobile shows only the current step's name (there's no room for six
    // labels under a six-box single row), updated via a plain text swap
    // right as that step starts — no need to type it out character by
    // character, it just needs to be legible before the next one lands.
    tl.set(mobileSyncLabel, { opacity: 1 }, position).call(
      () => mobileSyncLabel.forEach((el) => (el.textContent = `STEP ${i + 1} OF ${SYNC_STEPS.length} · ${step}`)),
      undefined,
      position
    );
  });

  // Explicit fade-out ahead of the swap — not left to the loop-end
  // "clear" pass — so Salesforce and the status bar are still fully
  // visible through LOGGING instead of getting clipped by email fading
  // in over them. The master↔Salesforce connector is deliberately NOT
  // included — it's the same line that continues on into Personalize
  // (see below), not something that fades out and gets replaced.
  tl.to(qa(scope, "[data-salesforce], [data-sync-group], [data-mobile-sync-label]"), { opacity: 0, duration: 0.4 }, `sync+=${swapStart}`);

  // --- Beat 5 · Personalize ----------------------------------------------------
  tl.addLabel("personalize", `sync+=${swapStart + 0.5}`);
  const email = qa(scope, "[data-email]");
  const prefBlock = qa(scope, "[data-pref-block]");
  tl.to(email, { opacity: 1, duration: 0.3 }, "personalize");

  // Retarget the SAME connector's far end from Salesforce's edge to
  // email's edge — both sit at master's own center height, so this is a
  // straight horizontal move, not a new line appearing at a different
  // slope where the old one used to be.
  tl.to(desktopConnectorMs, { attr: { x2: D_EMAIL.x - 2 }, duration: 0.5, ease: EASE.enter }, "personalize");

  // Packet-me travels along that same retargeted line, using the known
  // coordinates directly (the connector's own x2 is itself mid-tween at
  // this exact moment, so a live read here would catch it mid-flight).
  const meY = D_MASTER.y + D_MASTER.height / 2;
  const meX1 = D_MASTER.x + D_MASTER_SYNC_SHIFT + D_MASTER.width + 2;
  const meX2 = D_EMAIL.x - 2;
  qv<SVGCircleElement>(scope, "desktop", "[data-packet-me]").forEach((packet) => {
    tl.fromTo(packet, { cx: meX1, cy: meY, opacity: 0 }, { cx: meX2, cy: meY, opacity: 1, duration: 0.5, ease: "none" }, "personalize+=0.1").to(
      packet,
      { opacity: 0, duration: 0.15 },
      ">-0.1"
    );
  });
  // Mobile: same persistent-connector retarget as desktop — master-
  // compact and Salesforce/email never move, so this is a plain x2
  // attribute change, not an animated slide.
  const mMeY = M_MASTER_COMPACT.y + M_MASTER_COMPACT.height / 2;
  const mMeX1 = M_MASTER_COMPACT.x + M_MASTER_COMPACT.width + 2;
  const mMeX2 = M_EMAIL.x - 2;
  tl.to(qv(scope, "mobile", "[data-connector-ms]"), { attr: { x2: mMeX2 }, duration: 0.4, ease: EASE.enter }, "personalize");
  qv<SVGCircleElement>(scope, "mobile", "[data-packet-me]").forEach((packet) => {
    tl.fromTo(packet, { cx: mMeX1, cy: mMeY, opacity: 0 }, { cx: mMeX2, cy: mMeY, opacity: 1, duration: 0.5, ease: "none" }, "personalize+=0.1").to(
      packet,
      { opacity: 0, duration: 0.15 },
      ">-0.1"
    );
  });

  const greetings = qa<SVGTextElement>(scope, "[data-greeting]");
  const typeState = { n: 0 };
  tl.to(
    typeState,
    {
      n: GREETING_TEXT.length,
      duration: 0.6,
      ease: "none",
      onUpdate: () => greetings.forEach((g) => (g.textContent = GREETING_TEXT.slice(0, Math.round(typeState.n)))),
    },
    "personalize+=0.5"
  );
  tl.to(prefBlock, { opacity: 1, duration: 0.3 }, "personalize+=1.3");
  tl.to({}, { duration: 0.6 });

  // --- Fade everything back to the reset state before the loop restarts ----
  tl.addLabel("clear");
  tl.to(qa(scope, "[data-master], [data-master-compact], [data-salesforce], [data-email], [data-pref-block]"), { opacity: 0, duration: 0.4 }, "clear")
    .to(qa(scope, "[data-sync-group]"), { opacity: 0, duration: 0.4 }, "<")
    .to(qa(scope, "[data-connector-ms], [data-connector-tm]"), { opacity: 0, duration: 0.3 }, "<")
    .to(qa(scope, "[data-key-icon]"), { opacity: 0, duration: 0.3 }, "<")
    .to(qa(scope, "[data-mobile-sync-label]"), { opacity: 0, duration: 0.3 }, "<")
    // Scoped to pathway tables only — see resetConvergence()'s comment;
    // master's own frame/content must stay "revealed" across loops, not
    // just fade with the rest of the master group this one time.
    .to(qa(scope, "[data-table] [data-table-content]"), { opacity: 0, duration: 0.3 }, "<")
    // An instant set, not a tween — the frame should already be at its
    // dim ghost color for the very first frame of the slide-back below,
    // not animate from its bright "revealed" look to dim WHILE also
    // sliding (that combination read as a brightness flash on arrival).
    // Matches resetConvergence's own ghost color exactly — a mismatch
    // here previously left a second, subtler color snap right at the
    // loop seam (one dim grey jumping to a slightly different dim grey).
    .set(qa(scope, "[data-table] [data-table-frame]"), { stroke: grey, strokeDasharray: "3 3", opacity: 0.65 }, "<")
    // Sources/labels/beat-1 connector (both viewports) were faded out
    // back in beat 3 (see convergeTable) and otherwise wouldn't reappear
    // until resetConvergence's instant onRepeat snap — bringing them back
    // here, in step with the tables sliding back, turns that abrupt pop
    // into a single smooth crossfade instead of "empty ghost tables
    // sitting alone, then a hard cut to everything at once."
    .to(qa(scope, "[data-source], [data-source-label]"), { opacity: 1, duration: 0.4 }, "<")
    .to(qa(scope, "[data-connector-st]"), { opacity: 0.6, duration: 0.4 }, "<")
    // Mobile's table wrapper (not just its frame/content) was faded to 0
    // back at the Sync beat — see buildConvergenceBeats' "sync" section —
    // and nothing else animates it back. Without this, resetConvergence's
    // own instant onRepeat snap is the only thing that ever restores it,
    // so the ghost boxes stay invisible through this whole fade-in and
    // then hard-pop in alongside "sources", instead of arriving with the
    // labels/connector like they do here.
    .to(qv(scope, "mobile", "[data-table]"), { opacity: 1, duration: 0.4 }, "<");
  VIEWPORTS.forEach((vp) => {
    const tables = qv<SVGGElement>(scope, vp, "[data-table]");
    tl.to(tables, { x: 0, y: 0, scale: 1, duration: 0.4 }, "<");
  });
  tl.to({}, { duration: 0.3 });

  return tl;
}

export const BEAT_LABELS = ["sources", "tables", "master", "sync", "personalize"] as const;

/**
 * The settled end-state shown instead of the loop under
 * prefers-reduced-motion: beat 3's moment — source tables already shrunk
 * with their PREF chips mid-flight toward the master record, and the
 * Subscriber Key already merged — the one frame that's legible on its own
 * without the preceding/following beats for context.
 */
export function applyConvergenceSettledState(scope: ParentNode) {
  resetConvergence(scope);

  const grey = colorVar("text-faint");

  // Tables: revealed, and (desktop only) already translated left to
  // cover their source row.
  PATHWAYS.forEach((p) => {
    const frame = qa(scope, `[data-table="${p.id}"] [data-table-frame]`);
    const content = qa(scope, `[data-table="${p.id}"] [data-table-content]`);
    gsap.set(frame, { stroke: grey, strokeDasharray: "0 0", opacity: 1 });
    gsap.set(content, { opacity: 1 });
  });
  gsap.set(qv<SVGGElement>(scope, "desktop", "[data-table]"), { x: D_TABLE_COVER_X - D_TABLE.x });
  gsap.set(qv<SVGGElement>(scope, "mobile", "[data-table]"), { y: M_TABLE_MASTER_Y - M_TABLE_ROW_Y });
  gsap.set(qa(scope, "[data-source], [data-source-label]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-connector-st]"), { opacity: 0 });

  // PREF chips: visible, mid-flight at each connector's own midpoint.
  gsap.set(qa(scope, "[data-connector-tm]"), { opacity: 1, stroke: colorVar("blue-light") });
  VIEWPORTS.forEach((vp) => {
    PATHWAYS.forEach((p) => {
      const chip = qv<SVGGElement>(scope, vp, `[data-pref-chip="${p.id}"]`)[0];
      const connector = qv<SVGLineElement>(scope, vp, `[data-connector-tm="${p.id}"]`)[0];
      if (!chip || !connector) return;
      const x1 = Number(connector.getAttribute("x1"));
      const y1 = Number(connector.getAttribute("y1"));
      const x2 = Number(connector.getAttribute("x2"));
      const y2 = Number(connector.getAttribute("y2"));
      gsap.set(chip, { x: (x1 + x2) / 2 - 12, y: (y1 + y2) / 2 - 5, opacity: 1 });
    });
  });

  // Subscriber Key: already merged — key icon visible, badges hidden.
  gsap.set(qa(scope, "[data-key-icon]"), { opacity: 1 });
  gsap.set(qa(scope, "[data-master]"), { opacity: 1 });
  gsap.set(qv(scope, "desktop", "[data-master]"), { x: 0 });
}
