import { ReactNode } from "react";

import BarcodeStrip from "@/components/ui/BarcodeStrip";
import StatusDot from "@/components/ui/StatusDot";
import StatusBeacon from "@/components/ui/StatusBeacon";
import CrosshairDivider from "@/components/ui/CrosshairDivider";
import Section from "@/components/ui/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import SpecChip from "@/components/ui/SpecChip";
import CategoryTag from "@/components/ui/CategoryTag";
import Button from "@/components/ui/Button";
import CopyPill from "@/components/ui/CopyPill";
import KpiReadout from "@/components/ui/KpiReadout";
import KvList from "@/components/ui/KvList";
import KvRow from "@/components/ui/KvRow";
import CoordinateStamp from "@/components/ui/CoordinateStamp";
import ConsolePanel from "@/components/ui/ConsolePanel";
import EditorialCard from "@/components/ui/EditorialCard";
import MetricCluster from "@/components/ui/MetricCluster";
import FormField from "@/components/ui/FormField";
import MorphComparison from "@/components/visuals/email/MorphComparison";
import EmailAssemblyCard from "@/components/visuals/email/EmailAssemblyCard";
import FocusedWrapper from "@/components/visuals/email/FocusedWrapper";
import Work from "@/components/Work";
import BadgeRotationTest from "@/components/ui/BadgeRotationTest";
import TbhBadge from "@/components/ui/TbhBadge";
import { notFound } from "next/navigation";


function Specimen({ name, children }: { name: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-3 border-t border-border-dim pt-4">
            <p className="text-code text-text-faint">{name}</p>
            <div className="flex flex-wrap items-center gap-3">{children}</div>
        </div>
    );
}
export default function LabPage() {
    if (process.env.NODE_ENV === "production") notFound();
    return (
        <>

            <Section id="atoms" eyebrow="01 // ATOMS" title="Tier 1">
                <div className="flex flex-col gap-8">
                    <Specimen name="BarcodeStrip">
                        <BarcodeStrip density="default"></BarcodeStrip>
                    </Specimen>

                    <Specimen name="StatusDot">
                        <StatusDot status="online" pulse={true}></StatusDot>
                    </Specimen>

                    <Specimen name="Eyebrow">
                        <Eyebrow zone="01-DA" variant="compact"></Eyebrow>
                        <Eyebrow zone="ZONE // 02-DA_HANGAR" caption="GSAP SUITE"></Eyebrow>
                        <Eyebrow zone="ZONE // 03-LIVE" caption="ACTIVE TRANSMISSION" pulse />
                    </Specimen>

                    <Specimen name="SpecChip">
                        <SpecChip>&lt; 150 KB Polite</SpecChip>
                        <SpecChip variant="verified">Litmus 52/52 Pass</SpecChip>
                    </Specimen>

                    <Specimen name="StatusBeacon">
                        <StatusBeacon label="STATUS" value="ONLINE (100% SLA)" pulse />
                        <StatusBeacon label="IDLE" status="standby" />
                    </Specimen>

                    <Specimen name="CrosshairDivider">
                        <CrosshairDivider density="default"></CrosshairDivider>
                    </Specimen>

                    <Specimen name="CategoryTag">
                        <CategoryTag label="SFMC & EMAIL" />
                        <CategoryTag label="HTML5 DISPLAY" />
                        <CategoryTag label="FRONT-END WEB" />
                    </Specimen>

                    <Specimen name="Button">
                        <Button href="#" icon="&rarr;" brackets>Default Primary</Button>
                        <Button variant="wire" icon="&darr;">Wire</Button>
                        <Button variant="primaryInvert" icon="&darr;">primaryInvert</Button>
                    </Specimen>

                    <Specimen name="CopyPill">
                        <CopyPill label="Direct email Channel" value="tbh@thomasbrandonhays.com" />
                    </Specimen>

                    <Specimen name="KpiReadout">
                        <KpiReadout value="99.9%" caption="SLA UPTIME" trend="up" />
                        <KpiReadout value="85%" caption="VERIFICATION" trend="down" />
                        <KpiReadout value="60" unit="FPS" caption="TIMELINE MAX" />
                        <KpiReadout value="<142K" caption="Polite Load" />
                    </Specimen>

                    <Specimen name="KvList">
                        <div className="flex flex-col gap-3 border-t border-border-dim pt-4">
                            <p className="text-code text-text-faint">KvRow</p>
                            <KvList>
                                <KvRow label="RESPONSE SLA" value="< 4 BUSINESS HOURS" />
                                <KvRow label="DISPATCH DISCIPLINE" value="ENTERPRISE SFMC / GSAP" emphasis />
                            </KvList>
                        </div>
                    </Specimen>

                    <Specimen name="CoordinateStamp">
                        <CoordinateStamp />
                    </Specimen>

                    <Specimen name="ConsolePanel">
                        <ConsolePanel as="div" modId="TH-02" title="00-showcase_index" meta={<StatusBeacon label="STATUS" value="ONLINE" pulse />}>
                            <KvList>
                                <KvRow label="RESPONSE SLA" value="< 4 BUSINESS HOURS" />
                                <KvRow label="DISPATCH DISCIPLINE" value="ENTERPRISE SFMC / GSAP" emphasis />
                            </KvList>
                        </ConsolePanel>
                    </Specimen>

                    <Specimen name="EditorialCard">
                        <EditorialCard
                            eyebrow="CASE STUDY // PRODUCTION AUDIT"
                            meta="[ STARK WHITE CONTRAST ]"
                            title="Automotive Dynamic Multi-Tier Creative Suite"
                            tag="[ 18 PRODUCTION ASSETS ]"
                            cta={{ label: "READ FULL CASE STUDY", href: "#" }}
                        >
                            High-density responsive creative deployment built across 18 simultaneous ad units.
                            High-density responsive creative deployment built across 18 simultaneous ad units.
                            High-density responsive creative deployment built across 18 simultaneous ad units.
                            High-density responsive creative deployment built across 18 simultaneous ad units.
                            High-density responsive creative deployment built across 18 simultaneous ad units.
                            High-density responsive creative deployment built across 18 simultaneous ad units.
                            High-density responsive creative deployment built across 18 simultaneous ad units.
                            High-density responsive creative deployment built across 18 simultaneous ad units.
                        </EditorialCard>
                    </Specimen>

                    <Specimen name="MetricCluster">
                        <MetricCluster items={[{ value: "99.6%", caption: "SLA UPTIME", trend: "up" }, { value: "85%", caption: "VERIFICATION", trend: "down" }, { value: "60", unit: "FPS", caption: "TIMELINE MAX" }, { value: "<142K", caption: "Polite Load" }]} />
                    </Specimen>

                    <Specimen name="FormField">
                        <form className="flex flex-col gap-4">
                            <FormField id="fname" label="Name / Organization" required placeholder="e.g. Troy Barnes / Greendale Community College" />
                            <FormField id="email" label="Email" type="email" required placeholder="you@company.com" />
                            <FormField id="target" label="Dispatch Target" type="select" options={[
                                { value: "sfmc", label: "Salesforce Marketing Cloud" },
                                { value: "display", label: "HTML5 Display" },
                                { value: "web", label: "Front-End Web" },
                            ]} />
                            <FormField id="msg" label="Message" type="textarea" placeholder="Project scope, timeline, budget range" />
                            <FormField id="broken" label="Errored Field" error="This field is required" />
                        </form>
                    </Specimen>
                </div>
            </Section >

            <Section id="morph-comparison" eyebrow="02 // PERF" title="Envelope Morph Comparison">
                <div className="flex flex-col gap-8">
                    <Specimen name="MorphComparison">
                        <MorphComparison />
                    </Specimen>
                </div>
            </Section>

            {/* Isolates whether EmailAssemblyCard's own timeline complexity is
                the Firefox perf cause, independent of the carousel/page it
                normally sits inside — same component, no carousel chrome. */}
            <Section id="email-card-standalone" eyebrow="02 // PERF" title="EmailAssemblyCard (standalone)">
                <div className="flex flex-col gap-8">
                    <Specimen name="EmailAssemblyCard">
                        <div className="aspect-video w-full max-w-xl bg-surface">
                            <EmailAssemblyCard />
                        </div>
                    </Specimen>
                </div>
            </Section>

            {/* Same card, but routed through CarouselFocusContext (value
                true — same effective value as the default, just actually
                going through React context/useContext instead of relying
                on createContext's bare default) — isolates whether MY
                focus-gating code itself (added this session) is the cause,
                independent of Embla or any carousel chrome. */}
            <Section id="email-card-context" eyebrow="02 // PERF" title="EmailAssemblyCard (via CarouselFocusContext)">
                <div className="flex flex-col gap-8">
                    <Specimen name="EmailAssemblyCard">
                        <FocusedWrapper>
                            <div className="aspect-video w-full max-w-xl bg-surface">
                                <EmailAssemblyCard />
                            </div>
                        </FocusedWrapper>
                    </Specimen>
                </div>
            </Section>

            {/* Isolates JUST the badge's rotation mechanism (real SVG, the
                CSS ambient spin + GSAP scroll-linked rotation from the
                HeroIntro fix), decoupled from the rest of HeroIntro's
                machinery (sessionStorage, the intro timeline, the
                clip-path scroll listener) — next to the real production
                carousel, since the slowdown only ever showed up with both
                present together. */}
            <Section id="badge-rotation-work" eyebrow="02 // PERF" title="Badge Rotation + Work">
                <div className="flex flex-col gap-8">
                    <Specimen name="BadgeRotationTest">
                        <BadgeRotationTest badge={<TbhBadge className="h-full w-full" />} />
                    </Specimen>
                </div>
            </Section>

            {/* The exact production carousel assembly (real Embla, all 3
                real cards) in isolation — every narrower test above came
                back clean, so this checks whether Embla itself or having
                all three visuals mounted together is what reproduces it. */}
            <Work />

        </>
    );
}