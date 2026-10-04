import KpiReadout from "@/components/ui/KpiReadout";

type Kpi = {
  value: string;
  unit?: string;
  caption: string;
  trend?: "up" | "down";
};
type MetricClusterProps = {
  items: Kpi[];
  columns?: 2 | 3 | 4;
};

const columnMaps = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
} satisfies Record<2 | 3 | 4, string>;

export default function MetricCluster({ items, columns = 4 }: MetricClusterProps) {
  return (
    <div className={`grid gap-5 ${columnMaps[columns]}`}>
      {items.map((item) => (
        <KpiReadout key={item.caption} {...item} />
      ))}
    </div>
  );
}
