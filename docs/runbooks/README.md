# U.Psy Runbooks

Executable documentation for taking U.Psy from a Lovable-hosted project to a
fully owned, compliant, revenue-generating platform.

Nothing in this folder changes the running app. Each file is a phase you (or an
agent working directly on the GitHub repo) can execute independently.

## Execution order

| # | Runbook | Why it comes here |
|---|---------|-------------------|
| 0 | [Exit & ownership](./00-exit-and-ownership.md) | Own the code, the hosting, and the database before building on top of them. |
| 1 | [Compliance & audit](./01-compliance-and-audit.md) | The audit log and privacy tiers shape every table added later. Retrofitting is expensive. |
| 2 | [CRM & back channels](./02-crm-and-back-channels.md) | One contact model and one server-side event path for everything that follows. |
| 3 | [Payments & legal](./03-payments-and-legal.md) | Money in, contracts signed, auto-entrepreneur obligations met. |
| 4 | [Growth, SEO & content](./04-growth-seo-content.md) | Traffic to professionals, automated distribution, newsletter. |
| 5 | [Data & training](./05-data-and-training.md) | What may be collected, separated, and eventually used for models. |
| 6 | [Design consolidation](./06-design-system-consolidation.md) | Fix the layouts once, against a settled feature set. |
| 7 | [Clinical training platform](./07-clinical-training-platform.md) | The professional-education product. |

## Checklist

- [ ] Phase 0 — repo on GitHub, app deployed from GitHub, own Supabase project live
- [ ] Phase 1 — audit_log shipped, privacy tiers enforced, subprocessor DPAs signed
- [ ] Phase 2 — CRM tables live, all outbound calls routed server-side and logged
- [ ] Phase 3 — bank-transfer invoicing live, contract set published and versioned
- [ ] Phase 4 — keyword map executed, auto-distribution live, newsletter sending
- [ ] Phase 5 — data classification enforced in schema, consent gates in place
- [ ] Phase 6 — one token set across marketing / app / OPS
- [ ] Phase 7 — first cohort running

## Conventions used in these runbooks

- **Tables** are `public.*` unless stated. Every new table gets GRANTs, RLS, and
  policies in the same migration.
- **Server logic** is `createServerFn` in `src/lib/*.functions.ts`. Webhooks and
  cron targets are TanStack server routes under `src/routes/api/public/`.
- **Nothing sensitive** reaches the browser. If the browser needs it, it is not
  sensitive.
