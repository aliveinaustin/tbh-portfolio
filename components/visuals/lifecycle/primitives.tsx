// components/visuals/lifecycle/primitives.tsx
//
// Shared SVG building blocks for the Lifecycle & Personalization System
// visuals — the card (and any later hero/decision visuals) render through
// these so "the same system" reads consistently everywhere. Pure shape
// renderers only: a call site that needs a specific element to animate
// independently wraps it in its own `<g data-x={id}>`, the same pattern
// the modular-email visuals use.

export type SourceKind = "website" | "application" | "legacy";

/** A small 2px-stroke glyph for one of the three subscriber pathways — a
 * globe (circle, meridian ellipse, equator), a form (rounded rect, three
 * lines) or an archive box (a lid plus a box with a slot). */
export function SourceIcon({
  kind,
  x,
  y,
  size = 18,
  className,
}: {
  kind: SourceKind;
  x: number;
  y: number;
  size?: number;
  className?: string;
}) {
  // No stroke color set here, deliberately — it inherits from whatever
  // ancestor <g> the call site wraps this in (that's the element GSAP
  // actually tweens for the beat-1 red highlight; an explicit stroke
  // here would win over an animated one on an ancestor and never visibly
  // change color).
  const s = size;
  if (kind === "website") {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s / 2 - 1;
    return (
      <g className={className} fill="none" strokeWidth={1.4} strokeLinecap="round">
        <circle cx={cx} cy={cy} r={r} />
        <ellipse cx={cx} cy={cy} rx={r * 0.42} ry={r} />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
      </g>
    );
  }
  if (kind === "application") {
    const w = s * 0.74;
    const h = s * 0.88;
    const rx = x + (s - w) / 2;
    const ry = y + (s - h) / 2;
    return (
      <g className={className} fill="none" strokeWidth={1.4} strokeLinecap="round">
        <rect x={rx} y={ry} width={w} height={h} rx={1.5} />
        <line x1={rx + w * 0.2} y1={ry + h * 0.3} x2={rx + w * 0.8} y2={ry + h * 0.3} />
        <line x1={rx + w * 0.2} y1={ry + h * 0.54} x2={rx + w * 0.8} y2={ry + h * 0.54} />
        <line x1={rx + w * 0.2} y1={ry + h * 0.78} x2={rx + w * 0.52} y2={ry + h * 0.78} />
      </g>
    );
  }
  // legacy: a lid, floating just above a box with a slot
  const w = s * 0.86;
  const bx = x + (s - w) / 2;
  const lidY = y + s * 0.12;
  const boxY = lidY + s * 0.22;
  const boxH = s * 0.58;
  return (
    <g className={className} fill="none" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x={bx} y={lidY} width={w} height={s * 0.14} rx={1} />
      <rect x={bx + w * 0.06} y={boxY} width={w * 0.88} height={boxH} rx={1} />
      <line x1={x + s * 0.36} y1={boxY + boxH * 0.4} x2={x + s * 0.64} y2={boxY + boxH * 0.4} />
    </g>
  );
}

/** A rounded table: a header row of brighter bars over body rows of
 * fainter ones. With `keyColumn`, the first column is `--blue-light`
 * (header) / `--blue` (body) instead of the neutral grey. `accent`
 * overrides the border color (e.g. white once a step completes).
 * `revealed` skips the default "ghost" start state (dashed frame, hidden
 * content) — for a table that only ever fades in already-formed (the
 * master record), not one a timeline reveals in two stages. */
export function DataTable({
  x,
  y,
  width,
  height,
  cols,
  rows = 3,
  keyColumn = false,
  accent,
  revealed = false,
  className,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  cols: number;
  rows?: number;
  keyColumn?: boolean;
  accent?: string;
  revealed?: boolean;
  className?: string;
}) {
  const headerH = height * 0.24;
  const bodyH = height - headerH;
  const rowH = bodyH / rows;
  const colW = width / cols;
  const pad = colW * 0.14;
  return (
    <g className={className}>
      {/* The frame alone — a caller can tween its stroke/strokeDasharray
          from a faint dashed "ghost" to a solid one without needing a
          second, overlapping placeholder rect. */}
      <rect
        data-table-frame
        x={x}
        y={y}
        width={width}
        height={height}
        rx={3}
        fill="var(--color-surface)"
        stroke={accent ?? "var(--color-text-faint)"}
        strokeWidth={1}
        strokeDasharray={revealed ? undefined : "3 3"}
        opacity={revealed ? 1 : 0.65}
      />
      {/* Header/body bars, grouped so a caller can fade them in as one
          unit once the frame itself has resolved. */}
      <g data-table-content opacity={revealed ? 1 : 0}>
        {Array.from({ length: cols }).map((_, c) => (
          <rect
            key={`h${c}`}
            data-key-col-header={keyColumn && c === 0 ? true : undefined}
            x={x + c * colW + pad}
            y={y + headerH * 0.26}
            width={colW - pad * 2}
            height={headerH * 0.48}
            rx={(headerH * 0.48) / 2}
            fill={keyColumn && c === 0 ? "var(--color-blue-light)" : "var(--color-text)"}
          />
        ))}
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <rect
              key={`b${r}-${c}`}
              data-key-row={keyColumn && c === 0 ? r : undefined}
              x={x + c * colW + pad}
              y={y + headerH + r * rowH + rowH * 0.26}
              width={colW - pad * 2}
              height={rowH * 0.48}
              rx={(rowH * 0.48) / 2}
              fill={keyColumn && c === 0 ? "var(--color-blue)" : "var(--color-text-faint)"}
            />
          ))
        )}
      </g>
    </g>
  );
}

/** A small key glyph — a circular head, a shaft, two teeth. Brand-red:
 * the merged Subscriber Key, the one place red marks a value rather than
 * an active/error state. */
export function KeyIcon({ cx, cy, size = 11, className }: { cx: number; cy: number; size?: number; className?: string }) {
  const r = size * 0.3;
  const headCx = cx - size * 0.32;
  const shaftX2 = cx + size * 0.42;
  return (
    <g className={className} fill="none" stroke="var(--color-brand)" strokeWidth={1.4} strokeLinecap="round">
      <circle cx={headCx} cy={cy} r={r} />
      <line x1={headCx + r} y1={cy} x2={shaftX2} y2={cy} />
      <line x1={shaftX2 - size * 0.16} y1={cy} x2={shaftX2 - size * 0.16} y2={cy + size * 0.22} />
      <line x1={shaftX2} y1={cy} x2={shaftX2} y2={cy + size * 0.3} />
    </g>
  );
}

/** A small pill badge with a mono label — "ID" or "@". `dashed` renders
 * the faint, not-yet-present slot (Record 2 has no Subscriber Key). */
export function IdentityBadge({
  x,
  y,
  width = 22,
  height = 14,
  label,
  dashed = false,
  className,
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  dashed?: boolean;
  className?: string;
}) {
  return (
    <g className={className}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill="var(--color-surface)"
        stroke="var(--color-text-faint)"
        strokeWidth={1}
        strokeDasharray={dashed ? "2 2" : undefined}
        opacity={dashed ? 0.6 : 1}
      />
      <text x={x + width / 2} y={y + height / 2 + 2.6} textAnchor="middle" fontSize={7} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text-faint)" opacity={dashed ? 0.6 : 1}>
        {label}
      </text>
    </g>
  );
}

/** A small rounded chip — the shared preference fields ("PREF") that move
 * between tables, or the confirmation "TOKEN" in the opt-in flow. */
export function Chip({ x, y, width = 24, height = 11, label, className }: { x: number; y: number; width?: number; height?: number; label: string; className?: string }) {
  return (
    <g className={className}>
      <rect x={x} y={y} width={width} height={height} rx={height / 2} fill="var(--color-blue)" stroke="var(--color-surface)" strokeWidth={0.75} />
      <text x={x + width / 2} y={y + height / 2 + 2.3} textAnchor="middle" fontSize={6} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)">
        {label}
      </text>
    </g>
  );
}

/** Three stacked server bars with a status dot each, labelled below. Each
 * dot carries `data-led={i}` so a timeline can drive the top-to-bottom
 * cascade blink independently of the bars themselves. */
export function ServerStack({ x, y, width = 40, height = 34, label = "SALESFORCE", className }: { x: number; y: number; width?: number; height?: number; label?: string; className?: string }) {
  const gap = 3;
  const barH = (height - gap * 2) / 3;
  return (
    <g className={className}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={x} y={y + i * (barH + gap)} width={width} height={barH} rx={2} fill="var(--color-surface)" stroke="var(--color-text-faint)" strokeWidth={1} />
          <circle data-led={i} cx={x + 5} cy={y + i * (barH + gap) + barH / 2} r={1.3} fill="var(--color-text-faint)" />
        </g>
      ))}
      <text x={x + width / 2} y={y + height + 10} textAnchor="middle" fontSize={6.5} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={0.5}>
        {label}
      </text>
    </g>
  );
}

/** A rounded state pill — the sync rollout's six segments, and the
 * opt-in flow's Sign-up/Pending/Confirmed states: pending (faint dashed
 * outline), active (brand-red), done (white, paired with a check). No
 * `stroke`/`strokeDasharray`/`opacity` here, deliberately — the state
 * lives entirely in whatever `<g data-sync-box={id} stroke=... >` the
 * call site wraps this in and a timeline animates; this primitive just
 * inherits it. An own explicit stroke attribute here would permanently
 * win over that inherited value (SVG presentation attributes sit below
 * inherited author styles in the cascade) and the pill would never
 * visibly change state. */
export function PillBox({ x, y, width, height, className }: { x: number; y: number; width: number; height: number; className?: string }) {
  return <rect x={x} y={y} width={width} height={height} rx={Math.min(height / 2, 6)} fill="none" strokeWidth={1.25} className={className} />;
}

/** The checkmark path alone, sized to sit inside a PillBox — rendered
 * separately so it can fade in/out on its own timing from the box. Sized
 * off `height` and centered in `width`, not computed as a fraction of
 * width — a box much wider than it is tall (the desktop sync bar) would
 * otherwise stretch the glyph instead of just centering a normal-looking
 * checkmark inside it. */
export function PillCheck({ x, y, width, height, className }: { x: number; y: number; width: number; height: number; className?: string }) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const s = height;
  return (
    <path
      d={`M${cx - s * 0.38},${cy + s * 0.05} L${cx - s * 0.11},${cy + s * 0.2} L${cx + s * 0.38},${cy - s * 0.18}`}
      fill="none"
      stroke="var(--color-text)"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    />
  );
}
