# Phase 0 — Exit & Ownership

Goal: the code, the hosting, and the database are yours. Lovable becomes one
optional editor among several, not a dependency.

There are three independent layers. You can stop after any of them.

---

## Layer A — Code ownership (low risk, no downtime)

1. In Lovable: **Settings → GitHub → Connect**. Pick your own org, not a personal
   account, so access survives you.
2. Clone locally:
   ```bash
   git clone git@github.com:<org>/<repo>.git upsy
   cd upsy && bun install
   ```
3. Copy `.env.example` to `.env` and fill it from the Lovable Cloud values.
4. Verify locally: `bun run dev`, then `bun run build`.
5. Point Claude Code (or any agent) at the clone. It now has full read/write on
   the same repo Lovable pushes to. Both can work; the repo is the source of
   truth. Keep them on separate branches when working in parallel — Lovable
   commits directly to the default branch.

**Result:** an agent outside Lovable can change anything. Hosting and backend are
untouched.

---

## Layer B — Hosting ownership (moderate, short DNS cutover)

The app is TanStack Start on Vite. It builds to an edge server bundle with
nitro's `cloudflare-module` preset.

**Status: the repo side is done.** `npm run build` emits
`dist/server/wrangler.json` (Worker entry) and `dist/client` (assets), and the
repository now ships:

- `npm run deploy` — build + `wrangler deploy`
- `npm run deploy:preview` — build + `wrangler versions upload` (preview URL)
- `npm run preview:cf` — run the real Worker runtime locally
- `.github/workflows/deploy.yml` — deploy on push to `main`, or manually with a
  `preview` / `production` choice, ending in an unauthenticated smoke test
- `npm run check:deploy` — gate that the env contract, routing and deploy
  scripts stay consistent (also runs in CI and before every deploy)
- `.env.example` — the full env contract
- `src/lib/security-headers.ts` — CSP/HSTS/Permissions-Policy applied by the
  server, so they no longer depend on a provider's config file

`vercel.json` was deleted. Its catch-all rewrite to `index.html` came from the
pre-TanStack SPA and would have disabled SSR on any Vercel deploy. Vercel is
still viable as a fallback host — build `npm run build`, no rewrites, headers
already come from the server — and `scripts/check-vercel-config.mjs` stays in
CI in case the file returns.

What is left, and only you can do it:

1. Create the Cloudflare account/Worker (`npx wrangler login`, then
   `npm run deploy` once to create it).
2. Set GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and the
   `VITE_*` values from `.env.example`.
3. Set server secrets on the Worker with `npx wrangler secret put <NAME>` —
   `SUPABASE_SERVICE_ROLE_KEY` at minimum. Audit the live list any time with:
   ```bash
   rg -o "process\.env\['[A-Z_]+'\]|import\.meta\.env\.[A-Z_]+" -r '$0' src supabase | sort -u
   ```
4. Run `npm run deploy:preview` and walk the full app on the preview URL:
   sign-in, booking, intake, admin, OPS, PDF generation, email sending.
5. DNS: lower the TTL on `upsy.ma` / `www.upsy.ma` to 300s **24h before** cutover,
   then repoint to the new host. Keep the Lovable deployment live during the
   switch — it costs nothing and is your rollback.
6. Add both new origins to the Supabase Auth redirect allow-list before cutover,
   or OAuth breaks the moment DNS moves.

**Result:** upsy.ma is served by your host from your repo.

---

## Layer C — Backend ownership (highest risk — rehearse first)

Current state: Lovable Cloud manages a Supabase project (`vuawmihxcaewzmkuarkr`)
holding the database, auth users, storage buckets, and 33 edge functions.

### C.0 — Rehearsal (do not skip)

Run the entire sequence below against a **scratch** Supabase project first. Time
it. Note every manual step. Only then schedule the real cutover.

### C.1 — Create the target project

New Supabase org → new project, same region (EU for GDPR posture), Postgres
version ≥ the source. Note the new project ref.

### C.2 — Schema

```bash
supabase db dump --db-url "$SOURCE_DB_URL" --schema public,storage -f schema.sql
psql "$TARGET_DB_URL" -f schema.sql
```
Then verify: extensions (`pgcrypto`, `pg_net`, `pg_cron`), enums, functions,
triggers, RLS policies, and GRANTs all landed. GRANTs are the usual casualty.

### C.3 — Data

```bash
supabase db dump --db-url "$SOURCE_DB_URL" --data-only -f data.sql
psql "$TARGET_DB_URL" -f data.sql
```
Order matters if FKs are enforced; dump preserves it. Verify row counts table by
table.

### C.4 — Auth users

`auth.users` cannot be moved with a plain dump — password hashes and identities
need the Auth Admin API or a supported `auth` schema dump. Options:

- **Preferred:** `supabase db dump --schema auth` from the source and restore,
  which preserves hashes so nobody has to reset a password.
- **Fallback:** export users, recreate via the Admin API, and force a password
  reset for email/password users. OAuth users re-link on next sign-in.

Verify `user_roles` still maps correctly — the admin account
(`mehdifelji@gmail.com`) must retain the `admin` role.

### C.5 — Storage

Buckets and their policies come from the `storage` schema dump. Objects do not —
copy them:
```bash
# for each bucket: user-documents, email-assets, ...
supabase storage cp -r "ss://<bucket>" ./backup/<bucket> --experimental
supabase storage cp -r ./backup/<bucket> "ss://<bucket>" --experimental
```
Re-check that private buckets are still private after restore.

### C.6 — Edge functions

All 33 live in `supabase/functions/`. Deploy to the new project:
```bash
supabase link --project-ref <NEW_REF>
supabase functions deploy --no-verify-jwt=false
```
Re-create every secret they read (`RESEND_API_KEY`, `LOVABLE_API_KEY`, cron
secrets, note-encryption keys, etc.):
```bash
supabase secrets set --env-file ./functions.env
```
**The note-encryption key must be copied exactly** or every encrypted clinical
note becomes unreadable. Verify a decrypt round-trip before decommissioning the
source.

### C.7 — Scheduled jobs

`pg_cron` schedules do not travel with a data dump. Re-create each one and point
its URL at the new host:
```sql
SELECT cron.schedule('ops-task-watcher', '*/15 * * * *', $$ ... $$);
```
Known jobs: `ops-task-watcher`, `session-reminders-cron`,
`anamnesis-reminder-cron`, `process-email-queue`.

### C.8 — Manual reconfiguration

These never migrate and must be redone by hand:

| Item | Where |
|------|-------|
| Google OAuth client ID/secret | Google Cloud Console → new callback URL |
| Apple sign-in key | Apple Developer → new service ID + return URL |
| Resend sending domain | Resend dashboard → re-verify DNS for the new project |
| Auth redirect allow-list | Supabase Auth settings |
| Site URL | Supabase Auth settings |
| Email templates / auth hook | Re-point the auth email hook to the new function URL |
| Password policy + HIBP | Re-enable; defaults are off |

### C.9 — Cutover

1. Announce a maintenance window (30–60 min based on the rehearsal).
2. Put the app in read-only or maintenance mode.
3. Re-run C.3 (data only) to catch rows written since the rehearsal dump.
4. Swap env vars on the host; redeploy.
5. Smoke test: sign in, book, intake, admin dashboard, one email, one PDF, one
   AI call.
6. Keep the source project **paused, not deleted**, for 30 days.

### Rollback

Revert the env vars and redeploy. The source project still holds everything as
of the maintenance window. This is why step C.9.2 exists: no writes land in the
old database after the switch, so rollback is only a config change.

---

## After the exit

- The `.lovable/` folder and Lovable-specific config can stay; they are inert.
- `src/integrations/lovable/` is the OAuth broker. If you move OAuth to your own
  Supabase providers, that module and the `lovable.auth.signInWithOAuth` calls in
  `SocialAuthButtons.tsx` get replaced by `supabase.auth.signInWithOAuth`.
- `LOVABLE_API_KEY` powers the AI features. Keep it, or swap the gateway base URL
  and key for a direct provider account in `supabase/functions/*/index.ts`.
