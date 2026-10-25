import KvList from "@/components/ui/KvList";
import KvRow from "@/components/ui/KvRow";
import Button from "@/components/ui/Button";
import StatusDot from "@/components/ui/StatusDot";

export default function DossierCard() {
    return (
        <aside className="surface-invert flex min-w-0 flex-col gap-6 rounded-2xl border border-border-invert bg-surface-invert p-6 text-text-invert lg:rounded-none lg:border-0 lg:border-l lg:p-12">
            {/* <div className="flex items-center justify-between gap-3 border-b border-border-invert pb-4">
                <span className="text-label text-text-invert-dim">Profile</span>
            </div> */}
            <div className="flex items-center gap-2 lg:hidden">
                <StatusDot status="online" pulse />
                <span className="text-label text-text-invert-dim">
                    Open to full-time & contract</span>
            </div>
            <div className="flex flex-col gap-2 border-b border-border-invert pb-4">
                <h2 className="text-xl font-mono font-extrabold tracking-tight ">Thomas B. Hays</h2>
                <p className="text-body-sm text-text-invert-muted">
                    Front-end developer bridging Salesforce Marketing Cloud and HTML email with
                    animated display and production web.
                </p>
            </div>
            <KvList>
                <KvRow label="Focus" value="Email, SFMC, Display, Web" surface="invert" />
                <KvRow label="Experience" value="11 years, agency side" surface="invert" />
                <KvRow label="Contact" value="tbh@thomasbrandonhays.com" surface="invert" />
            </KvList>
            <div className="mt-auto flex flex-col gap-3 border-t border-border-invert pt-6">
                <Button href="#contact" icon="→" variant="primaryInvert">Get in touch</Button>
                <p className="text-code text-text-invert-faint text-center">
                    Typical response: &lt;1 business day
                </p>
            </div>
        </aside>
    );
}