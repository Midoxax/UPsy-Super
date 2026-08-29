# 4 — Environment contract

Every environment variable the codebase reads, discovered by scanning `src/`,
`supabase/`, `scripts/` and `.github/workflows/`. Structured form:
`inventory/env.json`.

## Rules

1. `VITE_*` is **inlined into the browser bundle**. Publishable values only.
   Never rename a server secret to a `VITE_` name to make an import work.
2. Server secrets are read with `process.env['NAME']` **inside a handler** —
   never at module scope. On Workers, env is injected at request time, so a
   module-scope read is `undefined` in production even when dev works.
3. Edge functions read `Deno.env.get('NAME')` and their secrets live in the
   Supabase secret store, not on the Worker.
4. `scripts/check-env-safety.mjs` runs in CI and fails the build if a
   server-only name appears in client-reachable code. Do not weaken it.

## Where each store lives

| Store | Holds | Set with |
|-------|-------|----------|
| Cloudflare Worker secrets | server runtime secrets | `wrangler secret put NAME` |
| GitHub Actions repo/environment secrets | build-time `VITE_*` + deploy credentials | repo Settings → Secrets |
| Supabase function secrets | edge-function secrets | `supabase secrets set --env-file` |
| Local `.env` | everything, for dev only | copy of `.env.example` |

## The variables

### Client-visible (safe in the bundle)

| Name | Purpose | Notes |
|------|---------|-------|
| `VITE_SUPABASE_URL` | Supabase project URL | required |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon/publishable key | required; RLS is the protection |
| `VITE_SUPABASE_PROJECT_ID` | project ref | used by generated client |
| `VITE_SITE_URL` | canonical origin | drives sitemap, canonicals, OAuth redirects |
| `VITE_OAUTH_PROVIDERS` | e.g. `google,apple` | which social buttons render |
| `VITE_APP_VERSION` | build identifier | set to the commit SHA in CI |
| `VITE_SENTRY_DSN` | error reporting | optional |
| `VITE_POSTHOG_KEY` | product analytics | optional; never send clinical data |
| `VITE_POSTHOG_HOST` | analytics host | default `https://eu.i.posthog.com` |

### Server-only (Worker / scripts)

| Name | Purpose | Rotation |
|------|---------|----------|
| `SUPABASE_URL` | server mirror of the project URL | with the project |
| `SUPABASE_PUBLISHABLE_KEY` | anon key for server publishable client | with the project |
| `SUPABASE_ANON_KEY` | legacy alias, still read in places | consolidate onto `SUPABASE_PUBLISHABLE_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | **bypasses RLS** | 90 days; never to the browser |
| `SITE_URL` | server-side canonical | with the domain |
| `PUBLIC_APP_URL` | absolute URL builder for emails/PDFs | with the domain |
| `CRON_SECRET` | bearer for cron-triggered public routes | 90 days |
| `CI_WEBHOOK_SECRET` | bearer for `/api/public/ci-events` | 90 days; must match the GitHub secret |
| `CRM_EMAIL_WEBHOOK_SECRET` | verifies email open/click webhook | 90 days |
| `NODE_ENV`, `MODE`, `DEV`, `COMMIT_SHA`, `PAYMENT_ENV` | build/runtime flags | n/a |

### Supabase edge-function secrets

| Name | Used by | Notes |
|------|---------|-------|
| `RESEND_API_KEY` | all email functions | rotate 90 days |
| `MAIL_FROM_DOMAIN`, `MAIL_FROM_NAME` | email sender identity | must match the verified Resend domain |
| `LOVABLE_API_KEY` | AI functions (`ai-assistant`, `generate-clinical-brief`, `session-summary`, `journal-synthesize`, `ops-director`, `ops-generate-protocol`, `recommend`, `crisis-screening`) | swap here if moving to a direct AI provider |
| `LOVABLE_SEND_URL` | send pathway for AI gateway | paired with the above |
| `CRON_SECRET` | cron functions | shared with the Worker value |
| `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_REMINDER_TEMPLATE` | WhatsApp reminders | optional feature |
| **note encryption key** | `encrypt-note` / `decrypt-note` | **copy verbatim between environments or every clinical note becomes unreadable.** Verify a decrypt round-trip before decommissioning any source project. |

### GitHub Actions

| Name | Used in |
|------|---------|
| `CLOUDFLARE_API_TOKEN` | deploy, rollback — scope: Edit Cloudflare Workers |
| `CLOUDFLARE_ACCOUNT_ID` | deploy, rollback |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PROJECT_ID` / `VITE_SITE_URL` | build |
| `VITE_SENTRY_DSN` / `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` | build, optional |
| `CI_WEBHOOK_SECRET` | posting deploy/scan events to `app_logs` |

### Local verification scripts (never set in production)

Overrides read only by `scripts/*.mjs` when run by hand or in CI. They hold no
secrets except `SUPABASE_KEY`, which is an alias, and none are read by the app.

| Name | Read by | Purpose |
|------|---------|---------|
| `BASE` | `check-bundle-size.mjs` | preview origin to measure against; defaults to `http://127.0.0.1:4173` |
| `UPDATE_BUDGET` | `check-bundle-size.mjs` | when set, rewrites `bundle-budget.json` instead of failing |
| `PROD_URL` | `check-production.mjs` | origin to smoke-test; defaults to the `homepage` field in `package.json` |
| `CONTROL_TABLE` | `check-database.mjs` | table used as the RLS control probe; defaults to `profiles` |
| `SUPABASE_KEY` | `check-database.mjs` | alias for `VITE_SUPABASE_PUBLISHABLE_KEY`; publishable key only — never the service-role key |

## Adding a variable

1. Add it to `.env.example` with a comment explaining what it is.
2. Decide the store: browser (`VITE_`), Worker, Supabase function, or CI.
3. Read it inside a handler, never at module scope.
4. If CI needs it, add it to the "Required secrets present" step in
   `.github/workflows/deploy.yml` so a missing value fails fast and by name.
5. Document it in the table above.

## Rotation runbook

For any secret: create the new value → set it in the store → deploy or restart
so the new value is live → verify the dependent flow → revoke the old value.
Never revoke first. Log the rotation in `app_logs` via the CI events route so
there is an auditable record.

Audit the live surface any time with:

```bash
rg -o "process\.env\['[A-Z_]+'\]|import\.meta\.env\.[A-Z_]+|Deno\.env\.get\('[A-Z_]+'\)" src supabase scripts | sort -u
```
