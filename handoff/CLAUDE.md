# CLAUDE.md — U.Psy agent rules

This file is loaded by every Claude Code session in this repository. It is the
short, always-on version of `docs/`. When in doubt, read the full docs.

## What this is

U.Psy is a live performance-psychology SaaS: public marketing site, client and
specialist dashboards, clinical tooling, a CRM/back office, and an internal
OPS command centre. Real users, real clinical records, real invoices.

## Stack

TanStack Start v1 · React 19 · TypeScript · Vite 7 · Tailwind v4 ·
Cloudflare Workers · Supabase (Postgres, auth, storage) · Google Cloud
(identity, Maps, firewall, Search Console).

## Directory map

```
src/routes/         file-based routes (172); routeTree.gen.ts is GENERATED
src/pages/          page components, lazy-imported by routes
src/pages/admin/    back-office pages
src/components/     shared UI; components/admin/ is the back office
src/ops/            internal OPS command centre (own theme + layout)
src/hooks/          data hooks; hooks/admin/ for back office
src/lib/            utilities, i18n, analytics, experiments, motion, security
src/integrations/   Supabase + Lovable clients — GENERATED, do not edit
supabase/functions/ 33 edge functions (maintain; never add new ones)
supabase/migrations/ 106 SQL migrations, append-only
scripts/            CI/verification scripts
docs/               the handoff pack
```

## Commands

```bash
bun install
bun run dev            # local dev on :8080
bun run typecheck
bun run test
bun run lint
bun run verify         # the full gate CI runs
bun run check:env      # no secrets leaked to the client bundle
node scripts/check-migrations-safety.mjs   # RLS/GRANT regression scan
bun run deploy:preview # Cloudflare preview URL
```

## Hard rules

1. No second router. No React Router, no Next.js patterns, no `src/App.tsx`
   page switcher. Routes are files under `src/routes/`.
2. Never edit generated files: `src/routeTree.gen.ts`,
   `src/integrations/supabase/*`, `supabase/config.toml`, `.env`.
3. No new Supabase edge functions. App logic → `createServerFn`. HTTP
   endpoints → `src/routes/api/`. Public/webhook/cron → `src/routes/api/public/`
   with signature or bearer verification inside the handler.
4. `CREATE TABLE public.x` is always followed, in the same migration, by
   GRANTs → `ENABLE ROW LEVEL SECURITY` → policies.
5. Roles live in `user_roles`; check with `has_role(auth.uid(), 'admin')`.
   Never a role column on a profile.
6. Secrets: server-only, no `VITE_` prefix, read inside a handler. Never
   logged, never returned to the browser, never committed.
7. Clinical data stays inside Supabase. Never to an LLM, analytics, log line,
   or URL.
8. `audit_log` is append-only. No UPDATE, no DELETE, six-year retention.
9. Public route loaders must not call `requireSupabaseAuth` server functions —
   prerender has no session. Protected loaders go under `_authenticated/`.
10. Cloudflare Workers runtime: no `child_process`, native addons, `sharp`,
    `puppeteer`, or real filesystem. No `Math.random()` / `crypto.randomUUID()`
    / IO at module scope.
11. Browser globals (`window`, `document`, `localStorage`) only in
    `useEffect`, event handlers, `<ClientOnly>`, or behind `useHydrated()`.
12. Three locales `en` / `fr` / `ar`; new strings go in all three and are
    checked in RTL.

## Routing conventions

`createFileRoute("...")` must match the filename exactly: dots become slashes,
`index.tsx` is the leaf, `$param` is dynamic, `$` is a splat, underscore
segments are pathless layouts and still appear in the route id. Every parent
route renders `<Outlet />`. Every content route defines its own `head()` with
a unique title and description.

Public routes are top-level with SSR on and no auth gate. Authenticated routes
go under `src/routes/_authenticated/`. Admin surfaces wrap their component in
`<AdminRoute>`. Locale-prefixed mirrors exist under `src/routes/$locale/` —
when you add a route, add both the bare and the `$locale` variant.

## Commits and PRs

Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
One logical change per PR. Every PR states user-visible impact, how it was
verified, and how to roll it back. `bun run verify` must be green.

## Before you say it works

Read the verification output in full. An exit code of 0 with `Error` in the
output is a failure. For UI, look at the rendered page, not just the build.
For data, query the rows. For security, run the scan.
