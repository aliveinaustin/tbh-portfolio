import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Skills from "@/components/Skills";
import About from "@/components/About";
import ContactUs from "@/components/ContactUs";
import SectionBreak from "@/components/ui/SectionBreak";


export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <SectionBreak variant="muted" />
      <Skills />
      <SectionBreak />
      <About />
      <SectionBreak variant="muted" />
      <ContactUs />
    </>
  );
}