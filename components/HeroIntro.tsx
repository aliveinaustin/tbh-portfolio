// components/HeroIntro.tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/motion/gsap";
import { DISTANCE, DURATION, EASE } from "@/lib/motion/tokens";

type HeroIntroProps = {
  badge: ReactNode;
  children: ReactNode;
};

// Next.js remounts Hero on every client-side navigation back to "/" (e.g.
// from a case study page), which would otherwise replay the whole intro
// every time. sessionStorage persists across that within one tab session but
// resets on an actual new visit, so it plays once per session, not once ever.
const INTRO_PLAYED_KEY = "tbh-hero-intro-played";

/**
 * Plays the badge intro once per session — rings establish, the aperture
 * spirals open, accent arcs flicker alive, service labels snap in, and the
 * center assembly banks and levels out — then clears the overlay to reveal
 * the real Hero content underneath. Skips straight to the resolved state on
 * repeat mounts within the session, and under prefers-reduced-motion.
 */
export default function HeroIntro({ badge, children }: HeroIntroProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const badgeEl = badgeRef.current;
    const content = contentRef.current;
    if (!overlay || !badgeEl || !content) return;

    const alreadyPlayed = sessionStorage.getItem(INTRO_PLAYED_KEY) === "1";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The intro is a top-of-page branding moment, but a reload (or a fresh
    // tab landing mid-scroll — e.g. clearing sessionStorage to retest while
    // scrolled down near Contact) can leave the browser at any scroll
    // position. Every measurement below is viewport-relative, so playing the
    // intro without resetting scroll first both sizes the badge off
    // nonsensical numbers and renders it "floating" over whatever section
    // happens to be in view instead of over Hero. Skipped for reduced-motion
    // and repeat-session mounts — neither actually plays the animation, so
    // there's nothing visually broken to fix and no reason to yank the
    // user's scroll position.
    if (!alreadyPlayed && !prefersReducedMotion) {
      // `behavior: "instant"` is required, not optional: html has
      // `scroll-behavior: smooth` for motion-safe users — exactly the
      // population this branch runs for — so a plain scrollTo(0, 0) would
      // animate the scroll instead of jumping immediately, and every
      // measurement below would still read the pre-scroll position.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    // Size and position both come from the one span that actually matters:
    // from where the Hero content begins (already reliably clear of the
    // header) to where the next section (#work) starts. Sizing within that
    // measured gap — rather than guessing with viewport-relative multipliers
    // — makes "never overlap the header or the next section" true by
    // construction instead of something to clamp after the fact.
    const rect = content.getBoundingClientRect();
    const workEl = document.getElementById("work");
    const workTop = workEl ? workEl.getBoundingClientRect().top : window.innerHeight;
    const availableSpan = Math.max(workTop - rect.top, rect.height);
    // The badge can never start above rect.top, so the true on-screen room is
    // measured from there to the bottom of the viewport — not the full
    // viewport height. On mobile, where tall stacked content pushes rect.top
    // deep into the page, using the full viewport height here was the bug:
    // it let the badge size itself larger than what could actually fit
    // between content's top and the screen's bottom edge.
    const roomBelowContentTop = window.innerHeight - rect.top;
    // The badge is aspect-square, so its width always equals its height —
    // badgeSize has to respect the viewport's width too (minus the overlay's
    // own p-8 padding), or a tall badge forces an equally-wide one that
    // overflows past the screen edges on narrow viewports.
    const badgeSize = Math.min(availableSpan * 0.99, 880, roomBelowContentTop * 0.99, window.innerWidth - 64);
    // When content fits in one screen (typical desktop), center on its own
    // midpoint — this is the look that's already been checked and approved.
    // When it doesn't (mobile, content taller than the viewport), centering
    // on content at all stops making sense — even averaging content.top with
    // the viewport bottom excludes the header's sliver of screen and skews
    // the result low. Just target the true viewport center instead; the
    // clamps below still keep it clear of the header if the badge is large
    // enough for that to matter.
    const contentCenter =
      rect.height <= window.innerHeight ? rect.top + rect.height / 2 : window.innerHeight / 2;
    let top = contentCenter - badgeSize / 2;
    top = Math.max(top, rect.top);
    top = Math.min(top, workTop - badgeSize);
    top = Math.min(top, window.innerHeight - badgeSize);
    top = Math.max(top, 0);
    overlay.style.top = `${top}px`;
    overlay.style.height = `${badgeSize}px`;

    // The watermark needs to clip a little below the header's bottom edge on
    // top, but stay open on the other three sides — a plain `overflow:
    // hidden` ancestor can't do that (it clips all four sides, or none once
    // the element is `position: fixed`, which ignores ancestor overflow
    // entirely). clip-path on the untransformed `overlay` box does: a single
    // real inset on top, and large negative insets on the other sides push
    // their clip edges far off-screen so they never engage.
    //
    // The inset is relative to overlay's OWN box top (`top`, already below
    // the header by construction) — not the header itself — so a positive
    // number here would only push the clip line further down, past overlay's
    // own edge. Reaching UP to the header's edge requires a negative inset,
    // which clip-path's spec explicitly allows (it expands the clipped
    // region beyond the reference box rather than shrinking it).
    const headerBottomPx = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    const clipLineY = headerBottomPx + 12;
    const topClipInset = clipLineY - top;
    const watermarkClipPath = `inset(${topClipInset}px -100vw -100vh -100vw)`;

    // Repeat mounts within the session (e.g. navigating back from a case
    // study) skip the intro, but the badge should still land in its
    // permanent spot as a background watermark — not vanish — so it snaps
    // straight to the timeline's end state instead of animating there.
    // Position stays `fixed` (never switches to absolute): that's what lets
    // the watermark act like a pinned backdrop — page content scrolls over
    // it — rather than a decoration that scrolls away with Hero itself.
    if (alreadyPlayed) {
      if (prefersReducedMotion) {
        gsap.set(overlay, { autoAlpha: 0 });
      } else {
        gsap.set(overlay, { visibility: "visible", opacity: 1, zIndex: -1, clipPath: watermarkClipPath });
        gsap.set(badgeEl, { scale: 2.4, rotate: -20, x: -badgeSize * 0.35, opacity: 0.14 });
        overlay.classList.add("hero-badge-watermark");
      }
      gsap.set(content, { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Deferred, not written synchronously: React Strict Mode's dev-only
        // mount→cleanup→remount runs this whole callback twice in a row. A
        // synchronous write here would persist from the first (discarded)
        // invocation, so the second (real) one would see "already played"
        // immediately and skip the animation on every first load. Deferring
        // lets the cleanup below cancel it if this invocation is the one
        // that gets torn down.
        const markPlayedTimer = setTimeout(() => sessionStorage.setItem(INTRO_PLAYED_KEY, "1"), 0);
        const q = gsap.utils.selector(overlay);
        // The badge's circles are all centered on the viewBox's exact midpoint —
        // svgOrigin pins rotation/scale there regardless of each group's own
        // (slightly asymmetric, due to uneven tick extensions) bounding box.
        const badgeCenter = "663.198 663.252";
        const outerRing = q("#outer-ring-assembly");
        const middleRing = q("#middle-ring-assembly");
        const rings = [...outerRing, ...middleRing];
        const apertureBlades = q("#aperture-segments path");
        const arcSegments = q("#outer-arc-segments path");
        // Visual left-to-right reading order (SFMC · Email · Display · Web) —
        // the SVG's own document order runs right-to-left, so this is built
        // explicitly rather than relying on querySelectorAll's DOM order.
        const labelIds = [
          "top-text-01__SFMC_",
          "top-bullet-01",
          "top-text-02__EMAIL_",
          "top-text-03__DISPLAY_",
          "top-bullet-02",
          "top-text-04__WEB_",
          "outer-ring-text-btm",
        ];
        const labels = labelIds.map((id) => q(`#${id}`)[0]).filter(Boolean);
        // Horizon, attitude brackets/grads/caret, and the monogram all move as
        // one unit for the bank-and-level payoff — the caret stays fixed to the
        // instrument face rather than swinging independently.
        const centerAssembly = q("#inner-ring-assembly, #center-text");

        const tl = gsap.timeline({
          onComplete: () => window.removeEventListener("scroll", onScroll),
        });

        tl.set(content, { autoAlpha: 0, y: DISTANCE.rise })
          .set(rings, { opacity: 0, scale: 0.7, rotate: -15, svgOrigin: badgeCenter })
          // Scale/rotate pivot on the shared badge center so blades visibly
          // emerge from the middle and grow out to meet the ring — but each
          // blade gets a different starting rotation (function-based value,
          // alternating by index) so they sweep against each other on the way
          // out instead of moving together as one rigid disc.
          .set(apertureBlades, {
            opacity: 0,
            scale: 0,
            rotate: (i) => (i % 2 === 0 ? 90 : -90),
            svgOrigin: badgeCenter,
          })
          .set(arcSegments, { opacity: 0, rotate: -8, svgOrigin: badgeCenter })
          .set(labels, { opacity: 0, scale: 0.85 })
          .set(centerAssembly, { opacity: 0, scale: 0.85, rotate: -40, svgOrigin: badgeCenter })
          .to(overlay, { autoAlpha: 1, duration: 0.01 })
          // Outer ring establishes first; the inner/middle ring follows a beat
          // behind, like it's catching up to lock into the same orientation.
          .to(outerRing, { opacity: 1, scale: 1, rotate: 0, duration: DURATION.slow, ease: EASE.enter })
          .to(middleRing, { opacity: 1, scale: 1, rotate: 0, duration: DURATION.slow, ease: EASE.enter }, "<+=0.25")
          // Iris blades swing open together, like camera aperture blades —
          // overlapping the tail of the ring animation to keep things moving.
          .to(apertureBlades, {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: DURATION.base,
            ease: EASE.enter,
          }, "<+=0.3")
          .addLabel("apertureStart", "<")
          // Arcs, labels and the center payoff all branch off the aperture's
          // start (rather than chaining after one another) so they run in
          // parallel — center starts filling in while the aperture is still
          // settling, instead of leaving the middle empty until the outer
          // stuff finishes.
          .to(arcSegments, {
            keyframes: { opacity: [0, 1, 0, 1, 0, 1], rotate: [-8, 0] },
            duration: DURATION.slow,
            ease: "power1.inOut",
            stagger: 0.1,
          }, "apertureStart+=0.3")
          // Service labels snap into place left-to-right (SFMC · Email · Display · Web),
          // reading order rather than document order, with a bounce-pulse pop.
          .to(labels, {
            opacity: 1,
            scale: 1,
            duration: DURATION.base,
            ease: "back.out(2.2)",
            stagger: 0.07,
          }, "apertureStart+=0.5")
          // The payoff: horizon + monogram (caret included) fade in already
          // mid-bank, then roll through the turn and level out at roughly the
          // same pace the labels take to finish popping in, so the two don't
          // read as mismatched speeds.
          .to(centerAssembly, { opacity: 1, scale: 1, duration: DURATION.base, ease: EASE.enter }, "apertureStart+=0.35")
          .to(centerAssembly, {
            keyframes: { rotate: [-40, 40, 0] },
            duration: DURATION.slow,
            ease: "power1.out",
          }, "apertureStart+=0.35")
          // Hold the fully-assembled badge an extra beat so it's actually
          // readable before the payoff, instead of launching right as it lands.
          // `overlay` itself (fixed, z-index dropped behind the page, clipped
          // at the header) never gets the scale/rotate transform below — only
          // `badgeEl` does. Keeping overlay untransformed is what lets its
          // clip-path stay a straight line at the header's edge instead of
          // rotating/scaling along with the badge inside it.
          .set(overlay, { zIndex: -1, clipPath: watermarkClipPath }, "+=1.2")
          // classList directly, not GSAP's className special property — this
          // build of GSAP ships with that feature commented out of CSSPlugin,
          // so passing className as a plain property overwrote the whole
          // class list (including hero-intro-overlay itself) with the raw
          // string instead of toggling one class on top of the rest.
          .call(() => overlay.classList.add("hero-badge-watermark"), [], "<")
          // The badge doesn't vanish — it blows up into a big, rotated, flat-red
          // watermark parked behind the real content, instead of disappearing.
          .to(
            badgeEl,
            {
              scale: 2.4,
              rotate: -20,
              x: -badgeSize * 0.35,
              opacity: 0.14,
              duration: 1,
              ease: "power2.out",
            },
            "<"
          )
          .to(content, { autoAlpha: 1, y: 0, duration: DURATION.base, ease: EASE.enter }, "<+=0.2");

        // A user who starts scrolling before the intro finishes shouldn't be
        // stuck watching a `position: fixed` badge ride along on top of
        // their content — scroll-locking until the animation completes was
        // considered and rejected (blocking a basic gesture like scroll
        // reads as the page being broken). Interrupting straight to the
        // resolved watermark state instead respects the scroll immediately
        // while still landing in the one state that's actually designed to
        // coexist with scrolling.
        let skippedByScroll = false;
        const skipToWatermark = () => {
          if (skippedByScroll) return;
          skippedByScroll = true;
          window.removeEventListener("scroll", onScroll);
          tl.kill();
          clearTimeout(markPlayedTimer);
          sessionStorage.setItem(INTRO_PLAYED_KEY, "1");
          // tl.kill() freezes every sub-element wherever its own tween
          // happened to be mid-flight — whatever hadn't started revealing
          // yet (aperture blades, labels, center assembly) is still sitting
          // at the hidden opacity:0/scale:0.7-0.85 the timeline set at t=0.
          // Snap everything to its fully-revealed state before the watermark
          // transform takes over, or an early interrupt leaves the badge
          // missing whatever hadn't animated in yet.
          gsap.set([...rings, ...apertureBlades, ...arcSegments, ...labels, ...centerAssembly], {
            opacity: 1,
            scale: 1,
            rotate: 0,
          });
          // zIndex/clip-path/class snap instantly — this early in the
          // timeline there's no previous clip-path value to animate from,
          // and neither benefits from easing anyway. The visible payoff
          // (scale/rotate/fade) still gets a short tween so interrupting
          // reads as "wrapping up" rather than a hard cut.
          gsap.set(overlay, { zIndex: -1, clipPath: watermarkClipPath });
          overlay.classList.add("hero-badge-watermark");
          gsap.to(badgeEl, {
            scale: 2.4,
            rotate: -20,
            x: -badgeSize * 0.35,
            opacity: 0.14,
            duration: 0.2,
            ease: "power1.out",
          });
          gsap.to(content, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power1.out" });
        };
        // A small threshold, not scrollY > 0 — trackpad/mouse-wheel
        // overscroll bounce can fire scroll events at the very top of the
        // page without the user having asked to scroll at all.
        const onScroll = () => {
          if (window.scrollY > 10) skipToWatermark();
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
          window.removeEventListener("scroll", onScroll);
          clearTimeout(markPlayedTimer);
          tl.kill();
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(content, { autoAlpha: 1 });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative">
      {/*
        Fixed (not absolute), with top/height measured and set in JS — see the
        effect above for why neither "match the viewport" nor "match the
        content's own height" alone works across all screen sizes. Both this
        and the content below use a CSS-only pre-hide (globals.css) so
        neither flashes at the wrong size/visibility on first paint, before
        GSAP (and the sizing effect) get a chance to run — see the comments
        there for why a plain useEffect alone isn't enough on a real reload.
      */}
      <div
        ref={overlayRef}
        className="hero-intro-overlay pointer-events-none fixed left-0 right-0 z-60 flex items-center justify-center p-8"
      >
        {/*
          Separate from `overlay` on purpose: the watermark payoff scales and
          rotates this inner element, not the outer one. `overlay` carries the
          clip-path that hides the badge behind the header — if the transform
          landed on overlay too, the clip boundary would rotate/scale right
          along with it instead of staying a straight line at the header's edge.
        */}
        <div ref={badgeRef} className="h-full">
          {badge}
        </div>
      </div>
      <div ref={contentRef} className="hero-intro-content">
        {children}
      </div>
    </div>
  );
}
