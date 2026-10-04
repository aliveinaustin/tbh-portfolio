export type CaseStudy = {
  slug: string;
  index: string;
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
  constraints: string[];
  decisions: { decision: string; reason: string }[];
  learned: string[];
  metrics?: { value: string; unit?: string; caption: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "modular-email-component-system",
    index: "01-DS",
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
    index: "02-DS",
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
    index: "03-FE",
    discipline: "FRONT-END & COMMERCE",
    title: "Headless Commerce Platform",
    summary:
      "A React storefront decoupled from WooCommerce, taking real payments on a hardened checkout path — and a documented record of ninety ways that stack fails, most of them silently.",
    role: "Sole engineer — architecture, implementation, infrastructure, measurement",
    platform: "React / WooCommerce / DigitalOcean",
    status: "Project concluded; store retired. Engineering record preserved.",
    stack: [
      "React",
      "Vite",
      "TypeScript",
      "Zustand",
      "Tailwind CSS",
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
      "Build and operate a direct-to-consumer storefront on a headless architecture — a React SPA served independently of its WooCommerce backend, connected only through the REST API — as a solo engineer, on a production system taking real payments, alongside a full-time job. The hard part was not the build. It was that a single-operator production system has no second reviewer, so defects that produce no error message can run indefinitely.",
    approach:
      "Two working principles. First, verify against the running system rather than the documentation: carrier routing confirmed empirically after vendor docs proved unreliable, consent state read from live network traffic rather than configuration screens, build output inspected directly after a Vite transform produced something the source did not imply. Second, keep a written record — ninety numbered entries covering each non-obvious defect, its root cause, the fix, and the verification that proved it. When that record reached 207 KB and became a per-session cost, it was restructured into a 15 KB index plus eight topic-scoped files loaded on demand: a 95% reduction in baseline context with no loss of discoverability, because the index rather than the split was treated as the load-bearing component.",
    result:
      "A production headless commerce platform with continuous deployment, environment-scoped secrets, consent-compliant measurement, first-party attribution and a hardened payment path. Several production defects were found that produced no error, no log, and no user-visible symptom: a checkout endpoint hard-deleting its own orders across six failure branches, a cart reporting itself empty to returning customers, a pixel counting every purchase three times, and an analytics property counting bot traffic as sessions. Payload work took the icon font from 3.87 MB to 447 KB and hero images from 1.87 MB to 110 KB, moving Lighthouse desktop performance from 73 into the nineties.",
    constraints: [
      "Solo build on a live system processing real payments — no second reviewer",
      "Platform-reported analytics proved untrustworthy in both directions: begin_checkout fired on every route navigation and was suppressed entirely by consent denial and ad blockers",
      "Consent Mode modelling meant a portion of reported conversions were estimates rather than observations",
      "WooCommerce's failed order status triggers a customer-facing email on this configuration, ruling it out for forensic order preservation",
      "nginx was serving the full storefront to any Host header, so scanner traffic on the raw IP counted as sessions",
      "Fixed cost-per-click means a $13 product costs the same to acquire as a $50 one",
    ],
    decisions: [
      {
        decision: "Trash rather than hard delete on checkout failure",
        reason:
          "Preserves the order row for forensics; chosen over `failed` status because that triggers a customer email.",
      },
      {
        decision: "Structured logging on every failure branch",
        reason: "Distinguishes infrastructure failures from payment failures; previously both produced nothing.",
      },
      {
        decision: "Derive cart count and subtotal from the item array",
        reason: "Eliminates the class of defect rather than the instance — stored values were excluded from persistence.",
      },
      {
        decision: "Memoise the derivation on array reference",
        reason: "Eight consumers including a per-grid-item product card were recomputing on every cart mutation.",
      },
      {
        decision: "Defer cart-clear until after 3-D Secure resolves",
        reason:
          "Failed authentication was emptying the cart and deleting the abandonment record as though the order had completed.",
      },
      {
        decision: "First-party attribution written to order metadata",
        reason: "Server-side and immune to consent changes, tracking prevention, ad blockers and pixel defects.",
      },
      {
        decision: "Treat the order database as the only trustworthy count",
        reason: "Every platform report is an approximation of it.",
      },
      {
        decision: "Correct the failure record in place rather than superseding entries",
        reason: "Two entries teaching that a tool is unreliable would have blocked correct changes later.",
      },
    ],
    learned: [
      "The defects that cost the most are the ones that produce no error. In every significant finding, the system reported success while doing the wrong thing.",
      "Verification has to run against the running system, not the documentation — several findings were only reachable that way.",
      "A passing test that checks only the success path will ship the defect; the 3-D Secure failure was proven by instrumenting for the absence of an event.",
      "Fixing the class of defect beats fixing the instance: deriving cart totals removed a whole category of persistence bug.",
      "Wind down on evidence rather than exhaustion — market demand data and per-product return-on-spend analysis made the structural cost-per-click problem legible before it became a sunk-cost argument.",
    ],
    metrics: [
      { value: "447", unit: "KB", caption: "Icon font, from 3.87 MB" },
      { value: "110", unit: "KB", caption: "Hero images, from 1.87 MB" },
      { value: "73→90s", caption: "Lighthouse desktop" },
      { value: "90", caption: "Documented failure modes" },
    ],
  },
];

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