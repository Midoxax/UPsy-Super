# LSSPM Airtable — Rebuild v2: treasurer and executive board

Base: **LSSPM Association Management System** — `appzYnIb5WmWjUYDg`

v1 (see `AIRTABLE_AMS_BLUEPRINT.md`) made the base *compute* instead of being typed by hand.
This v2 makes it **governable**: it adds the accounting layer Moroccan associations are now
expected to keep, the internal controls that protect the board personally, and the funnel
stages that currently do not exist at all.

Every table ID and field ID below is real, read from the live base. Applying this is
mechanical — no discovery needed.

---

## Why v2 exists — three gaps in the current base

1. **No accounting-code layer.** Morocco issued a dedicated chart of accounts for
   associations — the **PCAOBNL**, *avis n° 23* of the Conseil National de la Comptabilité,
   25 April 2023, updating the 2003 plan. It defines three reporting models by annual
   operating revenue (normal / simplifié / super-simplifié), and expects a *manuel des
   procédures comptables* and audited annual accounts. Today the base cannot produce a
   *rapport financier* or hand an accountant anything but a spreadsheet to re-key.

2. **No controls.** Any single collaborator can mark a payment Verified, and nothing
   records who approved what. Standard nonprofit practice is segregation of duties plus a
   dual-signature threshold above a board-set amount. This is what earns *quitus* at the AG
   and what protects you personally if a figure is ever questioned.

3. **No funnel above the conversion line.** `Members` and `Participants` are both
   post-conversion. There is no prospect, no lead status, no source attribution — so
   "where did this member come from" and "how many leads are stuck unpaid" are
   unanswerable. And `Payment Method` has no card option at all, so there is no online
   payment entry point to funnel *into*.

---

## Part A — Accounting layer (PCAOBNL)

### New table: `Chart of Accounts`
The bridge between LSSPM's operations and your accountant's ledger.

| Field | Type | Notes |
| --- | --- | --- |
| `Account Code` | Single line text | primary — PCAOBNL code, e.g. `7 561` |
| `Label FR` | Single line text | |
| `Class` | Single select | 1 Financement permanent · 2 Actif immobilisé · 3 Actif circulant · 4 Passif circulant · 5 Trésorerie · 6 Charges · 7 Produits |
| `Nature` | Single select | Cotisations · Dons · Subventions · Prestations/formations · Sponsoring · Charges de personnel · Charges externes · Impôts et taxes · Frais financiers · Autres |
| `Model` | Multiple select | Normal · Simplifié · Super-simplifié — which reporting model uses this line |
| `Active` | Checkbox | |
| `Notes` | Long text | when to use it, in plain French, so a non-accountant treasurer picks right |

Seed it with only the codes LSSPM actually uses — 25–40 lines, not the whole plan. An
unused code is a mis-posting waiting to happen.

### Changes to `Payments` (`tblD3YBy65Zg8ko1f`)
- `Account` — link → `Chart of Accounts`, **required in practice**. Set by automation from
  `Nature` (`fld3BfRg2qOcK8xJr`) as a default, overridable by the treasurer.
- `Account Code` — lookup of `Chart of Accounts.Account Code`, so exports carry the code.
- `Approved By` — collaborator. **Must not be the same person as the recorder** (see Part B).
- `Approved At` — date.
- `Bank Transaction` — link → `Bank Transactions` (below).

### Changes to `Expenses` (`tbltwQeFhaiLIIiKP`)
- `Account` — link → `Chart of Accounts`; `Account Code` lookup.
- `Requested By` / `Approved By` — collaborators, must differ.
- `Approval Threshold Exceeded` — formula: `IF({Amount} >= 5000, "Double signature requise", "")`
  (set the 5 000 MAD threshold to whatever the bureau votes; put the number in one place).
- `Bank Transaction` — link.
- `Paid At`, `Payment Method`, `Fiscal Year`.

### New table: `Bank Transactions`
The reconciliation spine. Without it "the bank says X, Airtable says Y" is unanswerable.

`Statement Ref` (primary) · `Date` · `Label` (as printed by the bank) · `Debit` ·
`Credit` · `Bank Account` (link → `Bank Accounts`) · `Payment` (link) · `Expense` (link) ·
`Income` (link) · `Matched` (formula: linked to something and amounts agree) ·
`Statement Month` · `Imported At` · `Notes`

Monthly close = the *Non rapprochés* view is empty. That is the whole job, and it becomes a
five-minute check instead of an evening.

### New table: `Bank Accounts`
`Name` (primary) · `Bank` · `RIB / IBAN` (restrict field permissions) · `Type` (Courant,
Épargne, Réserve) · `Signatories` (link → People) · `Opening Balance` · `Current Balance`
(rollup) · `Active`.

### New table: `Fiscal Years`
`Year` (primary) · `Start` / `End` · `Status` (Ouvert, Clôturé, Audité) ·
`Reporting Model` (Normal / Simplifié / Super-simplifié — derived from total product) ·
`Total Produits` · `Total Charges` · `Résultat` (formula) · `AG Date` ·
`Rapport financier` (attachment) · `Quitus accordé` (checkbox).

Closing a year sets `Status = Clôturé`; a validation view flags any payment or expense
dated inside a closed year, which is how retro-dated edits get caught.

---

## Part B — Internal controls

These are the controls a treasurer is expected to be able to describe at an AG.

1. **Segregation of duties.** The person who *records* a payment must not be the person who
   *approves* it. Enforce with a formula flag on `Payments`:
   `IF({Created By} = {Approved By}, "⚠️ Même personne", "")` surfaced in a
   *Contrôle interne* view the president reviews monthly.
2. **Dual signature above threshold.** Any expense at or above the board-set amount needs
   two signatories from `Bank Accounts.Signatories`. Model it as `Approved By` +
   `Second Approver`, with the formula above refusing to go green until both are filled.
3. **No deletions, ever.** Void, don't delete — a gap in a receipt sequence is the one thing
   an auditor notices. Restrict delete permission to the president; the treasurer voids.
4. **Reserve policy.** A `Bank Accounts` row of type *Réserve*, with a written rule for what
   may draw on it and who authorises. Board-approved, minuted, attached to `Fiscal Years`.
5. **Monthly review.** Executive Dashboard is read by the bureau, not just the treasurer.
   A control nobody looks at is not a control.

---

## Part C — The funnel (currently missing entirely)

### New table: `Leads`
Everything above the conversion line. One row per interested human, before they are anything.

`Lead ID` (primary, `LEAD-YYYY-#####`) · `Full Name` · `Email` · `Phone / WhatsApp` ·
`Source` (Formulaire site, Instagram, LinkedIn, Bouche-à-oreille, Congrès, Partenaire,
Import) · `Campaign` · `Interest` (Adhésion, Formation, Congrès, Bénévolat, Partenariat) ·
`Interested In` (link → Trainings/Workshops/Conferences) ·
`Stage` (Nouveau, Contacté, Qualifié, Inscrit non payé, **Converti**, Perdu) ·
`Lost Reason` (Prix, Date, Pas éligible, Sans réponse, Autre) ·
`Owner` (collaborator) · `Next Action` + `Next Action Date` ·
`Converted To Member` (link → Members) · `Converted At` · `Days In Stage` (formula) ·
`Consent` (checkbox + date — loi 09-08).

**Conversion rule:** a lead is never deleted. When they pay, `Stage = Converti` and
`Converted To Member` links the person. That link is your attribution: it answers "which
source produces paying members", which is the only marketing question worth asking.

### Funnel metrics that fall out for free
On a `Funnel` interface: leads by stage (kanban), conversion rate per source, average days
to convert, value per source (rollup of `Members.Total Paid` through the conversion link),
and *inscrits non payés* — the leak that costs the most and is invisible today.

### Fix the payment entry point
`Payment Method` (`fldRgb8wdJoyb1TkR`) currently offers Cash / Bank Transfer / Cheque /
Other. **Add `Carte (CMI)` and `Carte (Stripe)`** in the UI — the API can edit formulas but
cannot add select choices, and a webhook cannot write a choice that does not exist. Until
this is done there is no online funnel, only a back office.

---

## Part D — What the executive board actually reads

One interface, eight numbers, refreshed live. Resist adding a ninth.

| Metric | Source |
| --- | --- |
| Adhérents actifs | count of `Members` where `Membership State` = Active |
| Adhésions nettes (12 m) | new memberships − lapsed |
| Taux de renouvellement | renewed ÷ due for renewal |
| Trésorerie disponible | `Bank Accounts.Current Balance` less reserve |
| Résultat de l'exercice | `Fiscal Years.Résultat` |
| Impayés | sum of `Registrations.Balance Due` |
| Remplissage moyen | avg `Confirmed Count ÷ Capacity` on upcoming events |
| Satisfaction moyenne | avg survey score, last 12 months |

Separate **Trésorier** interface: encaissements par nature, dépenses à approuver,
non rapprochés, budget vs réel, export annuel.

---

## Part E — Treasurer's operating rhythm

The point of all of the above is that these become checklists, not projects.

**Weekly (10 min)** — approve pending expenses; check *Contrôle interne* view is empty;
check *Inscrits non payés*.

**Monthly (30 min)** — import the bank statement into `Bank Transactions`; clear
*Non rapprochés*; confirm every verified payment has a numbered document; send the bureau
report (automation #6 already built, currently off).

**Annually** — close the fiscal year; produce the *rapport financier* from `Fiscal Years`;
present to the AG; record *quitus*; archive to Drive.

---

## Part F — Application order

Do it in this order; each step only depends on the ones above.

1. `Chart of Accounts` + seed 25–40 PCAOBNL lines used by LSSPM.
2. `Bank Accounts`, `Fiscal Years`.
3. Account/approval fields on `Payments` and `Expenses`.
4. `Bank Transactions` + reconciliation views.
5. `Leads` + funnel views and interface.
6. Manual UI steps: card payment methods, `Seq` autonumber for gapless receipt numbering
   (see v1 §Known gaps — the automation language has no arithmetic, so numbering must be
   an autoNumber field plus a formula).
7. Automations: default account from nature; approval-required alerts; reconciliation
   nag; lead stage reminders; the six already built (currently **off** — review and enable).
8. Interfaces: Executive Dashboard, Trésorier, Funnel.

---

## What still cannot be automated inside Airtable

Honest boundaries, so nothing is promised twice:

- **PDF rendering** of receipts and certificates — needs Make.com, Zapier, or a Docs/Placid
  template. Airtable creates and emails the records; it does not render the PDF.
- **Gateway webhooks** (CMI/Stripe) — need Zapier or Make to land in `Payments`.
- **Sequential numbering** — no arithmetic in the automation expression language; use
  autoNumber + formula instead.
- **Schema changes via Zapier** — Zapier's Airtable actions are record-level only. It can
  create and update records; it cannot create tables, fields, or automations. Use Zapier at
  the edges (payments, WhatsApp, PDFs, Drive) and Airtable automations inside the base.
