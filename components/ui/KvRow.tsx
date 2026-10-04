
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
        <div className={`flex items-center gap-3 border-b py-2 ${s.rule}`}>
            <span className={`text-code ${s.label}`}>{label}:</span>
            <span aria-hidden="true" className={`h-px flex-1 border-b border-dotted ${s.leader}`} />
            <span className={`text-code ${emphasis ? "text-ok" : s.value}`}>{value}</span>
        </div>
    );
}
