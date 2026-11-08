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
            const target = document.getElementById(hash);
            target?.scrollIntoView();
            // Native hash navigation both scrolls to the target *and* moves
            // focus there; preventDefault above replaces that with a custom
            // scroll but drops the focus half. Without this, keyboard focus
            // stays on the link itself — now scrolled off-screen — so the
            // next Tab continues from the link's actual DOM position (e.g.
            // back up into Work) instead of from the section the page just
            // scrolled to. tabindex="-1" makes an otherwise-unfocusable
            // section a valid *programmatic* focus target without adding it
            // to the normal Tab sequence, matching native behavior.
            if (target && !target.hasAttribute("tabindex")) {
                target.setAttribute("tabindex", "-1");
            }
            target?.focus({ preventScroll: true });
        } else {
            window.scrollTo({ top: 0 });
        }
        history.replaceState(null, "", hash ? `${pathname}#${hash}` : pathname);
    }

    return <Link href={href} onClick={handleClick} {...props} />;
}