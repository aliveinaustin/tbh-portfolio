// components/visuals/DecisionVisuals.tsx
import type { ReactNode } from "react";
import Image from "next/image";
import BeforeAfterPair from "@/components/visuals/BeforeAfterPair";
import RecorderGrid from "@/components/visuals/RecorderGrid";
import FailureTrace from "@/components/visuals/FailureTrace";
import EmailPaddingVisual from "@/components/visuals/email/EmailPaddingVisual";
import EmailTokensVisual from "@/components/visuals/email/EmailTokensVisual";
import EmailCtaLinkVisual from "@/components/visuals/email/EmailCtaLinkVisual";
import EmailDarkCellsVisual from "@/components/visuals/email/EmailDarkCellsVisual";
import { gearznWalkthroughGrid } from "@/lib/case-visuals";

/** Order-confirmation screenshot shown close to its native resolution (no
 * upscaling transform — that's what was making the first pass look
 * artifacted) with a callout ring on the order number instead of a tight
 * zoomed crop. */
function AttributionCrop() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-bg"
    >
      <Image
        src="/work/gearzn/decisions/17-order-confirmation--desktop-1440.png"
        alt=""
        fill
        sizes="(min-width: 1024px) 480px, 90vw"
        className="object-cover object-[center_38%]"
      />
      <span
        className="absolute rounded-full border-2 border-brand"
        style={{ left: "6%", top: "42%", width: "19%", height: "9%" }}
      />
    </div>
  );
}

// Keyed by `CaseStudy["decisions"][number]["visual"]` — one shared instance
// for "failure-trace" is intentional: "Move failed orders to the trash" and
// "Log every failure path" read as one fix told in two sentences, so they
// share a single row and a single animation rather than two unsynced copies.
export const decisionVisuals: Record<string, ReactNode> = {
  "cart-totals": (
    <BeforeAfterPair
      before="/work/gearzn/decisions/12-cart-drawer-3-items--mobile-390.png"
      beforeAlt="Cart drawer with 3 items, before the fix"
      after="/work/gearzn/decisions/13-cart-drawer-qty-updated--mobile-390.png"
      afterAlt="Cart drawer after a quantity change, total recalculated from the items"
    />
  ),
  "3ds-clear": (
    <BeforeAfterPair
      before="/work/gearzn/decisions/16-checkout-filled--mobile-390.png"
      beforeAlt="Checkout page filled in, before 3-D Secure confirmation"
      after="/work/gearzn/decisions/17-order-confirmation--mobile-390.png"
      afterAlt="Order confirmation page after payment is confirmed"
    />
  ),
  attribution: <AttributionCrop />,
  "recorder-grid": <RecorderGrid screens={gearznWalkthroughGrid} />,
  "failure-trace": <FailureTrace />,
  "padding-model": <EmailPaddingVisual />,
  "theme-tokens": <EmailTokensVisual />,
  "cta-link": <EmailCtaLinkVisual />,
  "dark-cells": <EmailDarkCellsVisual />,
};
