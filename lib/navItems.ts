// lib/navItems.ts
export type NavItem = {
    label: string;
    href: `/#${string}`;
};

export const navItems = [
    { label: "Work", href: "/#work" },
    { label: "Skills", href: "/#skills" },
    { label: "About", href: "/#about" },
] satisfies NavItem[];