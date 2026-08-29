# 9 — Day-two operations

## Monitoring

| Signal | Where | Alert on |
|--------|-------|----------|
| Uptime / SSR health | `GET /api/public/health` probed from ≥2 regions | non-200 twice in a row |
| Worker errors | Cloudflare Workers Logs / Logpush | error rate above baseline |
| Application errors | `app_logs` (via `src/start.ts` and `/api/public/runtime-logs`) | any `error` severity spike |
| Client errors | Sentry, if `VITE_SENTRY_DSN` set | new issue, or regression in a resolved one |
| Database | Supabase dashboard: slow queries, connection saturation, disk | disk > 80 %, sustained slow queries |
| Email | Resend: bounce and complaint rate | bounce > 2 %, complaint > 0.1 % |
| Auth | Supabase auth logs | sign-in failure rate spike (provider outage or misconfigured redirect) |
| Cron | job run rows | a job that has not run within 2× its interval |
| Cost | Cloudflare, Supabase, Google Cloud budget alerts | 50 / 80 / 100 % of cap |

The admin **Operations log** tab (`OperationsLogsPanel.tsx`) is the in-app view
of `app_logs`, searchable with CSV export. CI posts deploy and security-scan
events into the same stream via `/api/public/ci-events`, so a deploy, a scan
result and a runtime error all appear on one timeline.

## Cron inventory

| Job | Schedule | What it does | Failure impact |
|-----|----------|--------------|----------------|
| `ops-task-watcher` | */15 min | advances OPS tasks, raises overdue flags | OPS board goes stale |
| `session-reminders-cron` | daily | session reminder emails | clients miss sessions |
| `anamnesis-reminder-cron` | daily | intake completion nudges | intake completion drops |
| `process-email-queue` | frequent | drains the outbound email queue | **all transactional email stops** |
| `home-hero-auto-promote` | daily 04:17 UTC | promotes a winning hero variant | experiment runs longer than needed |

`process-email-queue` is the one whose silence is expensive and invisible.
Alert on it explicitly.

## Log retention

| Store | Retention | Why |
|-------|-----------|-----|
| `audit_log` | 6 years | legal obligation; append-only |
| `app_logs` | 90 days | operational debugging |
| Cloudflare Workers logs | 30 days | provider default |
| Sentry | per plan | client errors |

Never put clinical content, personal identifiers, or secrets in a log line.
Log identifiers you can join back to a record, not the record.

## Backups and restore drills

- Supabase: daily automated backups plus point-in-time recovery.
- **Drill quarterly.** Restore into a scratch project, verify row counts on the
  ten largest tables, and verify a clinical note decrypt round-trip. A backup
  you have never restored is an assumption.
- Before any destructive migration: take an on-demand backup and note the
  restore point in the PR.
- Storage objects are not covered by the database backup. Snapshot the
  `user-documents` bucket separately.

## Release cadence

- Merge to `main` deploys to production automatically.
- Anything touching migrations, auth, payments or clinical paths goes to
  preview first and is walked by hand.
- No deploys on a Friday afternoon unless it is fixing something worse.

## On-call checklist

When something is reported broken:

1. `GET /api/public/health` — is the app up at all?
2. Cloudflare dashboard — errors, or a WAF rule blocking legitimate traffic?
3. Supabase dashboard — database up, connections available, no incident?
4. Admin Operations log — what does `app_logs` say, and when did it start?
5. Recent deploys — if the timing lines up, roll back first
   (`.github/workflows/rollback.yml`) and diagnose after.
6. If data may be exposed, switch to the incident runbook in
   `docs/08-security-compliance.md` immediately.

## Quarterly review

- Access review: who still needs `admin`, `crm_staff`, Cloudflare, Supabase,
  Google Cloud, GitHub. Revoke the rest.
- Secret rotation for everything on a 90-day cycle.
- Dependency audit and Dependabot backlog clear-down.
- Restore drill.
- Cost review against the budget caps.
- Doc drift: does `docs/` still describe the system? Regenerate
  `docs/inventory/*.json` and reconcile.
