# Values

> Values are the words in `Mission.md` and `Vision.md` translated into a test you can run against any single decision, in under ten seconds, without re-reading either document.

Nine words recur across UPsy's founding documents: Evidence-Based, Scientific, Human, Accessible, Premium, Modern, Minimal, Calm, Secure, Trustworthy. This document defines each one precisely enough that two different designers, given the same brief, would make the same call — because an undefined value is not a value, it's a mood.

---

## Purpose

Mission and Vision describe *why UPsy exists* and *where it's going*. Values describe *how any single person, in any single moment, decides between two options that are both otherwise reasonable*. A designer choosing between two card-shadow depths, a writer choosing between two ways to phrase an error message, an engineer choosing between a faster-but-less-transparent loading pattern and a slower-but-honest one — all of these are Values decisions, made dozens of times a day, far more often than Mission or Vision get consciously invoked. This document exists so those small decisions are consistent across a company, without requiring a meeting.

---

## The Ten Values

Each value is defined as: a one-line definition, what it looks like in a real decision, and — critically — what it is *not* (values without an explicit non-example get diluted into applying to everything, which means they apply to nothing).

### 1. Evidence-Based
**Definition:** A claim, a copy line, or a design pattern is used because research or data supports it, not because it feels intuitively right.
**Looks like:** Assessment question wording is drawn from validated psychological instruments (adapted for tone), not invented fresh by a copywriter.
**Is not:** Citing a study once in a founding deck and then never revisiting design decisions against evidence again. Evidence-based is an ongoing practice, not a one-time credential.

### 2. Scientific
**Definition:** Process and rigor are visible in how UPsy operates — methodology is not hidden, hedged, or replaced with vibes.
**Looks like:** A matching algorithm's criteria are explainable to a curious patient in plain language, even if the underlying model is more complex.
**Is not:** Jargon-heavy copy that performs scientific authority through vocabulary rather than demonstrating it through transparency. Sounding scientific and being legible are both required — one without the other fails this value.

### 3. Human
**Definition:** Every interaction reads as though a calm, competent person is on the other side, not a system.
**Looks like:** An error message says what went wrong and what to do next, in first person plural or direct address ("we couldn't process that — try again in a moment"), never a raw error code.
**Is not:** Forced casualness, jokes, or emoji in contexts involving distress, payment, or clinical information. Human does not mean informal; it means present and attentive.

### 4. Accessible
**Definition:** Usable by people across the full range of ability, language, income, and geography — this is a design requirement, not a legal minimum.
**Looks like:** WCAG AA compliance by default on every surface, including internal admin tools; pricing and language options that acknowledge Morocco's actual linguistic diversity (Darija, French, Standard Arabic, and English where relevant).
**Is not:** A single "accessibility mode" toggle bolted onto an otherwise inaccessible product. Accessibility is a baseline property of the one experience everyone gets, not an alternate path.

### 5. Premium
**Definition:** Crafted with the same attention to detail as the best-regarded products in any category, regardless of price point.
**Looks like:** Consistent 8px spacing grid, considered motion easing, typography that respects an actual type scale — the kind of polish a user feels without being able to name it.
**Is not:** Expensive-looking, exclusive, or aspirational-lifestyle branding. UPsy's "premium" is craft and precision, never luxury signaling — a sliding-scale-priced session and a full-price session should feel equally considered.

### 6. Modern
**Definition:** Reflects current, not dated, interaction and visual conventions — the product should never make a user feel like they've opened something from five years ago.
**Looks like:** Adopting current platform conventions (system font stacks, native-feeling motion, current iconography weight) as they evolve.
**Is not:** Chasing every visual trend. "Modern" is refreshed relative to genuine current baseline, not novelty for its own sake — see Minimal below for the check on this.

### 7. Minimal
**Definition:** Every element present earns its place; nothing is decorative.
**Looks like:** A dashboard shows the three numbers a psychologist actually needs today, not twelve numbers "in case they're useful."
**Is not:** Empty or sparse for its own sake — minimal is the *absence of the unnecessary*, not the absence of information a user needs. A screen that omits something the user needs in order to look clean has failed this value, not honored it.

### 8. Calm
**Definition:** Reduces the user's stress and cognitive load in the moment, actively, by design.
**Looks like:** Soft, muted color transitions; generous whitespace; predictable, un-jarring motion timing (see `Motion.md`); no urgency-manufacturing patterns (countdown timers, red badges, "only 2 left").
**Is not:** Passive or slow. Calm interfaces can — and for time-sensitive flows like booking a same-day session, must — still be fast and responsive. Calm describes emotional tone, not latency.

### 9. Secure
**Definition:** Protects sensitive psychological, medical, and financial data as the default assumption of every design and engineering decision, visibly enough that users trust it without having to take it on faith.
**Looks like:** Clear, specific data-handling language at the point data is collected (not buried in a separate privacy policy nobody reads); encryption and access-control decisions that hold up under an actual security review, not just described in marketing copy.
**Is not:** A padlock icon or a "bank-level security" claim with nothing verifiable behind it. Secure is a property of the actual system, communicated honestly — see the overlap with Trustworthy below.

### 10. Trustworthy
**Definition:** Every claim UPsy makes about itself is independently verifiable by the person hearing it.
**Looks like:** A psychologist's accreditation is shown with the actual credentialing body and license status, not just a generic "verified" badge.
**Is not:** A trust badge, testimonial carousel, or "trusted by X users" counter used as a substitute for verifiable evidence. This value is the single most load-bearing one in the list because it's the one competitors can most easily fake — which is exactly why it must never be asserted without backing.

---

## Principles

1. **Values resolve conflicts, they don't just decorate mood boards.** A value that never says no to anything is not being used correctly. Every value above includes an explicit "is not," and that boundary should actually get invoked when a real proposal crosses it.
2. **Some values are in tension by design, and that tension is the point.** Premium and Minimal can pull in different directions (more polish vs. less on the screen); Modern and Calm can too (current motion conventions vs. avoiding anything jarring). When two values conflict on a specific decision, resolve toward whichever is closer to `Mission.md` Principle 3 (friction removes exactly the people we exist to help).
3. **Trustworthy and Secure are the two values with zero tolerance for shortcuts.** Every other value admits some subjectivity and craft judgment; these two are closer to hard requirements, because faking them is both easy and catastrophic for a mental-health platform's reason for existing.

---

## Best Practices

- When two design options are both otherwise reasonable, name which Value is the tiebreaker out loud in the design review, rather than defaulting to whoever has seniority or the loudest opinion.
- Audit copy specifically for Human violations (jargon, forced casualness, raw error codes) as a distinct review pass from visual QA — copy tone drifts independently of visual polish.
- When a growth or marketing proposal includes a trust claim ("thousands of patients helped," "top-rated psychologists"), require the Trustworthy value's verifiability test before shipping it: could a skeptical user click through and confirm this themselves?

---

## Examples

**Values-aligned decision:** A psychologist's profile card shows their license number and issuing body directly, with a link to verify it, rather than a "✓ Verified" checkmark with no further detail. *This is Trustworthy and Scientific working together — the claim is both made and made checkable.*

**Values-aligned decision:** The booking confirmation screen states the cancellation policy in one plain sentence at the moment of booking, rather than linking to a separate terms page. *This is Human and Trustworthy together — the information a person needs is given directly, not gated behind a click that will not happen.*

**Values-violating decision (rejected):** A dashboard widget showing "🔥 12 people booked in the last hour" to create urgency around a specific psychologist's calendar. *This directly violates Calm (manufactures urgency by design) and arguably Trustworthy (the number is real but its purpose is to pressure, not inform) — rejected even though it might lift short-term conversion.*

---

## Rules

- No UI pattern that manufactures artificial urgency (countdown timers, scarcity counters, "X people are viewing this") may ship anywhere in the product — a hard violation of Calm, not a judgment call.
- No trust or credibility claim in copy may ship without a corresponding verifiable detail visible in the same view (per Trustworthy).
- No accessibility shortcut ("we'll add an accessible version later") may ship as the default experience — Accessible is a baseline property of the one experience, not a variant.
- Any copy containing an error code, stack trace, or raw system message visible to an end user is a Human violation and must be rewritten before ship.

---

## Do

- Do name the specific Value being applied when defending a design decision in review, rather than saying "it just feels right."
- Do make every trust claim in copy independently checkable by the reader.
- Do treat Accessible, Secure, and Trustworthy as non-negotiable baselines, and Premium, Modern, Minimal, Calm as craft judgments to be balanced against each other per-decision.

## Don't

- Don't use urgency-manufacturing patterns, even ones common in other industries' consumer apps.
- Don't let "Premium" become a justification for exclusivity, luxury signaling, or unnecessary visual complexity — check every "premium" instinct against Minimal.
- Don't treat "Modern" as license to chase visual trends disconnected from what current conventions your actual users already understand.
- Don't ship a trust badge, counter, or claim that isn't independently verifiable by the person reading it.

---

## Accessibility

Accessible is one of the ten values, not a downstream implementation detail of the others — see `Accessibility.md` for the enforced technical standard (WCAG AA floor). What this document adds is the reasoning: Accessible is listed as a peer to Premium, Modern, and Calm specifically so that in a tradeoff discussion, it carries the same weight as those more visually obvious values, rather than being treated as a compliance checkbox added after visual design is "done."

---

## Future Expansion

As new product lines and markets are added, each new context should be checked against all ten values, not a subset — a common failure mode is assuming B2B or internal-tool contexts are exempt from Calm or Human because "it's just for professionals, not anxious patients." Psychologists and clinic administrators experience stress too (caseload pressure, billing complexity, compliance deadlines); the same calm, human treatment applies.

If UPsy expands regionally (per `Vision.md` Goal 5), revisit whether all ten values translate directly, or whether a market-specific nuance needs documenting (for example, what "Trustworthy" evidence looks like may differ where accreditation bodies differ) — without changing the words themselves.

---

## Developer Notes

- Secure and Trustworthy have direct engineering implications beyond copy and visual design: encryption at rest and in transit, access-control audit trails, and incident-disclosure practices are the actual substance behind those two values, not just their expression in the UI. Treat security review findings as Values violations when unresolved, not just tickets.
- Performance budgets connect to Calm (a slow interface is not calm, it's stressful) and to Premium (craft includes responsiveness) — cite both when defending a performance investment against feature-work pressure.

---

## AI Notes

- When generating or reviewing any UPsy artifact, check it against all ten values as a checklist, not just the ones that feel most relevant to the surface being generated — B2B admin tools and internal dashboards are not exempt from Human, Calm, or Accessible.
- When a generated design or copy includes any claim about trust, popularity, or credibility, verify it satisfies the Trustworthy definition's test (independently checkable) before presenting it as acceptable.
- Flag — rather than silently resolve — any case where two values appear to conflict on a specific generated artifact (e.g., a Premium-feeling amount of visual richness vs. a Minimal reading of what's necessary), so a human can make the tradeoff call per Principle 2 above.

---

## Prompting Notes

- Weak prompt: *"Make this dashboard feel more premium."*
- Strong prompt: *"Increase the craft level of this dashboard (Premium) without adding elements that don't serve the psychologist's actual daily task (Minimal) — if there's tension, resolve toward showing less, more precisely."*

When prompting for copy specifically, explicitly invoke Human and Trustworthy together: *"Write this error message as a calm, specific person would explain it (Human), and make sure the retry guidance is something the user can actually verify worked (Trustworthy)."* Vague prompts like "make it sound better" tend to produce copy that drifts toward generic friendliness without the specificity these two values actually require.
