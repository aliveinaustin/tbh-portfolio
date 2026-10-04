import StatusBeacon from "@/components/ui/StatusBeacon";
import KvList from "@/components/ui/KvList";
import KvRow from "@/components/ui/KvRow";
import Button from "@/components/ui/Button";

export default function DossierCard() {
    return (
        <aside className="surface-invert flex min-w-0 flex-col gap-6 rounded-2xl border border-border-invert bg-surface-invert p-6 text-text-invert lg:rounded-none lg:border-0 lg:border-l lg:p-12">            <div className="flex items-center justify-between gap-3 border-b border-border-invert pb-4">
            <span className="text-label text-text-invert-dim">Professional Dossier</span>
            <StatusBeacon label="Active" status="online" pulse surface="invert" />
        </div>
            <div className="flex flex-col gap-2 border-b border-border-invert pb-4">
                <span className="text-code text-text-invert-faint uppercase">Principal Specialization</span>
                <h2 className="text-xl font-mono font-extrabold tracking-tight ">Thomas B. Hays</h2>
                <p className="text-body-sm text-text-invert-muted">
                    Front-end developer bridging Salesforce Marketing Cloud and HTML email with
                    animated display and production web.
                </p>
            </div>
            <KvList>
                <KvRow label="Core Focus" value="SFMC, HTML Email, GSAP" surface="invert" />
                <KvRow label="Experience" value="11 Years Enterprise" surface="invert" />
                <KvRow label="Contact" value="tbh@thomasbrandonhays.com" surface="invert" />
            </KvList>
            <div className="mt-auto flex flex-col gap-3 border-t border-border-invert pt-6">
                <Button href="#contact" icon="→" variant="primaryInvert">Send Dispatch / Scope</Button>
                <p className="text-code text-text-invert-faint text-center">
                    Typical response: Within 1 business day
                </p>
            </div>
        </aside>
    );
}