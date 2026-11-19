import { notFound } from "next/navigation";

// /lab is a working scratch page, not meant to ship. In production it's
// 404 unless ENABLE_LAB is explicitly set — gated here (not just in the
// page) so any future sub-route under /lab inherits the same block.
//
// Forced dynamic so the check runs fresh per request rather than being
// baked in once at build time — Next statically optimizes this route
// otherwise, and the toggle should take effect on a server restart, not
// require a rebuild.
export const dynamic = "force-dynamic";

export default function LabLayout({ children }: LayoutProps<"/lab">) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_LAB !== "true") {
    notFound();
  }

  return children;
}
