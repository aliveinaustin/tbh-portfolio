import BarcodeStrip from "@/components/ui/BarcodeStrip";
import StatusDot from "@/components/ui/StatusDot";

export default function UtilityBar() {
    return (
        <div className="mx-auto hidden w-full max-w-page px-margin pt-8 pb-4 lg:block">
            <div className="flex justify-between items-baseline gap-6 border-b border-border pb-2">
                <div className="flex min-w-0 flex-1 items-baseline gap-6">
                    <BarcodeStrip className="w-auto max-w-64 min-w-0 flex-1 text-accent-dim h-2.5" />
                    <span className="text-label whitespace-nowrap text-text-muted">Austin, TX &bull; Remote worldwide</span>
                </div>
                <div className="flex shrink-0 items-baseline gap-2">
                    <div className="flex self-center">
                        <StatusDot status="online" pulse />
                    </div>
                    <span className="text-label text-text whitespace-nowrap">Open to full-time & contract</span></div>
            </div>
        </div>
    )
}