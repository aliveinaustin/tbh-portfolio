import type { ReactNode } from "react";

type ConsolePanelProps = {
    as?: "article" | "div";
    modId?: string;
    title: string;
    meta?: ReactNode
    children: ReactNode;
};

export default function ConsolePanel({ as: TagType = "article", modId, title, meta, children }: ConsolePanelProps) {
    return (
        <TagType className="rounded-2xl border border-border bg-surface p-6 lg:p-8">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border-dim pb-4">
                <div className="flex items-center gap-3">
                    {modId && <span className="text-code text-text-faint whitespace-nowrap">[ {modId} ]</span>}
                    <h3 className="uppercase text-label">{title}</h3>
                </div>
                {meta}
            </header>
            {children}
        </TagType>
    )
}