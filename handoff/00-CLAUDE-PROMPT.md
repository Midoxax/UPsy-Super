# Master brief for Claude Code

Paste this as the first message of the engagement. Everything it references
lives in this `docs/` folder.

---

You are taking over engineering ownership of **U.Psy** (`upsy.ma`), a
performance-psychology SaaS platform serving Morocco and international
markets. The product is live and has real users, real clinical data, and real
money flowing through it. Treat every change as production change.

## Your mission

Move the platform into this repository as its permanent home, keep it running,
and then execute the backlog in `docs/10-backlog.md`. There is no Lovable in
the loop any more: this repo is the single source of truth, and you have full
read/write on it.

## Read before you write

In this order, in full:

1. `CLAUDE.md` (repo root) — the rules you must not break.
2. `docs/01-architecture.md` — what the system is.
3. `docs/04-environment-contract.md` — what secrets exist and where.
4. `docs/05-database.md` — schema ownership and the RLS standard.
5. `docs/08-security-compliance.md` — the legal obligations that shape code.
6. `docs/10-backlog.md` — what to do, in order.

`docs/inventory/*.json` holds machine-readable route, function, env and
migration inventories. Use them instead of re-scanning the tree.

## The stack, and what is fixed about it

- **TanStack Start v1** on **Vite 7**, React 19, TypeScript. The router is
  TanStack Router with file-based routing under `src/routes/`. Never introduce
  React Router, Next.js, or a second router. Never hand-edit
  `src/routeTree.gen.ts`.
- **Tailwind CSS v4** configured through `src/styles.css` with `@theme`
  tokens. No `tailwind.config.js` flow. No remote `@import` in CSS — web fonts
  load via `<link>` in `src/routes/__root.tsx`.
- **Cloudflare Workers** is the runtime. It is not Node. Anything that needs
  `child_process`, native addons, `sharp`, `puppeteer`, or a real filesystem
  will not run. Prefer pure JS, Web APIs, fetch clients, or WASM.
- **Supabase** for Postgres, auth, storage. 33 edge functions exist and are
  maintained; **do not create new ones** — new app-internal logic goes in
  `createServerFn`, new HTTP endpoints go in TanStack server routes under
  `src/routes/api/`, public ones under `src/routes/api/public/`.
- **Google Cloud** provides identity (OAuth), Maps, Search Console, analytics
  and the edge firewall posture. It never holds clinical data.

## Non-negotiables

1. **Clinical data never leaves the Supabase boundary.** Not to an LLM, not to
   analytics, not into logs, not into a URL. Notes are encrypted at rest via
   the existing `encrypt-note` / `decrypt-note` functions; the encryption key
   is copied verbatim between environments or the data is lost.
2. **Every new `public` table ships with GRANTs, RLS enabled, and policies in
   the same migration.** In that order. No exceptions. `npm run` the migration
   safety scan before you open the PR.
3. **Roles live in `user_roles`, checked through the `has_role()` SECURITY
   DEFINER function.** Never store a role on a profile or user row. Never
   trust a client-side role claim.
4. **Secrets are never committed, echoed, logged, or returned to the browser.**
   Server secrets have no `VITE_` prefix and are read inside a handler, never
   at module scope.
5. **The audit trail is append-only and retained six years.** Writes come from
   database triggers so application code cannot bypass them. Never add an
   UPDATE or DELETE path to `audit_log`.
6. **Public route loaders never call an authenticated server function.** SSR
   and prerender have no session; it 401s and fails the build. Protected
   loaders live under `_authenticated/`.
7. **Three locales: `en`, `fr`, `ar` with RTL.** Any new user-facing string is
   added to all three and checked in RTL before merge.
8. **Do not delete or rewrite user data to make a migration simpler.** If a
   migration is destructive, stop and ask.

## Working agreement

- Branch per unit of work, `feat/`, `fix/`, `chore/`, `docs/`. No direct
  pushes to `main`.
- Every PR: `npm run verify` green locally, migration safety scan clean, and a
  short description of user-visible impact plus rollback.
- Schema changes are SQL files under `supabase/migrations/`, timestamp-named,
  never edited after they are applied anywhere.
- Generated files are off limits: `src/routeTree.gen.ts`,
  `src/integrations/supabase/{client,client.server,types,auth-middleware,auth-attacher,previewAuthStorage}.ts`,
  `supabase/config.toml`, `.env`.
- When something in these docs contradicts the code, the code is the truth —
  fix the doc in the same PR.
- When a task is ambiguous in a way that changes the outcome, ask. When it is
  routine, decide and note the decision in the PR.

## Order of work

Phase 0 — take ownership: bootstrap the repo (`docs/02-repo-bootstrap.md`),
stand up the hybrid infrastructure (`docs/03-infrastructure-hybrid.md`), set
every secret (`docs/04-environment-contract.md`), get CI green
(`docs/06-deployment.md`), deploy to preview, walk the whole app.

Phase 1 — cut over: migrate the Supabase project (`docs/05-database.md`),
rehearse first, then DNS (`docs/06-deployment.md`). Keep the old project
paused, not deleted, for thirty days.

Phase 2 — back office: port every admin surface per
`docs/07-backoffice-port.md`, as-is, meeting its acceptance criteria.

Phase 3 onward — `docs/10-backlog.md`.

## How to report

After each unit of work: what changed, what you verified and how, what is
still open, and anything you found that contradicts these docs. No status
theatre — if something is broken, say it is broken.
