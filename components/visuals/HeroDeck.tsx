// components/visuals/HeroDeck.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import ScreenDeck, { type ScreenDeckHandle } from "@/components/visuals/ScreenDeck";
import type { DeckScreen } from "@/lib/case-visuals";

type HeroDeckProps = { screens: DeckScreen[] };

/**
 * The detail-page hero pane: a large, dimmed browser-width screenshot behind
 * a bigger ScreenDeck, offset so the phone overlaps its lower corner. The
 * backdrop crossfades to match whichever screen the deck brings to front.
 * Step labels run in their own row below the image (not overlaid on it —
 * unreadable sitting on top of the screenshot), sharing that row with the
 * deck's own pause button — ScreenDeck renders no labels or button of its
 * own at this size (`hideControls`), driven here by ref instead.
 */
export default function HeroDeck({ screens }: HeroDeckProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const deckRef = useRef<ScreenDeckHandle>(null);

  return (
    // pr-6/sm:pr-10 looks like dead offset but isn't: it's real padding on
    // this box's own content area (not just a clip-path accommodation —
    // that lives on the unpadded inner box below), so it's what actually
    // keeps the deck's right edge off the page edge. Confirmed by removing
    // it once: overflow came right back, worse than the clip-path change
    // below alone would explain.
    <div className="relative w-full pr-6 sm:pr-10">
      {/* Sized to the backdrop alone (no bottom padding) so the phone's
          bottom-0 anchor overlaps the image itself, not the label row
          below — that row lives outside this box entirely. A clip-path,
          not overflow-x/y: the deck's cards fan out and flip using fixed
          pixel offsets sized for a wide clipped panel on the home page
          (CaseStudyCard's own overflow-hidden) — this needs the same
          horizontal containment (including the ~160px exit flip, which a
          tighter clip around just the narrow phone column was cutting off
          mid-animation) without clipping the intentional vertical overlap
          above the backdrop. `overflow-x-hidden` + `overflow-y-visible`
          looks like it should do exactly that, but doesn't: per the CSS
          overflow spec, pairing any non-"visible" axis with "visible" on
          the other silently computes that one to "auto" instead — which
          still clips the overlap, just via a scrollable region sitting at
          its default (scrolled-to-top) position. clip-path's inset() sets
          each edge independently with no such coupling — a huge inset on
          top/bottom is effectively "don't clip this edge"; left stays
          flush with the box (the flip never travels that direction), and
          right gets a small tolerance — the fan itself is scaled down to
          fit (see FAN_SCALE in ScreenDeck.tsx), but the flipping card's
          rotationY tilt bleeds a few px past its own x position as it
          rotates, which a flush 0 was still clipping. */}
      <div className="relative [clip-path:inset(-9999px_-8px_-9999px_0px)]">
        <div
          aria-hidden="true"
          className="relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-border bg-surface"
        >
          {screens.map((s, i) =>
            s.desktopSrc ? (
              <Image
                key={s.desktopSrc}
                src={s.desktopSrc}
                alt=""
                fill
                // Only the first (always the initial active state, "Browse")
                // is actually painted above the fold at load — next/image
                // defaults to lazy, which measurably delays this one's LCP
                // since it waits for an in-view check before even starting
                // the fetch. The other four stay lazy; nothing shows them
                // until the deck advances.
                priority={i === 0}
                sizes="(min-width: 1024px) 600px, 100vw"
                className={cn(
                  // GearZN's own UI is already a near-black theme, so a
                  // strong brightness cut reads as empty — this only needs
                  // to read as "secondary," not literally dark.
                  "object-cover object-top brightness-90 motion-safe:transition-opacity motion-safe:duration-700",
                  i === active ? "opacity-100" : "opacity-0"
                )}
              />
            ) : null
          )}
        </div>

        <div className="absolute right-0 bottom-0 w-28 sm:w-40 lg:w-44">
          <ScreenDeck
            ref={deckRef}
            screens={screens}
            size="hero"
            onActiveChange={setActive}
            onPausedChange={setPaused}
            hideControls
          />
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 sm:mt-4">
        <div className="flex-1">
          {/* Below sm, five labels plus connectors don't fit the column
              width without wrapping — a single crossfading label reads
              better than a wrapped row at that width. */}
          <div aria-hidden="true" className="relative h-[1.33em] sm:hidden">
            {screens.map((s, i) => (
              <span
                key={s.label}
                className={cn(
                  "absolute inset-0 text-label text-text motion-safe:transition-opacity motion-safe:duration-500",
                  i === active ? "opacity-100" : "opacity-0"
                )}
              >
                {s.label}
              </span>
            ))}
          </div>

          <ol aria-hidden="true" className="hidden flex-wrap items-center gap-x-2 gap-y-1 sm:flex">
            {screens.map((s, i) => (
              <li key={s.label} className="flex items-center gap-2">
                {i > 0 && <span className="w-3 border-t border-dotted border-text-faint" />}
                <span className={cn("text-label transition-colors", i === active ? "text-text" : "text-text-faint")}>
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <button
          type="button"
          onClick={() => deckRef.current?.toggle()}
          aria-label={paused ? "Play animation" : "Pause animation"}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-bg/80 text-text-muted hover:text-text"
        >
          {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
