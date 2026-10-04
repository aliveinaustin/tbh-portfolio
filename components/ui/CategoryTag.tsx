type CategoryTagProps = {
  index: string;    // "01-DS"
  label: string;    // "SFMC & EMAIL"
};

export default function CategoryTag({ index, label }: CategoryTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-border bg-surface-high px-2 py-1 text-code leading-none">
      <span className="text-text-faint">
        <span aria-hidden="true">[ </span>
        {index}
        <span aria-hidden="true"> ]</span>
      </span>
      <span className="text-text-dim">{label}</span>
    </span>
  );
}