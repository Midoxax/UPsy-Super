# U.Psy Clinical Pilot — Playbook

> Named a **Clinical Pilot**, not a Founder Beta. A beta is software you are
> still testing; a pilot is a service you are delivering under supervision.
> The second framing is the accurate one, and it sets the standard everyone
> involved holds themselves to.

Operational, not architectural. Everything here is executable tonight.

**The bar is not "the software works." It is "we can safely deliver care."**
A booking that completes and a consultation that helps someone are different
achievements, and only the second one matters to the person on the other end.

---

## 0. Before you start

Have open: Vercel dashboard, Supabase dashboard, Stripe (test mode), the inbox
receiving transactional email, and a phone.

Two accounts you will create: one psychologist, one patient. Use real email
addresses you control — the point is to receive what a user receives.

**Stripe stays in TEST mode for the whole of A1–A3.** Switch to live only after
§6, and only once you have watched one test payment settle end to end.

---

## 1. Deploy (10 min)

```
1. Merge PR #2 to main
2. Watch the Vercel build
3. Confirm the deployment URL responds
```

⚠️ **This is the first build on Node 22 with `npm ci`.** Both are verified in
CI but neither has run on Vercel. If the build fails, look at `engines.node`
in `package.json` and `installCommand` in `vercel.json` — in that order.

Then confirm the environment is real, not a preview stub:

- [ ] `VITE_SUPABASE_URL` points at **production**, not a dev project
- [ ] `VITE_SENTRY_DSN` is set — otherwise errors vanish silently. It is set in
      `.env`; confirm events actually arrive by triggering one, because a DSN
      with no matching CSP entry fails silently in exactly the same way as no
      DSN at all
- [ ] `npm run check:production` passes — headers served, site public, routes up
- [ ] `npm run check:database` passes — the committed migrations are really
      in the database, not just in git
- [ ] Load the site, open DevTools, confirm no console errors on the homepage

---

## 2. A1 — Platform (15 min)

Do this on a **phone**, not a laptop. Most of your users will be on one, and
mobile is where layout and tap targets fail.

| # | Check | Pass condition |
|---|---|---|
| 1 | Homepage loads | Content within ~3s on mobile data |
| 2 | Language switch EN → FR → AR | Copy changes; Arabic lays out right-to-left |
| 3 | Register a patient account | Confirmation email **arrives** |
| 4 | Click the email link | Lands logged in, not on an error |
| 5 | Log out, log back in | Session restores |
| 6 | Password reset | Email arrives, new password works |
| 7 | Visit `/dashboard` logged out | Redirects to `/auth`, never a blank page |
| 8 | Browse psychologists | Real profiles, real photos |
| 9 | Book a session | Appears in your dashboard |
| 10 | Pay (Stripe test card `4242…`) | Booking marked paid |
| 11 | Booking confirmation email | Arrives, correct time and timezone |
| 12 | Cancel the booking | Cancellation confirmed, refund behaviour matches your policy |
| 13 | Sentry | The above produced no unexpected errors |
| 14 | PostHog | Events recorded |

**Any failure here stops the launch.** These are the mechanics of the service.

---

## 3. A2 — Clinical operations (20 min)

The section that decides whether you are running a clinical service or a
booking website. Run it with a **real psychologist**, not yourself pretending.

**One psychologist must complete one consultation end to end. If they cannot,
you are not ready — regardless of what the platform does.**

| # | Check | Pass condition |
|---|---|---|
| 1 | Psychologist applies via `/apply` | Application appears in admin |
| 2 | You approve it | They receive notification and can log in |
| 3 | They set availability | Slots appear to patients |
| 4 | Patient books them | Both parties notified |
| 5 | **Consent flow** | Patient sees and accepts before first session; acceptance is **recorded** |
| 6 | **Privacy notice** | Reachable before registration, not buried |
| 7 | **Emergency disclaimer** | Visible before booking — U.Psy is not a crisis service, with local emergency numbers |
| 8 | **Cancellation policy** | Shown before payment, not after |
| 9 | Join the session | Video connects both sides |
| 10 | Case exists | Session attaches to a patient record, not a floating booking |
| 11 | Clinical note | Psychologist can write and save one |
| 12 | Note is encrypted | Verify via `encrypt-note` / `decrypt-note`, not by trusting the UI |
| 13 | Patient timeline | Psychologist sees history, not one isolated session |
| 14 | Close the session | Marked complete |
| 15 | Follow-up | Either scheduled or explicitly declined |
| 16 | **Crisis path** | Psychologist knows what to do if a patient discloses risk **mid-session** — and it is written down, not improvised |

**Item 16 is the one to not skip.** Everything else can be fixed next week. A
psychologist facing disclosed suicidal ideation with no protocol is the failure
mode that ends the company, and it is an operational document, not code.

---

## 4. A3 — Founder operations (15 min)

Can *you* run the service when something goes wrong at 22:00?

The admin console at `/admin` already covers: overview, users, psychologists,
bookings, transactions, support, accreditation, learning, pricing, translations.
More than expected — verify each actually works rather than assuming.

| # | Check | Where | Status |
|---|---|---|---|
| 1 | Approve a psychologist | `/admin` → Applications | ✅ built |
| 2 | Suspend one | `/admin` → Psychologists | verify |
| 3 | View bookings | `/admin` → Bookings | ✅ built |
| 4 | View transactions | `/admin` → Transactions | ✅ built |
| 5 | Answer a support ticket | `/admin` → Support | verify |
| 6 | Reset a user's password | Supabase dashboard → Auth | ⚠️ no UI |
| 7 | **Refund a payment** | Stripe dashboard | ⚠️ **no UI — Stripe directly** |
| 8 | **Resend an invoice** | `generate-org-invoice` | ⚠️ no UI |
| 9 | **Export a user's data** | SQL | ⚠️ **no UI — GDPR/Law 09-08 obligation** |
| 10 | **Impersonate a user** | — | ❌ **not built** |
| 11 | View errors | Sentry | ✅ external |
| 12 | Platform health | `/admin` → Overview | verify |

**Items 7, 9 and 10 are the real gaps.**

Refunds and data export are survivable at five patients — you do them by hand
in Stripe and SQL. Write down the exact steps tonight, because you will need
them under pressure and you will not want to be composing SQL then.

**Impersonation is deliberately absent, and I would keep it that way for
beta.** On a platform holding clinical notes it is the most dangerous internal
feature you will ever build. With five patients you can phone them. Build it
when support volume forces it — and build the audit trail before the UI.

---

## 5. Rollback

**Symptom: the new deploy is broken.**

1. Vercel dashboard → Deployments → last known good → **Promote to Production**
2. Instant; no rebuild. Assets are content-hashed, so a rollback cannot serve a
   mismatched bundle.
3. Note: the service worker uses `registerType: "autoUpdate"`. Clients pick up
   the change on next navigation, but someone mid-session may hold the old
   build for a few minutes.

**Symptom: a database migration broke something.**

Rolling back the deploy does **not** roll back the database. Supabase → Database
→ Backups → restore point-in-time. Assume data loss between the incident and the
restore point, and tell affected users.

**Symptom: payments are misbehaving.**

Disable the booking CTA before debugging. A broken payment path that stays open
generates support load faster than you can fix the cause.

---

## 6. Incident response — two severities, always

**Every incident is scored twice: technical and clinical.** Ordinary software
companies score availability. A mental-health service cannot, because the two
dimensions come apart — and it is exactly when they diverge that the wrong
thing gets prioritised.

| Incident | Technical | Clinical |
|---|---|---|
| Stripe is down | Sev 2 | Sev 4 |
| Homepage 500s | Sev 1 | Sev 4 |
| Patient disclosed suicidal ideation, psychologist never notified | Sev 3 | **Sev 1** |
| Session video fails mid-consultation | Sev 3 | **Sev 2** |
| Clinical note saved to the wrong patient | Sev 2 | **Sev 1** |

**Respond to the higher of the two.** The third row is the one that matters:
technically a notification bug, barely worth paging anyone. Clinically it is
the most serious thing that can happen on this platform. A single severity
scale would rank it below a broken homepage, and that ranking is how someone
gets hurt.

**Clinical Sev 1 — someone may be at risk.**
→ **Human first, engineering second.** Phone the patient. Phone the
psychologist. Fix the code afterwards. This is a clinical incident that happens
to involve software.

**Technical Sev 1 / Clinical Sev 3-4 — service down, nobody at risk.**
→ Roll back (§5). Status message. Email affected users within the hour; people
who have entrusted you with mental-health care notice silence.

**Both low — a feature is broken, workaround exists.**
→ Log it. Fix in normal hours.

**For every Sev 1 or 2, write down within 24 hours:** what happened, who was
affected, what you did, what prevents recurrence. Not bureaucracy — at fifty
patients you will not remember, and the pattern across three incidents is what
tells you what to fix.

---

## 6b. Clinical governance — required before any patient

**These are not engineering deliverables and must not be written by an
engineer, or by an AI.** They carry clinical and legal liability, they must be
authored or countersigned by a qualified clinician licensed in Morocco, and
they should be reviewed against Law 09-08. Listed here because the pilot is
blocked without them, not because the repository owns them.

1. **Clinical Protocol Manual** — the minimum standard every psychologist on
   the platform follows.
2. **Crisis Escalation SOP** — exactly what happens on suicide risk, abuse
   disclosure, psychosis, or medical emergency. Names, numbers, timeframes.
3. **Consent Policy** — precisely what a patient agrees to, in the language
   they read.
4. **Privacy SOP** — who may access what, and how access is reviewed.
5. **Session Documentation Standard** — so notes are consistent enough to be
   clinically useful and legally defensible.
6. **Incident Review Process** — every clinical incident is reviewed, not just
   resolved.

### Clinical quality assurance — monthly

Software QA asks whether the system works. Clinical QA asks whether the care is
good, and no amount of the former substitutes for the latter.

Every month, review: **five anonymised cases**, documentation quality against
the standard, protocol adherence, and patient outcomes. This is how healthcare
organisations improve, and starting it at five patients is far easier than
retrofitting it at five hundred.

## 7. Launch sequence

Your sequence, which is better than mine. Do not compress it.

```
Deploy preview  →  Founder test (§2–4)  →  Pilot psychologist (§3)
   →  5 patients  →  20  →  50  →  Public beta
```

**Hold at 5 patients for at least a week.** The first five teach you more than
the next forty-five, and they are the only cohort small enough to phone
individually when something breaks.

**Gate between each step:** no Sev 1 incidents, no unresolved Sev 2, and every
psychologist involved says the workflow is usable. If any is false, hold. The
temptation to grow through a known problem is how a clinical service damages
someone.

---

## 8. Before you invite anyone

- [ ] §2, §3, §4 all pass
- [ ] Crisis protocol written and the pilot psychologist has read it
- [ ] Emergency disclaimer live with **Moroccan** emergency numbers
- [ ] Privacy notice and consent flow live and recording acceptance
- [ ] Cancellation and refund policy visible before payment
- [ ] Stripe switched to live mode, one real payment observed
- [ ] Sentry receiving events
- [ ] Rollback rehearsed once — promote a previous deploy and back, on purpose
- [ ] Refund and data-export steps written down
- [ ] You know who answers the phone at 22:00

Last one is not a joke. You are the on-call clinician-adjacent contact for the
first fifty patients. Decide that deliberately rather than discovering it.
