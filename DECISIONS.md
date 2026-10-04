# Decisions

Design and architecture choices, with reasoning. Written so future-me doesn't relitigate settled questions or wonder why the theme differs from the design export.

---

## Design

### Color: HTML export values, frontmatter ramp structure

The Stitch export disagreed with itself across three sources — DESIGN.md frontmatter, DESIGN.md prose, and the HTML. Resolved in favor of the HTML values, because the rendered comps I actually reviewed and approved came from the HTML. The frontmatter contributed the five-step surface ramp structure. The prose hexes were discarded, though its naming and rationale are still useful reading.

### Accent: white. Monochrome, not cyan — *supersedes the above*

The export's cyan (`#00f2ff`) read as 90s cyberpunk rather than Apollo-era ground control. Those consoles were high-contrast white on black with color reserved strictly for status. Switched to a monochrome palette where `--accent` is `#ffffff` and the only color in the system is status: `--ok` green, `--warn` amber, `--error` red.

The cyan palette survives as a `[data-theme="cyan"]` block — defined, not exposed, no switcher UI.

Consequence worth remembering: accent and primary text are both white, so `text-accent` can't mean "emphasized." Accent is for interactive affordances (focus rings, pill fills, selection); hierarchy comes from `--text` / `--text-muted` / `--text-faint`.

### Invert surface gets its own four-step ramp

The white editorial card and dossier need their own text tokens — dark-surface values fail contrast badly on white. `--text-invert` / `-dim` / `-muted` / `-faint` mirror the dark ramp. `--ok-invert` exists because `--ok` at `#34d399` is ~1.8:1 on a light fill.

Components that appear on both surfaces take a `surface?: "dark" | "invert"` prop with a lookup map — `KvRow` and `StatusBeacon` have one. `Button` uses a `primaryInvert` variant instead, since its change is a fill rather than a set of text colors.

### Typography: JetBrains Mono + Inter

Two families, not three. The export used Space Mono, JetBrains Mono, and Inter.

The mono face carries headings, labels, metrics, nav, and chips — so it has to work at 48px/0.12em tracking *and* 11px/0.2em tracking. JetBrains Mono is designed for small-size legibility and holds both. Space Mono is better at display size and mushy at 11px, which is where the telemetry labels live.

Tradeoff accepted: JetBrains is more neutral and less retro-futurist in character. If display headings feel flat in practice, adding Space Mono back as a display-only face is additive — one token, one import.

### Body copy is Inter, always

The export set body copy in mono (~180 `font-mono` classes to ~24 `font-sans`), and DESIGN.md defines `body-lg`/`body-md` as Space Mono. **Both are overridden.** Mono at paragraph length is tiring to read, and the About section and case study descriptions are where a reader actually slows down.

Mono is for labels, metrics, nav, eyebrows, chips, and code. Inter is for anything longer than a line.

### Type ramp is fluid

DESIGN.md gives separate fixed desktop and mobile sizes (48px / 28px for display-hero). Using `clamp()` instead, so one declaration covers the range rather than jumping at a breakpoint.

### Theme: dark-only, with palette variants planned

The design is committed to dark. A light variant would be a separate design, not a recolor. Alternate palettes — if built — will be dark variants swapping accent and surface tones via `[data-theme="..."]` overriding the same tokens.

Switcher is deferred to the quality pass. The token layer is built now, which is what makes the switcher cheap later.

### No arbitrary color values in components

Every fill, border, and text color goes through a semantic token. `bg-[#0f141a]` and `text-slate-400` don't follow a theme change, and the whole point of the token layer is that changing my mind about the palette costs minutes.

---

## Architecture

### Next.js, standalone output

App Router with `output: 'standalone'`, not static export. Static export would have been simpler to deploy but gives up route handlers, which the contact form needs. Running a real Node process in production was also the more useful thing to have built.

Astro is arguably the better technical fit for a mostly-static content site. Chose Next deliberately because the skills section claims Next.js and React Server Components, and building the site in that stack makes the claim inspectable.

### DigitalOcean droplet, not Vercel or GitHub Pages

Pages can't run standalone output at all. Vercel would work with zero config. Chose the droplet because the infrastructure already existed, the marginal cost was near zero, and running Node behind nginx with systemd is a better answer to "how is your site deployed" than a platform default.

Single environment for now. Staging goes on the same box — second systemd unit, second nginx vhost — when the contact form arrives.

### Work samples are real files in `/public`

```
public/work/ads/{campaign}/{size}/index.html
public/work/email/{slug}/index.html
```

Nothing in `/public` is touched by the bundler, which is the only way table-based email HTML and production ad units survive intact. Each ad unit stays a self-contained folder exactly as it ships to an ad server.

Consequence: they render in iframes, not inline. That's also what makes the mobile/dark email toggles real — an iframe has its own viewport, so the email's own media queries fire.

### File sizes are computed, not typed

A build-time script walks the ad folders, sums bytes, writes a JSON manifest. Components read it. Turns a claim into a measurement, and it can't drift from the actual assets.

### Deploy: build in Actions, rsync, restart

The droplet never builds. Push to `main` triggers install, build, assembly of the standalone bundle with `.next/static` and `public`, rsync over SSH, and a scoped `systemctl restart`. The deploy user has NOPASSWD sudo for exactly that one command.

### Content is typed data files, not a CMS

Case studies, skills groups, and client entries live in TypeScript files. Single author, no editorial workflow — a CMS would be more infrastructure than the content justifies.

---

## Open

- **Client work permissions.** Pending answer from GSDM. Determines whether work samples are real, anonymized rebuilds, or a mix. Also whether client logos can be shown, and whether clients can be named in text even if assets can't be shown.
- **Case study detail pages.** Only worth building if they hold content the homepage can't — process, code excerpts, the constraint that made it hard, QA matrix. If they'd just be longer versions of the cards, skip them. Cards stay self-contained until decided.
- **Space Mono as a display face.** Revisit after seeing JetBrains at 48px in context.
- **Third palette.** Revisit after living with the default for a week on real content.

---

## Component conventions

Established while building Tiers 0–2. These are the ones that cost time to rediscover.

- **Lookup map for styling variants, conditional render for structural ones.** `Section` has two variants that differ by color (map). `Eyebrow` has two that differ by which elements exist (early return). Empty objects in a variant map mean it's the wrong tool.
- **`w-full` on grid and flex children.** Without it they refuse to shrink below their content's intrinsic width, which is what caused the page-wrapper overflow on mobile.
- **Icon-plus-text pairs need an inner wrapper.** `flex-wrap` on the parent lets a status dot wrap to its own line, away from its label. Both `Eyebrow` and `StatusBeacon` had this bug.
- **`whitespace-nowrap` is a desktop decision.** Scope it `lg:`. Unconditional nowrap on an eyebrow pushed the whole page wide at 320px.
- **`Button` base is `w-full sm:w-auto`.** Full-width tap targets on mobile, content-width above.
- **Type utilities, one per element.** `text-display`, `text-label`, `text-code`. Don't stack `text-xs tracking-widest font-mono` — that's what the ramp replaced.
- **Dynamic class names only work for hand-written CSS classes.** `` `triangle-${trend}` `` is fine because those live in `globals.css`. The same pattern with Tailwind utilities fails silently, because Tailwind scans source for complete strings.
- **Tier 0–2 primitives live in `components/ui/`; Tier 3 page sections live in `components/`.** The test: could it drop into a different project unchanged?

---

## Content & clearance

### No fabricated claims

The comps shipped invented metrics (4.6M sends, 99.6% SLA, 52/52 Litmus, 100/100 Lighthouse) and two Salesforce certifications. All removed. A case study with no metric row looks deliberate; one with a number that can't survive a follow-up question doesn't.

Only the commerce case study carries metrics, because it's the only one with figures that are provable.

### Client work

Two agency clients are fully restricted and appear nowhere in the repo.

[CONFIDENTIAL CLIENT] work can be shown behind authentication but not publicly. The two SFMC case studies are anonymized — no branch names, no client sector, "sub-brands" rather than a brand count — and carry `gatedArtifacts: true`. The write-ups are public; only the rendered artifacts are gated.

3–6 clients are cleared for display work. Get each clearance in writing with a date.

### Certifications

None held yet. The comp's badge row stays out of production until one is earned.

---

## Open

- **Hero spec cards** removed. Replacing with a self-branded 728x90 as the first real unit in `/public/work/ads/`.
- **Logo** is raster for now. Rebuild as SVG by construction in Illustrator, not by tracing — tracing produces one flattened path with no animatable structure.
- **`scroll-padding-top: 5rem`** is a placeholder. Match it to the real header height once Header exists.
- **`/lab` has `robots: noindex`.** Decide before launch whether the component catalog is public — it's arguably a portfolio piece in its own right.
- **Case study detail pages.** The data files now carry `problem` / `approach` / `result` / `constraints` / `decisions` / `learned`, which is enough content to justify them. Build after the homepage.
- **Third palette.** Revisit after living with monochrome on real content.
