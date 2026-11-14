// components/visuals/email/buildHeroTimeline.ts
//
// The detail-page hero builds its OWN timeline from the shared primitives
// rather than replaying the card's five-beat sequence: its job is to set
// up the layer explanation (Template/Rows/Modules/Config, then the four
// callouts, then the exploded view), not restate the card's full brand-
// cycle-and-dark-mode summary — that belongs to the card, and the Theme
// Tokens decision visual further down the page already shows the three
// brands properly. Repeating that here would show the same thing twice
// and make the loop long before the exploded view even starts.
import { gsap } from "@/lib/motion/gsap";
import { EASE } from "@/lib/motion/tokens";
import { colorVar } from "@/lib/motion/tokens";
import { LAYOUT, ROWS, PALETTE_ITEMS, HERO_CALLOUTS, HERO_LABEL_X, heroCalloutSource, type CalloutId } from "@/components/visuals/email/layout";
import { framePath, envelopePath, moduleRect, type SimpleModuleVariant } from "@/components/visuals/email/primitives";

const TOKEN_SIZE = { width: 12, height: 7 };
// How far above its landing spot a module/token starts its drop-in.
const DROP = 12;
// The config beat's token chips start noticeably higher than that — a
// 12-unit drop lands too fast to read as a deliberate "drop," just a
// blink-and-you-miss-it fade.
const TOKEN_DROP = 30;

// The point every stack-plane svg rotates around during the explode —
// shared across all four so they tilt together as one coherent unit
// instead of each wobbling around its own center. Each one is the exact
// same size/position (stacked via CSS, see EmailAssemblySvg), so a plain
// percentage origin lands on the same absolute point for all of them.
const ISO_ORIGIN = "50% 50%";
// A REAL 3D tilt: each data-stack-plane is now its own sibling <svg>
// (rather than a <g> inside one shared SVG — see EmailAssemblySvg.tsx),
// so GSAP applies rotationX/z through the normal CSS `transform` property
// instead of the SVG transform *attribute*, which is 2D-only and silently
// drops them. (An earlier attempt faked this with a plain rotate+scaleY —
// mathematically the correct flattened/orthographic equivalent, but
// orthographic projection has no size falloff with depth, so it could
// never produce real foreshortening no matter how the numbers were
// tuned.) rotationX tips the stack back to face the "ceiling"; rotationY
// turns it CCW around its own vertical axis (what actually brings the
// bottom-left and top-right corners into vertical alignment, matching
// the reference) — a Z-axis spin alone can't do that, it only rotates
// the already-flat silhouette in the view plane.
const ISO_ROTATION_X = 65;
const ISO_ROTATION_Y = 35;
const ISO_ROTATION_Z = -15;

type Point = { x: number; y: number };
type PointLike = Point | (() => Point);
const resolvePoint = (p: PointLike): Point => (typeof p === "function" ? p() : p);

function labelPoint(callout: (typeof HERO_CALLOUTS)[number]): Point {
  return { x: HERO_LABEL_X - 6, y: callout.labelY - 3 };
}

/** Converts a point in browser (client) pixels into the overlay <svg>'s
 *  own coordinate space via its screen CTM — how the explode phase finds
 *  out where a real, CSS-3D-transformed plane actually rendered, since
 *  that position only exists once the browser has laid it out and can't
 *  be computed ahead of time from fixed numbers. The overlay is the one
 *  that holds the callout lines, so its coordinate space is what their
 *  x1/y1/x2/y2 attributes are interpreted in. */
function svgPointFromClient(svg: SVGSVGElement, clientX: number, clientY: number): Point {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const transformed = pt.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}

/** The center of a (possibly 3D-transformed) plane element, in the root
 *  svg's coordinate space — a live getter, not a snapshot, since it's only
 *  read right when a line tween actually starts (see moveLineStart). */
function planeSourcePoint(svg: SVGSVGElement, planeEl: Element): Point {
  const rect = planeEl.getBoundingClientRect();
  return svgPointFromClient(svg, rect.left + rect.width / 2, rect.top + rect.height / 2);
}

/** x1/y1 fixed at `from`; x2/y2 draws out from `from` to `to` — reads as
 *  the line being traced into existence. Used for the callouts' first
 *  reveal, same technique as the card's connectors/token-lines. */
function drawLineOut(tl: gsap.core.Timeline, line: SVGLineElement, from: Point, to: Point, duration: number, position: string | number) {
  const proxy = { t: 0 };
  tl.set(line, { attr: { x1: from.x, y1: from.y, x2: from.x, y2: from.y } }, position).to(
    proxy,
    {
      t: 1, duration, ease: "none", onUpdate: () => {
        line.setAttribute("x2", String(from.x + (to.x - from.x) * proxy.t));
        line.setAttribute("y2", String(from.y + (to.y - from.y) * proxy.t));
      },
    },
    "<"
  );
}

/** x2/y2 left untouched; x1/y1 moves from `from` to `to`. Used for the
 *  explode/rejoin leader lines, where the label end stays put and the
 *  source end is what retracts or redraws — the mirror of drawLineOut.
 *  `from`/`to` accept a plain point OR a getter, resolved lazily right as
 *  the tween starts (not at timeline-build time) — the explode/rejoin
 *  redraws need to read a 3D plane's actual rendered position, which only
 *  exists once the browser has laid out that frame. */
function moveLineStart(tl: gsap.core.Timeline, line: SVGLineElement, from: PointLike, to: PointLike, duration: number, position: string | number) {
  const state = { fx: 0, fy: 0, tx: 0, ty: 0, t: 0 };
  tl.call(
    () => {
      const f = resolvePoint(from);
      const t = resolvePoint(to);
      state.fx = f.x;
      state.fy = f.y;
      state.tx = t.x;
      state.ty = t.y;
      state.t = 0;
      line.setAttribute("x1", String(f.x));
      line.setAttribute("y1", String(f.y));
    },
    [],
    position
  ).to(
    state,
    {
      t: 1, duration, ease: "none", onUpdate: () => {
        line.setAttribute("x1", String(state.fx + (state.tx - state.fx) * state.t));
        line.setAttribute("y1", String(state.fy + (state.ty - state.fy) * state.t));
      },
    },
    "<"
  );
}

/**
 * Template (~0.8s) → Rows (~0.8s) → Modules (~1.2s) → Config (~0.6s). Same
 * primitives as the card (envelope/frame morph, drawSVG row outlines,
 * module geometry) but no palette column — modules just drop into their
 * rows from just above, staggered, since "separate parts" is what the
 * exploded view explains, not this assembly. Config lands a single brand
 * (--brand red) with no A/B/C cycle.
 */
export function buildHeroAssembly(tl: gsap.core.Timeline, scope: HTMLElement) {
  const frameShape = scope.querySelector<SVGPathElement>("[data-envelope-frame]");
  const flap = scope.querySelector<SVGPathElement>("[data-envelope-flap]");
  const rows = gsap.utils.toArray<SVGRectElement>("[data-row]", scope);
  const dot = scope.querySelector<SVGCircleElement>("[data-draw-dot]");
  const modules = gsap.utils.toArray<SVGGraphicsElement>("[data-module]", scope);
  const accents = gsap.utils.toArray<SVGGraphicsElement>("[data-accent]", scope);
  const modulesGroup = scope.querySelector<SVGGElement>("[data-modules]");
  const paletteModulesGroup = scope.querySelector<SVGGElement>("[data-palette-modules]");
  const tokensGroup = scope.querySelector<SVGGElement>("[data-tokens]");
  const headerToken = scope.querySelector<SVGRectElement>('[data-token="header"]');
  const buttonToken = scope.querySelector<SVGRectElement>('[data-token="button"]');
  const heroBarToken = scope.querySelector<SVGRectElement>('[data-token="hero-bar"]');
  const configChip = scope.querySelector<SVGRectElement>("[data-config-chip]");
  const heroBar = scope.querySelector<SVGRectElement>("[data-hero-bar]");
  // Shared markup the hero never shows — still needs resetting at the top
  // of every loop so a stray state from the card (or a prior hero loop)
  // can't bleed through.
  const paletteGroup = scope.querySelector<SVGGElement>("[data-palette]");
  const connectorsGroup = scope.querySelector<SVGGElement>("[data-connectors]");
  const legendGroup = scope.querySelector<SVGGElement>("[data-legend]");
  const tokenLinesGroup = scope.querySelector<SVGGElement>("[data-token-lines]");
  const scanLine = scope.querySelector<SVGRectElement>("[data-scan]");
  const checksGroup = scope.querySelector<SVGGElement>("[data-checks]");
  const toggleGroup = scope.querySelector<SVGGElement>("[data-toggle]");
  const stackPlanes = gsap.utils.toArray<SVGSVGElement>("[data-stack-plane]", scope);
  const planeOutlines = gsap.utils.toArray<SVGRectElement>("[data-plane-outline]", scope);

  if (
    !frameShape ||
    !flap ||
    !dot ||
    !modulesGroup ||
    !paletteModulesGroup ||
    !tokensGroup ||
    !headerToken ||
    !buttonToken ||
    !heroBarToken ||
    !configChip ||
    !heroBar ||
    !paletteGroup ||
    !connectorsGroup ||
    !legendGroup ||
    !tokenLinesGroup ||
    !scanLine ||
    !checksGroup ||
    !toggleGroup ||
    !stackPlanes.length
  ) {
    return;
  }

  frameShape.setAttribute("d", envelopePath(LAYOUT.frame));

  const grey = colorVar("text-faint");
  const brand = colorVar("brand");
  const blue = colorVar("blue");

  const moduleFor = (variant: string) => modules.find((m) => m.getAttribute("data-module") === variant);
  const rowFor = (variant: string) => ROWS.find((r) => r.variant === variant)!;

  // --- Template (~0.8s) ----------------------------------------------------
  tl.addLabel("template")
    .set(frameShape, { morphSVG: envelopePath(LAYOUT.frame), opacity: 1 })
    .set(flap, { opacity: 1 })
    .set(
      [rows, dot, modulesGroup, paletteModulesGroup, tokensGroup, configChip, heroBar, paletteGroup, connectorsGroup, legendGroup, tokenLinesGroup, scanLine, checksGroup, toggleGroup],
      { opacity: 0 }
    )
    .set(planeOutlines, { opacity: 0 })
    .set(stackPlanes, { rotationX: 0, rotationY: 0, rotationZ: 0, y: 0, transformOrigin: ISO_ORIGIN })
    .set(accents, { fill: grey })
    .set(rows, { stroke: grey, strokeWidth: 1 })
    // Hold on the plain envelope a beat before unfolding — short enough to
    // keep the hero's pace tight, but long enough to actually register
    // "envelope" rather than reading as a single scale-down-then-up blip
    // right after the previous loop's fold-back.
    .to({}, { duration: 0.7 })
    .to(frameShape, { morphSVG: framePath(LAYOUT.frame), duration: 0.5, ease: EASE.enter })
    .to(flap, { opacity: 0, duration: 0.3 }, "<");

  // --- Rows (~0.8s) ----------------------------------------------------------
  tl.addLabel("rows").set(rows, { opacity: 1 }, "rows").set(dot, { opacity: 1 }, "rows");

  ROWS.forEach((row, i) => {
    const position = i === 0 ? "rows" : "<+=0.12";
    tl.fromTo(rows[i], { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.28, ease: "none" }, position).fromTo(
      dot,
      { x: row.x, y: row.y },
      { x: row.x, y: row.y + row.height, duration: 0.28, ease: "none" },
      "<"
    );
  });
  tl.to(dot, { opacity: 0, duration: 0.12 });

  // --- Modules (~1.2s): drop into place from just above, no palette -------
  tl.addLabel("modules").set(modulesGroup, { opacity: 1 }).set(paletteModulesGroup, { opacity: 1 });

  ROWS.forEach((row, i) => {
    const module = moduleFor(row.variant);
    const rowOutline = rows.find((r) => r.getAttribute("data-row") === row.variant);
    if (!module || !rowOutline) return;

    const position = i === 0 ? "modules" : "<+=0.22";

    if (row.variant === "header") {
      tl.fromTo(module, { y: -DROP, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, position);
    } else if (row.variant === "text") {
      const native = PALETTE_ITEMS.find((p) => p.variant === "text")!;
      const scaleX = row.width / native.width;
      const scaleY = row.height / native.height;
      const targetY = row.y - native.y;
      tl.fromTo(
        module,
        { x: row.x - native.x, y: targetY - DROP, scaleX, scaleY, opacity: 0, transformOrigin: "0% 0%" },
        { y: targetY, opacity: 1, duration: 0.3, ease: "power2.out" },
        position
      );
    } else {
      const target = moduleRect(row.variant as SimpleModuleVariant, row);
      tl.set(module, { attr: { x: target.x, y: target.y, width: target.width, height: target.height, rx: target.rx } }, position).fromTo(
        module,
        { y: -DROP, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
        "<"
      );
    }

    tl.to(rowOutline, { stroke: brand, strokeWidth: 2, duration: 0.12 }, "<+=0.15").to(rowOutline, { stroke: grey, strokeWidth: 1, duration: 0.3 }, ">");

    // The hero module's own accent bar lands alongside it, grey/faint
    // like everything else at this stage — its own red token colors it
    // in during the config beat below.
    if (row.variant === "hero") {
      tl.to(heroBar, { opacity: 1, duration: 0.3 }, "<");
    }
  });

  // --- Config (~0.6s): token chips land, header/button turn brand red, --
  // --- the hero module's own accent bar turns red too (its own token), --
  // --- and the hero module's BODY turns blue instead — driven by the ----
  // --- Configuration chip landing, not the red sweep — so the config ----
  // --- beat visibly produces two distinct colors to point at, one red ---
  // --- and one blue, rather than one flat sweep. One pass only — no -----
  // --- A/B/C cycle, that's the card's job. -------------------------------
  const headerRow = rowFor("header");
  const buttonRow = rowFor("button");
  const heroRow = rowFor("hero");
  const heroModule = moduleFor("hero");
  const heroModuleRect = moduleRect("hero", heroRow);
  const heroBarRect = { x: heroModuleRect.x, y: heroModuleRect.y, width: heroModuleRect.width, height: heroModuleRect.height * 0.14 };
  const headerTarget = { x: headerRow.x + headerRow.width * 0.42 - TOKEN_SIZE.width / 2, y: headerRow.y + headerRow.height * 0.5 - TOKEN_SIZE.height / 2 };
  const buttonTarget = { x: buttonRow.x + buttonRow.width * 0.42 - TOKEN_SIZE.width / 2, y: buttonRow.y + buttonRow.height * 0.5 - TOKEN_SIZE.height / 2 };
  const heroBarTarget = { x: heroBarRect.x + heroBarRect.width * 0.42 - TOKEN_SIZE.width / 2, y: heroBarRect.y + heroBarRect.height * 0.5 - TOKEN_SIZE.height / 2 };

  tl.addLabel("config")
    .set(tokensGroup, { opacity: 1 }, "config")
    .set(headerToken, { attr: { x: headerTarget.x, y: headerTarget.y - TOKEN_DROP }, fill: brand, opacity: 0 }, "config")
    .set(buttonToken, { attr: { x: buttonTarget.x, y: buttonTarget.y - TOKEN_DROP }, fill: brand, opacity: 0 }, "config")
    .set(heroBarToken, { attr: { x: heroBarTarget.x, y: heroBarTarget.y - TOKEN_DROP }, fill: brand, opacity: 0 }, "config")
    .to(heroBarToken, { attr: { y: heroBarTarget.y }, opacity: 1, duration: 0.3, ease: "power2.out" }, "config")
    .to(heroBar, { fill: brand, duration: 0.3 }, "<+=0.1")
    .to(headerToken, { attr: { y: headerTarget.y }, opacity: 1, duration: 0.3, ease: "power2.out" }, "config")
    .to(buttonToken, { attr: { y: buttonTarget.y }, opacity: 1, duration: 0.3, ease: "power2.out" }, "<+=0.08")
    .to([moduleFor("header"), moduleFor("button")], { fill: brand, duration: 0.3 }, "<+=0.1")
    .fromTo(configChip, { opacity: 0, y: -TOKEN_DROP }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "config+=0.15")
    .to(heroModule ?? [], { fill: blue, duration: 0.3 }, "<+=0.1");
}

/**
 * Decoupled from the assembly entirely: the four callouts only start once
 * the email is fully formed, drawing in label-order (Configuration,
 * Module, Row pattern, Template — top to bottom), ~0.15s apart, like
 * someone annotating a finished diagram rather than narrating it as it's
 * built. Tying them to individual beats made the reveal order jump around
 * (whatever beat finishes first draws first, regardless of label position)
 * and meant explaining layers before the viewer had seen the whole email.
 */
export function buildHeroCallouts(tl: gsap.core.Timeline, scope: HTMLElement) {
  tl.addLabel("callouts");

  HERO_CALLOUTS.forEach((callout, i) => {
    const line = scope.querySelector<SVGLineElement>(`[data-callout-line="${callout.id}"]`);
    const textGroup = scope.querySelector<SVGGElement>(`[data-callout-text="${callout.id}"]`);
    if (!line || !textGroup) return;

    const source = heroCalloutSource(callout.id);
    const target = labelPoint(callout);
    const position = i === 0 ? "callouts" : `callouts+=${(i * 0.15).toFixed(2)}`;

    tl.set(line, { opacity: 1 }, position);
    drawLineOut(tl, line, source, target, 0.4, position);
    // The label slides in from the left as it fades in, reading as if the
    // line's leading edge is what's pushing it into its resting spot.
    tl.fromTo(textGroup, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }, ">");
  });
}

// Each plane's separation once exploded — a real translateY, in the
// plane's own LOCAL space (applied alongside, not instead of, the shared
// rotationX/Y/Z — see below). Because each data-stack-plane is now its
// own <svg> (a normal CSS-transformable element, not a <g> stuck using
// the 2D-only SVG transform attribute — see EmailAssemblySvg.tsx), GSAP
// composes this local y with the rotation as a real 3D transform, and the
// parent's CSS `perspective` projects the result with genuine
// foreshortening — not a hand-rolled approximation. Configuration lifts
// furthest (top of the stack), Template doesn't move at all — it's the
// foundation the other three separate away from. Evenly spaced 75px
// apart. Measured directly (getBoundingClientRect) rather than guessed:
// at this rotation, positive local y renders LARGER/nearer and lower on
// screen, negative renders SMALLER/further and higher — so template (the
// foundation, meant to read as nearest/largest) needs the most positive
// value, configuration (lifted furthest away) the most negative. Negated
// below, since `y: -PLANE_DEPTH[id]` is what's actually applied — these
// exact numbers (y of -150/-75/0/+75) came from testing directly in the
// inspector: same 75px spacing as before, just recentered — the previous
// center point sat too low, pushing the exploded stack's top edge up
// into the page section below it.
const PLANE_DEPTH: Record<CalloutId, number> = {
  configuration: 150,
  module: 75,
  "row-pattern": 0,
  template: -75,
};

/**
 * Explode: translates and spins the actual, live email — not a separate
 * illustration cross-fading in — into a real 3D exploded stack. The whole
 * thing (frame, rows, modules, configuration) tilts back together as one
 * unit (shared rotationX/rotationZ + transformOrigin), a dashed outline
 * fades in per plane so each one reads as its own card, and each plane
 * then separates along the now-tilted Z axis via a real translateZ — the
 * parent's CSS `perspective` (set in EmailAssemblySvg.tsx) projects that
 * with genuine foreshortening, not an orthographic approximation. Callout
 * lines retract to their labels before anything moves, then redraw out to
 * wherever each plane actually rendered once real — read live via
 * getScreenCTM, since the exact on-screen position after a 3D transform
 * isn't worth precomputing by hand. Holds, then rejoins in reverse:
 * planes converge, the tilt un-spins back to flat, lines redraw to the
 * flat positions. Labels never move — only the lines and the planes/tilt
 * do.
 */
export function buildHeroExplode(tl: gsap.core.Timeline, scope: HTMLElement) {
  const svg = scope.querySelector<SVGSVGElement>("[data-overlay]");
  const stackPlanes = gsap.utils.toArray<SVGSVGElement>("[data-stack-plane]", scope);
  const planeOutlines = gsap.utils.toArray<SVGRectElement>("[data-plane-outline]", scope);
  if (!svg || !stackPlanes.length || !planeOutlines.length) return;

  const lineFor = (id: CalloutId) => scope.querySelector<SVGLineElement>(`[data-callout-line="${id}"]`);
  const planeFor = (id: CalloutId) => stackPlanes.find((p) => p.getAttribute("data-stack-plane") === id);

  // Retract: each line pulls back to its label, since the thing it's
  // pointing at is about to move.
  tl.addLabel("explode");
  HERO_CALLOUTS.forEach((callout) => {
    const line = lineFor(callout.id);
    if (!line) return;
    moveLineStart(tl, line, heroCalloutSource(callout.id), labelPoint(callout), 0.3, "explode");
  });

  // Spin: the whole email tilts back (rotationX) and twists toward the
  // labels (rotationZ) as one unit, each plane's dashed boundary fading
  // in as it becomes its own visible card.
  tl.to(stackPlanes, { rotationX: ISO_ROTATION_X, rotationY: ISO_ROTATION_Y, rotationZ: ISO_ROTATION_Z, duration: 0.7, ease: EASE.enter }, "explode+=0.15").to(
    planeOutlines,
    { opacity: 1, duration: 0.4 },
    "<+=0.2"
  );

  // Separate: each plane lifts to its resting offset along its own,
  // already-tilted local y-axis — the parent's perspective handles the
  // resulting screen position and foreshortening, no manual offset math
  // needed.
  tl.addLabel("separating", "<-0.1");
  HERO_CALLOUTS.forEach((callout) => {
    const plane = planeFor(callout.id);
    if (!plane) return;
    tl.to(plane, { y: -PLANE_DEPTH[callout.id], duration: 0.6, ease: EASE.enter }, "separating");
  });

  // Redraw: lines extend back out to wherever each plane actually landed
  // on screen — read live, once the separation above has finished.
  tl.addLabel("exploded", ">-0.1");
  HERO_CALLOUTS.forEach((callout) => {
    const line = lineFor(callout.id);
    const plane = planeFor(callout.id);
    if (!line || !plane) return;
    moveLineStart(tl, line, labelPoint(callout), () => planeSourcePoint(svg, plane), 0.35, "exploded");
  });

  // Hold on the exploded view.
  tl.to({}, { duration: 2 });

  // Rejoin, in reverse: retract from wherever the planes currently are...
  tl.addLabel("rejoin");
  HERO_CALLOUTS.forEach((callout) => {
    const line = lineFor(callout.id);
    const plane = planeFor(callout.id);
    if (!line || !plane) return;
    moveLineStart(tl, line, () => planeSourcePoint(svg, plane), labelPoint(callout), 0.3, "rejoin");
  });

  // ...then, right as the stack starts collapsing back together, the
  // labels/lines fade out immediately — they used to lag behind into the
  // envelope fold, visibly still on screen while the frame was already
  // shrinking. (The config token chips are left alone here on purpose:
  // they live inside the "configuration" plane itself, so they ride along
  // with its own un-spin back to flat rather than needing a separate fix
  // — they only fade out later, together with the rest of the content, as
  // part of buildFoldBack's normal envelope collapse.)
  tl.addLabel("converging");
  const calloutTexts = gsap.utils.toArray<SVGGElement>("[data-callout-text]", scope);
  const calloutLines = gsap.utils.toArray<SVGLineElement>("[data-callout-line]", scope);
  tl.to([...calloutTexts, ...calloutLines], { opacity: 0, duration: 0.25 }, "converging");

  // ...the planes converge back together...
  stackPlanes.forEach((plane) => tl.to(plane, { y: 0, duration: 0.5, ease: EASE.exit }, "converging"));

  // ...the dashed outlines fade out and the whole email un-spins back to flat.
  tl.to(planeOutlines, { opacity: 0, duration: 0.3 }, ">-0.2").to(
    stackPlanes,
    { rotationX: 0, rotationY: 0, rotationZ: 0, duration: 0.6, ease: EASE.exit },
    "<"
  );
}
