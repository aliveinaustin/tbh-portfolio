# thomasbrandonhays.com

Personal portfolio for Thomas Brandon Hays — a developer working across HTML email, Salesforce Marketing Cloud, HTML5 animated display, and front-end web.

The site is built around showing the work rather than describing it: banner ads run live at true IAB dimensions with real file sizes, and email templates render in isolated frames with desktop, mobile, and dark-mode views.

**Live:** [thomasbrandonhays.com](https://thomasbrandonhays.com)

---

## Stack

| | |
|---|---|
| Framework | Next.js (App Router, `output: 'standalone'`) |
| UI | React, TypeScript |
| Styling | Tailwind CSS |
| Host | DigitalOcean droplet — Ubuntu, nginx reverse proxy, systemd |
| TLS | Let's Encrypt via certbot |
| CI/CD | GitHub Actions — build, rsync, restart |
| Secrets | Doppler |
| Transactional email | Resend |

## Local development

```bash
npm install
npm run dev
```

Requires the Node version in `.nvmrc`.

```bash
npm run build    # produces .next/standalone
npm run lint
```

## Work samples

Banner units and email templates are served as untouched static files from `public/work/`, outside the bundler, so production ad units and table-based email HTML render exactly as they do in an ad server or an inbox:

```
public/work/ads/{campaign}/{size}/index.html
public/work/email/{slug}/index.html
```

File sizes shown in the UI are computed at build time from the actual assets rather than hardcoded.

## Deployment

Pushes to `main` trigger a GitHub Actions run that installs dependencies, builds, assembles the standalone bundle with `.next/static` and `public`, rsyncs it to the droplet over SSH, and restarts the systemd service. nginx proxies to the Node process on loopback; only 22, 80, and 443 are exposed.

## License

Code is MIT. Written content, design, and work samples are not — please don't reuse those.