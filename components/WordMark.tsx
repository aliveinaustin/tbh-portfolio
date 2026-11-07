// components/WordMark.tsx
import { cn } from "@/lib/cn";
import NavLink from "@/components/ui/NavLink";
import TbhMark from "@/components/ui/TbhMark";

type WordMarkProps = {
    onClick?: () => void;
    showTitle?: boolean;
    className?: string; // layout only (display, margin, alignment, width)
};

export default function WordMark({ onClick, showTitle = true, className }: WordMarkProps) {
    return (
        <NavLink
            href="/"
            onClick={onClick}
            className={cn(
                "flex min-w-0 items-center gap-6 rounded-md",
                className
            )}
        >

            <TbhMark className="h-4 w-auto shrink-0 text-brand sm:h-5" />

            <span className="flex flex-col gap-2">
                {/* text-lg: deliberate editorial exception, same as the DossierCard name */}
                <span className="font-mono text-lg whitespace-nowrap text-text [text-box:trim-both_cap_alphabetic]">
                    Thomas B. Hays
                </span>

                {showTitle && (
                    <>
                        <span className="text-label whitespace-nowrap text-accent-dim sm:hidden">
                            Email & Web Dev
                        </span>
                        <span className="hidden text-label whitespace-nowrap text-accent-dim sm:inline">
                            Email & Front-End Developer
                        </span>
                    </>
                )}
            </span>
        </NavLink>
    );
}