import StatusDot from "@/components/ui/StatusDot";
type Status = "online" | "standby" | "alert";

type Variant = "standard" | "compact";
type EyebrowProps = {
  zone: string;
  caption?: string;
  status?: Status;
  pulse?: boolean;
  variant?: Variant;
};

export default function Eyebrow({ zone, caption, status = "online", pulse = false, variant = "standard", }: EyebrowProps) {
  if (variant === "compact") {
    return (
      <p className="text-label text-text-muted">
        <span aria-hidden="true">[ </span>
        {zone}
        <span aria-hidden="true"> ]</span>
      </p>
    );
  }
  return (
    <p className="flex flex-wrap items-center gap-2.5 text-label">
      <span className="inline-flex items-center gap-2.5">
        <StatusDot status={status} pulse={pulse} />
        <span className="text-text lg:whitespace-nowrap">{zone}</span>
      </span>
      {caption && (
        <>
          <span aria-hidden="true" className="hidden select-none text-text-faint sm:inline">
            {"\u00B7".repeat(6)}
          </span>
          <span className="text-text-muted lg:whitespace-nowrap">{caption}</span>
        </>
      )}
    </p>
  );
}