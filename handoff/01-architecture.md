# 1 — Architecture (as built)

Facts in this document come from reading the repository on 2026-08-29. The
machine-readable form is in `inventory/`.

## Shape of the system

```text
                    ┌──────────────────────────────────────────┐
   browser  ──TLS──▶│ Cloudflare Worker (SSR + static assets)   │
                    │  TanStack Start server entry, src/server  │
                    │  security headers (src/lib/security-...)  │
                    └───────┬───────────────────────┬───────────┘
                            │ createServerFn RPC    │ /api/public/* routes
                            │ (bearer attached)     │ (bearer / HMAC verified)
                            ▼                       ▼
                    ┌──────────────────────────────────────────┐
                    │ Supabase                                  │
                    │  Postgres + RLS   auth   storage   pg_cron│
                    │  33 edge functions (email, AI, PDFs, ops) │
                    └───────┬───────────────────────┬───────────┘
                            │                       │
                     Resend (email)        Lovable AI gateway
                            │                       │
   Google Cloud ────────────┴───────────────────────┘
     OAuth identity · Maps · Search Console · Analytics/GTM · firewall
```

## Numbers

| Thing | Count |
|-------|-------|
| Routes | 172 (131 public, 29 authenticated, 12 admin) |
| API routes | 5, all under `/api/public/` |
| Edge functions | 33 |
| Migrations | 106, creating ~150 distinct tables |
| Environment variables | 33 |
| Runtime dependencies | 75 |

## Frontend

**Routing.** File-based under `src/routes/`. Routes are thin: they declare
`head()` metadata, wrap in `PageTransition` and a guard component, and
lazy-import the real page from `src/pages/`. Example:

```tsx
const AdminCRM = lazy(() => import("@/pages/admin/CRM"));
export const Route = createFileRoute("/admin/crm")({
  head: () => ({ meta: [ /* title, description, robots noindex */ ] }),
  component: () => <AdminRoute><PageTransition><AdminCRM /></PageTransition></AdminRoute>,
});
```

**Locale mirroring.** Every user-facing route exists twice: bare (`/psychologists`)
and locale-prefixed (`/$locale/psychologists`). `src/contexts/LocaleContext.tsx`
owns `<html lang>` and `dir`, and `src/lib/i18n/` holds copy modules
(`homeCopy`, `heroVariants`, `observatoireCopy`). Arabic is RTL and uses a
dedicated font stack.

**Design language.** Tailwind v4 tokens in `src/styles.css`. Public and
marketing surfaces run `.marketing-night` (deep burgundy canvas, gold accent,
ivory text); app dashboards stay light. Headings use a serif display face,
body a humanist sans, numerals a mono. The OPS module has its own theme in
`src/ops/ops-theme.css` — a cyan-on-black "command centre" language that is
deliberately separate from the product design system. Motion primitives live
in `src/lib/motion/`; `three` / `@react-three/fiber` power the marketing hero
only.

**State.** TanStack Query for server state, Zustand stores for the assessment
and intent engines (`src/stores/`), React context for auth, locale, theme.

## Backend boundaries

Three distinct server-side surfaces, and they are not interchangeable:

1. **`createServerFn`** — app-internal RPC. Lives in `*.functions.ts` under
   `src/lib/`. Authenticated variants use `.middleware([requireSupabaseAuth])`
   and receive `context.supabase` scoped to the caller. This is where new
   server logic goes.
2. **TanStack server routes** — raw HTTP, under `src/routes/api/`. The five
   that exist are all public and each verifies its caller inside the handler:
   - `/api/public/health` and `/api/public/healthz` — deploy probes, report
     env/config status.
   - `/api/public/runtime-logs` — client error ingest into `app_logs`.
   - `/api/public/ci-events` — bearer-secret ingest of deploy/scan events from
     GitHub Actions.
   - `/api/public/crm-email-events` — email open/click webhook into the CRM.
3. **Supabase edge functions** — 33 legacy Deno functions, maintained but
   frozen. See `inventory/edge-functions.json` for each function's secrets.
   Broad groups:
   - *Email*: `send-transactional-email`, `process-email-queue`,
     `auth-email-hook`, `handle-email-suppression`,
     `handle-email-unsubscribe`, `preview-transactional-email`,
     `send-notification`, `send-rejection-email`, `send-proposal-notification`,
     `notify-intake-trigger`, `notify-proposal-response`, `send-meeting-link`.
   - *Clinical*: `encrypt-note`, `decrypt-note`, `generate-clinical-brief`,
     `session-summary`, `crisis-screening`, `journal-synthesize`.
   - *Matching & onboarding*: `find-matches`, `recommend`, `propose-session`,
     `provision-psychologist`, `verify-application`.
   - *Money & documents*: `create-booking-payment`, `generate-org-invoice`,
     `generate-certificate`, `simulate-payment-webhook`.
   - *OPS*: `ops-director`, `ops-generate-protocol`, `ops-task-watcher`.
   - *Cron*: `session-reminders-cron`, `anamnesis-reminder-cron`,
     `ops-task-watcher`, `process-email-queue`.

## Subsystems worth knowing before you touch anything

**Auth.** Supabase auth, Google and Apple only, email verification mandatory,
HIBP password checks on. Social sign-in currently routes through the Lovable
OAuth broker (`src/integrations/lovable/`, used by `SocialAuthButtons.tsx`) —
this is the one live Lovable dependency and swapping it to
`supabase.auth.signInWithOAuth` is a Phase-0 backlog item. Roles come from
`user_roles` via `has_role()`; `src/hooks/useUserRole.ts` and
`useAdminAuth.ts` are the client-side readers, and `AdminRoute` is the gate.

**CRM.** `contacts`, `deals`, notes, `crm_consents`, `crm_staff` (RBAC),
`crm_automation_rules`, `crm_notifications`, `crm_email_messages`. A
`crm_run_automations()` trigger assigns pipeline stages and notifies owners on
funnel events. Forecasting uses stage probabilities exposed through RPCs.
`crm_consent_evidence()` is a manager-only RPC producing an auditable consent
export. Surfaced by `src/components/admin/CrmManager.tsx` with tabs for
contacts, funnels, forecast, automations and experiments.

**Compliance.** `audit_log` is append-only, enforced by immutability triggers,
six-year retention, admin-read-only. `dsr_submit()` handles GDPR data-subject
requests (export / correct / delete) with every action logged. `app_logs`
carries structured deploy and runtime events, surfaced in the admin Operations
log tab with CSV export.

**Experiments.** `src/lib/experiments/` holds the registry, the SSR variant
resolver, and `promotedWinner()`. `home_hero_winner()` and
`promote_home_hero_winner(_auto)` are database RPCs; a daily 04:17 UTC
`pg_cron` job auto-promotes once a variant clears the confidence threshold.
`ExperimentPanel.tsx` is the admin surface.

**Funnels.** `funnel_events` plus `funnel_metrics` RPCs power per-variant,
per-source and per-UTM conversion reporting, and the end-to-end Observatoire
funnel report.

**OPS command centre.** `src/ops/` — workspaces, events, phases, tasks, an AI
"Director" chat backed by `ops-director`, protocol generation, and a
background `ops-task-watcher` cron. Its own layout, theme and route subtree
(`/ops/$workspace`).

**Finance.** Sequential invoice numbering, revenue tracking in MAD,
auto-entrepreneur ceiling alerts, legal document versioning, payouts. Payments
are direct bank transfer with reference matching — no card processor.

## Known debt, stated plainly

- 157 `SECURITY DEFINER` linter warnings across the schema, pre-existing.
- 102 historical migrations violate the RLS/GRANT standard; they are captured
  in `scripts/migrations-safety-baseline.json` so CI only fails on new ones.
- `/admin/audit` and `/admin/dns` exist only on the bare path — no `$locale`
  mirror.
- The design system is inconsistent across marketing, dashboard and OPS
  surfaces; `docs/runbooks/06-design-system-consolidation.md` has the audit.
- `.lovable/` registers this project as a design-system library, which it is
  not. Drop the folder in the new repo.
- Stray files at root that should not travel: `fill_form.js`, `request.txt`,
  `mem_*.txt`/`.md`, duplicate plan markdown.
