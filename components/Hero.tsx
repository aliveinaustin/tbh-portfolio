import Eyebrow from "@/components/ui/Eyebrow";
import DossierCard from "@/components/DossierCard";
import CategoryTag from "@/components/ui/CategoryTag";
import Button from "@/components/ui/Button";
import { FileDown } from 'lucide-react';
export default function Hero() {
    return (
        <section id="hero" className="pt-6 lg:pt-8 pb-section">
            <div className="mx-auto w-full max-w-page px-margin">
                <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:bg-surface lg:border lg:border-border lg:items-stretch">
                    <div className="flex min-w-0 flex-col gap-6 lg:p-12">
                        <div className="hidden lg:block">
                            <Eyebrow zone="Front-End & SFMC Production" caption="Austin // Remote" />
                        </div>
                        <p className="text-label text-text-muted lg:hidden">Austin // Remote</p>
                        <div className="flex flex-col gap-6 border-t border-border pt-8">
                            <h1 className="text-display -mt-2">I build the code that marketing campaigns actually run on.</h1>
                            <p className="text-body text-text-muted max-w-prose">Email that holds up in Outlook, banners that fit the file-size budget, and web front ends that load fast. HTML email, SFMC, HTML5 display, React, and WordPress, built over 11 years at an agency.</p>
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <Button href="#contact" icon="→">Initiate Project / Hire</Button>
                                <Button href="/resume.pdf" download icon={<FileDown size={14} />} iconPosition="start" variant="wire">Download Resume</Button>
                            </div>
                        </div>
                        <div className="border-t border-border pt-8">
                            <div className="flex flex-wrap gap-2">
                                <CategoryTag label="SFMC & Email" />
                                <CategoryTag label="HTML5 Display" />
                                <CategoryTag label="Front-End Web" />
                            </div>
                        </div>
                    </div>
                    <DossierCard />
                </div>
            </div>
        </section>
    )
}