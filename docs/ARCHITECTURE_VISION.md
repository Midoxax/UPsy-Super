# U.Psy — Architecture Vision

Status: **proposal, awaiting approval.** No code changes accompany this
document. It states the architecture U.Psy should have in five years, compares
today's repository against it, and proposes a sequenced migration.

---

## 1. The central thesis

U.Psy is already a platform pretending to be a website.

The repository contains **35 Supabase edge functions**, **93 migrations**,
**127 tables under 413 RLS policies**, AI services (`ai-assistant`,
`ops-director`, `generate-clinical-brief`, `journal-synthesize`), payments
(`create-booking-payment`, `generate-org-invoice`), clinical encryption
(`encrypt-note` / `decrypt-note`), and safety tooling (`crisis-screening`).
That is a service estate, not a marketing site.

But it is consumed as though it were one website. All **78 routes are declared
flat in a single `App.tsx`**, 45 of them at the top level with no surface
grouping. Every edge function is invoked directly from browser code with no
versioned contract in between. There is no boundary anywhere that a second
client — a mobile app, a partner, an enterprise tenant — could attach to.

**The gap is not code quality. It is the absence of contracts.** Everything is
reachable from everything, so nothing can be owned, versioned, replaced or sold
separately. That is the constraint that will bind hardest as the platform
grows, and it is the one this document is about.

---

## 2. Where we actually are

Honest inventory. Strengths first, because they determine what is worth
preserving.

### Genuinely strong

- **Security posture.** 127/127 tables with RLS, 413 policies. Authorization
  lives in Postgres, not in client code. This is the hardest thing here to
  retrofit and it is already done. **Preserve this; build the future on it.**
- **Service granularity.** 35 focused edge functions with clear single
  responsibilities. The decomposition instinct is right.
- **Delivery discipline.** Enforced runtime contract, ratcheting quality gates,
  mutation-verified tests, bundle budgets, browser audit in CI.
- **Data model maturity.** 93 migrations means the schema has been evolved
  deliberately rather than improvised.

### Structurally limiting

| Constraint | Consequence |
|---|---|
| No API contract layer | Mobile apps, SDKs, partners and marketplace all blocked |
| 78 flat routes, one file | No surface can be owned, split, or deployed separately |
| Client-rendered SPA | ~1 MB entry, FCP 3.2s; SEO depends on a static shell |
| Tenancy is per-user, not per-org | Enterprise and white-label deployments blocked |
| Two auth systems | Supabase Auth plus Lovable OAuth for one product |
| Monolithic i18n | All four locales shipped to every visitor |
| No shared domain layer | Business rules live in components and edge functions |

---

## 3. Target architecture (5 years)

### 3.1 Six product surfaces, explicit and owned

Today's 78 flat routes become six addressable surfaces, each with an owner, a
route namespace, an independent bundle, and its own quality budget:

| Surface | Audience | Rendering | Why separate |
|---|---|---|---|
| **Public site** | Prospects, SEO | Server-rendered / static | Only surface where SEO and first paint matter |
| **Client portal** | Patients | Authenticated SPA | Sensitive, never indexed, offline-tolerant |
| **Specialist portal** | Psychologists | Authenticated SPA | Different data gravity; clinical tooling |
| **Organization portal** | Employers, clubs | Authenticated SPA | Multi-seat, billing, reporting |
| **Learning hub** | Learners | Hybrid | Content is indexable; progress is not |
| **Research hub** | Researchers | Authenticated | Aggregate/anonymised data only — hardest privacy boundary |

The point is not folders. It is that **a surface is a deployable unit with a
budget and an owner**, so the marketing site cannot be slowed down by the
clinical dashboard, and a research query cannot accidentally reach identifiable
rows.

### 3.2 A contract layer between clients and services

The decisive change. Today: browser → edge function, directly, untyped across
the wire, unversioned.

Target: **one versioned API surface** (`/api/v1/...`) that every client uses —
web, mobile, partner, SDK — with:

- an **OpenAPI schema as the source of truth**, generating both server handlers
  and typed clients
- **explicit versioning**, so a breaking change is a new version rather than an
  outage
- **domain packages** (`@upsy/domain-booking`, `@upsy/domain-clinical`) holding
  business rules once, consumed by both API and UI
- edge functions retained as the *implementation*, not the *interface*

This single boundary is what unblocks mobile, SDKs, marketplace and enterprise
simultaneously. Everything else in this document is downstream of it.

### 3.3 Tenancy as a first-class dimension

Today an organization is a row. In the target, **tenant is a dimension on every
request**: a `tenant_id` claim in the JWT, enforced in RLS alongside user
identity, so a white-label deployment is configuration rather than a fork.

This is the single highest-leverage schema decision in the document, and the
most expensive to retrofit later. **Every month it is deferred makes it more
expensive**, because every new table without a tenant column is another table
to migrate.

### 3.4 Rendering strategy split by purpose

Not "migrate to Next.js" as an article of faith. The honest position:

- **Public site and learning content**: server-rendered. SEO and first paint
  are the product there, and a 1 MB client bundle is the wrong tool.
- **Authenticated portals**: stay a SPA. They are behind a login, never
  indexed, and benefit from client-side state and offline tolerance. **SSR
  would add cost and complexity for no user-visible gain.**

Resist a full framework migration. Migrate the surfaces where rendering
actually changes outcomes.

### 3.5 AI as a governed service, not scattered calls

Three AI functions exist already. In five years there will be many more, and
they will touch clinical data. Target: a **single AI gateway** owning model
routing, prompt versioning, cost attribution, PII redaction before egress, and
an audit trail of every inference touching patient data.

For a mental-health platform this is a **regulatory requirement in waiting**,
not an engineering nicety.

---

## 4. Gap analysis

| Dimension | Today | Target | Gap |
|---|---|---|---|
| API contract | none | versioned OpenAPI | **Critical** |
| Multi-tenancy | per-user RLS | tenant dimension | **Critical** |
| Surface boundaries | 78 flat routes | 6 owned surfaces | **High** |
| Domain layer | in components | shared packages | **High** |
| Rendering | all SPA | split by purpose | **High** |
| Auth | two systems | one (Supabase) | Medium |
| i18n delivery | all locales always | per-locale | Medium |
| AI governance | direct calls | gateway | Medium |
| Design tokens | partly semantic | fully semantic | Low |
| Delivery pipeline | strong | strong | **None** |

---

## 5. Migration roadmap

Sequenced so each milestone is independently valuable and independently
abandonable. Effort is engineer-months for a small team; treat as order of
magnitude, not estimate.

### M0 — Foundations (1–2 months, low risk)

Finish what is already in flight. No architectural change.

- Split translations per locale (~52 KB gz off critical path)
- Migrate OAuth off Lovable to Supabase Auth
- Resolve the light-mode `--primary` contrast decision
- Extend the browser audit to authenticated surfaces

**Impact:** removes the last external dependency and the known a11y failure.
**Risk:** low. **Prerequisite for:** nothing — do it because it is cheap.

### M1 — Domain extraction (2–3 months, medium risk)

Move business rules out of components and edge functions into shared,
tested `packages/domain-*`. No user-visible change.

**Impact:** the precondition for every later milestone; rules stop being
duplicated between UI and services.
**Risk:** medium — touches everything, visible to nobody, so it needs
discipline to finish. **Mitigation:** one domain at a time, booking first.

### M2 — API contract layer (3–4 months, medium-high risk)

Introduce `/api/v1` with OpenAPI as source of truth. Edge functions become
implementations behind it. Clients migrate endpoint by endpoint.

**Impact:** **unblocks mobile, SDKs, partners and marketplace at once.** The
highest-value milestone in this document.
**Risk:** medium-high — runs dual paths during migration.
**Mitigation:** strangler pattern; old path stays until the new one is proven.

### M3 — Tenancy (2–3 months, high risk)

Add `tenant_id` through schema, JWT claims and RLS policies.

**Impact:** unblocks enterprise and white-label.
**Risk:** **high — this is authorization.** A mistake exposes one
organization's data to another.
**Mitigation:** additive migration, dual-read verification, and an automated
cross-tenant leakage test suite before any cutover. **Do not hand-verify this.**

### M4 — Surface separation (3–4 months, medium risk)

Split the 78 routes into six surfaces with independent bundles, budgets and
owners. Public site moves to server rendering.

**Impact:** FCP on the public site becomes a solved problem; teams stop
contending in one `App.tsx`.
**Risk:** medium — mostly mechanical, but touches routing and SEO.

### M5 — Platform services (ongoing)

AI gateway, analytics pipeline, feature flags, marketplace primitives.

**Impact:** compounding. **Risk:** low individually.

---

## 6. Sequencing rationale

Two orderings are tempting and wrong:

- **Surfaces first** (M4 before M2) is the visible, satisfying work. But
  splitting surfaces before there is an API contract means splitting the
  frontend while every piece still reaches into Supabase directly — you get six
  bundles with the same coupling, and pay the cost twice.
- **Tenancy first** (M3 before M1/M2) is tempting when an enterprise deal
  appears. But adding a tenant dimension while business rules are still spread
  across components means auditing every component for tenant-correctness.
  Domain extraction first makes tenancy a change in a few places.

The proposed order — **rules, then contracts, then tenancy, then surfaces** —
front-loads the invisible work that makes the visible work cheap.

---

## 7. What should NOT be done

Equally important, and where most platform rewrites fail:

- **Do not rewrite the RLS model.** It is the strongest asset in the
  repository. Extend it with tenancy; do not replace it.
- **Do not migrate authenticated portals to SSR.** Cost without user benefit.
- **Do not adopt microservices.** 35 edge functions are already
  well-decomposed. The missing piece is contracts, not more processes.
- **Do not attempt a big-bang rewrite.** Every milestone here is designed to
  ship independently and be abandoned without stranding the codebase.
- **Do not start M2 before M1 is genuinely finished.** A contract layer over
  scattered business rules just relocates the mess.

---

## 8. Decisions required before implementation

1. **Is enterprise/white-label a real 24-month goal?** If yes, M3 moves
   earlier despite the risk. If no, defer it and save 2–3 months.
2. **Is a mobile app planned?** If yes, M2 is the critical path and should
   start immediately after M1.
3. **Who owns each of the six surfaces?** Surface separation without ownership
   recreates the current situation with more folders.
4. **Gold as a text colour** (blocking a11y fix, decided at brand level).
5. **Appetite for invisible work.** M1 and M2 are ~6 months with little
   user-visible change. That has to be an explicit, defended decision or it
   will be abandoned halfway — which is worse than never starting.

---

## 9. Recommendation

Approve **M0 and M1** now. They are low-risk, independently valuable, and M1 is
the precondition for everything else.

Treat **M2 as the strategic bet** — it is what turns U.Psy from an application
into a platform, and nothing about mobile, SDKs, partners or marketplace is
possible without it.

Hold **M3 and M4** until questions 1–3 are answered. Both are expensive and
both are cheap to get wrong in ways that are expensive to undo.
