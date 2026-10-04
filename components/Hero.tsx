import Eyebrow from "@/components/ui/Eyebrow";
import DossierCard from "@/components/DossierCard";
import CategoryTag from "@/components/ui/CategoryTag";
import Button from "@/components/ui/Button";
import { FileDown } from 'lucide-react';
export default function Hero() {
    return (
        // Hero grid — frame only from lg up
        <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-border lg:items-stretch">
            <div className="flex min-w-0 flex-col gap-6 lg:p-12">
                <Eyebrow zone="Front-End & SFMC Production" caption="Austin // Remote" />
                <div className="flex flex-col gap-6 border-t border-border pt-8">
                    <h1 className="text-display -mt-2">I build the code that marketing campaigns actually run on.</h1>
                    <p className="text-body text-text-muted max-w-prose">High-volume, cross-client HTML email & Salesforce Marketing Cloud architectures, animated HTML5 display suites, and performant Jamstack front-end web apps built for enterprise scale.   </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Button href="#contact" icon="→" brackets>Initiate Project / Hire</Button>
                        <Button href="/resume.pdf" icon={<FileDown size={14} />} iconPosition="start" variant="wire" brackets>Download Resume</Button>
                    </div>
                </div>
                <div className="border-t border-border pt-8">
                    <div className="flex flex-wrap gap-2">
                        <CategoryTag index="01-DS" label="SFMC & Email" />
                        <CategoryTag index="02-DA" label="HTML5 Display" />
                        <CategoryTag index="03-FE" label="Front-End Web" />
                    </div>
                </div>
            </div>
            <DossierCard />
        </div>
    )
}