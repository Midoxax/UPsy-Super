# 3 — Hybrid infrastructure

Cloudflare serves the app. Supabase holds the data. Google Cloud provides
identity, mapping, firewall posture and the search/analytics surface.

The boundary is the important part: **clinical data never reaches Google.**
Google sees marketing analytics, sign-in identity assertions, and map tile
requests. Nothing else.

## Cloudflare

**Worker.** The build emits `dist/server/wrangler.json` (Worker entry) and
`dist/client` (static assets) using nitro's `cloudflare-module` preset. Deploy
with `bunx wrangler deploy --config dist/server/wrangler.json`.

Setup:

```bash
bunx wrangler login
bun run deploy            # first run creates the Worker
```

**Domains.** `upsy.ma` and `www.upsy.ma` as custom domains on the Worker.
Canonical is `https://www.upsy.ma`; apex redirects to it with a 301 bulk
redirect rule. `VITE_SITE_URL` must match the canonical exactly — sitemap,
canonicals and OAuth redirect building all derive from it.

**Secrets.** Server-only values go on the Worker, never in `wrangler.json`:

```bash
bunx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
bunx wrangler secret put CI_WEBHOOK_SECRET
bunx wrangler secret put CRM_EMAIL_WEBHOOK_SECRET
bunx wrangler secret put CRON_SECRET
```

Full list in `docs/04-environment-contract.md`.

**WAF and rate limiting.** Minimum viable posture:

| Rule | Scope | Action |
|------|-------|--------|
| Managed ruleset (Cloudflare OWASP core) | all | managed challenge |
| Rate limit `/api/public/*` | 60 req / min / IP | block 10 min |
| Rate limit `/auth*` and auth server fns | 20 req / min / IP | managed challenge |
| Block non-`POST` on `/api/public/ci-events`, `crm-email-events`, `runtime-logs` | those paths | block |
| Bot Fight Mode | all | on |
| Country rules | none by default | the product is worldwide |

**Cache.** HTML is SSR and must not be cached at the edge without care —
default to bypass for document requests, cache `dist/client` assets
aggressively (they are content-hashed, `immutable`, one year).

**Security headers** come from `src/lib/security-headers.ts` in the app, not
from a provider config file, so they travel with the code. Do not duplicate
them in a Cloudflare Transform Rule — one source of truth.

**Logs.** Enable Workers Logs / Logpush for the Worker. Retention 30 days.
Runtime application errors additionally land in `app_logs` via `src/start.ts`.

**R2** is not required today. If PDF or asset storage outgrows Supabase
Storage, R2 is the natural next hop; keep clinical documents in Supabase
Storage with private buckets and signed URLs.

## Supabase

- **Region:** EU. GDPR posture and the Moroccan Law 09-08 story both depend on
  it. Do not create the target project in `us-east`.
- **Postgres version** must be ≥ the source project's.
- **Extensions:** `pgcrypto`, `pg_net`, `pg_cron`.
- **Connection pooling:** use the pooled connection string for anything
  serverless. The Worker talks over the Data API, not raw Postgres.
- **Backups:** daily automated plus point-in-time recovery. PITR is on a paid
  tier; budget for it — a six-year audit obligation with no PITR is a bluff.
- **Cron jobs** (`pg_cron`, must be recreated by hand after migration):
  `ops-task-watcher` (*/15 min), `session-reminders-cron`,
  `anamnesis-reminder-cron`, `process-email-queue`, `home-hero-auto-promote`
  (daily 04:17 UTC).
- **Auth settings** that never migrate and must be re-set: site URL, redirect
  allow-list (add both new origins *before* DNS cutover or OAuth breaks the
  moment it moves), password policy, HIBP check (defaults to off), the auth
  email hook pointing at the new function URL.
- **Storage:** buckets and policies come from a `storage` schema dump; objects
  must be copied separately. Re-verify that `user-documents` is private after
  restore.

Migration detail is in `docs/05-database.md` and
`docs/runbooks/00-exit-and-ownership.md` § C.

## Google Cloud

Create one project, `upsy-prod`, plus `upsy-dev` for non-production
credentials. Enable billing with a budget alert at 50 / 80 / 100 % of a
deliberately small monthly cap.

**APIs to enable:** Identity Toolkit / OAuth consent, Maps JavaScript API,
Places API (only if actually used), Geocoding API, Search Console API,
Analytics Data API. Enable nothing else — every enabled API is attack surface.

**IAM.** Least privilege, no user gets `Owner` except one break-glass account
with MFA and a documented holder.

| Principal | Role | Purpose |
|-----------|------|---------|
| founder@ | Owner (break-glass) | account recovery only |
| engineering group | Editor on `upsy-dev`, Viewer on `upsy-prod` | day-to-day |
| `sa-maps@` service account | none (API key only) | Maps requests |
| `sa-search-console@` service account | Search Console *Restricted* | reporting reads |
| `sa-ci@` service account | Viewer + specific deploy roles if GCP ever hosts | CI |

Service-account keys: prefer Workload Identity Federation from GitHub Actions
over downloaded JSON keys. If a JSON key is unavoidable, it goes in the GitHub
secret store, is rotated every 90 days, and is never in the repo.

**OAuth clients.**

- Web client for Google sign-in. Authorised origins: `https://www.upsy.ma`,
  `https://upsy.ma`, the Cloudflare preview origin, `http://localhost:8080`.
  Authorised redirect URI: the Supabase auth callback for the target project.
- The OAuth consent screen needs the privacy policy and terms URLs
  (`/privacy`, `/terms`) and a verified domain, or Google caps the user count.
- Apple sign-in is configured on the Apple Developer side (service ID +
  return URL) and mirrored in Supabase; Google Cloud is not involved.

**Maps Platform.** One API key, restricted by HTTP referrer to the production
and preview origins, and restricted to the specific Maps APIs in use. Set a
daily quota cap. An unrestricted Maps key is the single most commonly abused
credential in a public repo — treat it as a secret even though it ships to the
browser.

**Firewall / Cloud Armor.** The app does not run on GCP, so Cloud Armor has
nothing to protect. Edge filtering is Cloudflare's job (above). Use GCP
firewall rules only if and when a GCP-hosted service appears; if that happens,
default-deny ingress and allow only the Cloudflare egress ranges.

**Search Console.** Verify both `upsy.ma` and `www.upsy.ma` (domain property
via DNS TXT is best — it covers every subdomain and protocol). Submit
`https://www.upsy.ma/sitemap.xml`. `public/sitemap.xml` is generated by
`scripts/generate-sitemap.ts` on every build.

**Analytics / GTM.** Marketing only. The container must not fire on
authenticated clinical surfaces; the CSP in `src/lib/security-headers.ts`
already constrains what can load. No user identifier that maps to a patient
record ever goes into an analytics event.

## What lives where — summary

| Concern | Owner |
|---------|-------|
| App runtime, TLS, WAF, CDN, rate limiting | Cloudflare |
| Database, auth, storage, cron, edge functions | Supabase (EU) |
| Identity providers (Google), Maps, Search Console, Analytics | Google Cloud |
| Transactional email | Resend |
| AI inference | Lovable AI gateway (swappable to a direct provider) |
| Source of truth, CI/CD | GitHub |
| Payments | Direct bank transfer, reconciled in-app |
