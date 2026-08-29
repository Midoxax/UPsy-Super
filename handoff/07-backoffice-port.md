# 7 — Back-office port map

The decision is **port as-is, improve later**. Every surface below already
works in production. The port is done when each one behaves identically in the
new repository against the migrated database.

## Route inventory

| Route | Page | Guard |
|-------|------|-------|
| `/admin` | `src/pages/admin/Dashboard.tsx` | `AdminRoute` |
| `/admin/crm` | `src/pages/admin/CRM.tsx` | `AdminRoute` |
| `/admin/audit` | `src/pages/admin/Audit.tsx` | `AdminRoute` |
| `/admin/finance` | `src/pages/admin/Finance.tsx` | `AdminRoute` |
| `/admin/applications` | `src/pages/admin/Applications.tsx` | `AdminRoute` |
| `/admin/growth-leads` | `src/pages/admin/GrowthLeads.tsx` | `AdminRoute` |
| `/admin/dns` | `src/pages/admin/DnsChecklist.tsx` | `AdminRoute` |
| `/ops/$workspace` | `src/ops/OpsLayout.tsx` + `src/ops/pages/*` | authenticated + workspace membership |

Locale mirrors exist under `/$locale/admin/*` for dashboard, crm, finance,
applications and growth-leads — but **not** for `audit` or `dns`. Either add
the two missing mirrors or drop the mirrors for admin entirely and keep the
back office single-locale. Pick one and be consistent; the current state is an
accident.

All admin routes set `robots: noindex,nofollow` in `head()`. Keep that.

## Surfaces, dependencies, acceptance

### Dashboard — `AdminStats.tsx`, `CommandPalette.tsx`
KPI tiles and a command palette. Depends on reporting RPCs that require
`EXECUTE` grants — a missing grant makes the dashboard silently empty, which
has happened before.
**Accepted when:** every tile renders a non-placeholder number, and the command
palette navigates to each admin surface.

### CRM — `CrmManager.tsx`
Tabs: Contacts, Funnels (`CrmFunnelPanel`), Forecast (`CrmForecastPanel`),
Automations (`CrmAutomationsPanel`), Experiments (`ExperimentPanel`).
Data: `useCrm.ts`, `useCrmOps.ts`. Tables: `contacts`, `deals`, `crm_consents`,
`crm_staff`, `crm_automation_rules`, `crm_notifications`, `crm_email_messages`,
`funnel_events`, `experiment_winners`. RBAC through `crm_staff` role-based RLS.
**Accepted when:** contact list filters and paginates; the funnel panel shows
per-variant and per-UTM conversion plus the Observatoire report; forecast shows
weighted pipeline value; an automation rule fires on a test funnel event and
creates a `crm_notifications` row; the experiment panel shows variant metrics
and a manual promote works; a non-`crm_staff` admin sees the RBAC denial rather
than data.

### Audit — `AuditTrail.tsx` + Operations log tab (`OperationsLogsPanel.tsx`)
Data: `useAudit.ts`, `useAppLogs.ts`. Tables: `audit_log` (append-only),
`app_logs`.
**Accepted when:** audit rows are searchable by actor, record and date range;
CSV export produces the same rows as the on-screen filter; the Operations log
shows deploy and runtime events including ones posted by CI; and an attempt to
UPDATE or DELETE an `audit_log` row is rejected by the database.

### Finance — `FinanceManager.tsx`, `TransactionsTab.tsx`, `SubscriptionsOverview.tsx`, `PricingControl.tsx`
Data: `useFinance.ts`, `usePlatformPricing.ts`, `useSpecialistPayouts.ts`.
Sequential invoice numbering, MAD revenue tracking, auto-entrepreneur ceiling
alert, legal document versioning.
**Accepted when:** invoice numbers stay strictly sequential with no gaps under
concurrent creation; the YTD revenue figure matches a direct SQL sum; the
ceiling alert fires at its threshold; a generated invoice PDF opens and carries
the right branding and legal mentions.

### Applications & accreditation — `ApplicationsTable.tsx`, `AccreditationManager.tsx`, `AccreditationDrawer.tsx`, `AccreditationDocsPanel.tsx`, `AccreditationKpiRow.tsx`, `ApprovalModal.tsx`, `RejectionModal.tsx`, `ProvisioningAuditTab.tsx`
Five-tier accreditation workflow; approval provisions a specialist through the
`provision-psychologist` function and sends email.
**Accepted when:** an application can be approved end to end in a test
environment — account provisioned, role granted, email sent, audit rows
written — and a rejection sends the rejection email without provisioning.

### Growth leads — `GrowthLeads.tsx`
Search by pillar breakdown, CSV export, GTM tracking. Table: `growth_leads`.
**Accepted when:** pillar filters work and the CSV matches the filtered set.

### Users & support — `UserManagement.tsx`, `UserDetailDrawer.tsx`, `SupportInbox.tsx`, `RolePreviewFrame.tsx`, `AdminPreviewProvider.tsx`
Role assignment, per-user detail, ticket inbox, and role preview (viewing the
app as another role).
**Accepted when:** granting and revoking a role writes to `user_roles` and to
`audit_log`; role preview never grants real elevated access, only a rendering
mode.

### Directory & content — `PsychologistDirectory.tsx`, `PsychologistEditDrawer.tsx`, `MatchingRequestsManager.tsx`, `ObservatoireManager.tsx`, `LearningHubManager.tsx`, `CourseEditDrawer.tsx`, `ModuleListEditor.tsx`, `TranslationManager.tsx`, `AnamnesisCopyEditor.tsx`, `BookingDetailDrawer.tsx`, `OrgApplicationsManager.tsx`
**Accepted when:** each editor saves and the change is visible on the public
surface it feeds; translation overrides apply across `en` / `fr` / `ar`
including RTL.

### DNS checklist — `DnsChecklist.tsx`
Static in-app rendering of `docs/06-deployment.md` § DNS cutover.
**Accepted when:** the records shown match the live Cloudflare configuration.

### OPS command centre — `src/ops/`
Landing, Command, Director (AI chat), Events, EventDetail, NewEvent (4-step
wizard), Tasks (Kanban), Preview. Backed by `ops_workspaces`, `ops_events`,
`ops_phases`, `ops_tasks`, the `ops-director` and `ops-generate-protocol`
functions, and the `ops-task-watcher` cron (*/15 min).
**Accepted when:** an event can be created through the wizard with a generated
protocol; tasks move across the Kanban and persist; the Director answers and
can update a task; the watcher cron produces a run entry within 15 minutes.

## Cross-cutting acceptance

- Every admin surface is unreachable without the `admin` role, verified by
  signing in as a non-admin and hitting the URL directly — not by hiding a nav
  link.
- Every read of clinical or personal data from a back-office surface writes an
  `audit_log` row.
- No admin surface is indexable; `robots: noindex,nofollow` on all of them.
- CSV exports never include a clinical free-text field.
- Every panel handles the empty state and the error state without a blank
  screen.

## Deliberately not in scope

Redesigning the back office. The OPS "command centre" visual language and the
product design system remain separate until
`docs/runbooks/06-design-system-consolidation.md` is executed. Do not
half-merge them during the port.
