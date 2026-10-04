import type { ReactNode } from "react";
type KvListProps = {
    children: ReactNode;
}

export default function KvList({ children }: KvListProps) {

    return <div className="flex w-full flex-col">{children}</div>;
}
