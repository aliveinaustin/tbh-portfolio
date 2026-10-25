import Link from "next/link";
import BackToTop from "@/components/ui/BackToTop";
import BarcodeStrip from "@/components/ui/BarcodeStrip";
import { navItems } from "@/lib/navItems";

const linkClasses =
    "whitespace-nowrap rounded-sm";

export default function Footer() {
    return (
        <footer className="mx-auto w-full max-w-page px-margin">
            <div className="flex flex-col gap-3 lg:gap-6 border-t border-border pt-6 pb-10 lg:flex-row lg:items-baseline lg:justify-between">
                <div className="order-last flex min-w-0 items-baseline gap-6 lg:order-0 lg:flex-1">

                    <BarcodeStrip className="hidden h-2.5 w-auto min-w-0 max-w-64 flex-1 text-accent-dim lg:block" />
                    <span className="text-label whitespace-nowrap text-text-muted">
                        Thomas B. Hays &copy; {new Date().getFullYear()}
                    </span>
                </div>

                <div className="flex items-baseline justify-between gap-8">
                    <nav aria-label="Footer navigation" className="min-w-0">
                        <ul className="flex flex-wrap gap-x-8 gap-y-4 text-label">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className={`${linkClasses} inline-flex shrink-0 items-center gap-2text-text hover:text-text-muted`}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <BackToTop />
                    {/* <Link href="#top" className={`${linkClasses} inline-flex shrink-0 items-baseline gap-2 text-label text-ok hover:text-text-muted`}>
                        <ArrowUp size={12} aria-hidden="true" className="self-center" />
                        Top
                    </Link> */}
                </div>
            </div>
        </footer >
    );
}