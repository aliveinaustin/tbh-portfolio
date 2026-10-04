
type Trend = "up" | "down";
type KpiReadoutProps = {
    value: string;
    unit?: string;
    caption: string;
    trend?: Trend;
};

export default function KpiReadout({ value, unit, caption, trend }: KpiReadoutProps) {
    return (
        <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
                <span className="text-metric">{value}</span>
                {unit && <span className="text-code text-text-muted">{unit}</span>}
                {trend && (
                    <span aria-hidden="true" className={`triangle-${trend} ${trend === "up" ? "text-ok" : "text-error"}`} />
                )}
            </div>
            <span className="text-code text-text-muted mt-1 uppercase">{caption}</span>
        </div>
    )
}
