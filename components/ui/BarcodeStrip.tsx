type Density = "default" | "tight";

type BarcodeStripProps = {
  density?: Density;
};

const densities = {
  default: 6,
  tight: 3,
} satisfies Record<Density, number>;

export default function BarcodeStrip({ density = "default" }: BarcodeStripProps) {
  const gap = densities[density];

  return (
    <div aria-hidden="true" className="h-3 w-full text-text-muted opacity-60" style={{
      backgroundImage: `repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px ${gap}px)`,
    }} />
  )
}
