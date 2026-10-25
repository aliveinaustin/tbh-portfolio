type CategoryTagProps = {
  label: string;    // "SFMC & EMAIL"
};

export default function CategoryTag({ label }: CategoryTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-border bg-surface-high px-2 py-1 text-code leading-none">
      <span className="text-text-dim">{label}</span>
    </span>
  );
}