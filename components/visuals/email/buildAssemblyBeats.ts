// components/visuals/email/buildAssemblyBeats.ts
import { gsap } from "@/lib/motion/gsap";
import { EASE } from "@/lib/motion/tokens";
import { colorVar } from "@/lib/motion/tokens";
import { LAYOUT, ROWS, PALETTE_ITEMS, LEGEND_ITEMS, HERO_CALLOUTS, HERO_LABEL_X, heroCalloutSource, type BrandId } from "@/components/visuals/email/layout";
import { framePath, envelopePath, moduleRect, type SimpleModuleVariant } from "@/components/visuals/email/primitives";

const TOKEN_SIZE = { width: 12, height: 7 };

/**
 * Animates a line's x2/y2 from its x1/y1 out to a target point, reading as
 * the line being traced from start to end. DrawSVGPlugin does this more
 * natively, but it measures a line's length from its current x1/y1/x2/y2
 * once and appears to cache that — fine for a line whose geometry never
 * changes between repeats (the beat 2 row outlines, the beat 3 palette
 * connectors), but beat 4 reuses the same two line elements for all three
 * brands with different endpoints each time, and only the first ever
 * visibly drew. Plain attribute interpolation has no such cache.
 */
function drawLine(
  tl: gsap.core.Timeline,
  line: SVGLineElement,
  from: { x: number; y: number },
  to: { x: number; y: number },
  duration: number,
  position: string | number
) {
  const proxy = { t: 0 };
  tl.set(line, { attr: { x1: from.x, y1: from.y, x2: from.x, y2: from.y } }, position).to(
    proxy,
    {
      t: 1,
      duration,
      ease: "none",
      onUpdate: () => {
        line.setAttribute("x2", String(from.x + (to.x - from.x) * proxy.t));
        line.setAttribute("y2", String(from.y + (to.y - from.y) * proxy.t));
      },
    },
    "<"
  );
}

/**
 * Appends the five-beat "assembly" sequence — Template, Rows, Modules,
 * Config, Tested — onto an existing GSAP timeline, reading elements from
 * EmailAssemblySvg by data-* attribute. Card-only: the hero builds its own,
 * shorter timeline from the same shared primitives instead of replaying
 * this one (see buildHeroTimeline.ts) — its job is to set up the layer
 * explanation, not restate the card's full brand-cycle/dark-mode summary.
 */
export function buildAssemblyBeats(tl: gsap.core.Timeline, scope: HTMLElement) {
  const frameShape = scope.querySelector<SVGPathElement>("[data-envelope-frame]");
  const flap = scope.querySelector<SVGPathElement>("[data-envelope-flap]");
  const rows = gsap.utils.toArray<SVGRectElement>("[data-row]", scope);
  const modules = gsap.utils.toArray<SVGGraphicsElement>("[data-module]", scope);
  const accents = gsap.utils.toArray<SVGGraphicsElement>("[data-accent]", scope);
  const dot = scope.querySelector<SVGCircleElement>("[data-draw-dot]");
  const paletteGroup = scope.querySelector<SVGGElement>("[data-palette]");
  const paletteSlots = gsap.utils.toArray<SVGGElement>("[data-palette-slot]", scope);
  const connectorsGroup = scope.querySelector<SVGGElement>("[data-connectors]");
  const connectors = gsap.utils.toArray<SVGLineElement>("[data-connector]", scope);
  const modulesGroup = scope.querySelector<SVGGElement>("[data-modules]");
  const paletteModulesGroup = scope.querySelector<SVGGElement>("[data-palette-modules]");
  const legendGroup = scope.querySelector<SVGGElement>("[data-legend]");
  const legendLabels = gsap.utils.toArray<SVGTextElement>("[data-legend-label]", scope);
  const tokenLinesGroup = scope.querySelector<SVGGElement>("[data-token-lines]");
  const tokensGroup = scope.querySelector<SVGGElement>("[data-tokens]");
  const headerToken = scope.querySelector<SVGRectElement>('[data-token="header"]');
  const buttonToken = scope.querySelector<SVGRectElement>('[data-token="button"]');
  const headerTokenLine = scope.querySelector<SVGLineElement>('[data-token-line="header"]');
  const buttonTokenLine = scope.querySelector<SVGLineElement>('[data-token-line="button"]');
  const scanLine = scope.querySelector<SVGRectElement>("[data-scan]");
  const checksGroup = scope.querySelector<SVGGElement>("[data-checks]");
  const checks = gsap.utils.toArray<SVGPathElement>("[data-check]", scope);
  const toggleGroup = scope.querySelector<SVGGElement>("[data-toggle]");
  const toggleThumb = scope.querySelector<SVGCircleElement>("[data-toggle-thumb]");
  const toggleSun = scope.querySelector<SVGGElement>("[data-toggle-sun]");
  const toggleMoon = scope.querySelector<SVGGElement>("[data-toggle-moon]");
  const configChip = scope.querySelector<SVGRectElement>("[data-config-chip]");

  if (
    !frameShape ||
    !flap ||
    !dot ||
    !paletteGroup ||
    !connectorsGroup ||
    !modulesGroup ||
    !paletteModulesGroup ||
    !legendGroup ||
    !tokenLinesGroup ||
    !tokensGroup ||
    !headerToken ||
    !buttonToken ||
    !headerTokenLine ||
    !buttonTokenLine ||
    !scanLine ||
    !checksGroup ||
    !toggleGroup ||
    !toggleThumb ||
    !toggleSun ||
    !toggleMoon ||
    !configChip
  ) {
    return;
  }

  // MorphSVGPlugin writes the `d` attribute directly rather than through
  // a tracked CSS property, so gsap.context().revert() doesn't reliably
  // restore it — React Strict Mode's dev-only double effect-invoke (mount,
  // cleanup, mount again) could otherwise hand the second mount a `d`
  // frozen mid-morph instead of the envelope. A plain DOM reset, not a
  // GSAP-tracked one, guarantees a clean shape regardless.
  frameShape.setAttribute("d", envelopePath(LAYOUT.frame));

  const grey = colorVar("text-faint");
  const brand = colorVar("brand");
  const blueLight = colorVar("blue-light");
  const white = colorVar("text");
  const surface = colorVar("surface");
  // The toggle's "other" fill — text-muted, not surface-highest: that was
  // too close in value to surface to read as a real change at this scale,
  // and this still sits clearly below white so brand C's white accents
  // (the last color the brand cycle lands on, right before this) don't
  // wash out against it.
  const surfaceToggled = colorVar("text-muted");

  const moduleFor = (variant: string) => modules.find((m) => m.getAttribute("data-module") === variant);
  const rowFor = (variant: string) => ROWS.find((r) => r.variant === variant)!;

  // --- Beat 1 · Template: envelope unfolds into the frame -----------------
  tl.addLabel("template")
    .set(frameShape, { morphSVG: envelopePath(LAYOUT.frame) })
    .set(flap, { opacity: 1 })
    .set(
      [
        rows,
        dot,
        paletteGroup,
        connectorsGroup,
        modulesGroup,
        paletteModulesGroup,
        legendGroup,
        tokenLinesGroup,
        tokensGroup,
        scanLine,
        checksGroup,
        toggleGroup,
        configChip,
      ],
      { opacity: 0 }
    )
    .set(accents, { fill: grey })
    .set(connectors, { opacity: 0 })
    .set(rows, { stroke: grey, strokeWidth: 1 })
    // Hold on the plain envelope before it starts unfolding — this runs at
    // the top of every cycle, including the very first one, so it's also
    // what gives a visitor time to register "envelope" despite the Work
    // section's own 0.8s scroll-entrance fade/rise (Section.tsx) starting
    // at roughly the same moment this timeline's own visibility gate does.
    // Without it, the unfold was mostly hidden behind that entrance motion.
    .to({}, { duration: 2 })
    .addLabel("frameMorph")
    .to(frameShape, { morphSVG: framePath(LAYOUT.frame), duration: 1.6, ease: EASE.enter })
    .to(flap, { opacity: 0, duration: 0.5 }, "<");

  // --- Beat 2 · Rows: row outlines draw top to bottom, a red dot leads ----
  // Starts 1s into the 1.6s frame morph (the flap's long gone by then, its
  // own fade finishing at the 0.5s mark) rather than waiting for the morph
  // to fully settle — that wait left the completed, empty frame sitting
  // there for half a second with nothing happening before rows appeared.
  tl.addLabel("rows", "frameMorph+=0.7")
    .set(rows, { opacity: 1 }, "rows")
    .set(dot, { opacity: 1 }, "rows");

  ROWS.forEach((row, i) => {
    const position = i === 0 ? "rows" : "<+=0.1";
    tl.fromTo(rows[i], { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.32, ease: "none" }, position).fromTo(
      dot,
      { x: row.x, y: row.y },
      { x: row.x, y: row.y + row.height, duration: 0.32, ease: "none" },
      "<"
    );
  });
  tl.to(dot, { opacity: 0, duration: 0.15 });

  // --- Beat 3 · Modules: a dotted guide points from palette to row, the --
  // --- module itself slides over (morphing into the row's exact shape), -
  // --- and its row's border pulses once it lands. -------------------------
  // The four palette-sourced modules don't get their own reveal tween until
  // their staggered turn comes up below — explicitly hiding them the
  // instant the (now-visible) group wraps them is what keeps them from
  // flashing in at their native palette position/size in the meantime.
  const paletteSourcedModules = PALETTE_ITEMS.map((item) => moduleFor(item.variant)).filter((m): m is SVGGraphicsElement => !!m);

  tl.addLabel("modules")
    .set(paletteGroup, { opacity: 1 })
    .set(connectorsGroup, { opacity: 1 })
    .set(modulesGroup, { opacity: 1 })
    .set(paletteModulesGroup, { opacity: 1 })
    .set(paletteSourcedModules, { opacity: 0 });

  const headerModule = moduleFor("header");
  if (headerModule) {
    tl.fromTo(headerModule, { opacity: 0, scale: 0.7, transformOrigin: "center" }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, ">");
    const headerRowOutline = rows.find((r) => r.getAttribute("data-row") === "header");
    if (headerRowOutline) {
      tl.to(headerRowOutline, { stroke: brand, strokeWidth: 2, duration: 0.15 }, "<+=0.2").to(
        headerRowOutline,
        { stroke: grey, strokeWidth: 1, duration: 0.35 },
        ">"
      );
    }
  }

  PALETTE_ITEMS.forEach((item, i) => {
    const moduleEl = moduleFor(item.variant);
    const slot = paletteSlots.find((s) => s.getAttribute("data-palette-slot") === item.variant);
    const connector = connectors.find((c) => c.getAttribute("data-connector") === item.variant);
    const row = rowFor(item.variant);
    const rowOutline = rows.find((r) => r.getAttribute("data-row") === item.variant);
    if (!moduleEl || !connector || !rowOutline) return;

    const position = i === 0 ? "<+=0.2" : "<+=0.45";

    // The dotted guide draws in first, as though being traced, pointing at
    // where this module is headed.
    tl.set(connector, { opacity: 1, drawSVG: "0%" }, position).to(connector, { drawSVG: "100%", duration: 0.3, ease: "none" }, ">");

    // The module itself slides over. For the three single-rect variants
    // this resizes the real x/y/width/height/rx attributes — a genuine
    // morph into the row's shape, not a transform standing in for one.
    // "text" is three separate lines, so it scales/translates as a group.
    if (item.variant === "text") {
      const scaleX = row.width / item.width;
      const scaleY = row.height / item.height;
      tl.to(
        moduleEl,
        { x: row.x - item.x, y: row.y - item.y, scaleX, scaleY, opacity: 1, transformOrigin: "0% 0%", duration: 0.45, ease: "back.out(1.6)" },
        "<+=0.1"
      );
    } else {
      const target = moduleRect(item.variant as SimpleModuleVariant, row);
      tl.to(
        moduleEl,
        { attr: { x: target.x, y: target.y, width: target.width, height: target.height, rx: target.rx }, opacity: 1, duration: 0.45, ease: "back.out(1.6)" },
        "<+=0.1"
      );
    }

    // The guide fades as the module arrives. Its whole palette slot — box,
    // preview shape and label together — fades too: once a module has
    // left for the template it shouldn't still look "available" behind it.
    tl.to(connector, { opacity: 0, duration: 0.2 }, "<+=0.25");
    if (slot) tl.to(slot, { opacity: 0, duration: 0.3 }, "<-0.1");

    // Landing: the row's border pulses brand-red, then settles back to grey.
    tl.to(rowOutline, { stroke: brand, strokeWidth: 2, duration: 0.15 }, "<").to(rowOutline, { stroke: grey, strokeWidth: 1, duration: 0.4 }, ">");
  });

  // Every accent module (header, hero, button) also takes on the brand fill
  // once the set has landed, then settles to grey ahead of beat 4's legend.
  tl.to(accents, { fill: brand, duration: 0.15 }, ">-0.1").to(accents, { fill: grey, duration: 0.3 }, ">+0.1");

  // --- Beat 4 · Config: a brand legend replaces the (now-empty) palette --
  // --- column; each brand's token chips fly out of its own legend box, --
  // --- and the email takes on that brand's color as they land. -----------
  const headerRow = rowFor("header");
  const buttonRow = rowFor("button");

  const BRANDS: { id: BrandId; color: string }[] = [
    { id: "A", color: brand },
    { id: "B", color: blueLight },
    { id: "C", color: white },
  ];

  tl.addLabel("config").to(legendGroup, { opacity: 1, duration: 0.35 }, ">");

  BRANDS.forEach((brandDef, i) => {
    const box = LEGEND_ITEMS.find((b) => b.id === brandDef.id)!;
    const label = legendLabels.find((l) => l.getAttribute("data-legend-label") === brandDef.id);
    const from = { x: box.x - TOKEN_SIZE.width / 2, y: box.y + box.height / 2 - TOKEN_SIZE.height / 2 };
    const headerTo = { x: headerRow.x + headerRow.width * 0.42 - TOKEN_SIZE.width / 2, y: headerRow.y + headerRow.height * 0.5 - TOKEN_SIZE.height / 2 };
    const buttonTo = { x: buttonRow.x + buttonRow.width * 0.42 - TOKEN_SIZE.width / 2, y: buttonRow.y + buttonRow.height * 0.5 - TOKEN_SIZE.height / 2 };
    const position = i === 0 ? ">+0.1" : ">+0.4";

    tl.to(label ?? [], { fill: brandDef.color, duration: 0.2 }, position)
      .set([headerToken, buttonToken], { attr: { x: from.x, y: from.y }, fill: brandDef.color, opacity: 0 }, "<")
      // Each wave's own opacity, not just the parent group's — the
      // previous wave faded these same two lines out individually, and a
      // child's own opacity:0 doesn't get undone by the parent coming
      // back to 1 (0 × 1 is still 0), which was why brand A's line worked
      // but B and C's never became visible again.
      .set([headerTokenLine, buttonTokenLine], { stroke: brandDef.color, opacity: 1 }, "<")
      .set(tokenLinesGroup, { opacity: 1 }, "<")
      .set(tokensGroup, { opacity: 1 }, "<");

    // Lines draw in (traced from the legend box out), then the chip
    // itself travels along that same path and fades in as it goes.
    const lineFrom = { x: box.x, y: box.y + box.height / 2 };
    drawLine(tl, headerTokenLine, lineFrom, { x: headerTo.x + TOKEN_SIZE.width / 2, y: headerTo.y + TOKEN_SIZE.height / 2 }, 0.35, "<");
    drawLine(tl, buttonTokenLine, lineFrom, { x: buttonTo.x + TOKEN_SIZE.width / 2, y: buttonTo.y + TOKEN_SIZE.height / 2 }, 0.35, "<");

    tl.to(headerToken, { attr: { x: headerTo.x, y: headerTo.y }, opacity: 1, duration: 0.4, ease: EASE.enter }, "<")
      .to(buttonToken, { attr: { x: buttonTo.x, y: buttonTo.y }, opacity: 1, duration: 0.4, ease: EASE.enter }, "<")
      .to(accents, { fill: brandDef.color, duration: 0.3 }, "<+=0.2")
      .to([headerTokenLine, buttonTokenLine], { opacity: 0, duration: 0.2 }, ">-0.1")
      .to([headerToken, buttonToken], { opacity: 0, duration: 0.2 }, "<")
      .to({}, { duration: 0.3 });
  });

  tl.to(legendGroup, { opacity: 0, duration: 0.3 }, ">+0.1");

  // --- Beat 5 · Tested: scan line, checks, dark mode, reset ----------------
  tl.addLabel("tested")
    .set(scanLine, { y: LAYOUT.frame.y - 3, opacity: 1 })
    .set(checksGroup, { opacity: 1 })
    .set(checks, { opacity: 0 });

  ROWS.forEach((row, i) => {
    const position = i === 0 ? ">" : "<+=0.18";
    tl.to(scanLine, { y: row.y + row.height / 2 - 1.5, duration: 0.18, ease: "none" }, position).to(
      checks[i],
      { opacity: 1, duration: 0.15 },
      "<+=0.05"
    );
  });

  tl.to(scanLine, { y: LAYOUT.frame.y + LAYOUT.frame.height, duration: 0.18, ease: "none" }, "<+=0.18").to(
    scanLine,
    { opacity: 0, duration: 0.15 },
    ">"
  );

  // Light/Dark toggle flips — slow enough to actually register the
  // crescent moon — holds on dark, then flips back to light so both the
  // moon's arrival and its departure are clearly visible, not just a
  // single quick pass.
  const thumbTravel = LAYOUT.toggle.width - LAYOUT.toggle.height;
  tl.set(toggleGroup, { opacity: 1 }, ">+0.1")
    .to(toggleThumb, { x: thumbTravel, duration: 0.7, ease: EASE.enter }, ">")
    .to(toggleSun, { fill: grey, stroke: grey, duration: 0.7 }, "<")
    .to(toggleMoon, { fill: white, duration: 0.7 }, "<")
    .to(frameShape, { fill: surfaceToggled, duration: 0.7 }, "<")
    .to({}, { duration: 1 })
    .to(toggleThumb, { x: 0, duration: 0.7, ease: EASE.enter })
    .to(toggleSun, { fill: white, stroke: white, duration: 0.7 }, "<")
    .to(toggleMoon, { fill: grey, duration: 0.7 }, "<")
    .to(frameShape, { fill: surface, duration: 0.7 }, "<");

  // Hold on the finished, tested state.
  tl.to({}, { duration: 1 });
}

/**
 * Modules lift out, frame folds back into the envelope, loop. Split out
 * from buildAssemblyBeats() so the hero can splice its own extra phases
 * (callouts, the exploded view) in between "tested state fully shown" and
 * this reset — the card calls it immediately after, the hero later.
 */
export function buildFoldBack(tl: gsap.core.Timeline, scope: HTMLElement) {
  const frameShape = scope.querySelector<SVGPathElement>("[data-envelope-frame]");
  const rows = gsap.utils.toArray<SVGRectElement>("[data-row]", scope);
  const modulesGroup = scope.querySelector<SVGGElement>("[data-modules]");
  const paletteModulesGroup = scope.querySelector<SVGGElement>("[data-palette-modules]");
  const paletteGroup = scope.querySelector<SVGGElement>("[data-palette]");
  const checksGroup = scope.querySelector<SVGGElement>("[data-checks]");
  const toggleGroup = scope.querySelector<SVGGElement>("[data-toggle]");
  const toggleThumb = scope.querySelector<SVGCircleElement>("[data-toggle-thumb]");
  const toggleSun = scope.querySelector<SVGGElement>("[data-toggle-sun]");
  const toggleMoon = scope.querySelector<SVGGElement>("[data-toggle-moon]");
  const configChip = scope.querySelector<SVGRectElement>("[data-config-chip]");
  const tokensGroup = scope.querySelector<SVGGElement>("[data-tokens]");
  if (
    !frameShape ||
    !modulesGroup ||
    !paletteModulesGroup ||
    !paletteGroup ||
    !checksGroup ||
    !toggleGroup ||
    !toggleThumb ||
    !toggleSun ||
    !toggleMoon ||
    !configChip ||
    !tokensGroup
  ) {
    return;
  }

  const white = colorVar("text");
  const grey = colorVar("text-faint");
  const surface = colorVar("surface");

  // Hero-only, if present (empty arrays on the card): the callout
  // lines/labels, and the hero module's own accent bar.
  const calloutLines = gsap.utils.toArray<SVGLineElement>("[data-callout-line]", scope);
  const calloutTexts = gsap.utils.toArray<SVGGElement>("[data-callout-text]", scope);
  const heroBar = gsap.utils.toArray<SVGRectElement>("[data-hero-bar]", scope);

  tl.to([modulesGroup, paletteModulesGroup, paletteGroup, checksGroup, toggleGroup, configChip, tokensGroup, ...heroBar], { opacity: 0, y: "-=6", duration: 0.4, ease: EASE.exit })
    .to(rows, { opacity: 0, duration: 0.3 }, "<")
    .to(frameShape, { morphSVG: envelopePath(LAYOUT.frame), fill: surface, duration: 0.6, ease: EASE.exit }, "<+=0.1")
    .set(toggleThumb, { x: 0 })
    .set(toggleSun, { fill: white, stroke: white })
    .set(toggleMoon, { fill: grey })
    .set([modulesGroup, paletteModulesGroup, paletteGroup, checksGroup, toggleGroup, configChip, tokensGroup, ...heroBar], { y: "+=6" });

  if (calloutLines.length) {
    tl.to([...calloutLines, ...calloutTexts], { opacity: 0, duration: 0.3 }, "<");
  }
}

export const BEAT_LABELS = ["template", "rows", "modules", "config", "tested"] as const;

/**
 * The settled end-state shown instead of the loop under
 * prefers-reduced-motion: assembled, brand-A, fully annotated (hero only —
 * the callout queries come back empty on the card and no-op). A plain
 * gsap.set(modules, {opacity:1}) isn't enough on its own: the four
 * palette-sourced modules live inside data-modules/data-palette-modules
 * wrapper <g>s that default to opacity:0 in the JSX, and a child's own
 * opacity:1 doesn't overcome a parent still at 0 (0 × 1 is still 0) — the
 * same multiplicative-opacity gotcha beat 4's token lines hit earlier. They
 * also still sit at their PALETTE geometry until something moves them, so
 * this re-targets each one at its row directly, the same geometry beat 3's
 * slide-in tweens toward.
 */
export function applySettledState(scope: HTMLElement) {
  const frameShape = scope.querySelector<SVGPathElement>("[data-envelope-frame]");
  const flap = scope.querySelector<SVGPathElement>("[data-envelope-flap]");
  const rows = gsap.utils.toArray<SVGRectElement>("[data-row]", scope);
  const modulesGroup = scope.querySelector<SVGGElement>("[data-modules]");
  const paletteModulesGroup = scope.querySelector<SVGGElement>("[data-palette-modules]");
  const modules = gsap.utils.toArray<SVGGraphicsElement>("[data-module]", scope);
  const accents = gsap.utils.toArray<SVGGraphicsElement>("[data-accent]", scope);
  const configChip = scope.querySelector<SVGRectElement>("[data-config-chip]");
  const heroBar = scope.querySelector<SVGRectElement>("[data-hero-bar]");
  if (!frameShape || !flap || !modulesGroup || !paletteModulesGroup) return;

  const brand = colorVar("brand");
  const blue = colorVar("blue");
  const surface = colorVar("surface");

  // A direct setAttribute, not gsap's morphSVG — this is a static end
  // state, not an animated transition, and morphSVG's `d` writes don't
  // reliably survive gsap.context().revert() across React Strict Mode's
  // dev-only double effect-invoke (see the same fix in buildAssemblyBeats);
  // a plain attribute set sidesteps that entirely.
  frameShape.setAttribute("d", framePath(LAYOUT.frame));
  gsap.set(frameShape, { fill: surface });
  gsap.set(flap, { opacity: 0 });
  gsap.set(rows, { opacity: 1 });
  gsap.set([modulesGroup, paletteModulesGroup], { opacity: 1 });
  gsap.set(modules, { opacity: 1 });
  // The hero module itself is excluded from the generic brand sweep —
  // like the live config beat, its body goes blue and only its own
  // accent bar (a separate element, hero-only — absent on the card,
  // where `heroBar` is simply null) takes the brand red.
  const heroModule = modules.find((m) => m.getAttribute("data-module") === "hero");
  gsap.set(
    accents.filter((a) => a !== heroModule),
    { fill: brand }
  );
  if (heroModule) gsap.set(heroModule, { fill: blue });
  if (heroBar) gsap.set(heroBar, { opacity: 1, fill: brand });
  if (configChip) gsap.set(configChip, { opacity: 1 });

  PALETTE_ITEMS.forEach((item) => {
    const moduleEl = modules.find((m) => m.getAttribute("data-module") === item.variant);
    if (!moduleEl) return;
    const row = ROWS.find((r) => r.variant === item.variant)!;
    if (item.variant === "text") {
      const scaleX = row.width / item.width;
      const scaleY = row.height / item.height;
      gsap.set(moduleEl, { x: row.x - item.x, y: row.y - item.y, scaleX, scaleY, transformOrigin: "0% 0%" });
    } else {
      const target = moduleRect(item.variant as SimpleModuleVariant, row);
      gsap.set(moduleEl, { attr: { x: target.x, y: target.y, width: target.width, height: target.height, rx: target.rx } });
    }
  });

  HERO_CALLOUTS.forEach((callout) => {
    const line = scope.querySelector<SVGLineElement>(`[data-callout-line="${callout.id}"]`);
    const textGroup = scope.querySelector<SVGGElement>(`[data-callout-text="${callout.id}"]`);
    if (!line || !textGroup) return;
    const source = heroCalloutSource(callout.id);
    const target = { x: HERO_LABEL_X - 6, y: callout.labelY - 3 };
    gsap.set(line, { opacity: 1, attr: { x1: source.x, y1: source.y, x2: target.x, y2: target.y } });
    gsap.set(textGroup, { opacity: 1 });
  });
}
