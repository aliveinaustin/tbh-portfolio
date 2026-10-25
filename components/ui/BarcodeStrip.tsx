import { cn } from "@/lib/cn";

type Density = "default" | "tight";

type BarcodeStripProps = {
  density?: Density;
  className?: string
};

const densities = {
  default: 6,
  tight: 3,
} satisfies Record<Density, number>;

export default function BarcodeStrip({ density = "default", className }: BarcodeStripProps) {
  const gap = densities[density];

  return (
    <div aria-hidden="true" className={cn("h-3 w-full text-accent-dim opacity-60", className)} style={{
      backgroundImage: `repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px ${gap}px)`,
    }} />
  )
}
