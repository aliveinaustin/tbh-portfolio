// components/visuals/email/EmailAssemblySvg.tsx
import { cn } from "@/lib/cn";
import {
  envelopeFlapPath,
  envelopePath,
  moduleRect,
  ModulePreview,
  MoonGlyph,
  SunGlyph,
  TextLines,
  type SimpleModuleVariant,
} from "@/components/visuals/email/primitives";
import { configChipRect, HERO_CALLOUTS, HERO_LABEL_X, LAYOUT, LEGEND_ITEMS, PALETTE_ITEMS, ROWS, heroCalloutSource } from "@/components/visuals/email/layout";

const SIZE = {
  // Short on mobile: the aspect-video visual panel only gives this card
  // ~190px of height there, and the palette/legend column is hidden below
  // sm anyway (see the `hidden sm:block` groups below), so there's nothing
  // for the viewBox's full width to serve at that size regardless.
  card: "h-40 sm:h-64 md:h-72",
  hero: "h-72 sm:h-96 lg:h-[28rem]",
} as const;

/**
 * The shared markup for the modular-email assembly animation — reused by
 * both the carousel card and the detail-page hero (just bigger), the same
 * way ScreenDeck's one implementation serves both. All the actual motion
 * lives in buildAssemblyBeats()/buildHeroTimeline.ts, which query these by
 * data-* attribute; this component only lays out the static geometry.
 *
 * Four of the pieces — template, row pattern, module, configuration — are
 * each their OWN sibling <svg> (not <g> groups inside one shared SVG),
 * absolutely stacked with the same viewBox so the flat view looks
 * identical to a single SVG. This is what lets the hero's explode phase
 * apply a REAL CSS 3D transform (rotationX + z + perspective) to each one
 * independently: GSAP renders a <g> element's transform through the
 * legacy SVG `transform` *attribute*, which is 2D-only — rotationX/z
 * silently no-op there — but a root <svg> tag, from the host document's
 * perspective, is just a normal element, so CSS 3D applies to it exactly
 * like it would to a <div>. A fifth SVG, data-overlay, holds everything
 * that never explodes (connectors, palette, legend, toggle, the hero's
 * callout lines/labels) and stays flat throughout.
 *
 * Beat 3's live modules start rendered at their PALETTE slot's geometry
 * (not their row's) for the three single-rect variants that slide in from
 * there (hero/button/footer) — buildAssemblyBeats tweens x/y/width/height
 * directly from there to the row's geometry, a real resize rather than a
 * transform standing in for one. The header module isn't in the palette
 * (beat 3 only names Hero/Text/Button/Footer) and sits at its row's
 * geometry natively, just fading/scaling in.
 *
 * Beat 4 reuses the palette's column for a brand legend (the palette has
 * already faded out by then) — token chips fly out from each brand's
 * legend box to the header/button rows as that brand is "applied."
 */
export default function EmailAssemblySvg({ size = "card" }: { size?: keyof typeof SIZE }) {
  const { frame, toggle: TOGGLE } = LAYOUT;
  const headerRow = ROWS[0];
  const heroRow = ROWS.find((r) => r.variant === "hero")!;
  const heroModuleRect = moduleRect("hero", heroRow);
  // Hero-only: a thin accent bar across the top of the hero image module,
  // colored by its own token (same red as header/button) — separate from
  // the module's own body fill below, which the Configuration callout's
  // blue chip drives instead. Gives the config beat two distinct, visible
  // color changes to point at rather than one flat sweep.
  const heroBarRect = { x: heroModuleRect.x, y: heroModuleRect.y, width: heroModuleRect.width, height: heroModuleRect.height * 0.14, rx: 2 };
  const toggleX = frame.x + frame.width - TOGGLE.width;
  const toggleY = frame.y - TOGGLE.height - 10;
  const isHero = size === "hero";
  const viewBox = isHero ? LAYOUT.heroViewBox : LAYOUT.viewBox;

  const planeClass = cn("absolute inset-0 h-full w-full overflow-visible");

  return (
    <div className="relative" style={isHero ? { perspective: "1000px" } : undefined}>
      {/* The base layer — in normal flow, so it's what actually reserves
          the component's layout height; the other four are absolutely
          stacked on top of it at the same size. */}
      <svg aria-hidden="true" data-stack-plane="template" viewBox={viewBox} className={cn("w-full overflow-visible", SIZE[size])} fill="none">
        <g data-email-frame-group stroke="var(--color-text-faint)" strokeWidth={1.5}>
          <rect data-plane-outline="template" x={frame.x} y={frame.y} width={frame.width} height={frame.height} rx={10} fill="none" strokeDasharray="3 3" opacity={0} />
          <path data-envelope-frame d={envelopePath(frame)} fill="var(--color-surface)" />
          <path data-envelope-flap d={envelopeFlapPath(frame)} fill="none" strokeWidth={1.25} />
        </g>
      </svg>

      <svg aria-hidden="true" data-stack-plane="row-pattern" viewBox={viewBox} className={planeClass} fill="none">
        <g data-rows>
          <rect data-plane-outline="row-pattern" x={frame.x} y={frame.y} width={frame.width} height={frame.height} rx={10} fill="none" stroke="var(--color-text-faint)" strokeWidth={1} strokeDasharray="3 3" opacity={0} />
          {ROWS.map((row) => (
            <rect
              key={row.variant}
              data-row={row.variant}
              x={row.x}
              y={row.y}
              width={row.width}
              height={row.height}
              rx={3}
              fill="none"
              stroke="var(--color-text-faint)"
              strokeWidth={1}
              opacity={0}
            />
          ))}
        </g>
      </svg>

      <svg aria-hidden="true" data-stack-plane="module" viewBox={viewBox} className={planeClass} fill="none">
        <rect data-plane-outline="module" x={frame.x} y={frame.y} width={frame.width} height={frame.height} rx={10} fill="none" stroke="var(--color-text-faint)" strokeWidth={1} strokeDasharray="3 3" opacity={0} />
        {/* Header isn't palette-sourced — it settles in at its row directly. */}
        <g data-modules fill="var(--color-text-faint)" opacity={0}>
          <LiveModule variant="header" rect={headerRow} />
        </g>
        {/* The four palette-sourced live modules, rendered at their palette
            slot's geometry to start (see PALETTE_ITEMS below for the slots
            themselves) — buildAssemblyBeats tweens each into its row. */}
        <g data-palette-modules fill="var(--color-text-faint)" opacity={0}>
          {PALETTE_ITEMS.map((item) => (
            <LiveModule key={item.variant} variant={item.variant} rect={item} />
          ))}
        </g>
        {isHero && <rect data-hero-bar {...heroBarRect} fill="var(--color-text-faint)" opacity={0} />}
      </svg>

      <svg aria-hidden="true" data-stack-plane="configuration" viewBox={viewBox} className={planeClass} fill="none">
        <rect data-plane-outline="configuration" x={frame.x} y={frame.y} width={frame.width} height={frame.height} rx={10} fill="none" stroke="var(--color-text-faint)" strokeWidth={1} strokeDasharray="3 3" opacity={0} />
        <g data-tokens opacity={0} stroke="var(--color-surface)" strokeWidth={0.75}>
          <rect data-token="header" width={12} height={7} rx={3.5} />
          <rect data-token="button" width={12} height={7} rx={3.5} />
          {isHero && <rect data-token="hero-bar" width={12} height={7} rx={3.5} />}
        </g>
        {/* Hero-only: a persistent chip on the hero module representing the
            campaign/brand config feeding into it — unlike the beat 4 token
            chips above (which fly past briefly during the brand-cycle demo),
            this one stays, giving the Configuration callout a fixed, always-
            visible thing to point at. Hidden on the card (opacity 0, never
            tweened there). */}
        <rect data-config-chip {...configChipRect()} fill="var(--color-blue)" stroke="var(--color-surface)" strokeWidth={0.75} opacity={0} />
      </svg>

      {/* Everything that never explodes — connectors, palette, legend,
          token-lines, scan/checks, the toggle and (hero-only) the callout
          leader lines + labels — stays flat throughout. */}
      <svg aria-hidden="true" data-overlay viewBox={viewBox} className={planeClass} fill="none">
        <circle data-draw-dot r={1.6} fill="var(--color-brand)" opacity={0} />

        {/* Dotted connector lines, one per palette item — fade in to point
            from the palette slot to the row it's headed for, then fade out
            once that module lands. */}
        <g data-connectors className="hidden sm:block" opacity={0} stroke="var(--color-brand)" strokeWidth={0.75} strokeDasharray="2 2">
          {PALETTE_ITEMS.map((item) => {
            const row = ROWS.find((r) => r.variant === item.variant)!;
            return (
              <line
                key={item.variant}
                data-connector={item.variant}
                x1={item.x}
                y1={item.y + item.height / 2}
                x2={row.x + row.width}
                y2={row.y + row.height / 2}
              />
            );
          })}
        </g>

        {/* Hidden below sm — the aspect-video panel there only has room for
            the main illustration; the palette column has nowhere to go, and
            the modules it previews still slide into their rows either way. */}
        <g data-palette className="hidden sm:block" opacity={0}>
          {PALETTE_ITEMS.map((item) => (
            <g key={item.variant} data-palette-slot={item.variant}>
              <rect
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rx={2}
                fill="var(--color-surface)"
                stroke="var(--color-border-dim)"
                strokeWidth={1}
              />
              <g fill="var(--color-text-faint)">
                <ModulePreview variant={item.variant} rect={item} />
              </g>
              <text
                x={item.x + item.width / 2}
                y={item.y - 6.5}
                textAnchor="middle"
                fontSize={6.5}
                fontFamily="var(--font-mono)"
                fill="var(--color-text-faint)"
                stroke="none"
              >
                {item.variant.toUpperCase()}
              </text>
            </g>
          ))}
        </g>

        {/* Beat 4's brand legend — same column the palette used above, which
            has always faded out by the time this appears. The frame itself
            letterboxes down to a narrow, centered column below sm (palette
            hidden, SVG short), leaving real empty space on both sides — the
            legend still fits there, just as a single bold letter instead of
            the full "BRAND A" (illegible at that scale). */}
        <g data-legend opacity={0}>
          {LEGEND_ITEMS.map((box) => (
            <g key={box.id} data-legend-box={box.id}>
              <rect
                data-legend-box-rect={box.id}
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
                rx={3}
                fill="var(--color-surface)"
                stroke="var(--color-text-faint)"
                strokeWidth={1}
              />
              <text
                data-legend-label={box.id}
                x={box.x + box.width / 2}
                y={box.y + box.height / 2 + 2.3}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fill="var(--color-text-faint)"
                stroke="none"
              >
                <tspan className="hidden sm:inline" fontSize={7}>{`BRAND ${box.id}`}</tspan>
                <tspan className="sm:hidden" fontSize={13} fontWeight={700}>
                  {box.id}
                </tspan>
              </text>
            </g>
          ))}
        </g>

        {/* Token chips + their dotted guide lines — repositioned and
            recolored per brand wave in buildAssemblyBeats, flying from that
            brand's legend box to the header/button rows. */}
        <g data-token-lines opacity={0} strokeWidth={0.75} strokeDasharray="2 2">
          <line data-token-line="header" />
          <line data-token-line="button" />
        </g>

        <rect data-scan x={frame.x} y={frame.y} width={frame.width} height={3} fill="var(--color-text)" opacity={0} />

        <g data-checks opacity={0} stroke="var(--color-text)" strokeWidth={1.5} fill="none" strokeLinecap="round">
          {ROWS.map((row) => (
            <path
              key={row.variant}
              data-check={row.variant}
              d={`M${frame.x + frame.width + 6},${row.y + row.height / 2 - 2} l2,2.5 l4,-5`}
            />
          ))}
        </g>

        {/* Light/Dark toggle — centered above the frame so it never overlaps
            the corner, with a sun glyph on the light side and a crescent
            moon on the dark side; the thumb slides between them. */}
        <g data-toggle transform={`translate(${toggleX}, ${toggleY})`} opacity={0}>
          <rect width={TOGGLE.width} height={TOGGLE.height} rx={TOGGLE.height / 2} fill="var(--color-surface-highest)" stroke="var(--color-border-dim)" strokeWidth={0.75} />
          <g data-toggle-sun fill="var(--color-text)" stroke="var(--color-text)" strokeWidth={0.6}>
            <SunGlyph cx={TOGGLE.height / 2 + 2.5} cy={TOGGLE.height / 2} r={1.3} />
          </g>
          <g data-toggle-moon fill="var(--color-text-faint)">
            <MoonGlyph cx={TOGGLE.width - TOGGLE.height / 2 - 2.5} cy={TOGGLE.height / 2} r={1.6} bg="var(--color-surface-highest)" />
          </g>
          <circle data-toggle-thumb cx={TOGGLE.height / 2} cy={TOGGLE.height / 2} r={TOGGLE.thumbR} fill="var(--color-text)" />
        </g>

        {/* Hero-only callouts — a leader line per layer, drawing out from a
            point on the assembled email to a label + description on the
            right, in the same traced-line style as the card's connectors and
            token lines. Collapsed (x2/y2 = source) and hidden by default;
            buildHeroCallouts draws each one in as its layer forms. Not
            rendered for the card: HERO_LABEL_X sits outside the card's
            narrower viewBox, and overflow-visible would otherwise bleed it
            into view regardless of the viewBox clip. */}
        {isHero && (
          <g data-callouts>
            {HERO_CALLOUTS.map((callout) => {
              const source = heroCalloutSource(callout.id);
              const color = CALLOUT_COLOR[callout.id];
              const descWidth = 340 - HERO_LABEL_X - 4;
              return (
                <g key={callout.id} data-callout={callout.id}>
                  <line
                    data-callout-line={callout.id}
                    x1={source.x}
                    y1={source.y}
                    x2={source.x}
                    y2={source.y}
                    stroke={color}
                    strokeWidth={0.75}
                    strokeDasharray="2 2"
                    opacity={0}
                  />
                  <g data-callout-text={callout.id} opacity={0}>
                    <text
                      data-callout-label={callout.id}
                      x={HERO_LABEL_X}
                      y={callout.labelY}
                      className="text-[10px] sm:text-[8px]"
                      fontFamily="var(--font-mono)"
                      fontWeight={700}
                      letterSpacing={0.5}
                      fill={color}
                      stroke="none"
                    >
                      {callout.label}
                    </text>
                    {/* The description only fits legibly once the hero (and
                        its callout column) has real width to work with —
                        below sm it'd render at an unreadably tiny size, so
                        it's hidden there rather than shrunk further. */}
                    <foreignObject x={HERO_LABEL_X} y={callout.labelY + 4} width={descWidth} height={28} className="hidden sm:block">
                      <div
                        style={{ fontFamily: "var(--font-sans)", fontSize: "6.5px", lineHeight: 1.35, color: "var(--color-text-faint)" }}
                      >
                        {callout.description}
                      </div>
                    </foreignObject>
                  </g>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}

const CALLOUT_COLOR: Record<(typeof HERO_CALLOUTS)[number]["id"], string> = {
  template: "var(--color-text)",
  configuration: "var(--color-blue-light)",
  module: "var(--color-brand)",
  "row-pattern": "var(--color-text)",
};

function LiveModule({ variant, rect }: { variant: ModulePreviewVariant; rect: { x: number; y: number; width: number; height: number } }) {
  if (variant === "text") return <TextLines rect={rect} />;
  const r = moduleRect(variant as SimpleModuleVariant, rect);
  const accent = variant === "header" || variant === "hero" || variant === "button";
  return <rect data-module={variant} data-accent={accent || undefined} x={r.x} y={r.y} width={r.width} height={r.height} rx={r.rx} />;
}

type ModulePreviewVariant = "header" | "hero" | "text" | "button" | "footer";
