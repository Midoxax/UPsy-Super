# U.Psy — Operating Model Architecture

Status: **proposal.** This is not a software design. It is the operating model
U.Psy should run on, and the system architecture that follows from it.

The premise: **architecture is org design made durable.** Conway's Law is not a
warning, it is a planning tool. A system will end up mirroring the
communication structure of the organisation that builds it, so the honest move
is to decide the organisation first and let the architecture follow.

---

## 1. First, the uncomfortable part

The brief assumes 50 engineers, 20 psychologists, 10 researchers, 5 AI
engineers, 3 DevOps, and 2 mobile teams. The repository today is a single
codebase with one deployment target and no module ownership.

**These are different companies.** Architecture that is correct for 90 people
is actively harmful at 10: six deployable surfaces with six on-call rotations
will crush a small team, and premature service boundaries calcify before anyone
knows where the real seams are.

So this document does two things and keeps them separate:

- **Sections 2–7: the target.** The operating model at the stated scale.
- **Section 8: the transition.** What is safe to build *now*, at current size,
  such that it becomes the target rather than blocking it.

Everything in the target is designed so that the small-team version is a
**subset**, not a different system. Nothing here requires a rewrite to grow
into.

---

## 2. Business capability map

Capabilities exist whether or not software exists. They are what the company
*does*, and they change on the order of years — which is exactly why they, not
pages or routes, are the right thing to draw boundaries around.

### Value-creating capabilities (the product)

| Capability | Business question it answers |
|---|---|
| **Identity & Access** | Who is this, and what may they see? |
| **Matching** | Which specialist fits this person? |
| **Care Delivery** | How does a session happen and get recorded? |
| **Clinical Safety** | How do we detect and escalate risk? |
| **Learning** | How do people build skills and get certified? |
| **Research** | How do we learn from aggregate outcomes, safely? |
| **Community** | How do people support each other between sessions? |

### Commercial capabilities (the business)

| Capability | Business question it answers |
|---|---|
| **Demand & Growth** | How do we find and convert clients and partners? |
| **Partner Lifecycle** | How does an enterprise, university, NGO, federation or government become and stay a customer? |
| **Supply & Credentialing** | How do we recruit, verify and retain psychologists? |
| **Billing & Revenue** | Who owes what, in which currency, under which contract? |
| **Compliance & Governance** | How do we prove we did the right thing, to a regulator? |

### Platform capabilities (the enablers)

| Capability | Business question it answers |
|---|---|
| **Tenancy & Provisioning** | How does a new deployment come into existence? |
| **Integration Spine** | How do systems learn what happened? |
| **Insight** | What is true about the business right now? |
| **AI Services** | How is model capability delivered and governed? |
| **Developer Platform** | How does an engineer ship safely? |

**Twenty capabilities.** Not twenty services and not twenty teams — the mapping
is deliberate and comes next.

---

## 3. Team topology

Applying Team Topologies to the stated headcount. Four team types, and the
distinction between them is what stops a platform team from becoming a ticket
queue.

### Stream-aligned teams (own a slice of customer value, end to end)

| Team | Owns | Size |
|---|---|---|
| **Care** | Matching, Care Delivery, Clinical Safety | 8 |
| **Growth** | Public surface, Demand, conversion | 6 |
| **Partners** | Partner Lifecycle, org portal, contracts | 6 |
| **Supply** | Credentialing, specialist portal, payouts | 5 |
| **Learning** | Courses, certification, community | 5 |
| **Mobile — Client** | Patient app | 5 |
| **Mobile — Specialist** | Specialist app | 5 |

### Platform teams (internal products with internal customers)

| Team | Owns | Size |
|---|---|---|
| **Core Platform** | API contract, tenancy, identity, event backbone | 6 |
| **Data & Insight** | Warehouse, pipelines, CRM sync, reporting | 4 |

### Enabling teams (raise capability, then leave)

| Team | Owns | Size |
|---|---|---|
| **AI** | Gateway, model governance, clinical AI safety | 5 |
| **DevOps / SRE** | Delivery, observability, incident response | 3 |

### Complicated-subsystem team

| Team | Owns | Size |
|---|---|---|
| **Clinical Systems** | Encryption, research anonymisation, regulatory evidence | 2 + embedded clinicians |

**Non-engineering functions and where they attach:**

- **20 psychologists** — not an engineering team. They are the *clinical
  authority*, embedded into Care and Clinical Systems as domain experts, and
  they own clinical protocol content as a product with its own release process.
- **10 researchers** — consumers of the Research capability, not builders of
  it. They need a governed data product, not database access.

### The interaction rule

Stream-aligned teams should not need to talk to each other to ship. Where they
do, that is a boundary drawn in the wrong place. Platform teams expose
**self-service contracts**, not tickets — the moment Core Platform becomes a
request queue, every stream team's velocity is capped by its backlog.

---

## 4. Systems follow teams

Each stream team owns a **domain** with its own data, its own API surface, and
its own deployable client. One team may own several capabilities; **no
capability is owned by two teams.**

```
                    ┌─────────────────────────────┐
                    │      Integration Spine      │
                    │   (event backbone, §5)      │
                    └──────────────┬──────────────┘
        ┌──────────┬───────────┬───┴────┬──────────┬──────────┐
        │          │           │        │          │          │
   ┌────▼───┐ ┌────▼────┐ ┌────▼───┐ ┌──▼─────┐ ┌──▼──────┐ ┌─▼────────┐
   │  Care  │ │ Growth  │ │Partners│ │ Supply │ │Learning │ │ Clinical │
   │        │ │         │ │        │ │        │ │         │ │ Systems  │
   └────┬───┘ └────┬────┘ └────┬───┘ └───┬────┘ └────┬────┘ └────┬─────┘
        └──────────┴───────────┴─────────┴───────────┴───────────┘
                                │
                  ┌─────────────▼──────────────┐
                  │       Core Platform        │
                  │ identity · tenancy · API   │
                  │ contract · authorization   │
                  └────────────────────────────┘
```

**Domains own their data.** Care does not read Billing's tables; it consumes
Billing's events or calls its API. This is the rule that makes independent
deployment possible, and the one most often broken first.

---

## 5. The integration spine — built now, not later

This is the part the brief is right to insist on, and the part most platforms
get wrong by deferring.

### The failure mode being avoided

The default path: the product is built, then someone needs CRM, so a webhook is
written from booking to HubSpot. Then finance needs revenue, so a script reads
the database nightly. Then partners need reporting, so another job runs. Within
two years there are forty point-to-point integrations, **nobody knows which
systems depend on which tables**, and no schema can change without breaking
something invisible.

That is not a tooling problem. It is the absence of a spine.

### The rule

**Every business event is published exactly once, to one backbone. Every other
system is a subscriber.**

```
Domain services ──publish──▶  EVENT BACKBONE  ──subscribe──▶  CRM
                                     │                        Warehouse
                                     │                        Back-office
                                     │                        Billing
                                     │                        Notifications
                                     │                        Partner webhooks
                                     └──────────────────────▶  Audit log
```

Booking does not know HubSpot exists. It publishes `booking.confirmed`. The CRM
connector subscribes. Replacing HubSpot with Salesforce is one connector, not
forty call sites.

### The event catalogue (illustrative, versioned as a contract)

| Domain | Events |
|---|---|
| Identity | `user.registered`, `user.verified`, `consent.granted`, `consent.withdrawn` |
| Matching | `match.requested`, `match.proposed`, `match.accepted` |
| Care | `booking.confirmed`, `session.completed`, `session.no_show` |
| Safety | `risk.flagged`, `risk.escalated` |
| Supply | `specialist.applied`, `specialist.credentialed`, `specialist.suspended` |
| Partners | `lead.captured`, `contract.signed`, `seat.allocated`, `renewal.due` |
| Billing | `invoice.issued`, `payment.received`, `payout.sent` |
| Learning | `course.completed`, `certificate.issued` |

Events are a **published contract**, versioned like the API. Adding a field is
safe; removing one is a version.

### CRM as a subscriber, never a source of truth

The platform owns the customer record. The CRM holds the *sales view* of it.
When those invert — when the CRM becomes authoritative — the platform can no
longer answer questions about its own customers without a vendor API, and
migration becomes impossible.

**Pipelines to model from day one**, because they are the business:

| Pipeline | Stages |
|---|---|
| **Enterprise / institution** | lead → qualified → pilot → contract → onboarded → renewal |
| **Specialist supply** | applied → screened → credentialed → active → at-risk |
| **Client care** | registered → matched → first session → retained → discharged |
| **Partner health** | seats used, outcomes, satisfaction, renewal risk |

The enterprise pipeline is the one to build first: **universities, NGOs,
government partnerships and sports federations all run through it**, with
different terms but the same shape.

### Back-office ("gestion") as a first-class product

Internal tooling deferred is internal tooling built badly under pressure, then
depended upon forever. The `ops/` console that exists today is the seed of
this. It should be treated as a **product with a team, a roadmap and a UX**,
covering:

- Partner and contract management
- Specialist credentialing workflow
- Clinical safety queue and escalation
- Billing exceptions and reconciliation
- Tenant provisioning
- Support and impersonation **with a full audit trail**

Impersonation on a platform holding clinical records is the single most
dangerous internal feature that will ever be built. Design its audit trail
before its UI.

---

## 6. Multi-party model

Enterprise, universities, NGOs, government and federations are **not five
customer types.** They are one model — *an organisation buying capacity on
behalf of people it does not clinically own* — with different terms.

| Dimension | Varies by partner |
|---|---|
| Who pays | employer, grant, ministry, federation, self |
| Who may see outcomes | aggregate only, never identifiable |
| Data residency | may be legally mandated per country |
| Branding | co-branded through fully white-label |
| Consent model | opt-in vs mandated programme |

**One tenancy model handles all of it**, if `tenant` is a dimension on every
request and every row from the beginning — a JWT claim enforced in RLS
alongside user identity. White-label then becomes configuration, not a fork.

**The non-negotiable invariant:** an organisation may *never* see identifiable
clinical data about its members. Employers see utilisation and aggregate
outcomes; they do not see who attended or what was said. This must be enforced
in the data model, not in a UI toggle, because a UI toggle will eventually be
wrong.

---

## 7. Ownership model

| Capability | Owning team | Accountable for |
|---|---|---|
| Identity & Access | Core Platform | Auth correctness, session security |
| Tenancy | Core Platform | Cross-tenant isolation |
| API Contract | Core Platform | Versioning, deprecation policy |
| Integration Spine | Data & Insight | Event delivery, schema registry |
| CRM & Pipelines | Data & Insight | Sync fidelity, pipeline accuracy |
| Matching, Care, Safety | Care | Clinical outcomes, escalation SLA |
| Public surface, Demand | Growth | Conversion, SEO, first paint |
| Partner Lifecycle | Partners | Onboarding time, renewal rate |
| Credentialing | Supply | Specialist quality, time-to-active |
| Learning | Learning | Completion, certification integrity |
| Clinical encryption, Research anonymisation | Clinical Systems | Regulatory defensibility |
| AI Gateway | AI | Cost, safety, model governance |
| Delivery, Observability | DevOps | Uptime, MTTR, deploy frequency |

Every capability has exactly one accountable team. Where two teams need the
same capability, one owns it and the other consumes a contract.

---

## 8. What to build now, at current size

The target is for 90 people. Building it today would be malpractice. But four
things are **cheap now and extremely expensive later**, and all four are
subsets of the target rather than detours:

### 8.1 Tenancy as a schema dimension — do this first

Add `tenant_id` to the schema and RLS policies **now**, while there are 127
tables rather than 400. Every month deferred adds tables to migrate. This does
not require building white-label; it requires not making it impossible.

**Cost now: weeks. Cost in two years: quarters, with an authorization migration
on live clinical data.**

### 8.2 The event backbone — before the second integration

The moment a second system needs to know that a booking happened, the choice
is: publish an event, or write a webhook. The webhook is faster once and
catastrophic forty times.

Start with a single `platform_events` table and a publisher in each domain. It
does not need Kafka. It needs to **exist before the point-to-point habit
forms.**

### 8.3 The domain layer — the precondition for everything

Business rules currently live in components and edge functions. Extract them
into owned domain modules. This is the M1 milestone from the vision document
and remains the correct first move: it is what lets teams later own domains
rather than folders.

### 8.4 Name the owners now

Even with a small team, write down who owns each capability. Ownership is a
habit, and retrofitting it onto a codebase where everyone owns everything is
the hardest cultural change on this list.

### Explicitly defer

- Separate deployables per surface — until teams exist to own them
- Kafka or a managed event bus — a table and a publisher is correct until volume says otherwise
- Six mobile clients, service mesh, per-domain databases — none of these are load-bearing yet

---

## 9. Decisions required

1. **Is tenancy needed within 24 months?** If yes, §8.1 starts now regardless of everything else. This is the most time-sensitive decision here.
2. **Which CRM?** The connector is replaceable; the *event contract* is not, so the catalogue should be designed before the vendor is chosen.
3. **Does clinical protocol content have a release process?** Twenty psychologists producing content need versioning and review, not a CMS afterthought.
4. **What is the data residency commitment?** Government and university partners will ask, and the answer constrains hosting topology permanently.
5. **Who owns back-office?** If nobody, it will be built by whoever is most annoyed, repeatedly.

---

## 10. Recommendation

The operating model above is the destination. Four things from it should start
now — **tenancy dimension, event backbone, domain layer, named ownership** —
because each is cheap today, expensive later, and a genuine subset of the
target rather than a bet on it.

Everything else waits for the teams that will own it. Building organisational
structure into software before the organisation exists produces the worst of
both: the coordination cost of a large company and the delivery capacity of a
small one.
