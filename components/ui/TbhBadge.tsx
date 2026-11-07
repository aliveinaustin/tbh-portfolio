// components/ui/TbhBadge.tsx
import { readFileSync } from "fs";
import { join } from "path";
import { cn } from "@/lib/cn";

type TbhBadgeProps = {
  className?: string;
};

// Read once at module load — this is static artwork, never changes at runtime.
const svgMarkup = readFileSync(join(process.cwd(), "public/brand/tbh-badge.svg"), "utf-8");

/**
 * The full circular TBH badge (monogram, attitude-indicator horizon, aperture
 * segments, service-label ring) — inlined server-side so its internal <g>/<path>
 * elements exist as real DOM nodes a client component can target with GSAP.
 */
export default function TbhBadge({ className }: TbhBadgeProps) {
  return (
    <div
      className={cn("[&>svg]:h-full [&>svg]:w-full", className)}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
