# Phase 5 — Data Strategy & Model Training

You want to gather clinical, marketing, and supervision data, and eventually
train models on psychologist performance. Some of that is straightforward. Some
of it is only lawful under conditions that must exist *before* collection starts.

This runbook is deliberately conservative. It documents the conditions, not a
green light.

## The one rule that governs everything

**Clinical content never leaves the boundary and never trains anything without
separate, explicit, revocable consent from the data subject.**

Health data is special-category under GDPR (art. 9) and sensitive under Loi
09-08. Consent to receive care is *not* consent to be used as training data. They
are separate purposes and need separate records in `crm_consents`.

## Three data estates

```text
┌─ CLINICAL (C1) ──────────────────────────────┐
│ notes, anamnesis, screenings, journals       │
│ encrypted at rest │ specialist+patient only  │
│ never exported, never modelled without       │
│ explicit research consent + ethics approval  │
└──────────────────────────────────────────────┘
┌─ OPERATIONAL (C2/C4) ────────────────────────┐
│ bookings, attendance, durations, outcomes    │
│ scale scores, cancellations, response times  │
│ pseudonymised, aggregable, modellable        │
└──────────────────────────────────────────────┘
┌─ COMMERCIAL (C3) ────────────────────────────┐
│ leads, quiz results, campaign events, traffic│
│ consent-gated for marketing, freely analysed │
│ in aggregate                                  │
└──────────────────────────────────────────────┘
```

Enforce this in the schema, not in a policy document: separate tables, separate
policies, no view that joins C1 content to C3.

## Marketing & business analytics (do this now)

Fully available today, no extra consent beyond what Phase 2 records:

- Funnel conversion by source, cluster, and locale.
- Booking → attendance → repeat rate.
- Specialist utilisation and time-to-first-response.
- Revenue by pipeline and cohort.

Build them as materialised views refreshed nightly, exposed only to admins. Never
join a person's clinical content into these — aggregate metadata is enough for
every business question worth asking.

## Supervision & performance data (conditions apply)

The ambition — measuring and improving psychologist performance — is legitimate
and is what would make U.Psy genuinely different. It is also the highest-risk
data work here, because a "performance score" attached to a named professional is
personal data about them, and the inputs derive from patients.

Conditions that must all hold before collection:

1. **Specialist consent.** Their own agreement (Phase 3) must state explicitly
   what is measured, how it is used, who sees it, and that it does not
   automatically drive accreditation or delisting decisions. GDPR art. 22 limits
   solely-automated decisions with significant effects.
2. **Patient consent for outcome data.** Outcome scales tied to a specialist are
   patient data. Either collect with explicit research consent, or aggregate at a
   threshold (≥ 10 patients) so no individual is identifiable.
3. **Ethics review.** An independent reviewer — not you — signs off on the
   protocol. For a platform positioning itself clinically, an informal review
   board is a credibility asset as much as a compliance one.
4. **Pseudonymisation at source.** The analysis dataset holds surrogate keys; the
   mapping lives in a separate, admin-only table with its own audit trail.
5. **Purpose limitation.** A dataset gathered for supervision quality cannot be
   repurposed for marketing or for a commercial model later. Record the purpose
   at collection; enforce it in code.

Safe first version:

| Signal | Source | Identifiability |
|--------|--------|-----------------|
| Session attendance / cancellation rate | bookings | specialist-level |
| Time to first response | messages | specialist-level |
| Patient-reported change (GAD-7/PHQ-9 delta) | screenings | aggregated, n≥10 |
| Supervision hours completed | training records | specialist-level |
| Peer-review scores | supervision module | specialist-level |

That already supports meaningful supervision without touching note content.

## Training an LLM (later, conditionally)

If it ever happens, these are non-negotiable:

- **Never** train on note content, journal entries, or session transcripts
  without individual explicit consent from every data subject in the corpus.
  Blanket terms-of-service consent does not qualify.
- **Never** send C1 data to a third-party model API. The DPA table in Phase 1
  lists which vendors may receive what — for AI providers the answer is C3 only.
- A realistic first corpus: published educational content, anonymised case
  vignettes written for teaching (not real records), supervision transcripts
  where every participant consented, and public clinical literature.
- Memorisation is the failure mode: models regurgitate training data. In health
  data, one regurgitation is a reportable breach.
- Document a model card: data sources, consent basis, intended use, limitations,
  and evaluation. Without it the model cannot be defended to a regulator or a
  professional body.

Interim path that carries almost none of this risk: retrieval over your own
published and consented content, with the model never seeing raw clinical data.
That delivers most of the product value now.

## Consent records for research

Extend `crm_consents` with research purposes, each recorded separately:

```
purpose = 'research_outcomes'      -- outcome data in aggregate studies
purpose = 'research_training_data' -- content usable for model training
purpose = 'supervision_metrics'    -- specialist performance measurement
```

Each needs: the exact wording shown, the version, the timestamp, and a working
withdrawal path. Withdrawal must remove the person from future datasets, and the
runbook must state what happens to models already trained — the honest answer is
usually "retrained at the next cycle", which is why the cycle must be defined
before the first model exists.

## Deliverables

- [ ] Three estates separated in schema; no C1↔C3 join path exists
- [ ] Nightly aggregate views for business analytics
- [ ] Specialist agreement amended with measurement clauses
- [ ] Research consent purposes + withdrawal path in `crm_consents`
- [ ] Ethics reviewer identified and protocol written
- [ ] Pseudonymisation layer with its own audit trail
- [ ] Written decision, dated, on whether model training proceeds — and if not
      yet, what would have to be true
