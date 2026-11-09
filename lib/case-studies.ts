export type CaseStudy = {
  slug: string;
  discipline: string;
  title: string;
  /** Card-level blurb. One or two sentences. */
  summary: string;
  /**
   * Generic client descriptor only. Named clients require written clearance.
   * Two agency clients are fully restricted and appear nowhere in this file.
   */
  client?: string;
  role: string;
  platform: string;
  stack: string[];
  /** Short neutral line when there is no live link. */
  status?: string;
  /** True when the artifacts (not the write-up) live behind the gated route. */
  gatedArtifacts?: boolean;
  problem: string;
  approach: string;
  result: string;
  /** Same copy as `result`, pre-split into paragraphs — only GearZN's detail
   * page renders these (its Result panel has room for them); `result`
   * itself stays the single string other studies and metadata use. */
  resultParagraphs?: string[];
  constraints: string[];
  decisions: { decision: string; reason: string; visual?: string }[];
  learned: string[];
  metrics?: { value: string; unit?: string; caption: string }[];
};

// Written once, used two ways: GearZN's own `result` below is
// `gearznResultParagraphs.join(" ")`, not a separate copy — a hand-kept
// duplicate is exactly the kind of thing that silently drifts when one
// copy gets edited and the other doesn't.
const gearznResultParagraphs = [
  "The store ran in production with continuous deployment, per-environment secrets, consent-compliant analytics, first-party attribution and a hardened checkout.",
  "The most important findings were bugs that gave no sign they existed. A checkout endpoint was deleting its own orders on six different failure paths. Returning customers were told their cart was empty. A pixel counted every purchase three times. Visitors who typed the address without “www” never saw the Apple Pay button, while every other wallet kept working, so it looked like an Apple Pay problem rather than a domain one. None of them produced an error, a log line or anything a customer would notice.",
  "Performance work paid off too: the icon font went from 3.87 MB to 447 KB, hero images from 1.87 MB to 110 KB, and Lighthouse desktop performance from 73 into the nineties.",
  "In the end, the numbers said to stop. With a fixed cost per click, a $13 product cost as much to sell as a $50 one, and the demand data made that clear before it became a sunk-cost argument.",
  "Before shutting it down, I wrote a recorder instead of capturing it by hand: a Playwright script that logs into staging, walks the full purchase path at four screen sizes, places test orders through Stripe's test mode, and saves every page and every interactive state. It also records loop-ready demo videos, with a scripted cursor that finishes on the exact pixel it started from. Every screen and clip on this page came from it. The store is retired. The engineering record, and this footage, is what remains.",
];

export const caseStudies: CaseStudy[] = [
  {
    slug: "modular-email-component-system",
    discipline: "SFMC & EMAIL",
    title: "Modular Email Component System",
    summary:
      "A reusable Salesforce Marketing Cloud architecture that lets campaigns across multiple sub-brands be assembled from tested components instead of built as one-off HTML emails.",
    client: "Enterprise client, multi-sub-brand program",
    role: "Front-End / Email Developer",
    platform: "Salesforce Marketing Cloud",
    status: "Client work — rendered artifacts available on request.",
    gatedArtifacts: true,
    stack: [
      "AMPscript",
      "Content Builder",
      "Data Extensions",
      "Litmus",
      "Responsive email",
      "Dark mode",
      "WCAG",
    ],
    problem:
      "Email campaigns across several sub-brands shared the same structural and technical requirements but were built individually. Heroes, body content, CTA groups, banners, footers, responsive spacing and dark-mode handling had to be recreated and retested every campaign. The system needed to support multiple distinct visual identities, stay usable by non-developer SFMC users, and preserve campaign-specific URLs, UTMs and tracking aliases.",
    approach:
      "I audited existing builds to find where layout structure, campaign copy, brand styling, URLs and client-specific fixes had become entangled in the same markup. That produced a layered Template → Row Pattern → Module → Configuration architecture, where each layer owns one responsibility. AMPscript theme tokens supply sub-brand colors and assets; a Data Extension-backed CTA library resolves image-button artwork by sub-brand and human-readable CTA key. Responsive behavior, Outlook compatibility and dark-mode handling were developed and tested at the component level so fixes are inherited rather than rediscovered.",
    result:
      "A modular production system that separates structure, presentation, reusable content and campaign configuration. Campaigns are assembled from standardized templates and tested modules while retaining per-brand presentation and unique tracking. QA moved upstream: responsive behavior, Outlook compatibility, dark mode, image sizing and accessibility are solved when components are built, not when campaigns ship.",
    constraints: [
      "Content Builder had to stay practical for users not maintaining the underlying HTML",
      "AMPscript variables share scope across a render, requiring deliberate naming and ownership",
      "Outlook's Word renderer required table layouts, explicit dimensions and scoped line-height",
      "Dark mode behaves differently across Outlook, Apple/native and other clients",
      "Image-based CTAs had to stay editable without making every campaign an asset-management exercise",
      "Reused CTA artwork still needed unique per-campaign UTMs",
      "tel: and mailto: links required different handling from trackable HTTP destinations",
    ],
    decisions: [
      {
        decision: "Template → Row Pattern → Module → Configuration",
        reason: "Separates structural, reusable and campaign-specific concerns.",
      },
      {
        decision: "40px desktop / 20px mobile spacing model",
        reason: "Predictable responsive behavior; modules stop inventing page-level spacing.",
      },
      {
        decision: "Theme tokens driven by sub-brand",
        reason: "One set of modules supports several visual systems instead of one implementation each.",
      },
      {
        decision: "Developer-governed modules with CFG snippets",
        reason: "Protects tested rendering behavior while exposing the values producers actually change.",
      },
      {
        decision: "CTA Image Library Data Extension, keyed by brand + CTA key",
        reason: "Centralizes reusable artwork; equivalent actions resolve to the right brand asset.",
      },
      {
        decision: "Separate CTA asset selection from destination URL and tracking",
        reason: "Artwork is reused while every campaign keeps unique URLs and UTMs.",
      },
      {
        decision: "Component-level Litmus QA",
        reason: "Moves recurring client fixes upstream so campaigns inherit tested behavior.",
      },
      {
        decision: "Explicit table geometry and cell backgrounds",
        reason: "Outlook for Windows Dark transforms neighboring cells differently without them.",
      },
    ],
    learned: [
      "Reusable email architecture works when ownership boundaries are explicit — containers own layout context, modules own rendering, configuration owns campaign values.",
      "Design-system thinking applies to email, but browser-oriented abstractions matter less than predictable table structures and components validated against real client behavior.",
      "Asset reuse and URL reuse are different problems and are easier to manage separately.",
      "Solving an Outlook issue once is useful; changing the component so future campaigns inherit the fix is the system-level improvement.",
    ],
  },
  {
    slug: "lifecycle-personalization-system",
    discipline: "SFMC & CLOUDPAGES",
    title: "Lifecycle & Personalization System",
    summary:
      "Modernized an SFMC lifecycle system spanning three subscriber pathways — preserving Salesforce identity, adding authenticated API sync, and driving personalized email from normalized preference data.",
    client: "Enterprise client, multi-pathway subscriber program",
    role: "Front-End / Email Developer",
    platform: "Salesforce Marketing Cloud",
    status: "Client work — rendered artifacts available on request.",
    gatedArtifacts: true,
    stack: [
      "AMPscript",
      "SSJS",
      "CloudPages",
      "Data Extensions",
      "Salesforce API",
      "OAuth",
      "Journey Builder",
      "Litmus",
    ],
    problem:
      "What began as a set of email and CloudPage needs had grown into a lifecycle system spanning website acquisition, application audiences, legacy subscribers, double opt-in, preference collection, Salesforce synchronization and personalized follow-up. Subscribers arrived with different identity types — some with Salesforce IDs, some with only an email address — and three pathways tracked different lifecycle events. Downstream personalization needed one predictable record regardless of origin.",
    approach:
      "I audited the data model, CloudPage behavior, email architecture and client-rendering constraints. Rather than flattening every workflow, I kept pathway-specific source Data Extensions for lifecycle state and normalized the shared preference fields into a Master Data Extension used for personalization. Identity moved to Id/Subscriber Key with email fallback, preserving existing Salesforce records. The Salesforce API integration was rolled out incrementally — validate input, minimal DE write, restore fields one at a time, add the outbound request, add OAuth, then add sanitized diagnostic logging — so failures could be isolated to a specific layer.",
    result:
      "A maintainable system supporting three subscriber origins without sacrificing existing Salesforce identities. Acquisition-specific state stays separate from shared preference data, one normalized source feeds downstream journeys, and CloudPage and API failures are diagnosable. The reusable email layer removed the need to re-solve the same Outlook, mobile, dark-mode and tracking problems per campaign.",
    constraints: [
      "Some subscribers had Salesforce IDs; others entered with only an email address",
      "Three pathways tracked different lifecycle events, so one acquisition table was not a valid source for every use case",
      "CloudPages and SSJS offered limited debugging visibility — schema problems surfaced as generic server errors",
      "OAuth credentials and endpoints had to stay out of browser-accessible code",
      "AMPscript variables share render scope, creating collision risk between reusable modules",
      "Outlook, Apple Mail, Outlook.com and mobile each required different responsive and dark-mode strategies",
    ],
    decisions: [
      {
        decision: "Id/Subscriber Key as canonical primary key, email as fallback",
        reason: "Preserves existing Salesforce identities without blocking email-only acquisition.",
      },
      {
        decision: "Separate source DEs, normalized Master DE",
        reason: "Keeps pathway-specific state isolated while giving personalization one consistent record.",
      },
      {
        decision: "Lookup-before-write date preservation",
        reason: "Repeat interactions no longer destroy original lifecycle timestamps.",
      },
      {
        decision: "Tokenized double opt-in with expiration",
        reason: "Explicit confirmation state; already-confirmed subscribers aren't returned to pending.",
      },
      {
        decision: "Incremental API rollout",
        reason: "Separates schema failures from OAuth and API failures in a runtime with poor diagnostics.",
      },
      {
        decision: "Dedicated configuration Data Extension",
        reason: "Separates integration configuration from subscriber data.",
      },
      {
        decision: "Local-only credential helper",
        reason: "Generated the config payload at runtime without publishing a sensitive utility.",
      },
      {
        decision: "Module-scoped AMPscript variable naming",
        reason: "Shared render scope meant generic names let later blocks overwrite earlier values.",
      },
    ],
    learned: [
      "In marketing platforms, integration failures are usually data-contract problems before they are application-code problems.",
      "Identity strategy has to accommodate both existing CRM records and acquisition paths that start with incomplete identity.",
      "Normalization is most useful when it separates pathway-specific state from the shared data downstream systems actually need.",
      "In constrained runtimes, observability and phased rollout are part of the implementation, not optional debugging extras.",
    ],
  },
  {
    slug: "headless-commerce-platform",
    discipline: "FRONT-END & COMMERCE",
    title: "Headless Commerce Platform",
    summary:
      "I built and ran GearZN, a headless car-accessories store, by myself. React in front, WooCommerce behind, real customers paying real money. Along the way I documented ninety ways that stack can fail, most of them without a single error message.", role: "Sole engineer — architecture, implementation, infrastructure, measurement",
    platform: "React / WordPress + WooCommerce / DigitalOcean",
    status: "Project concluded; store retired. Engineering record preserved.",
    stack: [
      "React",
      "Vite",
      "TypeScript",
      "Zustand",
      "Tailwind CSS",
      "WordPress",
      "WooCommerce REST API",
      "Stripe",
      "Docker Compose",
      "GitHub Actions",
      "DigitalOcean",
      "nginx",
      "Doppler",
      "GA4",
      "Consent Mode v2",
    ],
    problem:
      "GearZN was a direct-to-consumer car-accessories store on a headless architecture: a React app served on its own, talking to WooCommerce only through its REST API. I was the only engineer, the store took real payments, and I ran it around a full-time job. Building it turned out to be the easy part. The hard part was that nobody else was looking. With no second reviewer, the bugs that matter most are the ones that never throw an error. They just keep quietly doing the wrong thing.",
    approach:
      "I worked by two rules. The first was to trust the running system over the documentation. Carrier routing, consent state and build output all behaved differently than the docs or settings screens said, so I checked each one directly: testing the routing, reading live network traffic, inspecting the compiled bundle. The second rule was to write everything down. Every non-obvious bug got a numbered entry: what broke, why, the fix, and how I proved the fix worked. By the time the log reached 207 KB, loading it into every working session had become a cost of its own, so I rebuilt it as a 15 KB index pointing to eight topic files loaded only when needed. That cut the baseline by 95% without losing anything, because the index, not the split, was what made it searchable.",
    result: gearznResultParagraphs.join(" "),
    resultParagraphs: gearznResultParagraphs,
    constraints: [
      "One engineer, a live store and real payments, with no second reviewer.",
      "The analytics were wrong in both directions: checkout events fired on every page change, while consent choices and ad blockers hid others entirely.",
      "Some reported conversions were Consent Mode estimates, not actual observations.",
      "WooCommerce's \"failed\" order status emails the customer here, so it couldn't be used to keep failed orders for investigation.",
      "nginx served the full store to any hostname, so scanners hitting the raw IP showed up as visitors.",
      "With a fixed cost per click, a $13 product cost as much to sell as a $50 one.",
    ],
    decisions: [
      {
        decision: "Move failed orders to the trash instead of deleting them",
        reason: "A failed payment used to delete the order, and every clue about what went wrong with it. Moving it to the trash keeps the record without emailing the customer, which WooCommerce's \"failed\" status would have done.",
        visual: "failure-trace",
      },
      {
        decision: "Log every failure path",
        reason: "A server error and a declined card both ended the same way: in silence. Logging each path separately means every failure says what it was.",
        visual: "failure-trace",
      },
      {
        decision: "Calculate cart totals from the items instead of storing them",
        reason: "A stored total can drift out of sync with the cart. A total calculated from the items can't, which closed a whole category of bugs instead of one. It's memoized, so the eight components that read it stay fast.",
        visual: "cart-totals",
      },
      {
        decision: "Clear the cart only after 3-D Secure finishes",
        reason: "The cart was being cleared before card authentication finished, so a failed check left the customer with an empty cart and no abandoned-cart email. Now nothing is cleared until the payment is confirmed.",
        visual: "3ds-clear",
      },
      {
        decision: "Write attribution onto the order itself",
        reason: "Ad platforms lose track of sales when visitors block cookies or trackers. Saving where each customer came from on the order, on my own server, keeps that answer whatever the browser allows.",
        visual: "attribution",
      },
      {
        decision: "Route every WordPress file to WordPress explicitly",
        reason: "In a headless setup, any URL nginx didn't send to WordPress fell through to React, which answers everything with its own page and a success code. That's how search engines asking for robots.txt and the sitemaps silently got the storefront instead.",
      },
      {
        decision: "Script the walkthrough instead of recording it by hand",
        reason: "A script follows the same path at every screen size, logs any step it couldn't finish, and can redo the whole video or static image capture after a change. Doing it by hand guarantees none of that.",
        visual: "recorder-grid",
      },
    ],
    learned: [
      "The expensive bugs are the silent ones. In every major finding, the system reported success while doing the wrong thing.",
      "Test what's running, not what the docs promise, and test for what should be missing. The 3-D Secure bug only showed up once I checked for an event that never fired.",
      "Fix the category, not the instance. Calculating cart totals instead of storing them removed a whole family of bugs at once.",
      "Stop on evidence, not exhaustion. The cost-per-click math showed when to wind down before it became a matter of stubbornness.",
    ],
    metrics: [
      { value: "447", unit: "KB", caption: "Icon font, from 3.87 MB" },
      { value: "110", unit: "KB", caption: "Hero images, from 1.87 MB" },
      { value: "73→90s", caption: "Lighthouse desktop" },
      { value: "90", caption: "Documented failure modes" },
    ],
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((s) => s.slug === slug);
}

/*
ANONYMIZATION NOTE

Public case studies name no clients. Changes from the source documents:

  - Branch and agency-client names removed from `client`, `problem`,
    `approach`, `result` and `decisions`.
  - "four brands" / "branch-specific" → "sub-brands" / "per-brand".
    The original count was identifying in context.
  - "career-preference collection" → "preference collection".
  - `client` now carries a generic descriptor only.

Two agency clients are fully restricted and appear nowhere in this file
or in any other project file.

`gatedArtifacts: true` marks studies whose rendered emails and templates
may be shown behind authentication but not publicly. The write-up itself
is public; only the artifacts are gated. Confirm with the agency that a
password gate satisfies the restriction — "not public" and "not
reproducible at all" are different rules.

Re-read these before launch with fresh eyes. Anonymization tends to leave
one identifying detail behind, usually in a constraint or a metric.
*/