import Link from "next/link";
import Button from "@/components/ui/Button"
import MobileNav from "@/components/MobileNav"
import { navItems } from "@/lib/navItems";
import WordMark from "@/components/WordMark";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 lg:py-3">
            <div className="mx-auto max-w-page lg:px-margin">
                <div className="flex h-16 lg:h-20 items-center justify-between gap-6 lg:rounded-2xl border-b lg:border border-border px-margin lg:px-6 bg-bg/80 backdrop-blur">
                    <WordMark className="flex-1" />
                    <div className="flex shrink-0 items-center gap-8">
                        <nav className="hidden lg:flex" aria-label="Primary navigation">
                            <ul className="flex flex-row text-label gap-8">
                                {navItems.map((item) => (
                                    <li key={item.href}>
                                        <Link href={item.href} className="whitespace-nowrap text-text hover:text-text-muted rounded-sm">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <Button href="#contact" icon="&rarr;" className="hidden md:inline-flex">Initiate Project</Button>
                        <MobileNav />
                    </div>
                </div>
            </div>
        </header>
    )
}