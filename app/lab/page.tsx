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
import Hero from "@/components/Hero";
function Specimen({ name, children }: { name: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-3 border-t border-border-dim pt-4">
            <p className="text-code text-text-faint">{name}</p>
            <div className="flex flex-wrap items-center gap-3">{children}</div>
        </div>
    );
}
export default function LabPage() {

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
                        <CategoryTag index="01-DS" label="SFMC & EMAIL" />
                        <CategoryTag index="02-DA" label="HTML5 DISPLAY" />
                        <CategoryTag index="03-FE" label="FRONT-END WEB" />
                    </Specimen>

                    <Specimen name="Button">
                        <Button href="#" icon="&rarr;" brackets>Default</Button>
                        <Button variant="wire" icon="&darr;">Wire</Button>
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

                    <Specimen name="Hero">
                        <Hero />
                    </Specimen>
                </div>
            </Section >

        </>
    );
}