// components/ui/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type NavLinkProps = ComponentProps<typeof Link> & { href: string };

export default function NavLink({ href, onClick, ...props }: NavLinkProps) {
    const pathname = usePathname();

    function handleClick(e: MouseEvent<HTMLAnchorElement>) {
        onClick?.(e); // e.g. closing the drawer, before we scroll

        // Leave Cmd/Ctrl/Shift/middle clicks alone (new tab, new window)
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

        const [path, hash] = href.split("#");
        if ((path || "/") !== pathname) return; // different page: let Link navigate

        e.preventDefault();
        if (hash) {
            document.getElementById(hash)?.scrollIntoView();
        } else {
            window.scrollTo({ top: 0 });
        }
        history.replaceState(null, "", hash ? `${pathname}#${hash}` : pathname);
    }

    return <Link href={href} onClick={handleClick} {...props} />;
}