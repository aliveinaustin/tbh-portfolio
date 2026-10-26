// components/Skills.tsx
import Section from "@/components/ui/Section";
import { skillGroups } from "@/lib/skills";

export default function Skills() {
    return (
        <Section id="skills" title="Skills">
            <dl className="border-t border-border">
                {skillGroups.map((group) => (
                    <div
                        key={group.id}
                        className="grid gap-2 border-b border-border py-5 md:grid-cols-[16rem_1fr] md:gap-8"
                    >
                        <dt className="text-label text-text-muted">{group.title}</dt>
                        <dd className="text-body text-text">{group.skills.join(", ")}</dd>
                    </div>
                ))}
            </dl>
        </Section>
    );
}