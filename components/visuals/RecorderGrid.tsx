// components/visuals/RecorderGrid.tsx
import Image from "next/image";
import type { DeckScreen } from "@/lib/case-visuals";

type RecorderGridProps = { screens: Pick<DeckScreen, "src" | "label">[] };

// Logical (CSS) viewport dimensions the recorder actually captured at —
// not the files' raw pixel dimensions, which bake in each profile's own
// device-pixel-ratio (1920 is @1x, 1440 is a @2x capture at 1440 logical,
// 390 is @3x, SE is @2x at 375 logical) and would distort the comparison.
const PROFILE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1920": { width: 1920, height: 1080 },
  "1440": { width: 1440, height: 900 },
  "390": { width: 390, height: 844 },
  SE: { width: 375, height: 667 },
};

// Scales the widest profile (1920) down to this many px; every other tile
// is sized relative to it, so the row reads as an actual size comparison
// rather than a uniform thumbnail grid.
const TARGET_MAX_WIDTH = 240;
const SCALE = TARGET_MAX_WIDTH / 1920;

/** The same page at the recorder's four profile sizes, sized proportional
 * to their real logical dimensions — decorative, the decision text next to
 * it carries the meaning. */
export default function RecorderGrid({ screens }: RecorderGridProps) {
  return (
    <div aria-hidden="true" className="flex w-full flex-wrap items-end gap-3 sm:gap-4">
      {screens.map((s) => {
        const dims = PROFILE_DIMENSIONS[s.label];
        const width = dims ? Math.round(dims.width * SCALE) : 80;
        const height = dims ? Math.round(dims.height * SCALE) : 80;
        return (
          <figure key={s.src} className="flex flex-col items-center gap-2">
            <div
              className="relative shrink-0 overflow-hidden rounded-lg border border-border bg-bg"
              style={{ width, height }}
            >
              <Image src={s.src} alt="" fill sizes={`${width}px`} className="object-cover object-top" />
            </div>
            <figcaption className="text-label text-text-faint">{s.label}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}
