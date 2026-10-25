"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X, FileDown } from "lucide-react";
import { navItems } from "@/lib/navItems";
import Button from "@/components/ui/Button";
import CopyPill from "@/components/ui/CopyPill";
import WordMark from "@/components/WordMark";
export default function MobileNav() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // keep in sync with Tailwind's lg breakpoint
        const mq = window.matchMedia("(min-width: 64rem)");
        const onChange = (e: MediaQueryListEvent) => {
            if (e.matches) dialogRef.current?.close();
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const open = () => {
        dialogRef.current?.showModal();
        setIsOpen(true);
    };
    const close = () => dialogRef.current?.close();
    return (
        <>
            <button
                type="button"
                onClick={open}
                aria-label="Open menu"
                aria-expanded={isOpen}
                aria-controls="mobile-nav"
                className="inline-flex size-11 items-center justify-center rounded-md text-text lg:hidden"
            >
                <Menu size={24} aria-hidden="true" />
            </button>
            <dialog
                ref={dialogRef}
                id="mobile-nav"
                onClose={() => setIsOpen(false)}
                className="m-0 h-dvh max-h-none w-full max-w-none flex-col border-0 bg-bg p-0 text-text open:flex"
            >
                {/* Header row */}
                <div className="flex h-16 items-center justify-between gap-4 border-b border-border px-margin">
                    <WordMark onClick={close} />
                    <form method="dialog">
                        <button className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-text text-label">
                            <X size={16} aria-hidden="true" />
                            <span className="max-[24rem]:sr-only">Close</span>
                        </button>
                    </form>
                </div>

                {/* Nav items */}
                <nav aria-label="Mobile navigation" className="px-margin pt-6">
                    <ul className="flex flex-col gap-3">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <a href={item.href} onClick={close} className="flex items-center justify-between gap-6 rounded-md border border-border px-4 py-4">
                                    <span className="flex items-baseline gap-4">
                                        <span className="text-label text-text">{item.label}</span>
                                    </span>
                                    <span aria-hidden="true">&rarr;</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Contact: reuse CopyPill */}
                <div className="px-margin pt-6"><CopyPill className="w-full" label="Email" value="tbh@thomasbrandonhays.com" /></div>

                {/* Bottom group, pushed down by mt-auto */}
                <div className="mt-auto flex flex-col gap-3 border-t border-border px-margin py-6">
                    <Button href="#contact" onClick={close} className="w-full" brackets icon="→">Initiate Project</Button>
                    <Button href="/resume.pdf" onClick={close} className="w-full" icon={<FileDown size={14} />} iconPosition="start" variant="wire" brackets>Download Resume</Button>
                </div>
            </dialog>
        </>
    )
}