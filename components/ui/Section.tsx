"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/motion/gsap";
import { DISTANCE, DURATION, EASE, STAGGER } from "@/lib/motion/tokens";

type Variant = "dark" | "invert";
type Spacing = "default" | "tight" | "none";
type SectionProps = {
  id: string;
  eyebrow?: string;
  title?: string;
  children?: ReactNode;
  /** Full-bleed content rendered below children, outside the max-w-page/px-margin container — left edge still lines up with it via the `bleed-right` utility. */
  bleed?: ReactNode;
  variant?: Variant;
  spacing?: Spacing;
  /** Lays a translucent `--bg` backing behind this section's content — for
   * text-dense sections (Skills, About) where the Hero watermark bleeding
   * through at full strength would hurt readability. Hero and Work skip
   * this so the watermark still shows at full strength in their own gaps. */
  muteWatermark?: boolean;
  /** Fades the muted backing in from transparent over this section's own top
   * edge instead of starting flat — needed wherever a muted section borders
   * a less-muted (or unmuted) neighbor above it, so the watermark's
   * continuous ring/text art doesn't visibly cut at the section seam. */
  muteWatermarkFadeTop?: boolean;
  /** Same, but fading back out to transparent over this section's bottom
   * edge — for a muted section followed by an unmuted one below it. */
  muteWatermarkFadeBottom?: boolean;
};

// Proved this by isolating the gradient alone (no badge, no text, real page
// background, brightness-boosted) and reproducing the exact same bands —
// confirmed it's not color-space math (survived forcing `in srgb` and plain
// rgba()) and not the blur (survived removing it). It's plain 8-bit
// quantization: this gradient's whole range is ~0 to 85% alpha of a
// near-black color, a genuinely small slice of the 256 representable
// levels, spread over hundreds of pixels — neighboring pixels round to the
// *same* 8-bit value for stretches at a time, and that staircase becomes
// visible once contrast is pushed up (exactly how the user found it: via a
// devtools/monitor contrast boost). No gradient authoring trick fixes
// quantization after the fact. Noise dithering does: layering a faint
// texture on top means each near-identical pixel gets a slightly different
// final value, which breaks the flat bands into something the eye reads as
// smooth grain instead of a stepped edge — the standard fix for exactly
// this class of problem.
// #060a10 is --bg's literal value (see :root above) — hardcoded here since a
// gradient stop can't itself reference a custom property without
// reintroducing a resolved-color-space question.
const MUTE_BG_RGB = "6, 10, 16";
const MUTE_FADE_PX = 320;
const mutedColor = (alpha: number) => `rgba(${MUTE_BG_RGB}, ${(alpha / 100).toFixed(4)})`;

// Monochrome fractal noise, alpha scaled down to ~6% via feComponentTransfer
// so it's felt as grain rather than seen as a pattern. Computed once at
// module load, not per-render.
const NOISE_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'>" +
  "<filter id='n'>" +
  "<feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>" +
  "<feColorMatrix type='saturate' values='0'/>" +
  "<feComponentTransfer><feFuncA type='linear' slope='0.06'/></feComponentTransfer>" +
  "</filter>" +
  "<rect width='100' height='100' filter='url(#n)'/>" +
  "</svg>";
const NOISE_DATA_URI = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")`;

function muteWatermarkGradient(fadeTop: boolean, fadeBottom: boolean) {
  const stops: string[] = [];
  stops.push(fadeTop ? "rgba(6, 10, 16, 0) 0px" : `${mutedColor(85)} 0px`);
  if (fadeTop) stops.push(`${mutedColor(85)} ${MUTE_FADE_PX}px`);
  if (fadeBottom) stops.push(`${mutedColor(85)} calc(100% - ${MUTE_FADE_PX}px)`);
  stops.push(fadeBottom ? "rgba(6, 10, 16, 0) 100%" : `${mutedColor(85)} 100%`);
  return `linear-gradient(in srgb to bottom, ${stops.join(", ")})`;
}



const variants = {
  // No explicit background here on purpose: `--bg` is exactly body's own
  // background color, so painting it again on every dark section was always
  // redundant — and it was the thing quietly blocking Hero's background
  // watermark from showing through each section's empty padding/gaps. Every
  // dark section's actual content already carries its own opaque background
  // where it needs one (CaseStudyCard, DossierCard, etc.), so dropping this
  // changes nothing visible except letting the watermark show through.
  dark: { section: "text-text", eyebrow: "text-text-muted" },
  invert: { section: "bg-surface-invert text-text-invert", eyebrow: "text-text-faint" },
} satisfies Record<Variant, { section: string; eyebrow: string }>;

const spacings = {
  default: "py-section",
  tight: "py-12",
  none: "",
} satisfies Record<Spacing, string>;

export default function Section({
  id,
  eyebrow,
  title,
  children,
  bleed,
  variant = "dark",
  spacing = "default",
  muteWatermark = false,
  muteWatermarkFadeTop = false,
  muteWatermarkFadeBottom = false,
}: SectionProps) {
  const headingId = title ? `${id}-heading` : undefined;
  const v = variants[variant];
  const s = spacings[spacing];

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bleedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        // One trigger for the whole section drives every target's tween, so a
        // header and its content can never disagree about whether they're on
        // screen yet — two independent triggers on closely-stacked elements
        // can straddle the threshold and leave one of them stuck hidden.
        const targets = [headerRef.current, contentRef.current, bleedRef.current].filter(
          (el): el is HTMLDivElement => el !== null
        );
        if (targets.length === 0) return;

        const tl = gsap.timeline({ paused: true });

        targets.forEach((el, index) => {
          tl.from(
            el,
            { opacity: 0, y: DISTANCE.rise, duration: DURATION.base, ease: EASE.enter },
            index === 0 ? 0 : STAGGER.content
          );
        });

        // IntersectionObserver, not ScrollTrigger, for this one-shot
        // "reveal once scrolled into view" — every section on the homepage
        // used to run its own ScrollTrigger instance for this (one per
        // Section, all `once: true` but still actively watched until they
        // fire), and ScrollTrigger's own MutationObserver-based
        // auto-refresh (which re-measures trigger positions on any DOM
        // change that might affect layout) was found, via Firefox memory
        // profiling, to retrigger repeatedly against this page's
        // continuously-animating hero watermark and carousel cards —
        // several still-armed instances compounding into severe memory
        // growth even with no scrolling happening. IntersectionObserver is
        // what every other looping visual in this codebase already uses
        // for its own visibility gating, with none of that overhead.
        // rootMargin approximates ScrollTrigger's old "top 80%": the
        // element is treated as intersecting once its top has scrolled up
        // into the viewport's top 80%, not merely touched the bottom edge.
        const io = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            tl.play();
            io.disconnect();
          },
          { rootMargin: "0px 0px -20% 0px" }
        );
        io.observe(root);

        return () => io.disconnect();
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "relative",
        s,
        v.section,
        muteWatermark && !muteWatermarkFadeTop && !muteWatermarkFadeBottom && "bg-bg/85",
        bleed && "overflow-x-hidden"
      )}
    >
      {/*
        A positioned sibling, not this section's own `background` — that
        means it competes in the normal stacking order instead of being free
        background paint: it needs to sit above the Hero watermark overlay
        (z-index: -1, elsewhere on the page) but below this section's own
        text, so both get an explicit z-index rather than relying on paint
        order defaults — a positioned z-0 element always wins against a
        negative one, but always loses to a positive one, regardless of DOM
        position.
      */}
      {muteWatermark && (muteWatermarkFadeTop || muteWatermarkFadeBottom) && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `${NOISE_DATA_URI}, ${muteWatermarkGradient(muteWatermarkFadeTop, muteWatermarkFadeBottom)}`,
            backgroundRepeat: "repeat, no-repeat",
            backgroundSize: "160px 160px, 100% 100%",
          }}
        />
      )}
      <div className="relative z-10 max-w-page mx-auto px-margin">
        {(eyebrow || title) && (
          <header ref={headerRef} className="mb-10 flex flex-col gap-3">
            {eyebrow && <p className={`text-label ${v.eyebrow}`}>{eyebrow}</p>}
            {title && <h2 id={headingId} className="text-headline">{title}</h2>}
          </header>
        )}
        {children && <div ref={contentRef}>{children}</div>}
      </div>
      {bleed && <div ref={bleedRef} className="relative z-10">{bleed}</div>}
    </section>
  )
}
