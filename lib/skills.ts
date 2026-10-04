export type SkillGroup = {
  id: string;
  index: string;
  title: string;
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    id: "sfmc-email",
    index: "01-DS",
    title: "SFMC & Email",
    skills: [
      "Salesforce Marketing Cloud",
      "AMPscript",
      "SSJS",
      "Content Builder",
      "CloudPages",
      "Data Extensions",
      "Journey Builder",
      "Salesforce API / OAuth",
      "Double opt-in flows",
      "Preference centers",
      "Modular template systems",
      "MJML",
      "ZURB Foundation for Emails",
      "Mailchimp / Template Language",
      "Resend",
      "SMTP relay configuration",
      "Transactional email",
      "Litmus",
      "MSO conditionals",
      "Hybrid / fluid layouts",
      "Dark mode handling",
      "Cross-client QA",
      "UTM & alias tracking",
    ],
  },
  {
    id: "display",
    index: "02-DA",
    title: "HTML5 Animated Display",
    skills: [
      "GSAP / GreenSock",
      "HTML5 banner development",
      "Multi-size ad sets",
      "Polite load",
      "File-size budgets",
      "ClickTag implementation",
      "Canvas",
      "SVG",
      "CSS animation",
      "Creative asset conversion (Figma / XD / PSD)",
    ],
  },
  {
    id: "front-end",
    index: "03-FE",
    title: "Front-End Web",
    skills: [
      "TypeScript",
      "JavaScript",
      "HTML",
      "CSS",
      "React",
      "Next.js",
      "Vite",
      "Zustand",
      "Tailwind CSS",
      "jQuery",
      "Bootstrap",
      "SASS / LESS",
      "Node.js",
      "PHP",
      "WordPress",
      "WooCommerce / REST API",
      "Headless architecture",
      "Stripe / Express Checkout",
      "Checkout & order-flow engineering",
      "REST APIs",
      "JSON / XML",
      "SQL",
      "Responsive design",
      "WCAG / Section 508 accessibility",
      "Cross-browser compatibility",
      "Performance budgets & code splitting",
    ],
  },
  {
    id: "measurement",
    index: "04-MX",
    title: "Measurement & Privacy",
    skills: [
      "GA4",
      "Google Consent Mode v2",
      "Meta Pixel",
      "Server-side event deduplication",
      "First-party attribution (gclid capture)",
      "Google Merchant Center feeds",
      "CookieYes / US state privacy compliance",
      "Conversion attribution architecture",
      "Data-integrity & audit-trail design",
    ],
  },
  {
    id: "ai-tooling",
    index: "05-AI",
    title: "AI & LLM Tooling",
    skills: [
      "Claude API",
      "Claude Code",
      "MCP (Model Context Protocol) servers",
      "Prompt engineering for structured output",
      "LLM content pipelines",
      "Context management (CLAUDE.md)",
    ],
  },
  {
    id: "tooling",
    index: "06-OPS",
    title: "Tooling & Delivery",
    skills: [
      "Git / GitHub",
      "GitHub Actions CI/CD",
      "Staging & production pipelines",
      "Docker Compose",
      "DigitalOcean",
      "nginx",
      "Doppler (per-environment secrets)",
      "DNS & TLS management",
      "WP-CLI",
      "Shell / PowerShell scripting",
      "AWS S3",
      "BitBucket",
      "JIRA / ClickUp",
      "Figma",
      "Adobe Creative Suite",
      "Technical writing & process documentation",
    ],
  },
];

/*
NOTE — curation decisions.

OMITTED as off-positioning for a developer portfolio:
  - Business & finance operations: QuickBooks Online, MyWorks Sync, A2X,
    Mercury banking, unit economics, LLC operations, USPTO trademark
    clearance. All real, all describing a different job. Keep them for a
    freelance pitch where "runs his own books" is a selling point.
  - Google Ads campaign management (Search, Standard Shopping). Marketing
    ops, not development. GA4, Consent Mode, Pixel and attribution are
    kept — those are engineering.
  - Facebook / Instagram commerce, Aweber, social community management
    (from the resume). Same reason.
  - DataForSEO API, Google Sheets as a pipeline layer, DSers. Narrow
    integrations; they belong in the GearZN case study rather than as
    standing skills.

OMITTED as dated: SVN, Team Foundation Server, SourceTree, Sketch,
Adobe XD, Zeplin, Grunt / Gulp.

PER YOUR NOTE: Google Ads API (access rejected) and Cloudflare Tunnel
(discussed, not built) are excluded.

NEW GROUPS: "Measurement & Privacy" and "AI & LLM Tooling" are additions
to the three original disciplines. The AI group is the most current thing
on the list and the hardest for most candidates to claim honestly.
Measurement sits naturally beside the SFMC tracking work.

Six groups may be one or two too many — the comp has three columns.
Consider folding Measurement into SFMC & Email and AI into Tooling if the
grid gets crowded.

CERTIFICATIONS — no Salesforce certification yet. The comp's badge row
stays out of production until one is earned.

EXPERIENCE LENGTH — GSD&M is Aug 2015–present (11 years). Resumes still
say 8; update them and use the same number everywhere.
*/
