// components/visuals/email/layout.ts
//
// The one coordinate system every modular-email visual shares — the card,
// the hero and the SVG markup all read from these instead of re-deriving
// positions, so a change here (e.g. row heights) stays consistent
// everywhere it's used.

import type { ModuleVariant } from "@/components/visuals/email/primitives";

export const LAYOUT = {
  viewBox: "0 0 220 210",
  // The hero reuses every coordinate above — frame, rows, palette, legend
  // all stay put — just in a wider canvas with room on the right for the
  // callout labels the card doesn't have.
  heroViewBox: "0 0 340 210",
  frame: { x: 14, y: 10, width: 130, height: 190 },
  // The light/dark toggle pill, centered above the frame.
  toggle: { width: 38, height: 13, thumbR: 5 },
} as const;

type Row = { variant: ModuleVariant; x: number; y: number; width: number; height: number };

// Inside the frame (x 14–144), with an 8px inset each side (content x 22–136).
const CONTENT_X = LAYOUT.frame.x + 8;
const CONTENT_WIDTH = LAYOUT.frame.width - 16;

export const ROWS: Row[] = [
  { variant: "header", x: CONTENT_X, y: 18, width: CONTENT_WIDTH, height: 16 },
  { variant: "hero", x: CONTENT_X, y: 40, width: CONTENT_WIDTH, height: 58 },
  { variant: "text", x: CONTENT_X, y: 104, width: CONTENT_WIDTH, height: 40 },
  { variant: "button", x: CONTENT_X, y: 150, width: CONTENT_WIDTH, height: 22 },
  { variant: "footer", x: CONTENT_X, y: 178, width: CONTENT_WIDTH, height: 14 },
];

// The small preview column beside the frame beat 3's modules slide in
// from — header isn't here: beat 3 only names Hero/Text/Button/Footer,
// the header bar settles in directly. A 12px gap (not 8) between items
// leaves room for the label above each one without crowding the item
// before it.
export const PALETTE_ITEMS: Row[] = [
  { variant: "hero", x: 164, y: 40, width: 44, height: 30 },
  { variant: "text", x: 164, y: 82, width: 44, height: 30 },
  { variant: "button", x: 164, y: 124, width: 44, height: 30 },
  { variant: "footer", x: 164, y: 166, width: 44, height: 30 },
];

export type BrandId = "A" | "B" | "C";
type LegendBox = { id: BrandId; x: number; y: number; width: number; height: number };

// Beat 4's legend — same column the palette used (it's faded out by then),
// one box per brand. Token chips fly from a box out to the header/button
// rows when that brand is "applied," so the legend is visibly the source
// of the color rather than just a key.
export const LEGEND_ITEMS: LegendBox[] = [
  { id: "A", x: 160, y: 36, width: 54, height: 34 },
  { id: "B", x: 160, y: 78, width: 54, height: 34 },
  { id: "C", x: 160, y: 120, width: 54, height: 34 },
];

// The hero's persistent "config" chip — sits on the hero module itself
// (rather than only flashing past during the card's brand-cycle beat), so
// there's always something concrete on the assembled email for the
// Configuration callout to point at.
export const CONFIG_CHIP = { width: 16, height: 9 } as const;

export function configChipRect(): { x: number; y: number; width: number; height: number; rx: number } {
  const heroModuleRow = ROWS[1];
  return {
    x: heroModuleRow.x + heroModuleRow.width - CONFIG_CHIP.width - 12,
    // Below the hero module's own red accent bar (see buildHeroTimeline's
    // heroBarRect, ~the top 14% of the module), not overlapping it — this
    // chip colors the body section underneath, a separate concern.
    y: heroModuleRow.y + 18,
    width: CONFIG_CHIP.width,
    height: CONFIG_CHIP.height,
    rx: CONFIG_CHIP.height / 2,
  };
}

// Hero-only: the four callouts, each a leader line from a point on the
// assembled email out to a label + one-line description on the right.
// Ordered to match the exploded view's stacking order (Configuration,
// Module, Row pattern, Template, top to bottom) rather than the order
// each layer actually forms in — the exploded view separates the email
// into four physical planes in that same order, and keeping the labels in
// that order means they never have to swap places between the flat and
// exploded views; only the leader lines move (retracting and redrawing to
// the new plane positions) when the explosion happens.
export type CalloutId = "configuration" | "module" | "row-pattern" | "template";

export const HERO_LABEL_X = 236;

export const HERO_CALLOUTS: { id: CalloutId; label: string; description: string; labelY: number }[] = [
  { id: "configuration", label: "CONFIGURATION", description: "Campaign values and brand tokens, fed into modules", labelY: 26 },
  { id: "module", label: "MODULE", description: "Hero, text, button, footer: tested once, reused everywhere", labelY: 76 },
  { id: "row-pattern", label: "ROW PATTERN", description: "Layout slots and spacing that modules drop into", labelY: 126 },
  { id: "template", label: "TEMPLATE", description: "Outer frame: width, background — the shell every email shares", labelY: 176 },
];

// Where each callout's leader line starts, on the assembled email itself.
export function heroCalloutSource(id: CalloutId): { x: number; y: number } {
  const buttonRow = ROWS[3];
  const footerRow = ROWS[4];
  switch (id) {
    case "configuration": {
      const chip = configChipRect();
      return { x: chip.x + chip.width / 2, y: chip.y + chip.height / 2 };
    }
    case "module":
      return { x: buttonRow.x + buttonRow.width * 0.5, y: buttonRow.y + buttonRow.height * 0.5 };
    case "row-pattern":
      return { x: footerRow.x + footerRow.width, y: footerRow.y + footerRow.height / 2 };
    case "template":
      return { x: LAYOUT.frame.x + LAYOUT.frame.width / 2, y: LAYOUT.frame.y + LAYOUT.frame.height };
  }
}
