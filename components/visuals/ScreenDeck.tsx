// components/visuals/ScreenDeck.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/motion/gsap";
import { EASE } from "@/lib/motion/tokens";
import type { DeckScreen } from "@/lib/case-visuals";

// Three visible depth positions — deeper cards wait hidden at the back and
// fade in as they come forward. `order` (a ref, not state) tracks which
// screenshot currently sits at each depth; these are positions, not identities.
const SLOTS = [
  { x: 0, y: 0, rotation: -2, scale: 1, opacity: 1 },
  { x: 36, y: -10, rotation: 4, scale: 0.94, opacity: 0.85 },
  { x: 70, y: -20, rotation: 9, scale: 0.88, opacity: 0.6 },
];
const HIDDEN = { x: 90, y: -26, rotation: 12, scale: 0.84, opacity: 0 };
const slot = (depth: number) => SLOTS[depth] ?? HIDDEN;

type ScreenDeckProps = { screens: DeckScreen[]; interval?: number };

/**
 * A deck of phone screenshots that fans out, with the front card flipping
 * out and tucking in at the back every `interval` seconds. Loops only while
 * motion-safe and in view; a visitor's pause persists through both.
 */
export default function ScreenDeck({ screens, interval = 2.8 }: ScreenDeckProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const order = useRef(screens.map((_, i) => i));
  const loop = useRef<gsap.core.Tween | null>(null);
  const visible = useRef(false);
  const userPaused = useRef(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Reads refs at call time, not render time — safe to call from both the
  // effect (on visibility change) and the pause button's click handler.
  const sync = () => {
    if (!loop.current) return;
    if (visible.current && !userPaused.current) loop.current.resume();
    else loop.current.pause();
  };

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", scope);
      const depthZ = (depth: number) => screens.length - depth;

      order.current.forEach((card, depth) =>
        gsap.set(cards[card], { ...slot(depth), zIndex: depthZ(depth) })
      );

      // Gated on prefers-reduced-motion here, not by skipping the effect
      // entirely — the fanned-stack positions above still apply either way,
      // so reduced-motion visitors get a still, fanned deck instead of a
      // flat pile of identical cards.
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const advance = () => {
          const [front, ...rest] = order.current;
          order.current = [...rest, front];

          gsap
            .timeline()
            .to(cards[front], {
              x: -160,
              rotationY: -35,
              rotation: -10,
              opacity: 0,
              duration: 0.55,
              ease: EASE.exit,
            })
            .set(cards[front], { ...slot(screens.length - 1), rotationY: 0, zIndex: 0 });

          rest.forEach((card, depth) =>
            gsap.to(cards[card], {
              ...slot(depth),
              zIndex: depthZ(depth),
              duration: 0.6,
              delay: 0.15,
              ease: EASE.enter,
            })
          );

          setActive(rest[0]);
          // gsap.delayedCall, not setInterval — pausing the returned tween
          // (via sync()) actually stops the loop instead of just skipping
          // one callback while a timer keeps running underneath.
          loop.current = gsap.delayedCall(interval, advance);
        };

        loop.current = gsap.delayedCall(interval, advance);
        sync();

        return () => loop.current?.kill();
      });
    }, scope);

    // Only animate when at least 60% visible — off screen entirely, or a
    // half-visible neighboring slide in the carousel, both pause it.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        sync();
      },
      { threshold: 0.6 }
    );
    io.observe(scope);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [screens, interval]);

  const toggle = () => {
    userPaused.current = !userPaused.current;
    setPaused(userPaused.current);
    sync();
  };

  return (
    <div ref={scopeRef} className="relative flex h-full flex-col items-center justify-center gap-8 p-8">
      <div aria-hidden="true" className="relative aspect-[390/844] h-64 [perspective:1200px] sm:h-72">
        {screens.map((s) => (
          <div
            key={s.src}
            data-card
            className="absolute inset-0 overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl will-change-transform"
          >
            <Image src={s.src} alt="" fill sizes="180px" className="object-cover object-top" />
          </div>
        ))}
      </div>

      <ol aria-hidden="true" className="hidden items-center gap-2 sm:flex">
        {screens.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            {i > 0 && <span className="w-4 border-t border-dotted border-text-faint" />}
            <span className={cn("text-label transition-colors", i === active ? "text-text" : "text-text-faint")}>
              {s.label}
            </span>
          </li>
        ))}
      </ol>

      {/* Below sm there's no room for the horizontal label row (measured:
          the stack already fills the full height of the aspect-video panel
          at phone widths), but there's ~130px of open space beside it —
          more than enough for the labels themselves (longest, "Confirmed",
          measures ~86px) stacked vertically instead. */}
      <ol aria-hidden="true" className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 flex-col items-start gap-1 sm:hidden">
        {screens.map((s, i) => (
          // items-start, not items-center: centering was relative to each
          // li's own shrink-to-fit width, which is that word's width — so
          // the connector zigzagged to a different x position under BROWSE
          // (58px) than under PRODUCT (67px) than under CART (38px), etc.,
          // instead of forming one straight line. A fixed ml nudge on the
          // connector itself (not flex alignment) keeps it at the same x for
          // every row regardless of word width — lined up just right of
          // where flush-left text starts, since that edge sits a couple
          // px left of the first letter's actual ink.
          <li key={s.label} className="flex flex-col items-start gap-1">
            {/* border-l-2, not the default 1px — border-dotted renders its
                dots sized from the border-width, so this is what actually
                makes them bigger/more visible at mobile scale. */}
            {i > 0 && <span className="ml-1 h-2 border-l-2 border-dotted border-text-faint" />}
            {/* Brand red here (not text-text like the desktop row) carries
                over the color identity from the dot-progress idea this
                replaced — still reads as "current step," just as text. */}
            <span className={cn("text-label transition-colors", i === active ? "text-brand" : "text-text-faint")}>
              {s.label}
            </span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={toggle}
        aria-label={paused ? "Play animation" : "Pause animation"}
        className="absolute right-3 bottom-3 z-10 inline-flex size-9 items-center justify-center rounded-full border border-border bg-bg/80 text-text-muted hover:text-text"
      >
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      </button>
    </div>
  );
}
