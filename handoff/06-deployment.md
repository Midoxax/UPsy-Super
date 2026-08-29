# 6 — Deployment, CI/CD and cutover

## Build

```bash
bun install --frozen-lockfile
bun run build     # prebuild regenerates public/sitemap.xml
```

Output: `dist/server/wrangler.json` (Worker entry) and `dist/client` (assets).
`scripts/verify-build.mjs` asserts the production output is well formed.

Bun is the package manager. `bun.lock` is committed; there is no
`package-lock.json`, so `npm ci` has nothing to install from. CI uses
`oven-sh/setup-bun`.

## The verification gate

`bun run verify` chains everything CI enforces:

| Step | Script | Catches |
|------|--------|---------|
| Runtime rules | `check:runtime` | Worker-incompatible patterns |
| Env safety | `check:env` | a server secret reachable from client code |
| Deploy config | `check:deploy` | env contract / routing / deploy-script drift |
| Supabase sync | `check:supabase` | code and schema out of step |
| Types | `typecheck` | TS errors |
| Tests | `test` | unit + integration (vitest) |
| Build | `build` | compile failures |
| Bundle budget | `check:bundle` | size regressions against `bundle-budget.json` |
| Output | `check:build` | malformed production output |

Plus, separately: `node scripts/check-migrations-safety.mjs` and `bun run lint`.

## Workflows

**`ci.yml`** — on pull request. Lint, typecheck, tests, env safety, migration
safety, build, bundle budget. These are the required status checks on `main`.

**`deploy.yml`** — on push to `main`, or manual with a `preview` / `production`
choice. Sequence: checkout → setup Node + Bun → `bun install --frozen-lockfile`
→ deploy config gate → **required-secrets check that names the missing secret**
→ build with the `VITE_*` values → verify output → `wrangler deploy`
(production) or `wrangler versions upload` (preview) → unauthenticated smoke
test via `scripts/check-production.mjs`.

The secrets check exists because the worse failure is not a red job eight
minutes later — it is a green deploy with an empty Supabase URL baked into the
client bundle.

**`production-check.yml`** — scheduled probe of the live site.

**`rollback.yml`** — one click. Builds the wrangler config and runs
`wrangler rollback` to the previous production Worker version. Rehearse it once
before you need it; a rollback you have never run is a hope, not a plan.

**`security-scan.yml`** — daily and on PR. Committed-secret check, dependency
audit, migration-safety scan. Results post to `/api/public/ci-events`, which
writes them into `app_logs`, which surfaces in the admin Operations log.

## Required repository secrets

`CLOUDFLARE_API_TOKEN` (scope: Edit Cloudflare Workers), `CLOUDFLARE_ACCOUNT_ID`,
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`,
`VITE_SITE_URL`, and optionally `VITE_SENTRY_DSN`, `VITE_POSTHOG_KEY`,
`VITE_POSTHOG_HOST`, `CI_WEBHOOK_SECRET`.

Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, …) live on the
Worker via `wrangler secret put`, never in a workflow file.

## Health checks

- `GET /api/public/health` — verifies key env/config and returns a clear status
  object. Use it as the smoke-test target and as the Cloudflare health probe.
- `GET /api/public/healthz` — lightweight liveness.

A deploy that returns 200 on `/` but 500 on an SSR route is the failure mode
the smoke test exists to catch. The workflow should go red, not the users'
browsers.

## Preview walkthrough — do this before every production cutover

```bash
bun run deploy:preview
```

On the preview URL, walk: sign-in (Google and Apple), sign-up with email
verification, the matching funnel, booking, intake form, a video session page,
client dashboard, specialist dashboard, organisation dashboard, admin CRM
(every tab), audit trail, finance, operations log, OPS command centre, one PDF
generation, one email send, one AI call. Check `ar` / RTL on at least the home,
directory and booking pages.

## DNS cutover

**24 hours before:** lower TTL on `upsy.ma` and `www.upsy.ma` to 300 seconds.
Add both new origins to the Supabase Auth redirect allow-list — miss this and
OAuth breaks the instant DNS moves.

**Window:**

1. Announce maintenance (30–60 min, based on the rehearsal timing).
2. App to read-only / maintenance mode.
3. Re-run the data-only dump to catch rows written since the rehearsal.
4. Swap env vars on the Worker; redeploy.
5. Repoint DNS to Cloudflare.
6. Smoke test: sign in, book, intake, admin dashboard, one email, one PDF, one
   AI call.
7. Raise TTL back to a normal value once stable.

**Success signals to watch for 48 hours:** `/api/public/health` green from
multiple regions; error rate in `app_logs` flat; Supabase auth sign-ins
succeeding for both providers; email deliveries in Resend; Search Console
showing no crawl-error spike; Cloudflare analytics showing traffic arriving at
the Worker rather than the old origin.

**Rollback:** revert the env vars and repoint DNS. Because step 2 stops writes,
no data lands in the old database after the switch, so rollback is only a
config change. Keep the old deployment live throughout — it costs nothing and
it is the parachute.

`/admin/dns` renders this checklist in-app with the exact records.
