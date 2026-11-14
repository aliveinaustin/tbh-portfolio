// components/visuals/lifecycle/layout.ts
//
// The coordinate system the Convergence card (and any later hero/decision
// visuals) share — positions for the three pathways, their source tables,
// the master record and the downstream Salesforce/email targets. Desktop
// and mobile are genuinely different compositions (stacked vs. side by
// side), not one layout reflowing, so each gets its own full set of
// positions rather than a shared formula with breakpoint branches.

import type { SourceKind } from "@/components/visuals/lifecycle/primitives";

export type PathwayId = SourceKind;

export const PATHWAYS: { id: PathwayId; label: string; cols: number }[] = [
  { id: "website", label: "WEBSITE", cols: 3 },
  { id: "application", label: "APPLICATION", cols: 4 },
  { id: "legacy", label: "LEGACY", cols: 2 },
];

export const SYNC_STEPS = ["VALIDATE", "WRITE", "FIELDS", "REQUEST", "OAUTH", "LOGGING"] as const;

// --- Desktop -----------------------------------------------------------
// Per the storyboard comps (the authority where the earlier written spec
// disagreed): only two "large" elements are ever on screen together.
// Tables reveal at D_TABLE's position, then translate left — no scale —
// until they cover the source row entirely; the master record slides in
// from the right at the same time. Once both are in their resting spots,
// a static connector joins them and the PREF chips travel along it.
export const D_WIDTH = 380;
export const D_HEIGHT = 192;
export const D_VIEWBOX = `0 0 ${D_WIDTH} ${D_HEIGHT}`;

export const D_SOURCE = { x: 12, size: 18 };
export const D_SOURCE_LABEL_X = D_SOURCE.x + D_SOURCE.size + 8;
export const D_ROW_Y: Record<PathwayId, number> = { website: 14, application: 64, legacy: 114 };
// The source→table connector has to start past each label's own (measured)
// right edge — "APPLICATION" is nearly twice as wide as "LEGACY" — or the
// dashed line cuts straight through the text.
export const D_CONNECTOR_ST_X1: Record<PathwayId, number> = { website: 75, application: 94, legacy: 70 };

export const D_TABLE = { x: 140, width: 72, height: 34 };
// Where each table translates to — covering the source row at its own x,
// same row height, so the slide is a straight horizontal line.
export const D_TABLE_COVER_X = D_SOURCE.x;

// About a third of its first draft's height — three rows, not six, so it
// reads as "the master record," not a tower that dwarfs the tables.
export const D_MASTER = { x: 220, y: 72, width: 90, height: 42 };
export const D_BADGE_Y = D_MASTER.y - 18;
// At the start of the Sync beat, master slides further left (vacating
// room) while this same motion "pulls" Salesforce in from the right —
// see D_SALESFORCE_SLIDE_OFFSET.
export const D_MASTER_SYNC_SHIFT = -70;

export const D_SALESFORCE = { x: 320, y: D_MASTER.y + D_MASTER.height / 2 - 17, width: 42, height: 34 };
// How far right of its resting x Salesforce starts before sliding in.
export const D_SALESFORCE_SLIDE_OFFSET = 70;
export const D_EMAIL = { x: 318, y: D_MASTER.y + D_MASTER.height / 2 - 40, width: 56, height: 80 };

export const D_SYNC_Y = 158;
export const D_SYNC_HEIGHT = 20;
export const D_SYNC_MARGIN = 14;

// --- Mobile ------------------------------------------------------------
// A genuinely different composition per beat, not one tall layout that
// reflows — beats 1-3 build top to bottom in a single column, beats 4-5
// switch to two columns (master left, Salesforce/email right). 390×220
// matches the card's own aspect-video panel almost exactly, so nothing
// gets clipped or letterboxed. The bottom ~25 units are reserved for the
// compact step indicator + pause button, which render as an HTML overlay
// outside the SVG, not inside it.
export const M_WIDTH = 390;
export const M_HEIGHT = 220;
export const M_VIEWBOX = `0 0 ${M_WIDTH} ${M_HEIGHT}`;

// Three even columns shared by the sources/tables rows (beats 1-2).
export const M_COL_X: Record<PathwayId, number> = { website: 75, application: 195, legacy: 315 };

export const M_SOURCE_ROW_Y = 12;
export const M_SOURCE_SIZE = 20;
export const M_SOURCE_X: Record<PathwayId, number> = Object.fromEntries(
  (Object.keys(M_COL_X) as PathwayId[]).map((id) => [id, M_COL_X[id] - M_SOURCE_SIZE / 2])
) as Record<PathwayId, number>;

export const M_TABLE = { width: 100, height: 68 };
export const M_TABLE_ROW_Y = 76; // beats 1-2, under the source row
export const M_TABLE_MASTER_Y = 14; // beat 3, tables move to the top (no source row above)
export const M_TABLE_X: Record<PathwayId, number> = Object.fromEntries(
  (Object.keys(M_COL_X) as PathwayId[]).map((id) => [id, M_COL_X[id] - M_TABLE.width / 2])
) as Record<PathwayId, number>;

// Beat 3: ID/@ badges + key icon sit above master's key column (not off
// to the side) — the three table connectors converge on that same point,
// reinforcing that this is where the Subscriber Key actually merges.
// Moved up from its first draft, which collided with master once master
// itself moved up to clear the bottom overlay.
export const M_BADGE_X = 64;
export const M_BADGE_Y = 108;
// Moved up and shrunk slightly from its first draft — it was tall enough
// to crowd the bottom step-indicator/pause-button overlay.
export const M_MASTER = { x: 20, y: 125, width: 350, height: 48 };

// Beats 4-5: two columns. Master shrinks and moves to the left column —
// one shared compact size/position for both beats, rather than a
// separate one per beat, to keep the geometry this card juggles
// tractable; Salesforce (beat 4) / email (beat 5) occupy the right.
// Pinned near the top (not vertically centered) specifically so beat 4's
// six-step row has clear room underneath instead of overlapping it.
export const M_MASTER_COMPACT = { x: 10, y: 10, width: 150, height: 55 };
export const M_SALESFORCE = { x: 272, y: 20, width: 56, height: 46 };
// Shrunk from its first draft's height (190, which ran to y=200 — too
// close to the bottom overlay) so it clears that overlay with margin.
export const M_EMAIL = { x: 172, y: 10, width: 190, height: 165 };

export const M_SYNC_Y = 95;
export const M_SYNC_HEIGHT = 24;
export const M_SYNC_MARGIN = 10;
export const M_SYNC_LABEL_Y = 140;

// --- Hero "Flow map" (ambient loop) -------------------------------------
// Unlike the card, nothing here ever moves position — the whole system is
// laid out once, fully labelled, and stays put. Only packets (traveling
// along these fixed connectors) and color (the cycling red pathway
// highlight) animate. Four static column headings — Pathways, Source
// Tables, Master, Downstream — sit above each desktop column; mobile's
// single flowing column doesn't need them (the row order alone reads as
// the same four stages).

export const H_D_WIDTH = 420;
export const H_D_HEIGHT = 220;
export const H_D_VIEWBOX = `0 0 ${H_D_WIDTH} ${H_D_HEIGHT}`;
export const H_D_HEADING_Y = 10;

export const H_D_SOURCE = { x: 10, size: 18 };
export const H_D_SOURCE_LABEL_X = H_D_SOURCE.x + H_D_SOURCE.size + 8;
export const H_D_ROW_Y: Record<PathwayId, number> = { website: 26, application: 86, legacy: 146 };
export const H_D_CONNECTOR_ST_X1: Record<PathwayId, number> = { website: 73, application: 92, legacy: 68 };

export const H_D_TABLE = { x: 100, width: 70, height: 36 };

// Rows converge on the master's left edge with a small per-row vertical
// offset (like the card's table→master connectors), not all at one point.
export const H_D_MASTER = { x: 210, y: 78, width: 100, height: 64 };
export const H_D_BADGE_Y = H_D_MASTER.y - 22;
export const H_D_CAPTION_Y = H_D_BADGE_Y - 12;
// Where the two downstream connectors fork from — master's own right-
// center, not two separate points — so both legs visibly originate from
// the same record.
export const H_D_FORK_X = H_D_MASTER.x + H_D_MASTER.width + 2;
export const H_D_FORK_Y = H_D_MASTER.y + H_D_MASTER.height / 2;

export const H_D_SALESFORCE = { x: 340, y: 18, width: 48, height: 38 };
export const H_D_EMAIL = { x: 330, y: 84, width: 70, height: 112 };

export const H_D_HEADING_X: Record<"pathways" | "tables" | "master" | "downstream", number> = {
  pathways: H_D_SOURCE.x,
  tables: H_D_TABLE.x,
  master: H_D_MASTER.x,
  downstream: H_D_SALESFORCE.x,
};

// --- Hero mobile: the same map flowing top to bottom -------------------
export const H_M_WIDTH = 360;
export const H_M_HEIGHT = 500;
export const H_M_VIEWBOX = `0 0 ${H_M_WIDTH} ${H_M_HEIGHT}`;

export const H_M_COL_X: Record<PathwayId, number> = { website: 64, application: 180, legacy: 296 };
export const H_M_SOURCE_ROW_Y = 10;
export const H_M_SOURCE_SIZE = 22;
export const H_M_SOURCE_X: Record<PathwayId, number> = Object.fromEntries(
  (Object.keys(H_M_COL_X) as PathwayId[]).map((id) => [id, H_M_COL_X[id] - H_M_SOURCE_SIZE / 2])
) as Record<PathwayId, number>;

export const H_M_TABLE = { width: 96, height: 66 };
export const H_M_TABLE_ROW_Y = 68;
export const H_M_TABLE_X: Record<PathwayId, number> = Object.fromEntries(
  (Object.keys(H_M_COL_X) as PathwayId[]).map((id) => [id, H_M_COL_X[id] - H_M_TABLE.width / 2])
) as Record<PathwayId, number>;

// All three table→master connectors converge on this single point — same
// device the card's beat 3 uses — directly above the master table, with
// the key icon + caption sitting right at it.
export const H_M_BADGE_X = H_M_WIDTH / 2;
export const H_M_BADGE_Y = 170;
export const H_M_CAPTION_Y = H_M_BADGE_Y - 16;

export const H_M_MASTER = { x: 20, y: H_M_BADGE_Y + 20, width: H_M_WIDTH - 40, height: 70 };
// The downstream fork point — master's own bottom-center, matching
// desktop's single shared origin for both legs.
export const H_M_FORK_X = H_M_MASTER.x + H_M_MASTER.width / 2;
export const H_M_FORK_Y = H_M_MASTER.y + H_M_MASTER.height + 2;

export const H_M_SALESFORCE = { x: 20, y: H_M_MASTER.y + H_M_MASTER.height + 50, width: 150, height: 56 };
export const H_M_EMAIL = { x: 190, y: H_M_MASTER.y + H_M_MASTER.height + 30, width: 150, height: 150 };
