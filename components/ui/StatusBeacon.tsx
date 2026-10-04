import StatusDot from "@/components/ui/StatusDot";
type Status = "online" | "standby" | "alert";
type Surface = "dark" | "invert";
// StatusBeacon
const surfaces = {
  dark: { pill: "border-border bg-surface", label: "text-text-muted", value: "text-text" },
  invert: { pill: "border-ok/50 bg-ok/20", label: "text-ok-invert", value: "text-ok-invert" },
} satisfies Record<Surface, { pill: string; label: string; value: string }>;
type StatusBeaconProps = {
  label: string;
  value?: string;
  status?: Status;
  pulse?: boolean;
  surface?: Surface;
};

export default function StatusBeacon({ label, value, status = "online", pulse = false, surface = "dark" }: StatusBeaconProps) {
  const s = surfaces[surface];
  return (
    <p className={`inline-flex w-fit flex-wrap items-center gap-2 rounded-2xl border px-3 py-1 text-label leading-none ${s.pill}`}>
      <span className="inline-flex items-center gap-2">
        <StatusDot status={status} pulse={pulse} />
        <span className={s.label}>{label}{value && ":"}</span>
      </span>
      {value && <span className={`whitespace-nowrap ${s.value}`}>{value}</span>}
    </p>
  );
}