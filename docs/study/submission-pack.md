# U.Psy Athlete Well-being Study: submission pack

Drafts for the three things needed before any result is published. Fill the
`[…]` fields, then send. The study runs in the Athlete Hub (`/athlete-hub`,
"Study" section); investigator exports are at `/admin/study`.

---

## 1. Ethics committee: protocol synopsis

Send to a Moroccan biomedical research ethics committee (CERB), for example
the Faculty of Medicine and Pharmacy of Rabat, Casablanca or Marrakech. If
the study is classed as non-interventional research, ask the committee for
an exemption letter or a favourable opinion; either is citable.

**Title.** Longitudinal study of well-being, perceived stress, sleep, burnout
and mental toughness in Moroccan athletes, and their relationship with daily
readiness and competition performance.

**Principal investigator.** Mehdi Felji, clinical sport psychologist, U.Psy
(contact@upsy.ma). [Academic co-investigator, institution]

**Design.** Prospective observational cohort, online, no intervention.
Duration [12 months] of recruitment, follow-up up to [12 months] per
participant.

**Population.** Adults (18+) who practise a sport at recreational,
competitive, national or international level and use the U.Psy Athlete Hub.
Exclusion: under 18 (enforced by the platform). Target sample [N = 300],
based on [justify: e.g. detecting within-person associations in multilevel
models with ≥ 8 measurement points].

**Procedures.**
| Measure | Instrument | Schedule |
|---|---|---|
| Sleep | Sleep Quality Scale (single item) + hours, nights with difficulty | weekly |
| Well-being | WHO-5 | every 2 weeks |
| Perceived stress | PSS-10 | every 4 weeks |
| Burnout | Athlete Burnout Questionnaire (15 items) | every 4 weeks |
| Mental toughness | Mental Toughness Index (8 items) | every 12 weeks |
| Readiness | daily check-in (mood, sleep, stress, energy, cognitive load) | daily, optional |
| Performance | competition importance and self-rated performance | per competition |

Everything is completed once at enrolment (baseline). About 3 minutes a week.

**Consent.** Electronic informed consent, versioned (`2026-10-v1`), in
French, Arabic and English, with three required confirmations (18+, read
and understood, agreement to pseudonymised research use). The consent
version and timestamp are stored with each enrolment.

**Withdrawal.** At any time from the same page, without justification. The
participant chooses whether data collected so far may be kept or must be
deleted; deletion removes study answers and excludes the participant from
every export.

**Confidentiality.** Each participant gets a random code (`UPS-XXXXXX`).
Exports contain the code, birth year, sex, sport, level and answers only;
never name, email, account identifier or free text. Every export is written
to an append-only audit log. Hosting: Supabase, London (eu-west-2, United Kingdom), access
restricted to the investigator.

**Risks and safeguards.** Minimal risk. Questions on mood and stress may be
uncomfortable. A WHO-5 score ≤ 28 shows the participant an urgent support
message (booking link to a psychologist, emergency numbers 141 / 19); WHO-5
≤ 50, PSS-10 ≥ 27 or ABQ exhaustion ≥ 4 show a gentle notice. The study is
not a clinical service and nobody monitors individual answers; this is
stated in the consent.

**Benefits.** No direct benefit beyond self-monitoring. Expected scientific
benefit: first longitudinal dataset of its kind in Morocco and Africa.

**Dissemination.** Peer-reviewed publication and aggregated reports;
no individual data published.

---

## 2. CNDP (Law 09-08) declaration

File on the CNDP portal (www.cndp.ma, "Déclarations"), as a processing of
health-related data for research. Health data are sensitive data: the
filing is a request for **authorisation**, not a simple declaration.

- **Controller:** U.Psy [legal entity name, RC, address, ICE].
- **Purpose:** scientific research on athletes' well-being and performance.
- **Data categories:** identification (kept separate; research export is
  pseudonymised), birth year, sex, sport, level, questionnaire answers, daily
  readiness, competition ratings.
- **Legal basis:** explicit consent (Art. 4), sensitive data (Art. 21).
- **Recipients:** the principal investigator; no transfer to third parties.
- **Transfer abroad:** hosting provider Supabase, London (United Kingdom) — declare the
  transfer (Art. 43).
- **Retention:** [5] years after the end of the study, then deletion or
  anonymisation.
- **Rights:** access, rectification, objection via contact@upsy.ma and the
  in-app withdrawal.
- **Security:** access control by role, row-level security, audit log,
  encrypted transport and storage.

Also check the existing platform declaration covers the clinical side
(bookings, session notes, AI-assisted summaries processed by Anthropic):
if not, file an update.

---

## 3. Instrument permissions

WHO-5 and PSS-10 are free for non-commercial research (cite the sources).
Ask permission for the two below, and request their validated French and
Arabic versions.

### MTI (Gucciardi et al., 2015)

> **To:** Professor Daniel F. Gucciardi, Curtin University
> **Subject:** Permission to use the Mental Toughness Index in a Moroccan longitudinal study
>
> Dear Professor Gucciardi,
>
> I am a clinical sport psychologist and founder of U.Psy, a Moroccan mental
> health and performance platform. We are setting up a longitudinal
> observational study of athletes' well-being and performance, submitted to
> a Moroccan research ethics committee, and would like to include the Mental
> Toughness Index (8 items) every twelve weeks.
>
> Could you confirm that we may use the MTI for this non-commercial research,
> administered online, and let us know of any French or Arabic validated
> version? We will cite Gucciardi et al. (2015) in all outputs and share the
> psychometric results for our sample if useful to you.
>
> Kind regards,
> Mehdi Felji
> Clinical sport psychologist, U.Psy — contact@upsy.ma

### ABQ (Raedeke & Smith, 2001)

> **To:** Professor Thomas D. Raedeke, East Carolina University
> **Subject:** Permission to use the Athlete Burnout Questionnaire in a Moroccan longitudinal study
>
> Dear Professor Raedeke,
>
> I am a clinical sport psychologist and founder of U.Psy, a Moroccan mental
> health and performance platform. We are preparing a longitudinal
> observational study of athletes, submitted to a Moroccan research ethics
> committee, and would like to administer the Athlete Burnout Questionnaire
> (15 items) online every four weeks.
>
> May we use the ABQ for this non-commercial research? We plan to use the
> French validation by Isoard-Gautheur, Oger, Guillet and Martin-Krumm
> (2010) and would welcome any information on an Arabic version. The ABQ
> will be cited in all outputs.
>
> Kind regards,
> Mehdi Felji
> Clinical sport psychologist, U.Psy — contact@upsy.ma

When the ethics reference arrives, put it in `STUDY.ETHICS_REF`
(`src/lib/study/copy.ts`); the consent and the admin page then show it.
