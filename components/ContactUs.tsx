// components/Contact.tsx
import Button from "@/components/ui/Button";
import CopyPill from "@/components/ui/CopyPill";
import { FileDown } from "lucide-react";
import ContactForm from "@/components/ContactForm";
export default function Contact() {
    return (
        <section id="contact" className="pb-section">
            <div className="mx-auto w-full max-w-page px-margin">
                <div className="grid gap-10 lg:grid-cols-[1fr_28rem] lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-border lg:bg-surface">
                    {/* Left: invitation + direct contact */}
                    <div className="flex flex-col gap-8 lg:p-12">
                        <div className="flex flex-col gap-6">
                            <span className="text-label text-text-muted">Contact</span>
                            <h2 className="text-headline">Get in touch</h2>
                            <p className="text-body max-w-prose text-text-muted">
                                Open to full-time roles and contract work in HTML email, SFMC, HTML5 display and
                                front-end. Tell me what you&rsquo;re building and when you need it. I reply within one
                                business day.
                            </p>
                        </div>

                        <CopyPill label="Email" value="tbh@thomasbrandonhays.com" className="w-full sm:w-fit" />

                        <div className="flex flex-wrap gap-3">
                            <Button href="/resume.pdf" download variant="wire" icon={<FileDown size={14} />} iconPosition="start">
                                Download Resume
                            </Button>
                            <Button href="https://github.com/aliveinaustin" variant="wire">GitHub</Button>
                            <Button href="https://www.linkedin.com/in/aliveinaustin/" variant="wire">LinkedIn</Button>
                        </div>
                    </div>

                    {/* Right: form */}
                    <ContactForm />
                </div>
            </div>
        </section>
    );
}