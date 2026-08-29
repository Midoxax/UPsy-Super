# Phase 7 — Clinical Training Platform

The professional-education product: structured training, supervision, and
certification for psychologists. It extends what exists in `/learn`, the
certification generator, and the accreditation tiers.

This is the strongest differentiator in the plan. A directory competes on supply;
a credentialing body defines the standard.

## Product shape

```text
Curriculum ──▶ Course ──▶ Module ──▶ Lesson (video | reading | exercise)
                  │
                  ├──▶ Assessment  (quiz | case study | observed session)
                  ├──▶ Supervision (group | individual, logged hours)
                  └──▶ Certification (issued on completion + hours + assessment)
```

Cohort-based, not self-paced. Cohorts create accountability, completion rates,
peer supervision, and a reason to pay a real price. Self-paced libraries in this
market complete at single-digit rates.

## Schema

```sql
CREATE TABLE public.curricula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  modality text NOT NULL,            -- cbt | schema | emdr | performance | supervision
  level text NOT NULL,               -- foundation | practitioner | advanced
  total_hours numeric(5,1) NOT NULL,
  accreditation_tier int,            -- tier this curriculum unlocks
  status text NOT NULL DEFAULT 'draft'
);

CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id uuid NOT NULL REFERENCES public.curricula(id),
  code text NOT NULL UNIQUE,         -- CBT-F-2026-01
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  capacity int NOT NULL,
  price_mad numeric(10,2) NOT NULL,
  lead_trainer_id uuid,
  status text NOT NULL DEFAULT 'open' -- open|full|running|completed|cancelled
);

CREATE TABLE public.enrolments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id),
  user_id uuid NOT NULL,
  invoice_id uuid,
  status text NOT NULL DEFAULT 'pending', -- pending|confirmed|withdrawn|completed|failed
  progress_pct numeric(5,2) NOT NULL DEFAULT 0,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (cohort_id, user_id)
);

CREATE TABLE public.supervision_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisee_id uuid NOT NULL,
  supervisor_id uuid NOT NULL,
  cohort_id uuid,
  kind text NOT NULL,                -- individual | group | peer
  hours numeric(4,2) NOT NULL,
  occurred_on date NOT NULL,
  topic text,
  verified_by uuid,                  -- supervisor signs off
  verified_at timestamptz,
  notes_encrypted text               -- C1: encrypted, supervisor+supervisee only
);
```

GRANTs, RLS, and audit triggers per Phase 1. Note `supervision_hours.notes_encrypted`
is C1 — it may reference patients. Admin sees the hours, never the notes.

Also needed: `modules`, `lessons`, `lesson_progress`, `assessments`,
`assessment_attempts`, `certificates` (extend the existing generator).

## Certification chain

```text
enrolment confirmed
  ▶ lessons completed        (lesson_progress = 100%)
  ▶ assessments passed       (attempt.score >= pass_mark)
  ▶ supervision hours met    (sum(hours) >= curriculum minimum, all verified)
  ▶ trainer sign-off
  ▶ certificate issued       (PDF, serial number, public verification URL)
  ▶ accreditation tier updated on the specialist profile
```

The existing `certificate_verifications` flow already provides public
verification — extend it so a certificate exposes curriculum, hours, and issue
date without the holder's contact details.

**Do not issue a certificate on lesson completion alone.** Hours and assessment
are what make it worth anything.

## Supervision module

The piece most Moroccan psychologists actually lack and will pay for:

- Supervisor directory with verified credentials and specialisms.
- Booking against supervisor availability — reuse the existing booking engine
  with a `session_type = 'supervision'` variant.
- Hour logging with two-sided confirmation (supervisee logs, supervisor verifies)
  so the record is defensible to a professional body.
- Running total against each specialist's requirement, visible on their dashboard.
- Group supervision: one session, many supervisees, one verification per person.

## Trainer surface

`/specialist/teaching`, gated on a `trainer` role:
- Cohort roster with progress per enrolee.
- Assessment review queue for case studies (human-marked).
- Session scheduling and materials upload.
- Sign-off queue for certification.

## Pricing and revenue

| Product | Model | Notes |
|---------|-------|-------|
| Foundation course | Per cohort, fixed MAD | Entry product |
| Practitioner track | Per cohort, higher | Includes supervision hours |
| Supervision hours | Per hour or bundle | Recurring, highest margin |
| Organisation seats | Per seat per cohort | B2B, invoiced to the org |

All routed through Phase 3 invoicing. Cohort enrolment confirms only on payment
received — capacity held for 7 days, then released.

## Content production

Each course needs: a syllabus, per-lesson learning outcomes, materials
(video/reading/exercise), an assessment blueprint, and a supervision plan.
Produce one complete course before building the second — an empty platform with
eight course shells converts nobody.

Recommended first: **Foundation in Performance Psychology**, matching the existing
public positioning and the Mental Performance content already ranking.

## Deliverables

- [ ] Curriculum → cohort → enrolment → certification schema, with GRANTs/RLS/audit
- [ ] Learner surface: cohort dashboard, lessons, progress, assessments
- [ ] Supervision booking + two-sided hour verification
- [ ] Trainer surface with roster, marking, sign-off
- [ ] Certification chain enforcing hours and assessment, not just completion
- [ ] Public certificate verification extended
- [ ] Accreditation tier updated automatically on completion
- [ ] One complete course produced and a first cohort run
