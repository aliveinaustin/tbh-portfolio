// components/visuals/email/primitives.tsx
//
// Shared SVG building blocks for every visual in the modular-email study —
// the card, the detail-page hero and all four decision visuals render
// through these so "the same email" reads consistently everywhere. Plain
// rects and lines, not real copy or brand marks: this is client work, and
// the decision text next to each visual carries the actual meaning.
//
// SVG, not HTML/CSS, because DrawSVG and MorphSVG (envelope→frame, row
// outlines drawing in) only work on SVG shapes, and keeping every beat in
// one coordinate space avoids juggling an SVG/HTML overlay for one
// cohesive animation.

export type ModuleVariant = "header" | "hero" | "text" | "button" | "footer";

export type Rect = { x: number; y: number; width: number; height: number };

/** A single rounded-rect path, always wound the same way starting at the
 * same corner — the shared topology framePath() and envelopeRect() both
 * build on, so MorphSVGPlugin always matches like point to like point
 * instead of twisting into a parallelogram when the two shapes' paths
 * happen to start from different corners or wind in different directions. */
function roundedRectPath({ x, y, width, height, rx = 10 }: Rect & { rx?: number }): string {
  return [
    `M${x + rx},${y}`,
    `L${x + width - rx},${y}`,
    `Q${x + width},${y} ${x + width},${y + rx}`,
    `L${x + width},${y + height - rx}`,
    `Q${x + width},${y + height} ${x + width - rx},${y + height}`,
    `L${x + rx},${y + height}`,
    `Q${x},${y + height} ${x},${y + height - rx}`,
    `L${x},${y + rx}`,
    `Q${x},${y} ${x + rx},${y}`,
    "Z",
  ].join(" ");
}

/** Path data for the rounded frame every email shares — the Template
 * layer. Used both to render a static frame and as a MorphSVGPlugin
 * `morphSVG` target (beat 1 unfolds the envelope into this shape). */
export function framePath(rect: Rect & { rx?: number }): string {
  return roundedRectPath(rect);
}

/** The envelope's bounding box — landscape, roughly letter-proportioned,
 * centered over the same area the (portrait) frame occupies. Same corner
 * radius and path topology as framePath(), just different proportions, so
 * the morph is a clean resize instead of a twisted point-for-point guess. */
export function envelopeRect({ x, y, width, height }: Rect): Rect {
  const cy = y + height / 2;
  const envelopeHeight = width * 0.62;
  return { x, y: cy - envelopeHeight / 2, width, height: envelopeHeight };
}

/** Path data for beat 1's starting shape — the envelope's outline alone
 * (its V flap is a separate element, see envelopeFlapPath, since a second
 * subpath here would reintroduce the same point-mismatch risk). */
export function envelopePath(frameRect: Rect): string {
  return roundedRectPath(envelopeRect(frameRect));
}

/** The envelope's flap — a simple V, drawn as its own element so it can
 * just fade out during the morph rather than needing to morph itself. */
export function envelopeFlapPath(frameRect: Rect): string {
  const r = envelopeRect(frameRect);
  return `M${r.x + 8},${r.y + 10} L${r.x + r.width / 2},${r.y + r.height * 0.58} L${r.x + r.width - 8},${r.y + 10}`;
}

/** The rounded frame every email shares — the Template layer, rendered
 * statically (no morph). */
export function FrameShape({ x, y, width, height, rx = 10, className }: Rect & { rx?: number; className?: string }) {
  return <path data-email-frame d={framePath({ x, y, width, height, rx })} className={className} />;
}

/** One row's outline — the Row pattern layer modules drop into. DrawSVG
 * animates its stroke in beat 2; it stays visible underneath whichever
 * module later sits inside it. */
export function RowOutline({ x, y, width, height, rx = 3, className }: Rect & { rx?: number; className?: string }) {
  return <rect data-row x={x} y={y} width={width} height={height} rx={rx} fill="none" className={className} />;
}

/** A small rounded token chip — the Configuration layer. `label` is set
 * but visually optional (card size omits it; hero size can show it). */
export function TokenChipShape({
  x,
  y,
  width = 16,
  height = 9,
  className,
}: { x: number; y: number; width?: number; height?: number; className?: string }) {
  return <rect data-token x={x} y={y} width={width} height={height} rx={height / 2} className={className} />;
}

/** A tiny sun glyph (center dot + four diagonal rays) for the light/dark
 * toggle's light side. */
export function SunGlyph({ cx, cy, r = 1.4, className }: { cx: number; cy: number; r?: number; className?: string }) {
  const rays = [45, 135, 225, 315].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const inner = r + 0.6;
    const outer = r + 1.6;
    return {
      x1: cx + Math.cos(rad) * inner,
      y1: cy + Math.sin(rad) * inner,
      x2: cx + Math.cos(rad) * outer,
      y2: cy + Math.sin(rad) * outer,
    };
  });
  return (
    <g className={className}>
      <circle cx={cx} cy={cy} r={r} />
      {rays.map((ray, i) => (
        <line key={i} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} strokeLinecap="round" />
      ))}
    </g>
  );
}

/** A tiny crescent-moon glyph for the toggle's dark side — a filled circle
 * with a smaller circle, in the pill's own background color, overlapping
 * to "bite out" a crescent. Simpler and more robust than true path
 * subtraction for a glyph this small. */
export function MoonGlyph({ cx, cy, r = 1.6, bg, className }: { cx: number; cy: number; r?: number; bg: string; className?: string }) {
  return (
    <g className={className}>
      <circle cx={cx} cy={cy} r={r} />
      <circle cx={cx + r * 0.55} cy={cy - r * 0.35} r={r * 0.85} fill={bg} />
    </g>
  );
}

export type SimpleModuleVariant = "header" | "hero" | "button" | "footer";

/**
 * Geometry for the four single-rect module variants, as a fraction of
 * whatever rect they're drawn into — the palette's small preview or a
 * row's full size. Exported as plain numbers (not JSX) so beat 3 can tween
 * a live module's x/y/width/height/rx directly from its palette geometry
 * to its row geometry: a genuine resize as it slots in, not a transform
 * scale standing in for one.
 */
export function moduleRect(variant: SimpleModuleVariant, rect: Rect): Rect & { rx: number } {
  const { x, y, width, height } = rect;
  const cy = y + height / 2;

  switch (variant) {
    case "header":
      return { x: x + width * 0.08, y: cy - height * 0.1, width: width * 0.3, height: height * 0.2, rx: height * 0.1 };
    case "hero":
      return { x: x + width * 0.06, y: y + height * 0.12, width: width * 0.88, height: height * 0.76, rx: 2 };
    case "button":
      return { x: x + width / 2 - width * 0.16, y: cy - height * 0.2, width: width * 0.32, height: height * 0.4, rx: height * 0.2 };
    case "footer":
      return { x: x + width * 0.1, y: cy - height * 0.07, width: width * 0.4, height: height * 0.14, rx: height * 0.07 };
  }
}

/** "Text" is three lines, not one rect, so it can't be a single
 * x/y/width/height tween target the way the other variants are — it
 * scales/translates as a group instead (see buildAssemblyBeats). */
export function TextLines({ rect, className }: { rect: Rect; className?: string }) {
  const { x, y, width, height } = rect;
  return (
    <g data-module="text" className={className}>
      <rect x={x + width * 0.1} y={y + height * 0.15} width={width * 0.8} height={height * 0.14} rx={height * 0.07} />
      <rect x={x + width * 0.1} y={y + height * 0.42} width={width * 0.8} height={height * 0.14} rx={height * 0.07} />
      <rect x={x + width * 0.1} y={y + height * 0.69} width={width * 0.5} height={height * 0.14} rx={height * 0.07} />
    </g>
  );
}

/** A module variant's PREVIEW inside the palette — same shape language,
 * sized to the small palette slot, never itself animated (the live module
 * sitting in front of it is what moves). Button gets its own fixed pill
 * proportions here rather than moduleRect()'s row-relative math: a
 * palette slot is roughly square, and that math (tuned for a wide, short
 * row) produces something closer to a circle than a pill at that aspect
 * ratio. */
export function ModulePreview({ variant, rect }: { variant: ModuleVariant; rect: Rect }) {
  if (variant === "text") return <TextLines rect={rect} />;
  if (variant === "button") {
    const { x, y, width, height } = rect;
    const h = Math.min(height, width) * 0.26;
    return <rect x={x + width / 2 - width * 0.17} y={y + height / 2 - h / 2} width={width * 0.34} height={h} rx={h / 2} />;
  }
  const r = moduleRect(variant, rect);
  return <rect x={r.x} y={r.y} width={r.width} height={r.height} rx={r.rx} />;
}
