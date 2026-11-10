// components/visuals/Zoomable.tsx
"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

type ZoomableProps = {
    src: string;
    alt: string;
    width: number;
    height: number;
    children: ReactNode;
};

/** Wraps an existing thumbnail (its own sizing, border and Image already
 * set up by the caller) in a button that opens a <dialog> with a larger,
 * uncropped version — several screenshots on this page are too small to
 * read at thumbnail size. Escape-to-close, focus return and the scroll
 * lock are already handled: native <dialog> behavior plus the global
 * html:has(dialog[open]:modal) rule in globals.css (see MobileNav for the
 * same pattern). */
export default function Zoomable({ src, alt, width, height, children }: ZoomableProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    return (
        <>
            <button type="button" onClick={() => dialogRef.current?.showModal()} className="group relative block w-full text-left">
                {children}
                <span
                    aria-hidden="true"
                    className="absolute right-1.5 bottom-1.5 inline-flex size-6 items-center justify-center rounded-full border border-border bg-bg/80 text-text-muted transition-colors group-hover:text-text"
                >
                    <ZoomIn size={12} />
                </span>
                <span className="sr-only">Enlarge screenshot: {alt}</span>
            </button>

            <dialog
                ref={dialogRef}
                aria-label={alt}
                onClick={(e) => {
                    if (e.target === e.currentTarget) dialogRef.current?.close();
                }}
                className="m-auto max-w-none rounded-2xl border-0 bg-transparent p-0 [&::backdrop]:bg-bg/80"
            >
                <div className="relative">
                    <Image
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        sizes="90vw"
                        className="h-auto max-h-[85vh] w-auto max-w-[85vw] rounded-2xl border border-border object-contain"
                    />
                    <form method="dialog">
                        <button
                            type="submit"
                            aria-label="Close"
                            className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full border border-border bg-bg/80 text-text-muted hover:text-text"
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                    </form>
                </div>
            </dialog>
        </>
    );
}
