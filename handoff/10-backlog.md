# 10 — Backlog

Ordered. Each item states what "done" means. Estimates are working days for one
engineer with agent assistance.

## Phase 0 — Take ownership

| # | Item | Est. | Done when |
|---|------|------|-----------|
| 0.1 | Create the repo, apply protections, CODEOWNERS, templates, Dependabot (`docs/02`) | 0.5 | `main` cannot be pushed to directly and CI is a required check |
| 0.2 | Strip the leave-behind set; move `CLAUDE.md` to root, handoff pack to `docs/` | 0.5 | clean tree, `bun run verify` green |
| 0.3 | Cloudflare account, Worker, domains, WAF, rate limits, cache rules (`docs/03`) | 1 | preview deploy reachable, WAF rules active |
| 0.4 | Google Cloud project, IAM, OAuth clients, Maps key with referrer restriction, Search Console, budget alerts (`docs/03`) | 1 | Google sign-in works on preview; Maps key rejects a foreign referrer |
| 0.5 | Set every secret in its correct store; CI names any missing one (`docs/04`) | 0.5 | deploy workflow's secrets step passes |
| 0.6 | CI green end to end, all five workflows | 1 | PR checks pass; rollback rehearsed once |
| 0.7 | Replace the Lovable OAuth broker with `supabase.auth.signInWithOAuth` | 1 | `src/integrations/lovable/` deleted; Google and Apple sign-in work on preview and production |
| 0.8 | Consolidate `SUPABASE_ANON_KEY` onto `SUPABASE_PUBLISHABLE_KEY` | 0.25 | single name across the codebase |

## Phase 1 — Cut over

| # | Item | Est. | Done when |
|---|------|------|-----------|
| 1.1 | Rehearse the full Supabase migration against a scratch project, timed (`docs/05`) | 2 | written timing and a list of every manual step |
| 1.2 | Target project created in EU, schema + data + auth + storage restored | 1 | row counts match; note decrypt round-trip verified |
| 1.3 | Edge functions deployed, secrets set, pg_cron jobs recreated | 0.5 | every cron produces a run entry |
| 1.4 | Manual reconfiguration: OAuth, Apple, Resend domain, redirect allow-list, site URL, auth email hook, password policy + HIBP | 0.5 | each verified by exercising the flow |
| 1.5 | Preview walkthrough of the entire app including `ar` / RTL (`docs/06`) | 1 | checklist complete, no blockers |
| 1.6 | DNS cutover with the 48-hour watch | 0.5 | success signals green; old project paused, not deleted |

## Phase 2 — Back office port

| # | Item | Est. | Done when |
|---|------|------|-----------|
| 2.1 | Dashboard, CRM (5 tabs), Audit + Operations log | 2 | acceptance criteria in `docs/07` met |
| 2.2 | Finance, Applications + accreditation, Growth leads | 2 | as above, including sequential invoice numbering under concurrency |
| 2.3 | Users, support, directory, content and translation editors | 2 | as above, verified in all three locales |
| 2.4 | OPS command centre | 1 | wizard, Kanban, Director and watcher all verified |
| 2.5 | Resolve the `$locale` admin mirror inconsistency (add `audit` + `dns`, or drop admin mirrors) | 0.5 | one consistent convention |
| 2.6 | Negative-path guard test: non-admin hitting every admin URL directly | 0.5 | all rejected server-side, not just hidden in nav |

## Phase 3 — Security remediation

| # | Item | Est. | Done when |
|---|------|------|-----------|
| 3.1 | Review all 157 `SECURITY DEFINER` functions: justify definer rights, set `search_path = public` | 3 | linter warning count reduced to a documented, justified set |
| 3.2 | Remediate baselined migration-safety violations, clinical and personal tables first | 4 | baseline file shrinks; each reduction explained in its PR |
| 3.3 | Sign every subprocessor DPA; record dates (`docs/08`) | — | signed set in one place |
| 3.4 | Verify the DSR portal end to end: export, correct, delete, with retention overrides explained | 1 | each path exercised and logged |
| 3.5 | Penetration test or external review of the auth and RLS surface | — | findings triaged |

## Phase 4 — Product debt

| # | Item | Est. | Done when |
|---|------|------|-----------|
| 4.1 | Design-system consolidation per `docs/runbooks/06` — one token set across marketing, dashboard and OPS | 5 | audit list closed; no surface using an off-token value |
| 4.2 | Accessibility pass: focus states, keyboard reachability, `aria-live` on task flows, RTL verification | 2 | audit clean on the top 20 routes |
| 4.3 | Bundle and performance: 3D scene lazy-loading, dpr caps, route-level splitting | 2 | bundle budget headroom restored; mobile LCP acceptable |
| 4.4 | SEO: unique `head()` on every content route, JSON-LD where applicable, sitemap correctness | 1 | Search Console clean |

## Phase 5 — Roadmap

Per the existing runbooks, unchanged in intent:

| # | Item | Reference |
|---|------|-----------|
| 5.1 | CRM and back-channel completion — server-side event bus, all outbound calls logged | `docs/runbooks/02` |
| 5.2 | Payments and legal — bank-transfer invoicing, reconciliation, contract set with proof of acceptance, auto-entrepreneur tax handling | `docs/runbooks/03` |
| 5.3 | Growth — professional-targeting keyword map, automated social distribution, AI-assisted newsletter with a human approval gate | `docs/runbooks/04` |
| 5.4 | Data and training — clinical/marketing separation enforced in schema, consent gates, de-identification before any dataset work | `docs/runbooks/05` |
| 5.5 | Clinical training platform — courses, cohorts, assessments, supervision hours, certification | `docs/runbooks/07` |

## Standing rules for this backlog

- Nothing in Phase 2 starts before Phase 1 is verified. Porting onto a database
  you have not proven is how you lose a weekend and a clinical note.
- Phase 3.1 and 3.2 are not optional cleanup. They are the difference between
  passing and failing the first serious security review.
- Anything in Phase 5 that touches clinical data goes through
  `docs/08-security-compliance.md` first, not after.
- Contracts and tax treatment need a Moroccan lawyer and accountant to sign
  off. The runbooks prepare the drafts and the checklist; they do not replace
  that review.
