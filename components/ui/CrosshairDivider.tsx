type Density = "default" | "tight";

type CrosshairDividerProps = {
  density?: Density;
};

const densities = {
  default: 48,
  tight: 24,
} satisfies Record<Density, number>;

export default function CrosshairDivider({ density = "default" }: CrosshairDividerProps) {
  const tile = densities[density];

  return (
    <div aria-hidden="true" className="h-2.5 w-full text-text-faint" style={{
      backgroundImage: [
        "linear-gradient(to right, transparent calc(50% - 5px), currentColor 0 calc(50% + 5px), transparent 0)",
        "linear-gradient(to right, transparent calc(50% - 0.5px), currentColor 0 calc(50% + 0.5px), transparent 0)",
      ].join(", "),
      backgroundSize: `${tile}px 1px, ${tile}px 10px`,
      backgroundPosition: "center",
      backgroundRepeat: "space no-repeat",
    }} />
  )
}

// {Array.from({ length: count }, (_, i) => (
//   <svg key={i} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
//     <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1" />
//   </svg>
// ))}