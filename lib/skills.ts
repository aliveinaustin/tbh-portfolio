// lib/skills.ts
export type SkillGroup = {
  id: string;
  title: string;
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    id: "sfmc-email",
    title: "SFMC & Email",
    skills: [
      "Salesforce Marketing Cloud",
      "AMPscript",
      "SSJS",
      "CloudPages",
      "Journey Builder",
      "Data Extensions",
      "Salesforce API / OAuth",
      "MJML",
      "Outlook / MSO rendering",
      "Dark mode",
      "Litmus",
    ],
  },
  {
    id: "display",
    title: "HTML5 Display",
    skills: [
      "GSAP",
      "Multi-size ad sets",
      "Polite load & file-size budgets",
      "ClickTag",
      "Canvas",
      "SVG animation",
      "Figma / PSD to HTML5",
    ],
  },
  {
    id: "front-end",
    title: "Front-End",
    skills: [
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Vite",
      "Zustand",
      "Node.js",
      "WordPress / WooCommerce",
      "Stripe",
      "Accessibility (WCAG / 508)",
    ],
  },
  {
    id: "measurement",
    title: "Measurement & Privacy",
    skills: [
      "GA4",
      "Consent Mode v2",
      "Meta Pixel",
      "Server-side event deduplication",
      "First-party attribution",
      "Merchant Center feeds",
    ],
  },
  {
    id: "ai",
    title: "AI & LLM Tooling",
    skills: [
      "Claude API",
      "Claude Code",
      "MCP servers",
      "Structured-output prompting",
      "LLM content pipelines",
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    skills: [
      "GitHub Actions",
      "Docker Compose",
      "DigitalOcean",
      "nginx",
      "Doppler",
      "DNS & TLS",
      "Shell scripting",
      "AWS S3",
    ],
  },
];