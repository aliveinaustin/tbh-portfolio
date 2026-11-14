// components/visuals/lifecycle/LifecycleConvergenceSvg.tsx
//
// Static markup for the "Convergence" card — two sibling <svg> trees
// (desktop side-by-side, mobile stacked), sharing the same data-*
// vocabulary so buildConvergenceBeats.ts drives both with one timeline;
// only one is ever visible at a time (Tailwind `hidden`/`sm:` toggle).
// Reuses FrameShape from the modular-email study's primitives for the
// beat-5 email mockup rather than redrawing a frame shape.

import { FrameShape } from "@/components/visuals/email/primitives";
import { SourceIcon, DataTable, KeyIcon, IdentityBadge, Chip, ServerStack, PillBox, PillCheck } from "@/components/visuals/lifecycle/primitives";
import {
  PATHWAYS,
  SYNC_STEPS,
  D_WIDTH,
  D_VIEWBOX,
  D_SOURCE,
  D_SOURCE_LABEL_X,
  D_ROW_Y,
  D_TABLE,
  D_TABLE_COVER_X,
  D_CONNECTOR_ST_X1,
  D_MASTER,
  D_BADGE_Y,
  D_SALESFORCE,
  D_SALESFORCE_SLIDE_OFFSET,
  D_EMAIL,
  D_SYNC_Y,
  D_SYNC_HEIGHT,
  D_SYNC_MARGIN,
  M_WIDTH,
  M_VIEWBOX,
  M_COL_X,
  M_SOURCE_ROW_Y,
  M_SOURCE_SIZE,
  M_SOURCE_X,
  M_TABLE_ROW_Y,
  M_TABLE_MASTER_Y,
  M_TABLE,
  M_TABLE_X,
  M_BADGE_X,
  M_BADGE_Y,
  M_MASTER,
  M_MASTER_COMPACT,
  M_SALESFORCE,
  M_EMAIL,
  M_SYNC_Y,
  M_SYNC_HEIGHT,
  M_SYNC_MARGIN,
  M_SYNC_LABEL_Y,
} from "@/components/visuals/lifecycle/layout";

function DesktopSvg() {
  // Was hardcoded to the viewBox's old 300-unit width — once it widened
  // to D_WIDTH (380) the six segments no longer spanned it, leaving the
  // bar looking left-aligned with dead space on the right.
  const syncWidth = (D_WIDTH - D_SYNC_MARGIN * 2 - 5 * 4) / 6;
  return (
    <svg data-viewport="desktop" viewBox={D_VIEWBOX} className="hidden h-auto w-full sm:block" aria-hidden="true">
      {/* --- Sources (always present; dim in beats 4–5) --- */}
      {PATHWAYS.map((p) => {
        const y = D_ROW_Y[p.id];
        return (
          <g key={p.id} data-source={p.id} stroke="var(--color-text-faint)">
            <SourceIcon kind={p.id} x={D_SOURCE.x} y={y} size={D_SOURCE.size} />
            {/* stroke="none" overrides the wrapping <g>'s stroke — without
                it the label inherits the icon's animated stroke color,
                doubling up with its own fill tween and reading as bold/off-color. */}
            <text
              data-source-label={p.id}
              x={D_SOURCE_LABEL_X}
              y={y + D_SOURCE.size / 2 + 2.8}
              fontSize={7}
              fontFamily="var(--font-mono)"
              fontWeight={700}
              fill="var(--color-text-faint)"
              stroke="none"
              letterSpacing={0.5}
            >
              {p.label}
            </text>
          </g>
        );
      })}

      {/* --- Source→table connectors + packets (beat 1) --- */}
      {PATHWAYS.map((p) => {
        const y = D_ROW_Y[p.id] + D_SOURCE.size / 2;
        return (
          <g key={p.id}>
            <line data-connector-st={p.id} x1={D_CONNECTOR_ST_X1[p.id]} y1={y} x2={D_TABLE.x - 2} y2={y} stroke="var(--color-text-faint)" strokeWidth={0.75} strokeDasharray="2 2" opacity={0.6} />
            {[0, 1, 2].map((n) => (
              <circle key={n} data-packet-st={`${p.id}-${n}`} cy={y} r={2} fill="var(--color-blue-light)" opacity={0} />
            ))}
          </g>
        );
      })}

      {/* --- Source tables (beat 2 reveal, beat 3 shrink) --- */}
      {PATHWAYS.map((p) => (
        <g key={p.id} data-table={p.id}>
          <DataTable x={D_TABLE.x} y={D_ROW_Y[p.id]} width={D_TABLE.width} height={D_TABLE.height} cols={p.cols} />
        </g>
      ))}

      {/* --- Table→master connectors + PREF chips (beat 3) ---
          Endpoints are the tables' FINAL covering position and master's
          resting position — fixed, not recomputed — because the line is
          revealed once (as the table/master animate into it) and then
          stays static while the PREF chips travel along it. */}
      {PATHWAYS.map((p, i) => {
        const fromY = D_ROW_Y[p.id] + D_TABLE.height / 2;
        const toY = D_MASTER.y + D_MASTER.height / 2 + (i - 1) * 10;
        return (
          <g key={p.id}>
            <line
              data-connector-tm={p.id}
              x1={D_TABLE_COVER_X + D_TABLE.width + 2}
              y1={fromY}
              x2={D_MASTER.x - 2}
              y2={toY}
              stroke="var(--color-blue-light)"
              strokeWidth={0.75}
              strokeDasharray="2 2"
              opacity={0}
            />
            <g data-pref-chip={p.id} opacity={0}>
              <Chip x={0} y={0} label="PREF" />
            </g>
          </g>
        );
      })}

      {/* --- ID/@ badges → key icon (beat 3) --- */}
      <g data-id-badge opacity={0}>
        <IdentityBadge x={0} y={0} label="ID" />
      </g>
      <g data-at-badge opacity={0}>
        <IdentityBadge x={0} y={0} label="@" />
      </g>
      {/* Static outer translate puts local (0,0) exactly at the glyph's
          intended pivot — GSAP's pop-in scale on the inner group then
          just scales around "0 0" with zero ambiguity, rather than
          fighting GSAP's own bounding-box-based origin resolution. */}
      <g transform={`translate(${D_MASTER.x + D_MASTER.width / 2}, ${D_BADGE_Y})`}>
        <g data-key-icon opacity={0}>
          {/* cx nudged +1.1 (not 0) — the glyph's head circle pulls its
              true bounding-box center 1.1 units left of its own "cx" prop,
              so without this offset the pop-in scales around a point
              that's visually off from the glyph's actual center. */}
          <KeyIcon cx={1.1} cy={0} />
        </g>
      </g>

      {/* --- Master record (beat 3+): slides in from the right at 0
          opacity to its resting x — see data-master's GSAP x offset,
          set in resetConvergence(). About a third of its first draft's
          height, so three rows reads proportionally right next to the
          source tables rather than towering over them. --- */}
      <g data-master opacity={0}>
        <DataTable x={D_MASTER.x} y={D_MASTER.y} width={D_MASTER.width} height={D_MASTER.height} cols={4} rows={3} keyColumn revealed accent="var(--color-text)" />
        <text x={D_MASTER.x + D_MASTER.width / 2} y={D_MASTER.y + D_MASTER.height + 10} textAnchor="middle" fontSize={7} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={0.5}>
          MASTER
        </text>
      </g>

      {/* --- Master ↔ Salesforce (beat 4): master slides further left at
          the start of this beat while Salesforce slides in from the
          right — the connector's x1/x2 below are its BEFORE-slide
          positions; buildConvergenceBeats.ts tweens both ends to their
          settled positions in lockstep with the two slides. --- */}
      <g data-salesforce opacity={0}>
        <ServerStack x={D_SALESFORCE.x} y={D_SALESFORCE.y} width={D_SALESFORCE.width} height={D_SALESFORCE.height} />
      </g>
      <line
        data-connector-ms
        x1={D_MASTER.x + D_MASTER.width + 2}
        y1={D_SALESFORCE.y + D_SALESFORCE.height / 2}
        x2={D_SALESFORCE.x + D_SALESFORCE_SLIDE_OFFSET - 2}
        y2={D_SALESFORCE.y + D_SALESFORCE.height / 2}
        stroke="var(--color-blue-light)"
        strokeWidth={0.75}
        strokeDasharray="2 2"
        opacity={0}
      />
      {[0, 1].map((n) => (
        <circle key={n} data-packet-ms={n} cy={D_SALESFORCE.y + D_SALESFORCE.height / 2} r={2} fill="var(--color-blue-light)" opacity={0} />
      ))}

      {/* --- Six-segment sync rollout (beat 4) --- */}
      <g data-sync-group opacity={0}>
        {SYNC_STEPS.map((step, i) => {
          const x = D_SYNC_MARGIN + i * (syncWidth + 4);
          return (
            <g key={step}>
              <g data-sync-box={step}>
                <PillBox x={x} y={D_SYNC_Y} width={syncWidth} height={D_SYNC_HEIGHT} />
              </g>
              <g data-sync-check={step} opacity={0}>
                <PillCheck x={x} y={D_SYNC_Y} width={syncWidth} height={D_SYNC_HEIGHT} />
              </g>
              <text x={x + syncWidth / 2} y={D_SYNC_Y + D_SYNC_HEIGHT + 9} textAnchor="middle" fontSize={5.2} fontFamily="var(--font-mono)" fill="var(--color-text-faint)" letterSpacing={0.3}>
                {step}
              </text>
            </g>
          );
        })}
      </g>

      {/* --- Master → Email (beat 5) --- */}
      <g data-email opacity={0}>
        <FrameShape x={D_EMAIL.x} y={D_EMAIL.y} width={D_EMAIL.width} height={D_EMAIL.height} rx={4} className="fill-(--color-surface) stroke-(--color-text-faint)" />
        <rect x={D_EMAIL.x} y={D_EMAIL.y} width={D_EMAIL.width} height={D_EMAIL.height * 0.08} rx={2} fill="var(--color-brand)" />
        <text data-greeting x={D_EMAIL.x + 6} y={D_EMAIL.y + D_EMAIL.height * 0.26} fontSize={8} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" />
        <rect x={D_EMAIL.x + 6} y={D_EMAIL.y + D_EMAIL.height * 0.36} width={D_EMAIL.width - 12} height={3} rx={1.5} fill="var(--color-text-faint)" />
        <rect x={D_EMAIL.x + 6} y={D_EMAIL.y + D_EMAIL.height * 0.46} width={(D_EMAIL.width - 12) * 0.7} height={3} rx={1.5} fill="var(--color-text-faint)" />
        <g data-pref-block opacity={0}>
          <rect x={D_EMAIL.x + 6} y={D_EMAIL.y + D_EMAIL.height * 0.58} width={D_EMAIL.width - 12} height={D_EMAIL.height * 0.3} rx={3} fill="none" stroke="var(--color-blue-light)" strokeWidth={1} />
          <g data-pref-block-chip transform={`translate(${D_EMAIL.x + 10}, ${D_EMAIL.y + D_EMAIL.height * 0.62})`}>
            <Chip x={0} y={0} width={20} height={9} label="PREF" />
          </g>
          <rect x={D_EMAIL.x + 10} y={D_EMAIL.y + D_EMAIL.height * 0.82} width={(D_EMAIL.width - 20) * 0.75} height={2.5} rx={1.25} fill="var(--color-text-faint)" />
        </g>
      </g>
      {/* No separate connector-me line — data-connector-ms IS the
          persistent master-outgoing line for the rest of the card; its x2
          just retargets from Salesforce's edge to email's edge (both sit
          at the same y as master's own center, so the retarget is a
          straight horizontal move, not a new line at a different slope). */}
      <circle data-packet-me cy={D_MASTER.y + D_MASTER.height / 2} r={2} fill="var(--color-blue-light)" opacity={0} />
    </svg>
  );
}

function MobileSvg() {
  // Six boxes in a single row (not a 3×2 grid) — per-step labels don't
  // fit underneath each one at this width, so only the current step's
  // name is shown, in the text label below the row (data-mobile-sync-label).
  const syncWidth = (M_WIDTH - M_SYNC_MARGIN * 2 - 5 * 4) / 6;
  return (
    <svg data-viewport="mobile" viewBox={M_VIEWBOX} className="h-auto w-full sm:hidden" aria-hidden="true">
      {/* --- Sources (beats 1–2): icon + label in each of 3 even columns --- */}
      {PATHWAYS.map((p) => (
        <g key={p.id} data-source={p.id} stroke="var(--color-text-faint)">
          <SourceIcon kind={p.id} x={M_SOURCE_X[p.id]} y={M_SOURCE_ROW_Y} size={M_SOURCE_SIZE} />
          <text
            data-source-label={p.id}
            x={M_COL_X[p.id]}
            y={M_SOURCE_ROW_Y + M_SOURCE_SIZE + 10}
            textAnchor="middle"
            fontSize={7}
            fontFamily="var(--font-mono)"
            fontWeight={700}
            fill="var(--color-text-faint)"
            stroke="none"
            letterSpacing={0.3}
          >
            {p.label}
          </text>
        </g>
      ))}

      {/* --- Vertical source→table connectors + packets (beat 1) --- */}
      {PATHWAYS.map((p) => {
        const x = M_COL_X[p.id];
        const y1 = M_SOURCE_ROW_Y + M_SOURCE_SIZE + 16;
        const y2 = M_TABLE_ROW_Y - 2;
        return (
          <g key={p.id}>
            <line data-connector-st={p.id} x1={x} y1={y1} x2={x} y2={y2} stroke="var(--color-text-faint)" strokeWidth={0.75} strokeDasharray="2 2" opacity={0.6} />
            {[0, 1, 2].map((n) => (
              <circle key={n} data-packet-st={`${p.id}-${n}`} cx={x} r={2} fill="var(--color-blue-light)" opacity={0} />
            ))}
          </g>
        );
      })}

      {/* --- Source tables (beats 1-2 at M_TABLE_ROW_Y, beat 3 slides up
          to M_TABLE_MASTER_Y once the source row above fades out) --- */}
      {PATHWAYS.map((p) => (
        <g key={p.id} data-table={p.id}>
          <DataTable x={M_TABLE_X[p.id]} y={M_TABLE_ROW_Y} width={M_TABLE.width} height={M_TABLE.height} cols={p.cols} />
        </g>
      ))}

      {/* --- Table→master connectors + PREF chips (beat 3) — all three
          converge on the SAME point above master's key column (not three
          separate points across its width), the same point the ID/@/key
          badges sit at — that's what makes it read as "this is where the
          key merges," and lets the key column's own fill trigger off a
          single shared arrival point. --- */}
      {PATHWAYS.map((p) => {
        const fromX = M_COL_X[p.id];
        const fromY = M_TABLE_MASTER_Y + M_TABLE.height + 2;
        const toX = M_BADGE_X;
        const toY = M_MASTER.y - 2;
        return (
          <g key={p.id}>
            <line data-connector-tm={p.id} x1={fromX} y1={fromY} x2={toX} y2={toY} stroke="var(--color-blue-light)" strokeWidth={0.75} strokeDasharray="2 2" opacity={0} />
            <g data-pref-chip={p.id} opacity={0}>
              <Chip x={0} y={0} label="PREF" />
            </g>
          </g>
        );
      })}

      {/* --- ID/@ badges → key icon (beat 3), far-left column --- */}
      <g data-id-badge opacity={0}>
        <IdentityBadge x={0} y={0} label="ID" />
      </g>
      <g data-at-badge opacity={0}>
        <IdentityBadge x={0} y={0} label="@" />
      </g>
      <g transform={`translate(${M_BADGE_X}, ${M_BADGE_Y})`}>
        <g data-key-icon opacity={0}>
          {/* cx nudged +1.1 (not 0) — the glyph's head circle pulls its
              true bounding-box center 1.1 units left of its own "cx" prop,
              so without this offset the pop-in scales around a point
              that's visually off from the glyph's actual center. */}
          <KeyIcon cx={1.1} cy={0} />
        </g>
      </g>

      {/* --- Master record, beat 3's full-width version --- */}
      <g data-master opacity={0}>
        <DataTable x={M_MASTER.x} y={M_MASTER.y} width={M_MASTER.width} height={M_MASTER.height} cols={4} rows={3} keyColumn revealed accent="var(--color-text)" />
        <text x={M_MASTER.x + M_MASTER.width / 2} y={M_MASTER.y + M_MASTER.height + 10} textAnchor="middle" fontSize={7} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={0.5}>
          MASTER
        </text>
      </g>

      {/* --- Master record, beats 4-5's compact left-column version —
          a separate element (not a resize of the one above) so each can
          fade independently without distorting strokes/corners. --- */}
      <g data-master-compact opacity={0}>
        <DataTable x={M_MASTER_COMPACT.x} y={M_MASTER_COMPACT.y} width={M_MASTER_COMPACT.width} height={M_MASTER_COMPACT.height} cols={4} rows={3} keyColumn revealed accent="var(--color-text)" />
        <text x={M_MASTER_COMPACT.x + M_MASTER_COMPACT.width / 2} y={M_MASTER_COMPACT.y + M_MASTER_COMPACT.height + 10} textAnchor="middle" fontSize={7} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={0.5}>
          MASTER
        </text>
      </g>

      {/* --- Salesforce (beat 4) / email (beat 5), right column --- */}
      <g data-salesforce opacity={0}>
        <ServerStack x={M_SALESFORCE.x} y={M_SALESFORCE.y} width={M_SALESFORCE.width} height={M_SALESFORCE.height} />
      </g>
      <g data-email opacity={0}>
        <FrameShape x={M_EMAIL.x} y={M_EMAIL.y} width={M_EMAIL.width} height={M_EMAIL.height} rx={4} className="fill-(--color-surface) stroke-(--color-text-faint)" />
        <rect x={M_EMAIL.x} y={M_EMAIL.y} width={M_EMAIL.width} height={M_EMAIL.height * 0.06} rx={2} fill="var(--color-brand)" />
        <text data-greeting x={M_EMAIL.x + 10} y={M_EMAIL.y + M_EMAIL.height * 0.18} fontSize={13} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" />
        <rect x={M_EMAIL.x + 10} y={M_EMAIL.y + M_EMAIL.height * 0.26} width={M_EMAIL.width - 20} height={4} rx={2} fill="var(--color-text-faint)" />
        <g data-pref-block opacity={0}>
          <rect x={M_EMAIL.x + 10} y={M_EMAIL.y + M_EMAIL.height * 0.36} width={M_EMAIL.width - 20} height={M_EMAIL.height * 0.22} rx={4} fill="none" stroke="var(--color-blue-light)" strokeWidth={1} />
          <g data-pref-block-chip transform={`translate(${M_EMAIL.x + 16}, ${M_EMAIL.y + M_EMAIL.height * 0.4})`}>
            <Chip x={0} y={0} width={30} height={13} label="PREF" />
          </g>
          <rect x={M_EMAIL.x + 16} y={M_EMAIL.y + M_EMAIL.height * 0.52} width={(M_EMAIL.width - 32) * 0.75} height={3.5} rx={1.75} fill="var(--color-text-faint)" />
        </g>
        <rect x={M_EMAIL.x + 10} y={M_EMAIL.y + M_EMAIL.height * 0.86} width={M_EMAIL.width - 20} height={M_EMAIL.height * 0.08} rx={6} fill="var(--color-brand)" />
      </g>

      {/* --- Master ↔ Salesforce / email connector — one persistent line
          whose far end retargets from Salesforce's edge to email's edge
          (see buildConvergenceBeats.ts), not two separate lines. --- */}
      <line
        data-connector-ms
        x1={M_MASTER_COMPACT.x + M_MASTER_COMPACT.width + 2}
        y1={M_MASTER_COMPACT.y + M_MASTER_COMPACT.height / 2}
        x2={M_SALESFORCE.x - 2}
        y2={M_SALESFORCE.y + M_SALESFORCE.height / 2}
        stroke="var(--color-blue-light)"
        strokeWidth={0.75}
        strokeDasharray="2 2"
        opacity={0}
      />
      {[0, 1].map((n) => (
        <circle key={n} data-packet-ms={n} cy={M_SALESFORCE.y + M_SALESFORCE.height / 2} r={2} fill="var(--color-blue-light)" opacity={0} />
      ))}
      <circle data-packet-me cy={M_SALESFORCE.y + M_SALESFORCE.height / 2} r={2} fill="var(--color-blue-light)" opacity={0} />

      {/* --- Six-segment sync rollout: one row (beat 4) --- */}
      <g data-sync-group opacity={0}>
        {SYNC_STEPS.map((step, i) => {
          const x = M_SYNC_MARGIN + i * (syncWidth + 4);
          return (
            <g key={step}>
              <g data-sync-box={step}>
                <PillBox x={x} y={M_SYNC_Y} width={syncWidth} height={M_SYNC_HEIGHT} />
              </g>
              <g data-sync-check={step} opacity={0}>
                <PillCheck x={x} y={M_SYNC_Y} width={syncWidth} height={M_SYNC_HEIGHT} />
              </g>
            </g>
          );
        })}
      </g>
      <text data-mobile-sync-label x={M_WIDTH / 2} y={M_SYNC_LABEL_Y} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-blue-light)" opacity={0} />
    </svg>
  );
}

export default function LifecycleConvergenceSvg() {
  return (
    <>
      <DesktopSvg />
      <MobileSvg />
    </>
  );
}
