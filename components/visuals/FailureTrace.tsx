// components/visuals/FailureTrace.tsx
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Check, Pause, Play } from "lucide-react";
import { gsap } from "@/lib/motion/gsap";

const STEPS = ["Cart", "Checkout", "Payment", "Order"];
// Non-breaking spaces ( ) inside each clause, regular spaces only
// around the "·" separators — on narrow widths this can still wrap, but
// only between clauses, never mid-phrase.
const LOG_LINE = "order 1042 · payment_failed · trashed";

/**
 * Illustrates "the system reported success while doing the wrong thing": a
 * dot travels through four steps, revealing a white outline and a green
 * check at each one in turn — every stage "reports success," including
 * Order, where the check arrives first and the outline turns brand-red a
 * beat later. That gap (a confident check inside a red ring) is the silent
 * failure. A log line then reveals what actually happened, holds, and the
 * whole thing fades back to empty before looping.
 */
export default function FailureTrace() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const userPaused = useRef(false);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [paused, setPaused] = useState(false);

  const sync = () => {
    if (!tl.current) return;
    if (visible.current && !userPaused.current) tl.current.play();
    else tl.current.pause();
  };

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const ctx = gsap.context(() => {
      const dot = scope.querySelector<HTMLElement>("[data-dot]");
      const log = scope.querySelector<HTMLElement>("[data-log]");
      const actual = scope.querySelector<HTMLElement>("[data-actual]");
      const nodes = gsap.utils.toArray<HTMLElement>("[data-node]", scope);
      const checks = gsap.utils.toArray<HTMLElement>("[data-check]", scope);
      const orderNode = nodes[nodes.length - 1];
      if (!dot || !log || !actual || nodes.length === 0 || checks.length === 0 || !orderNode) return;

      const root = getComputedStyle(document.documentElement);
      const faintColor = root.getPropertyValue("--text-faint").trim();
      const reportedColor = root.getPropertyValue("--text").trim();
      const brandColor = root.getPropertyValue("--brand").trim();

      const positions = nodes.map((n) => n.offsetLeft + n.offsetWidth / 2);

      gsap.set(dot, { x: positions[0], opacity: 0 });
      gsap.set(nodes, { borderColor: faintColor });
      gsap.set(checks, { opacity: 0 });
      gsap.set(actual, { opacity: 0 });

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const typeState = { n: 0 };
        const timeline = gsap.timeline({ repeat: -1 });

        timeline.set(dot, { x: positions[0], opacity: 1 }).call(() => {
          log.textContent = "";
        });

        // Cart reports immediately (the dot starts here); Checkout and
        // Payment each report on arrival after a short travel segment.
        nodes.slice(0, 3).forEach((node, i) => {
          if (i > 0) timeline.to(dot, { x: positions[i], duration: 0.45, ease: "none" });
          timeline
            .to(node, { borderColor: reportedColor, duration: 0.2 })
            .to(checks[i], { opacity: 1, duration: 0.2 }, "<");
        });

        timeline
          .to(dot, { x: positions[3], duration: 0.45, ease: "none" })
          .to(orderNode, { borderColor: reportedColor, duration: 0.2 })
          .to(checks[3], { opacity: 1, duration: 0.2 }, "<")
          // The beat: check lands, nothing changes for a moment — then the
          // outline turns red. Reads stronger split out than simultaneous.
          .to({}, { duration: 0.35 })
          .to(orderNode, { borderColor: brandColor, duration: 0.25 })
          .to(actual, { opacity: 1, duration: 0.25 }, "<")
          .to(dot, { opacity: 0, duration: 0.25 }, "<")
          .to(
            typeState,
            {
              n: LOG_LINE.length,
              duration: 1.1,
              ease: "none",
              onUpdate: () => {
                log.textContent = LOG_LINE.slice(0, Math.round(typeState.n));
              },
            },
            ">"
          )
          .to({}, { duration: 1.2 }) // hold on the settled state — green check, red ring
          // Fade everything back to empty before the loop restarts, rather
          // than snapping — matches how each stage arrived.
          .to(nodes, { borderColor: faintColor, duration: 0.4 })
          .to(checks, { opacity: 0, duration: 0.4 }, "<")
          .to(actual, { opacity: 0, duration: 0.3 }, "<");

        tl.current = timeline;
        sync();

        return () => timeline.kill();
      });

      // Reduced motion: skip straight to the settled, meaningful state —
      // every check shown, Order's ring red, log line already visible.
      // That's the one frame where the meaning survives without motion.
      gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(dot, { opacity: 0 });
        gsap.set(nodes, { borderColor: reportedColor });
        gsap.set(orderNode, { borderColor: brandColor });
        gsap.set(checks, { opacity: 1 });
        gsap.set(actual, { opacity: 1 });
        log.textContent = LOG_LINE;
      });
    }, scope);

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
  }, []);

  const toggle = () => {
    userPaused.current = !userPaused.current;
    setPaused(userPaused.current);
    sync();
  };

  return (
    <div ref={scopeRef} className="relative flex w-full flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div aria-hidden="true" className="flex flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-label">
          <span className="text-text-muted">Reported: success</span>
          <span data-actual className="text-brand opacity-0">
            Actual: order deleted
          </span>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? "Play animation" : "Pause animation"}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-bg/80 text-text-muted hover:text-text"
        >
          {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
        </button>
      </div>

      <div aria-hidden="true" className="relative flex items-start">
        {STEPS.map((step, i) => (
          <Fragment key={step}>
            <div className="flex w-14 flex-col items-center gap-2 sm:w-20">
              <div
                data-node={step}
                className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-text-faint bg-bg"
              >
                <Check data-check={step} size={14} className="text-ok opacity-0" />
              </div>
              <span className="text-center text-label text-text-faint">{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="relative top-[1.125rem] h-px flex-1 border-t border-dotted border-text-faint" />
            )}
          </Fragment>
        ))}
        <span
          data-dot
          className="absolute top-[1.125rem] left-0 z-20 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text"
        />
      </div>

      {/* Fixed height, not min-height: the line types in from empty, and a
          growing box here would push the next decision's copy down the
          page with it (nothing below this is absolutely positioned). */}
      <p aria-hidden="true" data-log className="h-[1.4em] text-code text-text-muted" />
    </div>
  );
}
