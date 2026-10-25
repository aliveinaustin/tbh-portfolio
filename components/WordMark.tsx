// components/WordMark.tsx
import { cn } from "@/lib/cn";
import Link from "next/link";

type WordMarkProps = {
    onClick?: () => void;
    showTitle?: boolean;
    className?: string; // layout only (display, margin, alignment, width)
};

export default function WordMark({ onClick, showTitle = true, className }: WordMarkProps) {
    return (
        <Link
            href="/"
            onClick={onClick}
            className={cn(
                "flex min-w-0 items-center gap-6 rounded-md",
                className
            )}
        >
            <span aria-hidden="true" className="rounded-md border border-border p-2">
                TBH
            </span>

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
        </Link>
    );
}