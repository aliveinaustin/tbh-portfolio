// components/ui/TbhBadge.tsx
import { readFileSync } from "fs";
import { join } from "path";
import { cn } from "@/lib/cn";

type TbhBadgeProps = {
  className?: string;
  label?: "TBH" | "404";
};

// Read once at module load — this is static artwork, never changes at runtime.
const svgMarkup = readFileSync(join(process.cwd(), "public/brand/tbh-badge.svg"), "utf-8");

// "404" drawn in the monogram's own flat-vector outline style (rounded digit
// counters via Bezier curves, matching how "B"'s counters are drawn) — traced
// from brand source art at the monogram's exact position/scale, so it drops
// into the same slot "TBH" occupies.
const FOUR_OH_FOUR_PATH =
  "M347.908 717.198 L347.908 674.499 L436.402 567.945 L512.899 567.945 L512.899 669.984 L535.99 669.984 L535.99 717.198 L512.899 717.198 L512.899 748.545 L449.044 748.545 L449.044 717.198 Z M410.473 671.919 L449.044 671.919 L449.044 626.769 Z M625.645 750.48 C609.305 750.48 596.706 747.642 587.848 741.966 C578.99 736.29 574.561 724.852 574.561 707.652 L574.561 607.29 C574.561 590.606 579.205 579.555 588.493 574.137 C597.781 568.719 610.165 566.01 625.645 566.01 L698.014 566.01 C713.58 566.01 726.05 568.719 735.424 574.137 C744.798 579.555 749.485 590.606 749.485 607.29 L749.485 707.652 C749.485 724.938 745.013 736.398 736.069 742.031 C727.125 747.664 714.44 750.48 698.014 750.48 Z M639.448 694.494 L684.598 694.494 L684.598 694.494 L684.598 694.494 L684.598 621.996 L684.598 621.996 L684.598 621.996 L639.448 621.996 L639.448 621.996 L639.448 621.996 L639.448 694.494 L639.448 694.494 Z M781.09 717.198 L781.09 674.499 L869.584 567.945 L946.081 567.945 L946.081 669.984 L969.172 669.984 L969.172 717.198 L946.081 717.198 L946.081 748.545 L882.226 748.545 L882.226 717.198 Z M843.655 671.919 L882.226 671.919 L882.226 626.769 Z";

// None of the three pieces swapped/hidden below nest another <g> inside
// themselves, so each one's own content always ends at the next "</g>" (or
// "/>" for the horizon line) found after its start.
function replaceGroupInner(markup: string, id: string, inner: string): string {
  const openTag = `<g id="${id}">`;
  const start = markup.indexOf(openTag);
  const contentStart = start + openTag.length;
  const contentEnd = markup.indexOf("</g>", contentStart);
  return markup.slice(0, contentStart) + inner + markup.slice(contentEnd);
}

function removeGroup(markup: string, id: string): string {
  const openTag = `<g id="${id}">`;
  const start = markup.indexOf(openTag);
  const end = markup.indexOf("</g>", start) + "</g>".length;
  return markup.slice(0, start) + markup.slice(end);
}

function removeSelfClosing(markup: string, openTag: string): string {
  const start = markup.indexOf(openTag);
  const end = markup.indexOf("/>", start) + 2;
  return markup.slice(0, start) + markup.slice(end);
}

// Swaps the monogram for "404", and drops the "SYSTEMS / DEV" subtitle and
// the center horizon line — neither reads sensibly next to an error code.
function to404(markup: string): string {
  let result = replaceGroupInner(markup, "tbh-monogram", `<path d="${FOUR_OH_FOUR_PATH}" fill="#fc3d21"/>`);
  result = removeGroup(result, "center-subtitle");
  result = removeSelfClosing(result, '<line id="inner-horizon"');
  return result;
}

/**
 * The full circular TBH badge (monogram, attitude-indicator horizon, aperture
 * segments, service-label ring) — inlined server-side so its internal <g>/<path>
 * elements exist as real DOM nodes a client component can target with GSAP.
 */
export default function TbhBadge({ className, label = "TBH" }: TbhBadgeProps) {
  const markup = label === "404" ? to404(svgMarkup) : svgMarkup;
  return (
    <div
      className={cn("[&>svg]:h-full [&>svg]:w-full", className)}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
