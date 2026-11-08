// components/HashFocusManager.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Covers the one case NavLink's own click handler can't: a hash link
 * clicked from a *different* page (e.g. "Work" in the header, clicked from
 * a case-study page). NavLink only intercepts same-page hash clicks —
 * cross-page ones fall through to Next's default <Link> navigation, which
 * scrolls to the target after landing but never focuses it. Header and
 * Footer live in the root layout, so they're the same DOM nodes across the
 * route change — focus simply stays on the link that was just activated,
 * and the next Tab continues from there (the next nav item) instead of
 * from the section the page just scrolled to.
 *
 * Keyed on pathname, not the hash: a same-page hash click (already handled
 * by NavLink) only changes the hash via history.replaceState, which doesn't
 * change pathname and doesn't fire this effect — so this never fights with
 * NavLink's own focus call.
 */
export default function HashFocusManager() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const target = document.getElementById(hash);
    if (!target) return;

    // Next's own navigation already did the scrolling; preventScroll avoids
    // a redundant/competing second scroll here.
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }
    target.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
