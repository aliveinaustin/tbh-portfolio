// components/visuals/PauseButton.tsx
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";

type PauseButtonProps = {
    paused: boolean;
    onClick: () => void;
    /** Used in the accessible label: "Pause {label}" / "Play {label}". */
    label: string;
    size?: "sm" | "md";
    className?: string;
};

const SIZE = {
    sm: { button: "size-7", icon: 12 },
    md: { button: "size-9", icon: 14 },
} as const;

/** The pause/play control every looping visual on the site needs (WCAG
 * 2.2.2) — same look and behavior everywhere; the caller positions it via
 * `className`. */
export default function PauseButton({ paused, onClick, label, size = "sm", className }: PauseButtonProps) {
    const { button, icon } = SIZE[size];
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={paused ? `Play ${label}` : `Pause ${label}`}
            className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-bg/80 text-text-muted hover:text-text",
                button,
                className
            )}
        >
            {paused ? <Play size={icon} aria-hidden="true" /> : <Pause size={icon} aria-hidden="true" />}
        </button>
    );
}
