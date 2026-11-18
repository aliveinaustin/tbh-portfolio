// components/visuals/lifecycle/LayerRolloutVisual.tsx
"use client";

import { gsap } from "@/lib/motion/gsap";
import { colorVar } from "@/lib/motion/tokens";
import { useLoopingTimeline } from "@/lib/motion/useLoopingTimeline";
import PauseButton from "@/components/visuals/PauseButton";
import { PillCheck } from "@/components/visuals/lifecycle/primitives";

// Six layer slots, always present (dashed, empty) from frame one — what
// changes is each one's own state as the rollout reaches it: empty ->
// checking (blue, "in progress" everywhere in this study) -> passed
// (white). Outbound request alone also visits failed (red) before a
// fixed rebuild carries it and the two layers above it to passed too.

type LayerId = "validate-input" | "minimal-write" | "restore-fields" | "outbound-request" | "oauth" | "diagnostic-logging";

const LAYER_ORDER: LayerId[] = ["validate-input", "minimal-write", "restore-fields", "outbound-request", "oauth", "diagnostic-logging"];

const LAYER_LABELS: Record<LayerId, string> = {
  "validate-input": "VALIDATE INPUT",
  "minimal-write": "MINIMAL WRITE",
  "restore-fields": "RESTORE FIELDS",
  "outbound-request": "OUTBOUND REQUEST",
  oauth: "OAUTH",
  "diagnostic-logging": "DIAGNOSTIC LOGGING",
};

// --- Desktop geometry --------------------------------------------------
const D_LAYER_W = 260;
const D_LAYER_H = 40;
const D_STRIDE = 50;
const D_STACK_X = 8;
const D_TOP_Y = 8;
const D_CALLOUT_X = 300;
const D_VIEWBOX_W = 492;
const D_VIEWBOX_H = D_TOP_Y + 5 * D_STRIDE + D_LAYER_H + 18;
const D_VIEWBOX = `0 0 ${D_VIEWBOX_W} ${D_VIEWBOX_H}`;

// --- Mobile geometry: narrower stack, callout beside it, never below ---
const M_FONT_SCALE = 1.35;
const M_LAYER_W = 190;
const M_LAYER_H = 40;
const M_STRIDE = 50;
const M_STACK_X = 10;
const M_TOP_Y = 10;
const M_CALLOUT_X = 224;
const M_VIEWBOX_W = 360;
const M_VIEWBOX_H = M_TOP_Y + 5 * M_STRIDE + M_LAYER_H + 18;
const M_VIEWBOX = `0 0 ${M_VIEWBOX_W} ${M_VIEWBOX_H}`;

function layerY(index: number, topY: number, stride: number) {
  return topY + (LAYER_ORDER.length - 1 - index) * stride;
}

function LayerBar({
  id,
  x,
  y,
  width,
  height,
  label,
  fontScale = 1,
  statusBelow,
}: {
  id: LayerId;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  fontScale?: number;
  /** Mobile's labels (up to "DIAGNOSTIC LOGGING") are too long to share
   * a row with a right-aligned "CHECKING…" at this width — stack status
   * under the label instead of beside it, so it never collides. */
  statusBelow?: boolean;
}) {
  const labelY = statusBelow ? y + height / 2 - 3 : y + height / 2 + 3;
  return (
    <g>
      <rect data-layer-fill={id} x={x} y={y} width={width} height={height} rx={6} fill="var(--color-brand)" opacity={0} />
      <rect data-layer-rect={id} x={x} y={y} width={width} height={height} rx={6} fill="none" stroke="var(--color-border-dim)" strokeWidth={1} strokeDasharray="4 4" />
      <text data-layer-label={id} x={x + 14} y={labelY} fontSize={8.5 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-border-dim)" letterSpacing={0.4}>
        {label}
      </text>
      {statusBelow ? (
        <text data-layer-status={id} x={x + 14} y={y + height - 8} fontSize={6.5 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-blue-light)" opacity={0} letterSpacing={0.3}>
          CHECKING…
        </text>
      ) : (
        <text data-layer-status={id} x={x + width - 14} y={y + height / 2 + 3} textAnchor="end" fontSize={8 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-blue-light)" opacity={0} letterSpacing={0.3}>
          CHECKING…
        </text>
      )}
      <g data-layer-check={id} opacity={0}>
        <PillCheck x={x + width - 14 - 16 * fontScale} y={labelY - 10} width={14} height={14} />
      </g>
    </g>
  );
}

/** "500 · Internal Server Error" plus (desktop only) a muted two-line
 * caption — mobile has no room for the caption without colliding with
 * the row below, so it's passed empty there. */
function ErrorCallout({
  x,
  y,
  fontScale = 1,
  subtitleLines,
  captionLines,
}: {
  x: number;
  y: number;
  fontScale?: number;
  subtitleLines: string[];
  captionLines: string[];
}) {
  return (
    <g data-error-callout opacity={0}>
      <text x={x} y={y} fontSize={16 * fontScale} fontFamily="var(--font-mono)" fontWeight={800} fill="var(--color-brand)">
        500
      </text>
      <text x={x} y={y + 15 * fontScale} fontSize={8.5 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-brand)">
        {subtitleLines.map((line, i) => (
          <tspan key={line} x={x} dy={i === 0 ? 0 : 11 * fontScale}>
            {line}
          </tspan>
        ))}
      </text>
      {captionLines.length > 0 && (
        <text x={x} y={y + 15 * fontScale + subtitleLines.length * 11 * fontScale + 12 * fontScale} fontSize={7 * fontScale} fontFamily="var(--font-mono)" fill="var(--color-text-faint)">
          {captionLines.map((line, i) => (
            <tspan key={line} x={x} dy={i === 0 ? 0 : 10 * fontScale}>
              {line}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
}

function CompleteLabel({ x, y, fontScale = 1 }: { x: number; y: number; fontScale?: number }) {
  return (
    <g data-complete-label opacity={0}>
      <PillCheck x={x} y={y - 7} width={14} height={14} />
      <text x={x + 20} y={y + 3} fontSize={9 * fontScale} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--color-text)" letterSpacing={0.4}>
        COMPLETE
      </text>
    </g>
  );
}

function qa<T extends Element>(scope: ParentNode, selector: string): T[] {
  return gsap.utils.toArray<T>(selector, scope);
}

/** Collapses the leader line to a point at its own start. */
function collapseLeader(el: SVGLineElement) {
  gsap.set(el, { attr: { x2: Number(el.getAttribute("x1")) } });
}

/** Stage 1 — all six slots empty and dashed, nothing built, no callout,
 * no complete label. */
function resetAll(scope: ParentNode) {
  const dim = colorVar("border-dim");

  gsap.set(qa(scope, "[data-layer-rect]"), { stroke: dim, strokeDasharray: "4 4" });
  gsap.set(qa(scope, "[data-layer-label]"), { fill: dim });
  gsap.set(qa(scope, "[data-layer-status]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-layer-check]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-layer-fill]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-error-callout]"), { opacity: 0 });
  gsap.set(qa(scope, "[data-complete-label]"), { opacity: 0 });
  qa<SVGLineElement>(scope, "[data-leader-line]").forEach(collapseLeader);
}

/** One layer's empty -> checking -> passed transition, built onto `tl`
 * starting at `position`. Returns the position right after it passes, so
 * callers can chain the next layer immediately. */
function landLayer(tl: gsap.core.Timeline, scope: ParentNode, viewport: "desktop" | "mobile", id: LayerId, position: number): number {
  const white = colorVar("text");
  const blueLight = colorVar("blue-light");

  const sel = (s: string) => `[data-viewport='${viewport}'] ${s}`;
  const rect = qa(scope, sel(`[data-layer-rect='${id}']`));
  const label = qa(scope, sel(`[data-layer-label='${id}']`));
  const status = qa(scope, sel(`[data-layer-status='${id}']`));
  const check = qa(scope, sel(`[data-layer-check='${id}']`));

  const appear = 0.15;
  const hold = 0.25;
  const pass = 0.2;

  tl.to(rect, { stroke: blueLight, strokeDasharray: "0 0", duration: appear }, position)
    .to(label, { fill: blueLight, duration: appear }, position)
    .to(status, { opacity: 1, duration: appear }, position);

  const passAt = position + appear + hold;
  tl.to(rect, { stroke: white, duration: pass }, passAt)
    .to(label, { fill: white, duration: pass }, passAt)
    .to(status, { opacity: 0, duration: 0.1 }, passAt)
    .to(check, { opacity: 1, duration: pass }, passAt);

  return passAt + pass;
}

/** Just the empty -> checking step, left checking (no pass) — outbound
 * request at the end of stage 2, before stage 3 fails it. */
function startChecking(tl: gsap.core.Timeline, scope: ParentNode, viewport: "desktop" | "mobile", id: LayerId, position: number) {
  const blueLight = colorVar("blue-light");
  const sel = (s: string) => `[data-viewport='${viewport}'] ${s}`;
  const rect = qa(scope, sel(`[data-layer-rect='${id}']`));
  const label = qa(scope, sel(`[data-layer-label='${id}']`));
  const status = qa(scope, sel(`[data-layer-status='${id}']`));

  tl.to(rect, { stroke: blueLight, strokeDasharray: "0 0", duration: 0.15 }, position)
    .to(label, { fill: blueLight, duration: 0.15 }, position)
    .to(status, { opacity: 1, duration: 0.15 }, position);
}

function buildSequence(tl: gsap.core.Timeline, scope: ParentNode, viewport: "desktop" | "mobile") {
  const dim = colorVar("border-dim");
  const brand = colorVar("brand");

  const sel = (s: string) => `[data-viewport='${viewport}'] ${s}`;
  const outboundRect = qa(scope, sel("[data-layer-rect='outbound-request']"));
  const outboundLabel = qa(scope, sel("[data-layer-label='outbound-request']"));
  const outboundStatus = qa(scope, sel("[data-layer-status='outbound-request']"));
  const outboundFill = qa(scope, sel("[data-layer-fill='outbound-request']"));
  const leader = qa<SVGLineElement>(scope, sel("[data-leader-line]"))[0];
  const callout = qa(scope, sel("[data-error-callout]"));
  const complete = qa(scope, sel("[data-complete-label]"));
  const allRects = qa(scope, sel("[data-layer-rect]"));
  const allLabels = qa(scope, sel("[data-layer-label]"));
  const allChecks = qa(scope, sel("[data-layer-check]"));

  // --- Stage 2: build and check, one layer at a time (0.0 - 2.4s) --------
  let t = 0;
  t = landLayer(tl, scope, viewport, "validate-input", t);
  t = landLayer(tl, scope, viewport, "minimal-write", t);
  t = landLayer(tl, scope, viewport, "restore-fields", t);
  startChecking(tl, scope, viewport, "outbound-request", t);

  // --- Stage 3: failure isolated (2.4 - 4.4s) ----------------------------
  tl.to(outboundRect, { stroke: brand, duration: 0.2 }, 2.4)
    .to(outboundLabel, { fill: brand, duration: 0.2 }, 2.4)
    .to(outboundStatus, { opacity: 0, duration: 0.1 }, 2.4)
    .to(outboundFill, { opacity: 0.12, duration: 0.2 }, 2.4);
  tl.to(leader, { attr: { x2: Number(leader.getAttribute("data-x2-final")) }, duration: 0.25, ease: "none" }, 2.6);
  tl.to(callout, { opacity: 1, duration: 0.2 }, 2.85);
  // Hold ~1s on the failure before the fix begins.

  // --- Stage 4: fix, continue, complete (4.4 - 8.0s) ---------------------
  tl.to(callout, { opacity: 0, duration: 0.2 }, 4.4);
  tl.to(leader, { attr: { x2: Number(leader.getAttribute("x1")) }, duration: 0.2 }, 4.4);
  tl.to(outboundFill, { opacity: 0, duration: 0.2 }, 4.4);

  let t4 = 4.6;
  t4 = landLayer(tl, scope, viewport, "outbound-request", t4);
  t4 = landLayer(tl, scope, viewport, "oauth", t4);
  t4 = landLayer(tl, scope, viewport, "diagnostic-logging", t4);

  tl.to(complete, { opacity: 1, duration: 0.25 }, t4 + 0.15);

  // Hold on the finished stack, then clear top-down — staggered so each
  // row's reset is visible, not an instant mass snap — landing exactly on
  // resetAll's own values so the subsequent onRepeat is invisible. Layer
  // elements are queried in LAYER_ORDER (bottom-up), so `from: "end"`
  // starts the stagger at diagnostic-logging (the last/topmost element).
  const clearAt = t4 + 0.15 + 0.25 + 1.0;
  tl.to(complete, { opacity: 0, duration: 0.15 }, clearAt);
  tl.to(allRects, { stroke: dim, strokeDasharray: "4 4", duration: 0.2, stagger: { each: 0.05, from: "end" } }, clearAt);
  tl.to(allLabels, { fill: dim, duration: 0.2, stagger: { each: 0.05, from: "end" } }, clearAt);
  tl.to(allChecks, { opacity: 0, duration: 0.15, stagger: { each: 0.05, from: "end" } }, clearAt);
}

function applyReducedState(scope: ParentNode) {
  resetAll(scope);
  const white = colorVar("text");
  const brand = colorVar("brand");

  (["desktop", "mobile"] as const).forEach((viewport) => {
    const sel = (s: string) => `[data-viewport='${viewport}'] ${s}`;
    const passedIds: LayerId[] = ["validate-input", "minimal-write", "restore-fields"];
    passedIds.forEach((id) => {
      gsap.set(qa(scope, sel(`[data-layer-rect='${id}']`)), { stroke: white, strokeDasharray: "0 0" });
      gsap.set(qa(scope, sel(`[data-layer-label='${id}']`)), { fill: white });
      gsap.set(qa(scope, sel(`[data-layer-check='${id}']`)), { opacity: 1 });
    });

    gsap.set(qa(scope, sel("[data-layer-rect='outbound-request']")), { stroke: brand, strokeDasharray: "0 0" });
    gsap.set(qa(scope, sel("[data-layer-label='outbound-request']")), { fill: brand });
    gsap.set(qa(scope, sel("[data-layer-fill='outbound-request']")), { opacity: 0.12 });

    const leader = qa<SVGLineElement>(scope, sel("[data-leader-line]"))[0];
    gsap.set(leader, { attr: { x2: Number(leader.getAttribute("data-x2-final")) } });
    gsap.set(qa(scope, sel("[data-error-callout]")), { opacity: 1 });
  });
}

export default function LayerRolloutVisual() {
  const { scopeRef, paused, toggle } = useLoopingTimeline({
    build: (scope) => {
      resetAll(scope);
      const tl = gsap.timeline({ repeat: -1, onRepeat: () => resetAll(scope) });
      (["desktop", "mobile"] as const).forEach((vp) => buildSequence(tl, scope, vp));
      return {
        controller: {
          play: () => tl.play(),
          pause: () => tl.pause(),
          restart: () => {
            resetAll(scope);
            tl.restart();
          },
        },
        cleanup: () => tl.kill(),
      };
    },
    reduced: (scope) => applyReducedState(scope),
  });

  return (
    <div ref={scopeRef} className="relative w-full p-4">
      <svg data-viewport="desktop" viewBox={D_VIEWBOX} className="hidden h-auto w-full sm:block" aria-hidden="true">
        {LAYER_ORDER.map((id, i) => (
          <LayerBar key={id} id={id} x={D_STACK_X} y={layerY(i, D_TOP_Y, D_STRIDE)} width={D_LAYER_W} height={D_LAYER_H} label={LAYER_LABELS[id]} />
        ))}
        <line
          data-leader-line
          x1={D_STACK_X + D_LAYER_W}
          y1={layerY(3, D_TOP_Y, D_STRIDE) + D_LAYER_H / 2}
          x2={D_STACK_X + D_LAYER_W}
          y2={layerY(3, D_TOP_Y, D_STRIDE) + D_LAYER_H / 2}
          stroke="var(--color-brand)"
          strokeWidth={1.25}
          data-x2-final={D_CALLOUT_X - 14}
        />
        <ErrorCallout
          x={D_CALLOUT_X}
          y={layerY(3, D_TOP_Y, D_STRIDE) + 10}
          subtitleLines={["Internal Server Error"]}
          captionLines={["Same generic message as every other failure.", "Only the newest layer can be the cause."]}
        />
        <CompleteLabel x={D_CALLOUT_X} y={D_TOP_Y + D_LAYER_H / 2} />
      </svg>

      <svg data-viewport="mobile" viewBox={M_VIEWBOX} className="h-auto w-full sm:hidden" aria-hidden="true">
        {LAYER_ORDER.map((id, i) => (
          <LayerBar
            key={id}
            id={id}
            x={M_STACK_X}
            y={layerY(i, M_TOP_Y, M_STRIDE)}
            width={M_LAYER_W}
            height={M_LAYER_H}
            label={LAYER_LABELS[id]}
            fontScale={M_FONT_SCALE}
            statusBelow
          />
        ))}
        <line
          data-leader-line
          x1={M_STACK_X + M_LAYER_W}
          y1={layerY(3, M_TOP_Y, M_STRIDE) + M_LAYER_H / 2}
          x2={M_STACK_X + M_LAYER_W}
          y2={layerY(3, M_TOP_Y, M_STRIDE) + M_LAYER_H / 2}
          stroke="var(--color-brand)"
          strokeWidth={1.25}
          data-x2-final={M_CALLOUT_X - 10}
        />
        <ErrorCallout
          x={M_CALLOUT_X}
          y={layerY(3, M_TOP_Y, M_STRIDE) + 9}
          fontScale={M_FONT_SCALE}
          subtitleLines={["Internal Server", "Error"]}
          captionLines={[]}
        />
        <CompleteLabel x={M_CALLOUT_X} y={M_TOP_Y + M_LAYER_H / 2} fontScale={M_FONT_SCALE} />
      </svg>

      <PauseButton paused={paused} onClick={toggle} label="animation" className="absolute right-4 bottom-4" />
    </div>
  );
}
