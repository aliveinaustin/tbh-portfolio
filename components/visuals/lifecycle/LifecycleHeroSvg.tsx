// components/visuals/lifecycle/LifecycleHeroSvg.tsx
//
// Static markup for the detail-page hero "Flow map" — unlike the card, this
// has no beats: the whole system (three pathways, their tables, the master
// record, Salesforce and Journeys+email) is laid out fully labelled from
// the first frame. buildHeroLoop.ts only ever drives color (the cycling
// red pathway highlight) and packet position — nothing here ever changes
// layout position, and labels never animate at all.

import { FrameShape } from "@/components/visuals/email/primitives";
import { SourceIcon, DataTable, KeyIcon, Chip, ServerStack } from "@/components/visuals/lifecycle/primitives";
import {
  PATHWAYS,
  H_D_VIEWBOX,
  H_D_HEADING_Y,
  H_D_HEADING_X,
  H_D_SOURCE,
  H_D_SOURCE_LABEL_X,
  H_D_ROW_Y,
  H_D_CONNECTOR_ST_X1,
  H_D_TABLE,
  H_D_MASTER,
  H_D_BADGE_Y,
  H_D_CAPTION_Y,
  H_D_FORK_X,
  H_D_FORK_Y,
  H_D_SALESFORCE,
  H_D_EMAIL,
  H_M_VIEWBOX,
  H_M_COL_X,
  H_M_SOURCE_ROW_Y,
  H_M_SOURCE_SIZE,
  H_M_SOURCE_X,
  H_M_TABLE,
  H_M_TABLE_ROW_Y,
  H_M_TABLE_X,
  H_M_BADGE_X,
  H_M_BADGE_Y,
  H_M_CAPTION_Y,
  H_M_MASTER,
  H_M_FORK_X,
  H_M_FORK_Y,
  H_M_SALESFORCE,
  H_M_EMAIL,
} from "@/components/visuals/lifecycle/layout";

const CAPTION = "Subscriber Key · email fallback";

function DesktopSvg() {
  return (
    <svg data-viewport="desktop" viewBox={H_D_VIEWBOX} className="hidden h-auto w-full sm:block" aria-hidden="true">
      {/* --- Column headings — static, never animate --- */}
      {(
        [
          ["pathways", "PATHWAYS"],
          ["tables", "SOURCE TABLES"],
          ["master", "MASTER"],
          ["downstream", "DOWNSTREAM"],
        ] as const
      ).map(([key, label]) => (
        <text
          key={key}
          x={H_D_HEADING_X[key]}
          y={H_D_HEADING_Y}
          fontSize={8.5}
          fontFamily="var(--font-mono)"
          fontWeight={700}
          fill="var(--color-text)"
          letterSpacing={0.6}
        >
          {label}
        </text>
      ))}

      {/* --- Pathways --- */}
      {PATHWAYS.map((p) => {
        const y = H_D_ROW_Y[p.id];
        return (
          <g key={p.id}>
            <g data-hero-source={p.id} stroke="var(--color-text-faint)">
              <SourceIcon kind={p.id} x={H_D_SOURCE.x} y={y} size={H_D_SOURCE.size} />
            </g>
            <text
              data-hero-source-label={p.id}
              x={H_D_SOURCE_LABEL_X}
              y={y + H_D_SOURCE.size / 2 + 2.8}
              fontSize={6.5}
              fontFamily="var(--font-mono)"
              fontWeight={700}
              fill="var(--color-text-faint)"
              letterSpacing={0.4}
            >
              {p.label}
            </text>
          </g>
        );
      })}

      {/* --- Pathway → table connectors + ambient/trace packets --- */}
      {PATHWAYS.map((p) => {
        const y = H_D_ROW_Y[p.id] + H_D_SOURCE.size / 2;
        return (
          <g key={p.id}>
            <line
              data-hero-connector-st={p.id}
              x1={H_D_CONNECTOR_ST_X1[p.id]}
              y1={y}
              x2={H_D_TABLE.x - 2}
              y2={y}
              stroke="var(--color-text-faint)"
              strokeWidth={0.75}
              strokeDasharray="2 2"
              opacity={0.6}
            />
            {[0, 1, 2].map((n) => (
              <circle key={n} data-hero-packet-st={`${p.id}-${n}`} cy={y} r={1.8} fill="var(--color-blue-light)" opacity={0} />
            ))}
          </g>
        );
      })}

      {/* --- Source tables (fully revealed from frame 1) --- */}
      {PATHWAYS.map((p) => (
        <g key={p.id} data-hero-table={p.id}>
          <DataTable x={H_D_TABLE.x} y={H_D_ROW_Y[p.id]} width={H_D_TABLE.width} height={H_D_TABLE.height} cols={p.cols} revealed />
        </g>
      ))}

      {/* --- Table → master connectors + packets --- */}
      {PATHWAYS.map((p, i) => {
        const fromY = H_D_ROW_Y[p.id] + H_D_TABLE.height / 2;
        const toY = H_D_MASTER.y + H_D_MASTER.height / 2 + (i - 1) * 12;
        return (
          <g key={p.id}>
            <line
              data-hero-connector-tm={p.id}
              x1={H_D_TABLE.x + H_D_TABLE.width + 2}
              y1={fromY}
              x2={H_D_MASTER.x - 2}
              y2={toY}
              stroke="var(--color-blue-light)"
              strokeWidth={0.75}
              strokeDasharray="2 2"
            />
            {[0, 1].map((n) => (
              <circle key={n} data-hero-packet-tm={`${p.id}-${n}`} r={1.8} fill="var(--color-blue-light)" opacity={0} />
            ))}
          </g>
        );
      })}

      {/* --- Master record: already merged, key column filled --- */}
      <g transform={`translate(${H_D_MASTER.x + H_D_MASTER.width / 2}, ${H_D_BADGE_Y})`}>
        <KeyIcon cx={1.1} cy={0} />
      </g>
      <text
        x={H_D_MASTER.x + H_D_MASTER.width / 2}
        y={H_D_CAPTION_Y}
        textAnchor="middle"
        fontSize={6}
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fill="var(--color-blue-light)"
        letterSpacing={0.2}
      >
        {CAPTION}
      </text>
      <DataTable x={H_D_MASTER.x} y={H_D_MASTER.y} width={H_D_MASTER.width} height={H_D_MASTER.height} cols={4} rows={4} keyColumn revealed accent="var(--color-text)" />
      <text
        x={H_D_MASTER.x + H_D_MASTER.width / 2}
        y={H_D_MASTER.y + H_D_MASTER.height + 10}
        textAnchor="middle"
        fontSize={6.5}
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fill="var(--color-text)"
        letterSpacing={0.4}
      >
        MASTER
      </text>

      {/* --- Master → Salesforce (always blue — never part of the red
          pathway trace) --- */}
      <line
        data-hero-connector-ms
        x1={H_D_FORK_X}
        y1={H_D_FORK_Y}
        x2={H_D_SALESFORCE.x - 2}
        y2={H_D_SALESFORCE.y + H_D_SALESFORCE.height / 2}
        stroke="var(--color-blue-light)"
        strokeWidth={0.75}
        strokeDasharray="2 2"
      />
      {[0, 1].map((n) => (
        <circle key={n} data-hero-packet-ms={n} r={1.8} fill="var(--color-blue-light)" opacity={0} />
      ))}
      <ServerStack x={H_D_SALESFORCE.x} y={H_D_SALESFORCE.y} width={H_D_SALESFORCE.width} height={H_D_SALESFORCE.height} />

      {/* --- Master → Journeys+email (the leg every pathway's trace
          ends on) --- */}
      <line
        data-hero-connector-me
        x1={H_D_FORK_X}
        y1={H_D_FORK_Y}
        x2={H_D_EMAIL.x - 2}
        y2={H_D_EMAIL.y + H_D_EMAIL.height / 2}
        stroke="var(--color-blue-light)"
        strokeWidth={0.75}
        strokeDasharray="2 2"
      />
      {[0, 1].map((n) => (
        <circle key={n} data-hero-packet-me={n} r={1.8} fill="var(--color-blue-light)" opacity={0} />
      ))}
      <circle data-hero-trace cx={0} cy={0} r={2.4} fill="var(--color-brand)" opacity={0} />

      <g data-hero-email>
        <FrameShape x={H_D_EMAIL.x} y={H_D_EMAIL.y} width={H_D_EMAIL.width} height={H_D_EMAIL.height} rx={4} className="fill-(--color-surface) stroke-(--color-text-faint)" />
        <rect x={H_D_EMAIL.x} y={H_D_EMAIL.y} width={H_D_EMAIL.width} height={H_D_EMAIL.height * 0.08} rx={2} fill="var(--color-brand)" />
        <text x={H_D_EMAIL.x + 6} y={H_D_EMAIL.y + H_D_EMAIL.height * 0.24} fontSize={8} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)">
          Hi, Sam
        </text>
        <rect x={H_D_EMAIL.x + 6} y={H_D_EMAIL.y + H_D_EMAIL.height * 0.34} width={H_D_EMAIL.width - 12} height={3} rx={1.5} fill="var(--color-text-faint)" />
        <rect x={H_D_EMAIL.x + 6} y={H_D_EMAIL.y + H_D_EMAIL.height * 0.44} width={(H_D_EMAIL.width - 12) * 0.7} height={3} rx={1.5} fill="var(--color-text-faint)" />
        <rect x={H_D_EMAIL.x + 6} y={H_D_EMAIL.y + H_D_EMAIL.height * 0.56} width={H_D_EMAIL.width - 12} height={H_D_EMAIL.height * 0.3} rx={3} fill="none" stroke="var(--color-blue-light)" strokeWidth={1} />
        <g transform={`translate(${H_D_EMAIL.x + 10}, ${H_D_EMAIL.y + H_D_EMAIL.height * 0.6})`}>
          <Chip x={0} y={0} width={20} height={9} label="PREF" />
        </g>
        <rect x={H_D_EMAIL.x + 10} y={H_D_EMAIL.y + H_D_EMAIL.height * 0.8} width={(H_D_EMAIL.width - 20) * 0.75} height={2.5} rx={1.25} fill="var(--color-text-faint)" />
      </g>
      <text
        x={H_D_EMAIL.x + H_D_EMAIL.width / 2}
        y={H_D_EMAIL.y + H_D_EMAIL.height + 12}
        textAnchor="middle"
        fontSize={6.5}
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fill="var(--color-text)"
        letterSpacing={0.3}
      >
        JOURNEYS + EMAIL
      </text>
    </svg>
  );
}

function MobileSvg() {
  return (
    <svg data-viewport="mobile" viewBox={H_M_VIEWBOX} className="h-auto w-full sm:hidden" aria-hidden="true">
      {/* --- Pathways --- */}
      {PATHWAYS.map((p) => (
        <g key={p.id}>
          <g data-hero-source={p.id} stroke="var(--color-text-faint)">
            <SourceIcon kind={p.id} x={H_M_SOURCE_X[p.id]} y={H_M_SOURCE_ROW_Y} size={H_M_SOURCE_SIZE} />
          </g>
          <text
            data-hero-source-label={p.id}
            x={H_M_COL_X[p.id]}
            y={H_M_SOURCE_ROW_Y + H_M_SOURCE_SIZE + 12}
            textAnchor="middle"
            fontSize={10}
            fontFamily="var(--font-mono)"
            fontWeight={700}
            fill="var(--color-text-faint)"
            letterSpacing={0.3}
          >
            {p.label}
          </text>
        </g>
      ))}

      {/* --- Pathway → table connectors + packets --- */}
      {PATHWAYS.map((p) => {
        const x = H_M_COL_X[p.id];
        const y1 = H_M_SOURCE_ROW_Y + H_M_SOURCE_SIZE + 16;
        const y2 = H_M_TABLE_ROW_Y - 2;
        return (
          <g key={p.id}>
            <line data-hero-connector-st={p.id} x1={x} y1={y1} x2={x} y2={y2} stroke="var(--color-text-faint)" strokeWidth={0.75} strokeDasharray="2 2" opacity={0.6} />
            {[0, 1, 2].map((n) => (
              <circle key={n} data-hero-packet-st={`${p.id}-${n}`} cx={x} r={1.8} fill="var(--color-blue-light)" opacity={0} />
            ))}
          </g>
        );
      })}

      {/* --- Source tables --- */}
      {PATHWAYS.map((p) => (
        <g key={p.id} data-hero-table={p.id}>
          <DataTable x={H_M_TABLE_X[p.id]} y={H_M_TABLE_ROW_Y} width={H_M_TABLE.width} height={H_M_TABLE.height} cols={p.cols} revealed />
        </g>
      ))}

      {/* --- Table → master connectors — all three converge on master's own
          top-center border (passing through the badge/key icon on the way,
          not stopping short of it in open space), same shared-point device
          as the card. --- */}
      {PATHWAYS.map((p) => {
        const fromX = H_M_COL_X[p.id];
        const fromY = H_M_TABLE_ROW_Y + H_M_TABLE.height + 2;
        return (
          <g key={p.id}>
            <line data-hero-connector-tm={p.id} x1={fromX} y1={fromY} x2={H_M_BADGE_X} y2={H_M_MASTER.y - 2} stroke="var(--color-blue-light)" strokeWidth={0.75} strokeDasharray="2 2" />
            {[0, 1].map((n) => (
              <circle key={n} data-hero-packet-tm={`${p.id}-${n}`} r={1.8} fill="var(--color-blue-light)" opacity={0} />
            ))}
          </g>
        );
      })}

      {/* --- Master record --- */}
      <g transform={`translate(${H_M_BADGE_X}, ${H_M_BADGE_Y})`}>
        <KeyIcon cx={1.1} cy={0} />
      </g>
      <text
        x={H_M_BADGE_X}
        y={H_M_CAPTION_Y}
        textAnchor="middle"
        fontSize={10}
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fill="var(--color-blue-light)"
        letterSpacing={0.2}
      >
        {CAPTION}
      </text>
      <DataTable x={H_M_MASTER.x} y={H_M_MASTER.y} width={H_M_MASTER.width} height={H_M_MASTER.height} cols={4} rows={4} keyColumn revealed accent="var(--color-text)" />
      <text
        x={H_M_MASTER.x + H_M_MASTER.width / 2}
        y={H_M_MASTER.y + H_M_MASTER.height + 14}
        textAnchor="middle"
        fontSize={10}
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fill="var(--color-text)"
        letterSpacing={0.4}
      >
        MASTER
      </text>

      {/* --- Master → Salesforce / Journeys+email, side by side --- */}
      <line
        data-hero-connector-ms
        x1={H_M_FORK_X}
        y1={H_M_FORK_Y}
        x2={H_M_SALESFORCE.x + H_M_SALESFORCE.width / 2}
        y2={H_M_SALESFORCE.y - 2}
        stroke="var(--color-blue-light)"
        strokeWidth={0.75}
        strokeDasharray="2 2"
      />
      {[0, 1].map((n) => (
        <circle key={n} data-hero-packet-ms={n} r={1.8} fill="var(--color-blue-light)" opacity={0} />
      ))}
      <line
        data-hero-connector-me
        x1={H_M_FORK_X}
        y1={H_M_FORK_Y}
        x2={H_M_EMAIL.x + H_M_EMAIL.width / 2}
        y2={H_M_EMAIL.y - 2}
        stroke="var(--color-blue-light)"
        strokeWidth={0.75}
        strokeDasharray="2 2"
      />
      {[0, 1].map((n) => (
        <circle key={n} data-hero-packet-me={n} r={1.8} fill="var(--color-blue-light)" opacity={0} />
      ))}
      <circle data-hero-trace cx={0} cy={0} r={2.6} fill="var(--color-brand)" opacity={0} />

      <ServerStack x={H_M_SALESFORCE.x} y={H_M_SALESFORCE.y} width={H_M_SALESFORCE.width} height={H_M_SALESFORCE.height} labelSize={10} />

      <g data-hero-email>
        <FrameShape x={H_M_EMAIL.x} y={H_M_EMAIL.y} width={H_M_EMAIL.width} height={H_M_EMAIL.height} rx={4} className="fill-(--color-surface) stroke-(--color-text-faint)" />
        <rect x={H_M_EMAIL.x} y={H_M_EMAIL.y} width={H_M_EMAIL.width} height={H_M_EMAIL.height * 0.06} rx={2} fill="var(--color-brand)" />
        <text x={H_M_EMAIL.x + 8} y={H_M_EMAIL.y + H_M_EMAIL.height * 0.16} fontSize={11} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)">
          Hi, Sam
        </text>
        <rect x={H_M_EMAIL.x + 8} y={H_M_EMAIL.y + H_M_EMAIL.height * 0.24} width={H_M_EMAIL.width - 16} height={3} rx={1.5} fill="var(--color-text-faint)" />
        <rect x={H_M_EMAIL.x + 8} y={H_M_EMAIL.y + H_M_EMAIL.height * 0.32} width={(H_M_EMAIL.width - 16) * 0.7} height={3} rx={1.5} fill="var(--color-text-faint)" />
        <rect x={H_M_EMAIL.x + 8} y={H_M_EMAIL.y + H_M_EMAIL.height * 0.42} width={H_M_EMAIL.width - 16} height={H_M_EMAIL.height * 0.26} rx={3} fill="none" stroke="var(--color-blue-light)" strokeWidth={1} />
        <g transform={`translate(${H_M_EMAIL.x + 12}, ${H_M_EMAIL.y + H_M_EMAIL.height * 0.46})`}>
          <Chip x={0} y={0} width={22} height={10} label="PREF" />
        </g>
        <rect x={H_M_EMAIL.x + 12} y={H_M_EMAIL.y + H_M_EMAIL.height * 0.58} width={(H_M_EMAIL.width - 24) * 0.75} height={3} rx={1.5} fill="var(--color-text-faint)" />
      </g>
      <text
        x={H_M_EMAIL.x + H_M_EMAIL.width / 2}
        y={H_M_EMAIL.y + H_M_EMAIL.height + 18}
        textAnchor="middle"
        fontSize={10}
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fill="var(--color-text)"
        letterSpacing={0.3}
      >
        JOURNEYS + EMAIL
      </text>
    </svg>
  );
}

export default function LifecycleHeroSvg() {
  return (
    <>
      <DesktopSvg />
      <MobileSvg />
    </>
  );
}
