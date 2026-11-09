// lib/case-visuals.ts
export type DeckScreen = { src: string; label: string; desktopSrc?: string };

export const gearznDeck: DeckScreen[] = [
  { src: "/work/gearzn/mbl/01-home.png", desktopSrc: "/work/gearzn/desktop/01-home.png", label: "Browse" },
  {
    src: "/work/gearzn/mbl/11-product-variant-selected.png",
    desktopSrc: "/work/gearzn/desktop/11-product-variant-selected.png",
    label: "Product",
  },
  {
    src: "/work/gearzn/mbl/14-cart-drawer-upsell-added.png",
    desktopSrc: "/work/gearzn/desktop/14-cart-drawer-upsell-added.png",
    label: "Cart",
  },
  {
    src: "/work/gearzn/mbl/16-checkout-filled.png",
    desktopSrc: "/work/gearzn/desktop/16-checkout-filled.png",
    label: "Checkout",
  },
  {
    src: "/work/gearzn/mbl/17-order-confirmation.png",
    desktopSrc: "/work/gearzn/desktop/17-order-confirmation.png",
    label: "Confirmed",
  },
];

// Recorder-grid thumbnails for the "Script the walkthrough" decision — the
// same page captured by the Playwright recorder at its four profile sizes.
export const gearznWalkthroughGrid = [
  { src: "/work/gearzn/decisions/02-shop--desktop-1920.png", label: "1920" },
  { src: "/work/gearzn/decisions/02-shop--desktop-1440.png", label: "1440" },
  { src: "/work/gearzn/decisions/02-shop--mobile-390.png", label: "390" },
  { src: "/work/gearzn/decisions/02-shop--mobile-se.png", label: "SE" },
];
