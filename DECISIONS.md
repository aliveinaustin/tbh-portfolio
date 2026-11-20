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

### `--text-faint` contrast: 4.82:1, and why one gray can't serve both surfaces

Pre-launch audit measured `--text-faint` at 4.16:1 against the darkest surface (`#060a10`) — under the 4.5:1 AA floor. Moved it from `#64748b` to `#6f7e95`: 4.82:1 against `#060a10`, still clearly dimmer than `--text-muted` (7.74:1 there), so the `text` > `text-muted` > `text-faint` hierarchy holds.

The lesson that cost a re-check: brightening it broke two *other* labels that were already passing — `CopyPill`'s label and `Section`'s invert-variant eyebrow, both rendered on white (`surface-invert`) using this same dark-surface token. The old, darker value happened to clear 4.5:1 against white by coincidence; the brightened one didn't (4.12:1). Fixed by moving both to `text-text-invert-muted`, not by tuning `--text-faint` again — no single gray passes 4.5:1 against both near-black and white at once, which is exactly why the `-invert` token family (see above) exists. Anything on `surface-invert` must use it.

Re-run Lighthouse on every page after any token change, not just the page the original finding came from — the regression above didn't show up until all four pages were checked, not just the one with the known issue.

---

## Architecture

### Next.js, standalone output

App Router with `output: 'standalone'`, not static export. Static export would have been simpler to deploy but gives up route handlers, which the contact form needs. Running a real Node process in production was also the more useful thing to have built.

Astro is arguably the better technical fit for a mostly-static content site. Chose Next deliberately because the skills section claims Next.js and React Server Components, and building the site in that stack makes the claim inspectable.

### DigitalOcean droplet, not Vercel or GitHub Pages

Pages can't run standalone output at all. Vercel would work with zero config. Chose the droplet because the infrastructure already existed, the marginal cost was near zero, and running Node behind nginx with systemd is a better answer to "how is your site deployed" than a platform default.

Single environment. If staging is added, it goes on the same box: a second systemd unit and a second nginx vhost.

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

### Runtime secrets: static env file, Doppler as source of truth

The systemd unit loads `/etc/portfolio/app.env` (root-owned, `600`) via `EnvironmentFile=`. That file is a one-time export from Doppler. Deliberately **not** using `doppler run --` in `ExecStart`: it makes every service start depend on reaching Doppler's API, so a Doppler outage during a reboot means the site doesn't come up. With a handful of secrets that rarely change, a static file is the more reliable choice.

Doppler stays the source of truth. When a secret changes, edit it in Doppler, then regenerate the file and restart:

```bash
doppler secrets download --no-file --format env --project <proj> --config prd \
  | sudo tee /etc/portfolio/app.env > /dev/null && sudo systemctl restart portfolio
```

Never edit `app.env` by hand. If manual syncing becomes a chore, move this into the deploy workflow as a step.

CI doesn't use Doppler at all: `npm run build` gets no injected env. That's fine because server secrets (e.g. `RESEND_API_KEY`) are read at request time, not build time.

### Search: generated robots.txt and sitemap

`app/robots.ts` and `app/sitemap.ts` produce `/robots.txt` (`text/plain`) and `/sitemap.xml` (`application/xml`). No static copies in `public/`, since they would collide with the generated routes. The sitemap maps over `caseStudies`, so a new study gets listed automatically. No `lastModified`: stamping `new Date()` would claim every page changed on every deploy.

nginx proxies both routes straight to Node, so a common SPA failure (robots.txt falling through to the HTML app shell with a `200`) can't happen here. Verify after any nginx change: `curl -sI https://thomasbrandonhays.com/robots.txt` should return `200` / `text/plain`.

No `llms.txt`: no major AI crawler reads it, and it isn't worth maintaining for zero effect. robots.txt allows all crawlers, including AI search and retrieval bots.

### `/lab` is development-only

`app/lab/layout.tsx` calls `notFound()` in production unless `ENABLE_LAB === "true"`, so `/lab` and any sub-routes return a real 404. `force-dynamic` makes it a runtime check, so turning it on needs a server restart, not a rebuild. It's excluded from the sitemap and deliberately *not* blocked in robots.txt: a crawler that can't load a page never sees its noindex.

Not a basic-auth gate: a login wall serves nobody, since recruiters can't see it and I have it locally. If the catalog gets polished enough to show, set `ENABLE_LAB=true`, add `robots: { index: false }`, and link it from the footer as "Component library."

### Analytics: self-hosted Umami, not GA4

GA4 sets cookies, which means Consent Mode plus a banner, and a banner is clutter a recruiter has to dismiss. Umami is cookieless (no banner needed), free when self-hosted, and keeps the data on my server. GA4 and Consent Mode experience is already demonstrated in the commerce case study.

Layout on the droplet:
- `/opt/umami/` holds `docker-compose.yml` plus `.env` (`600`; generated on the droplet, never committed). Source copies are in `infra/umami/`.
- Umami listens on `127.0.0.1:3001` (the app uses 3000). Localhost binding matters because Docker-published ports bypass UFW.
- Postgres publishes no port and is reachable only on the internal Docker network.
- Memory caps: Umami 512 MB, Postgres 384 MB, so analytics can't starve the site. A 2 GB swapfile was already in place.
- Served at `stats.thomasbrandonhays.com` via nginx and certbot.
- The tracker is served as `s.js`, not `umami.js`, so it matches fewer ad-blocker lists.
- Backups: nightly `pg_dump` from cron, kept 14 days, in `/opt/umami/backups`.
- Update: run `backup-umami.sh` by hand first, then `docker compose pull && docker compose up -d`.

The website ID is **hardcoded**, not an env var. It isn't secret (it ships in every page's HTML), and CI has no Doppler, so wiring an env var into the build just for this would be overhead. The tracker loads only in production, and `data-domains="thomasbrandonhays.com"` stops local builds from sending data.

Events: `resume-download`, `outbound-linkedin`, `outbound-github`, and `contact-submit`. `contact-submit` fires from a `useEffect` when `useActionState` moves to `"success"`, not during render.

`Button` gained a typed `trackEvent?: AnalyticsEvent` prop (renders `data-umami-event`) rather than forwarding arbitrary `data-*` attributes. The union lives in `lib/analytics.ts`, so a typo in an event name is a compile error instead of a silently missing event in Umami.

### Security headers: Next sets app-level headers, nginx sets HSTS

`next.config.ts`'s `headers()` sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and the CSP (below). `poweredByHeader: false` drops the framework fingerprint.

HSTS lives in nginx, not Next — it's meaningless without HTTPS, and nginx is what terminates TLS, so the app is one layer removed from where it actually matters. It's duplicated in all three places that answer over 443 (the main block, the `/work/` static-media location, and the www redirect block): nginx doesn't inherit a server-level `add_header` into a child location once that location sets its own (`/work/` already has one, for `Cache-Control`), so HSTS needed repeating there rather than just at the server level.

### CSP is split: narrow directives enforced now, script/connect-src Report-Only

`frame-ancestors 'self'; object-src 'none'; base-uri 'self'` is enforced immediately — none of those touch script or style loading, so nothing can regress.

`script-src`/`connect-src` ride in a separate `Content-Security-Policy-Report-Only` header instead. `'unsafe-inline'` is required (Next's own hydration bootstrap is an inline script), and a nonce-based alternative would force every page to render dynamically instead of statically. Report-Only surfaces violations in the console without breaking anything, until there's a reason to enforce it.

### Rate limiting: nginx, POST-only, via a method-keyed map

`limit_req_zone` keys on a `map $request_method` variable that resolves to `$binary_remote_addr` for `POST` and an empty string otherwise — nginx's documented behavior for an empty zone key is to skip rate limiting for that request, so GETs pass through unmetered. 5 requests/minute per IP, burst of 3, `nodelay`, `limit_req_status 429`. The `map`/`limit_req_zone` live in `/etc/nginx/conf.d/rate-limit.conf` (http context — neither directive can sit inside a `server` block); the `limit_req` directive itself sits in `location /`.

### Canonical URLs are per-page, not in the root layout

The home page's `alternates.canonical` lives in `app/page.tsx`'s own `metadata` export; each case study's canonical and `openGraph.url` live in `generateMetadata`, built from its own slug. A root-layout canonical would be wrong for every route except `/`.

### Security monitoring

GitHub, on `aliveinaustin/tbh-portfolio` (public): Dependabot alerts + security updates, secret scanning + push protection, and CodeQL default setup are all on. `.github/dependabot.yml` runs `npm` weekly (minor/patch grouped into one PR, majors stay separate so they get a real look) and `github-actions` monthly, both capped at 5 open PRs.

CI runs `npm audit --omit=dev --audit-level=high` before the build, so a new high/critical production-reachable advisory fails the deploy instead of shipping quietly. First run hit the known `source-map-js` advisory (event-loop DoS parsing malicious source maps) that the pre-launch audit had already assessed as unreachable — it only runs during `next build`/postcss, never in the deployed standalone server. `npm audit fix` alone couldn't resolve it (the only real fix needs a semver-major bump in a parent package it won't force), so pinned it directly via `package.json`'s `overrides: { "source-map-js": "^1.2.2" }` instead — resolved cleanly to `1.2.4` with no dependency reshuffling, `npm audit --omit=dev --audit-level=high` now passes at 0 vulnerabilities. Confirmed the override didn't change anything else: `next build` produced the identical route table (same statics/dynamic split, same three case-study pages), and a standalone-server smoke test served the CSS bundle fine (`200`, 44 KB) — relevant since `source-map-js` is a `postcss` dependency and postcss processes all of the app's CSS.

Overrides tend to outlive their reason, and Dependabot won't flag that the parent has fixed it upstream. Remove this one once `postcss` depends on `source-map-js` ≥1.2.2 itself — check with `npm ls source-map-js` on each Next/Tailwind major bump.

Droplet: Ubuntu `unattended-upgrades` is enabled and active, installing security updates daily (`APT::Periodic::Unattended-Upgrade "1"`). Umami is updated by hand, not automatically — the image is pinned in `docker-compose.yml`, and updates happen by watching Umami's GitHub releases and following the backup-then-pull routine above. Automatic reboots are left off (`Unattended-Upgrade::Automatic-Reboot` is commented out, default `false`) so a restart never happens unwatched — check `/var/run/reboot-required` (and `/var/run/reboot-required.pkgs` for which packages triggered it) periodically and reboot by hand.

**Node does not get automatic security updates.** `unattended-upgrades`'s `Allowed-Origins` only covers Ubuntu's own repos and ESM variants (checked directly: `grep -A5 Allowed-Origins /etc/apt/apt.conf.d/50unattended-upgrades`) — NodeSource isn't in it, so a Node security release just sits there unapplied. And even if it were covered, installing the package alone wouldn't be enough: `ExecStart=/usr/bin/node server.js` means the already-running process keeps using the old binary in memory until the service is restarted. This has to stay a manual routine: check `apt list --upgradable 2>/dev/null | grep nodejs` monthly, or immediately when a Node security release is announced, then `sudo apt-get install nodejs && sudo systemctl restart portfolio`.

### Node runtime: 24 everywhere, `.nvmrc` is the single source of truth

Local, CI, and the droplet had drifted: local was already on Node 24.22.1, `.nvmrc` (and so CI, via `node-version-file: .nvmrc` in both `deploy.yml` and `ci.yml`) said 22, and the droplet ran 22.23.4. Standardized all three on 24 rather than picking whichever was easiest, since the droplet is where the site actually runs and that's the version that matters most.

`.nvmrc` now reads `24` and stays the one place this is declared — both workflows read it rather than hardcoding a version, and `package.json` carries `engines: { "node": ">=24 <25" }` so a mismatch surfaces as an `npm ci` warning instead of a strange bug discovered later. The droplet's Node comes from NodeSource (`/etc/apt/sources.list.d/nodesource.sources`, not nvm), upgraded by pointing that file at `node_24.x` instead of `node_22.x`, `apt-get update && apt-get install -y nodejs`, then `systemctl restart portfolio`.

Checked the one real risk a cross-version restart like that could cause: `sharp` (required for `next/image` optimization in standalone mode — there's no silent JS fallback) ships prebuilt native bindings, and the deployed bundle at that moment was still the one CI had built under Node 22, now being run by a freshly-restarted Node 24 process. Verified live with a real `/_next/image` request — `200`, real PNG bytes, `X-Nextjs-Cache: MISS` (proving it was freshly processed, not served from a pre-restart cache). Held up because `sharp`'s bindings are N-API-based, which is specifically designed to be ABI-stable across Node majors, unlike older NAN-based native addons that would need rebuilding.

### PR-level CI, and why some dependency bumps are declined rather than merged

`.github/workflows/ci.yml` runs on every PR into `main`: `npm audit --omit=dev --audit-level=high`, `npm run lint`, `tsc --noEmit`, `next build` — the same checks as the deploy workflow, so a Dependabot PR gets real verification before merge instead of relying on a manual local check every time. (`deploy.yml` itself still only triggers on push to `main`, unchanged.) Required as a branch protection status check on `main` (Settings → Branches), so a PR can't be merged with a red or pending check — this only gates the merge button on a PR, not direct pushes to `main`, which still deploy normally.

Fixed four pre-existing lint errors that would otherwise have kept this gate permanently red regardless of what any given PR changed: two unescaped apostrophes (`react/no-unescaped-entities`), a `setState` call inside `ResultVideo`'s effect, and a local variable named `module` in `buildHeroTimeline.ts` shadowing Next's reserved name (renamed to `moduleEl`). The `setState` call stays inside the effect rather than moving to a `useState` initializer — that would read `window.matchMedia` during the client's first render but not the server's, mismatching `PauseButton`'s hydrated `paused` prop. Suppressed with `eslint-disable-next-line react-hooks/set-state-in-effect` on that one line only, with the reason recorded directly above it.

Two dependency version policies, both enforced through `dependabot.yml`'s `ignore` list so they live in the repo rather than as tribal knowledge:
- **`@types/node` stays pinned to the current Node major**, not whatever Dependabot proposes — a types-only bump ahead of the actual runtime would claim APIs the deployed Node version doesn't have. Bump it by hand alongside the next Node runtime upgrade, not independently.
- **TypeScript major versions are declined until Next.js officially supports them.** The open PR for TypeScript 7 was closed directly via a `@dependabot ignore this major version` comment (which also makes Dependabot stop re-proposing that exact major on its own), and a matching `ignore` entry for `typescript` semver-majors was added to `dependabot.yml` so the policy is visible in the file too, not just remembered server-side by Dependabot.

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
- **`scroll-padding-top` is `4rem` on mobile, `6.5rem` at `lg`.** Matched to the real header height (mobile `h-16`; desktop `h-20` + `lg:py-3`), so an anchor link (`/#work`, etc.) doesn't land with its target tucked under the sticky header.

---

## Content

### No fabricated claims

The comps shipped invented metrics (4.6M sends, 99.6% SLA, 52/52 Litmus, 100/100 Lighthouse) and two Salesforce certifications. All removed. A case study with no metric row looks deliberate; one with a number that can't survive a follow-up question doesn't.

Only the commerce case study carries metrics, because it's the only one with figures that are provable.

### Agency work is anonymized

Case studies from agency work name no clients. Where the rendered artifact can't be shown publicly, the write-up stays public and the artifact is gated (`gatedArtifacts: true`). The case study describes the problem and the engineering; the client isn't the point.

### Certifications

None held yet. The comp's badge row stays out of production until one is earned.

---

## Open

- **Hero spec cards** removed. Replacing with a self-branded 728x90 as the first real unit in `/public/work/ads/`.
- **Logo animation.** The logo is now SVG (`TbhMark`, plus the favicon set). Animating it in the hero is still to do.
- **Space Mono as a display face.** Revisit after seeing JetBrains at 48px in context.
- **Third palette.** Revisit after living with monochrome on real content.
- **CSP and work samples.** The Report-Only `script-src`/`connect-src` policy was only checked on pages without an iframed work sample. When the first real unit lands in `public/work/`, check the console on that page before ever considering enforcing the CSP — an iframed sample could need its own `frame-src` allowance, or load something `'self' 'unsafe-inline'` doesn't cover.
