# LSSPM — Association Management System on Airtable

Complete build specification for running **all** LSSPM operations on Airtable:
membership, scientific events, trainings, registrations, payments, receipts,
certificates, CPD tracking, partnerships, volunteers, documents, accounting and
executive reporting.

This is written to be implemented directly — field by field — without relying on
a single Airtable AI one-shot generation. Build it in the phase order given;
each phase only depends on the ones before it.

---

## 0. Ground rules

**Legal frame.** LSSPM is an association under the 1958 Dahir on the right of
association. That drives three payment natures which must never be conflated,
because they produce different documents and different accounting treatment:

| Nature | Document issued | Numbering prefix |
| --- | --- | --- |
| Cotisation (membership fee) | Reçu de cotisation | `REC-COT-YYYY-#####` |
| Formation / event registration | Facture or reçu, depending on how the activity is structured | `FAC-YYYY-#####` / `REC-FOR-YYYY-#####` |
| Don (donation) | Reçu de don | `REC-DON-YYYY-#####` |

Two consequences for the data model:
- `Payment.Nature` is a required single-select and it is the *only* thing that
  decides which document template fires. Never infer it from the amount or the
  linked event.
- Paid training/service revenue is tracked separately from cotisations and dons
  in the accounting rollups, because recurring commercial activity can attract
  VAT/IS obligations even for a non-profit. Keep the line separable from day one
  so your accountant can answer that question without re-keying anything.

**Numbering must be gapless and immutable.** Airtable autonumber is per-table
and never reused, which is what you want. Never delete a payment record — void
it (`Status = Annulé`) and issue a `Credit Note`. A deleted record is a hole in
the sequence, and a hole in the sequence is the one thing an auditor will
actually notice.

**Currency.** All money fields in MAD, 2 decimals. If you take international
card payments, store `Amount Charged` + `Currency` + `Amount MAD` +
`FX Rate` on the payment; report on `Amount MAD` only.

**Naming.** Table names in English (Airtable formulas and API stay sane),
user-facing interface labels in French. Field names English, singular nouns.

---

## Phase 1 — Core CRM

### `People`
One row per human, ever. Members, participants, trainers and volunteers are all
**roles** a person holds, not separate tables. This is the single most important
decision in the base: separate Members/Participants tables guarantee duplicate
humans within a year.

| Field | Type | Notes |
| --- | --- | --- |
| `Full Name` | Formula | `TRIM(First Name & " " & UPPER(Last Name))` — primary field |
| `First Name` | Single line text | |
| `Last Name` | Single line text | |
| `Person ID` | Formula | `"LSSPM-" & DATETIME_FORMAT(Created, "YYYY") & "-" & RIGHT("00000" & Autonumber, 5)` |
| `Autonumber` | Autonumber | hidden |
| `Created` | Created time | |
| `Email` | Email | unique — enforce with a dedupe view, see below |
| `Phone` | Phone | E.164, `+212…` |
| `CIN / Passport` | Single line text | needed on receipts for donations |
| `Date of Birth` | Date | |
| `City` | Single line text | |
| `Country` | Single select | default Maroc |
| `Profession` | Single select | Psychologue clinicien, Psychiatre, Psychologue du travail, Orthophoniste, Étudiant, Autre |
| `Diploma` | Single line text | |
| `Institution` | Link → `Organizations` | |
| `Roles` | Multiple select | Membre, Participant, Formateur, Bénévole, Staff, Donateur, Partenaire |
| `Language` | Single select | FR, AR, EN — drives which email template fires |
| `Photo` | Attachment | |
| `Consent RGPD/Loi 09-08` | Checkbox | + `Consent Date` |
| `Notes` | Long text | |
| **Rollups** | | |
| `Memberships` | Link → `Memberships` | |
| `Membership Status` | Rollup/Formula | see §Membership status formula |
| `Registrations` | Link → `Registrations` | |
| `Events Attended` | Rollup COUNT of registrations where `Attended` | |
| `Total Paid` | Rollup SUM `Payments.Amount MAD` where Status = Payé |
| `Outstanding Balance` | Rollup SUM `Registrations.Balance Due` |
| `Certificates` | Link → `Certificates` |
| `Certificate Count` | Count |
| `CPD Credits (12m)` | Rollup SUM of `Registrations.CPD Credits` filtered to last 12 months |

*Dedupe view:* group by `Email`, filter `Email is not empty`; any group with >1
row is a merge task. Run it weekly — a "Doublons" view in the admin interface
costs nothing and saves you a corrupted member register.

### `Organizations`
Universities, clinics, hospitals, sponsors, institutional partners, suppliers.

`Name` (primary) · `Org ID` (`ORG-YYYY-#####`) · `Type` (Université, Hôpital,
Clinique, Entreprise, ONG, Institution publique, Fournisseur) · `ICE` ·
`RC` · `Address` · `City` · `Country` · `Website` · `Primary Contact`
(link → People) · `Contacts` (link → People) · `Status` (Active/Inactive) ·
`Logo` · `Partnerships` (link) · `Sponsorships` (link) · `Notes`

> Note on the partnership sample data you pasted (Stanford / MIT / Google …):
> that shape maps to `Organizations` + `Partnerships`, with `Sync Status` and
> `Integration URL` living on `Partnerships`, not on the organization. One
> organization can hold several partnerships over time.

### `Partnerships`
`Partnership ID` (primary, `PART-YYYY-#####`) · `Organization` (link) ·
`Title` · `Contact` (link → People) · `Type` (Recherche, Formation,
Sponsoring, Institutionnel, Média) · `Status` (Prospect, En négociation,
Active, Suspendue, Terminée) · `Start Date` · `End Date` ·
`Agreement` (attachment — signed convention PDF) · `Value MAD` ·
`Owner` (collaborator) · `Sync Status` · `Integration URL` · `Renewal Date` ·
`Notes`

### `Memberships`
The subscription period, separate from the person. A person accumulates one row
per year — that is your renewal history and your audit trail.

`Membership ID` (primary, `ADH-YYYY-#####`) · `Member` (link → People) ·
`Category` (Membre actif, Membre associé, Étudiant, Membre d'honneur,
Institutionnel) · `Fee MAD` (from category, see `Fee Schedule`) ·
`Start Date` · `End Date` · `Payment` (link → Payments) ·
`Status` (formula) · `Card Issued` · `Card PDF` (attachment) ·
`Renewal Reminder Sent` (date) · `Year` (formula `YEAR(Start Date)`)

**Membership status formula** (on `Memberships`):
```
IF({Payment Status} != "Payé", "Impayée",
IF(IS_AFTER(TODAY(), {End Date}), "Expirée",
IF(DATETIME_DIFF({End Date}, TODAY(), 'days') <= 30, "Expire bientôt",
"Active")))
```
On `People`, `Membership Status` = rollup MAX of the linked memberships' end
dates, wrapped in the same logic — so a person is "Active" if *any* membership
covers today.

### `Fee Schedule`
Don't hardcode prices in formulas. `Code` (primary) · `Label FR` · `Label AR` ·
`Amount MAD` · `Applies To` (Cotisation / Formation / Atelier / Congrès) ·
`Category` · `Valid From` · `Valid To` · `Active`. Everything that needs a price
looks it up here. Changing the student rate then becomes one cell, not a
formula-hunt across six tables.

---

## Phase 2 — Events

### `Events`
One table for trainings, workshops and conferences — they differ by a
`Type` select, not by schema. Three near-identical tables would triple your
automations for no gain.

| Field | Type | Notes |
| --- | --- | --- |
| `Title` | Single line text | primary |
| `Event ID` | Formula | `"EVT-YYYY-#####"` |
| `Type` | Single select | Formation, Atelier, Congrès, Webinaire, Supervision, Table ronde |
| `Format` | Single select | Présentiel, En ligne, Hybride |
| `Status` | Single select | Brouillon, Publié, Inscriptions ouvertes, Complet, En cours, Terminé, Annulé |
| `Start / End DateTime` | Date with time | Africa/Casablanca |
| `Venue` | Link → `Venues` | |
| `Online Link` | URL | |
| `Trainers` | Link → People (filtered to role Formateur) | |
| `Capacity` | Number | |
| `Price Member / Non-member / Student` | Currency | or link → Fee Schedule |
| `CPD Credits` | Number | credits awarded on attendance |
| `Description FR / AR` | Long text | |
| `Cover Image` | Attachment | |
| `Program` | Attachment | PDF |
| `Materials` | Attachment | sent post-payment only |
| `Certificate Template` | Link → `Templates` | |
| `Registrations` | Link | |
| `Registered Count` | Count of registrations where Status ≠ Annulée |
| `Confirmed Count` | Count where `Payment Status = Payé` |
| `Seats Left` | Formula | `{Capacity} - {Confirmed Count}` |
| `Fill Rate` | Formula | `{Confirmed Count} / {Capacity}` — percent |
| `Revenue` | Rollup SUM of payments |
| `Direct Costs` | Rollup SUM of linked `Expenses` |
| `Margin` | Formula | `{Revenue} - {Direct Costs}` |
| `Attendance Rate` | Formula | attended ÷ confirmed |
| `Avg Satisfaction` | Rollup AVG of `Survey Responses.Score` |

### `Sessions`
For multi-day events. `Session ID` · `Event` (link) · `Title` · `Date` ·
`Start/End Time` · `Speakers` (link → People) · `Room` · `Attendance` (link) ·
`CPD Credits`. Attendance is per-session for accredited programmes; a single
per-event checkbox is not defensible for CPD.

### `Venues`
`Name` · `Address` · `City` · `Capacity` · `Contact` · `Phone` ·
`Daily Rate MAD` · `Equipment` (multi-select) · `Map URL` · `Photos` · `Notes`

---

## Phase 3 — Registration

### `Registrations` — the junction table, and the operational heart
`Registration ID` (primary, `REG-YYYY-#####`) · `Person` (link) ·
`Event` (link) · `Registered At` (created time) ·
`Rate Applied` (Membre / Non-membre / Étudiant / Invité / Gratuit) ·
`Amount Due` (formula from event price × rate) ·
`Payments` (link) · `Amount Paid` (rollup) ·
`Balance Due` (formula `{Amount Due} - {Amount Paid}`) ·
`Payment Status` (formula: Payé / Partiel / En attente / Remboursé) ·
`Status` (Pré-inscrite, Confirmée, Liste d'attente, Présente, No-show, Annulée) ·
`Attended` (checkbox) · `Attendance %` (rollup over sessions) ·
`CPD Credits` (formula: event credits if `Attended` and attendance ≥ 80%, else 0) ·
`Certificate` (link) · `Certificate Eligible` (formula) ·
`Invoice / Receipt` (link → Documents) · `Source` (Formulaire web, Sur place,
Import, Partenaire) · `Dietary / Accessibility Needs` · `Notes`

**Waiting list** is a view, not a table: `Status = Liste d'attente`, sorted by
`Registered At`. The promotion automation reads the top row when a seat frees.

### `Attendance`
`Registration` (link) · `Session` (link) · `Present` (checkbox) ·
`Check-in Time` · `Method` (QR, Manuel, En ligne). QR check-in: the registration
row exposes a `QR Payload` formula (`REG-…` + a short HMAC-ish salt) rendered as
an image via a QR service URL in a formula field, scanned by a staff interface.

---

## Phase 4 — Finance

### `Payments`
Never merge this with Registrations. One registration can take several payments;
one payment can never mean two things at once.

| Field | Type | Notes |
| --- | --- | --- |
| `Payment ID` | Formula | `PAY-YYYY-#####` |
| `Nature` | Single select | **Cotisation / Formation / Don / Autre** — required, drives everything |
| `Person` | Link → People | |
| `Registration` | Link | empty for cotisations and dons |
| `Membership` | Link | empty otherwise |
| `Amount MAD` | Currency | |
| `Amount Charged` / `Currency` / `FX Rate` | for non-MAD gateways |
| `Method` | Single select | Carte (Stripe), Carte (CMI), Virement, Chèque, Espèces, PayPal |
| `Gateway Reference` | Single line text | Stripe `pi_…` / CMI order id — **unique**, this is your idempotency key |
| `Status` | Single select | En attente, Payé, Échoué, Remboursé, Annulé |
| `Paid At` | Date with time | |
| `Document` | Link → `Documents` | the generated receipt/invoice |
| `Document Type` | Formula | Reçu de cotisation / Facture / Reçu de don, from `Nature` |
| `Fiscal Year` | Formula | `YEAR({Paid At})` |
| `Reconciled` | Checkbox | + `Bank Statement Ref` |
| `Refund Of` | Link → Payments (self) | for credit notes |
| `Notes` | Long text |

### `Documents` (receipts, invoices, credit notes)
`Document Number` (primary — generated per type-and-year, see below) ·
`Type` (Reçu de cotisation, Reçu de don, Facture, Avoir) · `Payment` (link) ·
`Person` (link) · `Issue Date` · `Amount MAD` · `Amount in Words FR` ·
`PDF` (attachment) · `Sent At` · `Sent To` (email) · `Void` (checkbox) ·
`Void Reason`.

Numbering formula (per type, per year, gapless via a per-type autonumber
maintained by the generation automation, not by Airtable's global autonumber):
```
{Prefix} & "-" & DATETIME_FORMAT({Issue Date}, "YYYY") & "-" & RIGHT("0000" & {Sequence}, 5)
```
The automation reads the max `Sequence` for that `(Type, Year)` and writes
`Sequence + 1` inside a single scripting step, so two concurrent payments cannot
claim the same number.

### `Expenses`
`Expense ID` · `Date` · `Supplier` (link → Organizations) · `Category`
(Location salle, Restauration, Impression, Honoraires formateur, Transport,
Communication, Frais bancaires, Frais généraux) · `Event` (link, optional) ·
`Amount MAD` · `VAT` · `Payment Method` · `Invoice` (attachment) ·
`Paid` · `Approved By` · `Budget Line` (link → `Budget`)

### `Income` — non-payment revenue
Subventions, sponsoring, in-kind. `Income ID` · `Source` (link → Organizations) ·
`Type` (Subvention, Sponsoring, Don en nature, Autre) · `Amount MAD` · `Date` ·
`Event` (link) · `Agreement` (attachment) · `Received`.

`Payments` + `Income` − `Expenses` is your complete cash picture. Don't let
sponsorships leak into Payments; they are not member transactions.

### `Sponsorships`
`Sponsor` (link → Organizations) · `Event` (link) · `Tier` (Platine, Or, Argent,
Bronze, Partenaire média) · `Amount MAD` · `Deliverables` (long text checklist) ·
`Contract` (attachment) · `Status` · `Invoice` (link → Documents)

### `Budget`
`Line` · `Fiscal Year` · `Category` · `Planned MAD` · `Actual` (rollup from
Expenses/Income) · `Variance` (formula) · `Owner`. This is what turns the
treasurer interface from a ledger into a control panel.

---

## Phase 5 — Administration

- **`Certificates`** — `Certificate ID` (`CERT-YYYY-#####`) · `Person` ·
  `Event` · `Registration` · `Issue Date` · `CPD Credits` · `PDF` ·
  `Verification Code` (formula, random-salted) ·
  `Verification URL` (`https://…/verify?c={Verification Code}`) ·
  `QR Code` · `Revoked` + `Revoke Reason`. The public verification page is a
  read-only Airtable form/interface or a small page on upsy.ma hitting the API.
- **`Templates`** — `Name` · `Kind` (Certificat, Reçu, Facture, Email, Attestation) ·
  `Language` · `File` (Docs/Placid template id) · `Active`. Never inline HTML in
  an automation body; you will want to change a logo without touching logic.
- **`Volunteers`** — `Person` (link) · `Availability` · `Skills` ·
  `Assignments` (link → Tasks/Events) · `Hours Logged` (rollup) · `Status`
- **`Staff`** — `Person` · `Role` (Président, Trésorier, Secrétaire général,
  Chargé de formation, Community manager) · `Start/End Date` · `Access Level`
- **`Tasks`** — `Task` · `Assignee` · `Due` · `Priority` · `Status` ·
  `Event` / `Partnership` / `Registration` (links) · `Blocked By`
- **`Communications`** — `Subject` · `Audience` (view-based segment) ·
  `Channel` (Email, WhatsApp, SMS, Réseaux) · `Sent At` · `Recipients Count` ·
  `Open Rate` · `Template` · `Related Event`
- **`Surveys` / `Survey Responses`** — per-event evaluation, `Score` 1–5,
  free text, feeds `Events.Avg Satisfaction`.
- **`Files`** — statuts, PV d'AG, rapports moraux et financiers, récépissés de
  déclaration, correspondance officielle. `Title` · `Category` · `Year` ·
  `File` · `Confidential` (drives interface visibility).

---

## Phase 6 — Views and interfaces

**Essential views** (create per table, they are what the interfaces sit on):

- People: *Membres actifs*, *Cotisations à renouveler (30j)*, *Expirés*,
  *Formateurs*, *Bénévoles*, *Doublons*, *Sans consentement*
- Events: *À venir*, *Inscriptions ouvertes*, *Complets*, *Terminés sans
  certificats*, *Calendrier* (calendar view), *Rentabilité* (grid, sorted by margin)
- Registrations: *En attente de paiement*, *Paiement vérifié*, *Liste d'attente*,
  *Présents à certifier*, *No-shows*, *Annulations à rembourser*
- Payments: *Non rapprochés*, *Échoués*, *Ce mois*, *Par nature* (grouped),
  *Sans document généré*
- Documents: *À envoyer*, *Envoyés*, *Annulés*
- Expenses: *Non approuvées*, *Par événement*, *Par catégorie*
- Tasks: *Mes tâches*, *En retard*

**Interfaces**

1. **Tableau de bord exécutif** — membres actifs, évolution 12 mois, revenus par
   nature, marge par événement, prochains événements, taux de renouvellement.
2. **Gestion des adhésions** — record-review layout on People, with the
   membership history side panel and a "Relancer" button.
3. **Gestion des formations** — event record page: inscrits, sièges, marge,
   check-in, matériel, certificats.
4. **Inscriptions & check-in** — staff-facing, phone-friendly, QR scan, mark
   present, promote from waiting list.
5. **Tableau de bord finance (trésorier)** — encaissements, impayés, dépenses à
   approuver, rapprochement bancaire, budget vs réel, export annuel.
6. **Portail formateur** — his own sessions, participant list, materials upload,
   evaluation results. Restricted to his own records.
7. **Portail membre** (read-only, shared link or Airtable portal) — statut
   d'adhésion, reçus, certificats, inscriptions à venir.
8. **Partenariats** — pipeline kanban by `Status`, renewal dates, agreements.

---

## Phase 7 — Automations

Airtable-native where possible; Make.com where an external service or PDF is
involved. Every one of these needs an idempotency guard — check a flag field
before acting, set it after — otherwise a re-run duplicates receipts.

| # | Trigger | Actions |
| --- | --- | --- |
| 1 | Form submission (inscription événement) | Find-or-create `People` by email → create `Registration` → if `Amount Due > 0`, create Stripe/CMI payment link → send email with the link → else confirm directly |
| 2 | Stripe/CMI webhook `payment_succeeded` (Make) | Upsert `Payments` **keyed on `Gateway Reference`** → set Payé + `Paid At` → link to registration/membership → set registration `Confirmée` |
| 3 | `Payments.Status → Payé` | Generate the document matching `Nature` (reçu cotisation / facture / reçu de don), claim the next sequence number, render PDF, attach, link, email it, stamp `Sent At` |
| 4 | Registration confirmed | Welcome email in `Person.Language` + Google Calendar invite + materials link + WhatsApp group invite |
| 5 | 7 days / 24 hours before event | Reminder emails, only to `Payment Status = Payé` |
| 6 | Seat freed (cancellation) | Promote top of waiting list → notify → 48h payment window |
| 7 | Payment pending > 72h | Relance 1; > 7 days relance 2; > 14 days auto-cancel and free the seat |
| 8 | Event ends | Send evaluation survey to attendees |
| 9 | `Certificate Eligible` becomes true | Create `Certificates`, render PDF with QR verification, email it, increment CPD |
| 10 | Membership `End Date - 60/30/7 days` | Renewal sequence with a pre-filled payment link |
| 11 | Membership expired | Status flip, remove member pricing, add to *Réactivation* view |
| 12 | New `Expense` | Notify treasurer for approval; on approval, update `Budget.Actual` |
| 13 | Monthly, 1st | Treasurer report: encaissements par nature, impayés, dépenses, solde budgétaire — PDF to the bureau |
| 14 | Quarterly | KPI report: adhésions nettes, événements, taux de remplissage, satisfaction, revenus |
| 15 | Nightly | Data hygiene: duplicate emails, payments without documents, registrations without payment nature, certificates without PDF → task rows |

**Idempotency pattern for #2 and #3** — the two that cost real money when they
misfire:
```
1. Search Payments where {Gateway Reference} = webhook.id
2. If found and Status = "Payé" → stop.
3. Else upsert, then set a `Document Generated` checkbox in the same run.
4. Automation #3 filters on `Document Generated is unchecked`.
```

---

## Stack around the base

- **Stripe** for international cards, **CMI** for Moroccan cards. Both write into
  the same `Payments` table via Make; `Method` distinguishes them. Bank transfers
  and cash get entered manually in the treasurer interface, same table, same
  document flow — one ledger, no exceptions.
- **Make.com** for webhooks, PDF rendering, Google Workspace, WhatsApp.
- **Google Drive** as the PDF store (Airtable attachments as the convenience
  copy, Drive as the durable archive — Airtable attachment URLs expire).
- **Google Calendar** for event invites; **Gmail/Workspace** for transactional mail.
- **Placid / Google Docs templates** for certificates and receipts.

---

## Build order (realistic)

| Week | Deliverable |
| --- | --- |
| 1 | Phase 1 tables + Fee Schedule, import existing members, run the dedupe view |
| 2 | Phases 2–3, one real event configured end to end, registration form live |
| 3 | Phase 4 + automations 1–3: payment → receipt → email working with a 1 MAD test |
| 4 | Automations 4–9, certificates with QR verification |
| 5 | Interfaces 1–5, treasurer trained on the finance dashboard |
| 6 | Phase 5 admin tables, automations 10–15, member and trainer portals |

Do **not** build automations before the relationships are final. Rewiring a
linked field after 30 automations reference it is the single most expensive
mistake available in Airtable.

---

## What to hand Airtable AI

Give it Phase 1 only, as a schema request, with the explicit instruction *"no
automations, no interfaces"*. Then verify every link field by hand before moving
on. Phases 2–5 the same way, one prompt each. Interfaces and automations are
faster built manually than repaired after a one-shot generation.

---

# Implementation log — what is now live in the base

Base: **LSSPM Association Management System** (`appzYnIb5WmWjUYDg`).

The base already had 16 linked tables when this work started — further along than the
earlier Airtable AI error suggested. What it did not have was any computed field, any
automation, and any way to tell a cotisation from a formation payment. Everything below
was added on top of the existing structure; no table was renamed, restructured or deleted.

## Fields added

**Payments** — `Nature` (Cotisation / Formation / Don / Autre), `Document Type` (formula,
derived from Nature), `Paid At`, `Fiscal Year`, `Document Generated` (idempotency guard),
`Amount Confirmed` (formula: zero unless Verified and not refunded), `Member Email` (lookup).

**Registrations** — `Net Amount Due`, `Amount Paid` (rollup of confirmed payments),
`Balance Due`, `Payment State`, `Is Active`, `Is Confirmed`, `Participant Email`,
`Confirmation Sent`.

**Trainings / Workshops / Conferences** — `Registered Count`, `Confirmed Count`,
`Seats Left`, `Revenue` (and `Outstanding` on Trainings).

**Members** — `Total Paid`, `Outstanding Balance`, `Days Until Expiry`,
`Membership State`, `Certificate Count`, `Events Registered`.

Every rollup aggregates `Amount Confirmed`, never raw `Amount`, so an unverified or
refunded payment can never inflate revenue or close out a balance.

## Automations created (all six saved as drafts, switched OFF)

1. **Paiement vérifié → confirmation + horodatage** — emails the payer, stamps `Paid At`,
   closes the `Document Generated` guard.
2. **Relance adhésions arrivant à expiration** — daily 09:00 Casablanca, members expiring
   within 30 days.
3. **Inscription soldée → confirmation participant** — fires on computed `Payment State`,
   syncs the manual status fields, guards against double-send.
4. **Relance hebdomadaire des inscriptions impayées** — Mondays 08:00; weekly, not daily,
   so members are not spammed.
5. **Présence validée + éligible → création du certificat** — creates the linked
   certificate and flips the registration to Issued.
6. **Rapport mensuel du trésorier** — 1st of the month, verified payments and outstanding
   balances as tables.

Airtable saves automations off by design, forcing a human review. Open each one and enable
it after checking the sender address and the treasurer recipient on #6.

## Known gaps — these cannot be done through the API and need a UI edit

1. **Sequential receipt numbering.** The automation expression language has no arithmetic
   functions (no `add`, no `max`), so a running counter cannot be computed in an automation.
   The correct fix is better than an automation anyway: add an **autoNumber** field named
   `Seq` to `Payments` in the UI, then make `Receipt Number` a formula —
   `"REC-" & DATETIME_FORMAT({Paid At},"YYYY") & "-" & RIGHT("0000" & {Seq}, 5)`.
   That is gapless, immutable and needs no automation at all. autoNumber fields cannot be
   created through the API, which is the only reason this is a manual step.
2. **Card payment methods.** `Payment Method` offers only Cash / Bank Transfer / Cheque /
   Other. Add `Carte (Stripe)` and `Carte (CMI)` in the UI — the API can change a field's
   formula but cannot add select choices, and a webhook cannot write a choice that does
   not exist.
3. **PDF rendering** for receipts and certificates still needs Make.com or a Docs/Placid
   template; Airtable automations can create and email the records, not render the PDF.
4. **Members vs Participants remain separate tables.** Merging them is destructive and was
   not done unilaterally — see the Phase 1 rationale above. `Participants.Linked Member`
   is the bridge in the meantime; run a periodic duplicate-email check across both.
