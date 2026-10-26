// components/ui/BackToTop.tsx
"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTop() {
    return (
        <button
            type="button"
            onClick={() => {
                window.scrollTo({ top: 0 });
                history.replaceState(null, "", window.location.pathname + window.location.search);
            }}
            className="inline-flex shrink-0 cursor-pointer items-baseline gap-2 rounded-sm text-label whitespace-nowrap text-ok hover:text-text-muted"
        >
            <ArrowUp size={12} aria-hidden="true" className="self-center" />
            Top
        </button>
    );
}