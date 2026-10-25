
type Surface = "dark" | "invert";
type KvRowProps = {
    label: string;
    value: string;
    emphasis?: boolean;
    surface?: Surface;
};

const surfaces = {
    dark: {
        rule: "border-border-dim",
        leader: "border-border-dim",
        label: "text-text-muted",
        value: "text-text",
    },
    invert: {
        rule: "border-transparent",
        leader: "border-text-invert-faint",
        label: "text-text-invert-muted",
        value: "text-text-invert",
    },
} satisfies Record<Surface, { rule: string; leader: string; label: string; value: string }>;

export default function KvRow({ label, value, emphasis, surface = "dark" }: KvRowProps) {
    const s = surfaces[surface];

    return (
        <div className={`flex flex-col gap-1 border-b py-2 sm:flex-row sm:items-center sm:gap-3 ${s.rule}`}>
            <span className={`text-code shrink-0 whitespace-nowrap ${s.label}`}>{label}:</span>
            <span aria-hidden="true" className={`hidden h-px flex-1 border-b border-dotted sm:block ${s.leader}`} />
            <span className={`text-code min-w-0 [overflow-wrap:anywhere] sm:text-right ${emphasis ? "text-ok" : s.value}`}>{value}</span>
        </div>
    );
}
