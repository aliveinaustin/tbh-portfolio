type Status = "online" | "standby" | 'alert';
type StatusDotProps = {
  status?: Status;
  pulse?: boolean;
};

const statuses = {
  online: 'text-ok',
  standby: 'text-text-muted',
  alert: 'text-error'
} satisfies Record<Status, string>;

export default function StatusDot({ status = "online", pulse = false }: StatusDotProps) {
  const color = statuses[status];

  return (
    // Pulse = live/active. Use on `online` only; standby and alert stay static.
    <span aria-hidden="true" className={`relative inline-flex size-1 ${color}`}>
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-current opacity-60 animate-status-pulse" />
      )}
      <span className="relative inline-flex size-full rounded-full bg-current" />
    </span>
  )
}
