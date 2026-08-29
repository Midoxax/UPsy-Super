# Mission

> **UPsy exists to make evidence-based psychological care the default, not the exception, everywhere in Morocco and, eventually, everywhere psychological care is scarce, stigmatized, or fragmented.**

This document is the root node of the UPsy Design Operating System. Every visual decision, every interaction pattern, every word of copy, every product roadmap decision downstream must trace back to this file. If a design cannot justify itself against the Mission, it does not belong in the system — no matter how polished it looks in isolation.

---

## Purpose

UPsy is not a booking website with a therapy theme. UPsy is infrastructure — the connective tissue between people who need psychological support and the professionals qualified to give it, built for a region (Morocco, and the broader MENA/Francophone-Africa corridor) where that connective tissue barely exists today.

The purpose of this document is to give every designer, engineer, writer, and AI system working on any UPsy product a single, unambiguous answer to the question: **"Why does this exist?"** — so that answer never has to be re-derived from scratch, re-interpreted per team, or diluted by a single landing page, dashboard, or onboarding screen that optimizes for something the mission doesn't ask for (novelty, cleverness, decoration, aggressive growth tactics).

Everything else in this Design Operating System — Color System, Typography, Component library, Motion rules, Persona documents, Product documentation — is a *translation* of this Mission into a specific medium. This file is the source; those are the compiled artifacts.

---

## The Mission Statement

**Primary (external, one sentence):**
> Evidence-based psychological care, one calm decision away.

**Primary (internal, operating version):**
> We build the systems — product, clinical, technological, and financial — that make it structurally easier for a person in Morocco to see a qualified psychologist than to avoid seeing one.

**Long-form (for onboarding decks, investor materials, hiring):**
> UPsy exists because access to psychological care in Morocco is currently gated by geography, stigma, cost opacity, and a near-total absence of trustworthy digital infrastructure connecting patients to accredited professionals. We are building that infrastructure — starting with a matching and booking platform for patients and psychologists, and expanding into the clinics, schools, companies, sports federations, and universities that need the same infrastructure at scale. Every product we ship is a brick in that same wall. None of them are side projects.

---

## Why This Exists (Context)

- **The access gap is structural, not just cultural.** Morocco has a severe shortage of licensed mental health professionals relative to population, heavily concentrated in Casablanca and Rabat. A patient in Agadir, Tangier, or a rural region has close to zero discovery mechanism for a qualified psychologist, let alone one who fits their language, price point, specialty, or availability.
- **Stigma compounds scarcity.** In much of Moroccan society, seeking psychological help still carries social risk. A product that requires visible, effortful, public-feeling steps (walking into a clinic, asking a GP for a referral, explaining yourself to a receptionist) will lose a meaningful fraction of people who need care before they ever reach a professional. **Every point of friction in our product is a point where someone quietly closes the tab and goes back to suffering in silence.** This is not a metaphor — it is the design constraint that justifies the entire calm, low-friction visual language documented later in this system.
- **Trust has to be engineered, not assumed.** In a market with no dominant, trusted incumbent, a new platform must earn credibility through visible evidence — real accreditation, real transparency on pricing and process, real professional-grade design — rather than through brand recognition it hasn't yet earned. This is why "Scientific" and "Evidence-Based" sit alongside "Calm" and "Human" as core values (see `Values.md`): warmth without rigor reads as unlicensed; rigor without warmth reads as clinical and cold. UPsy has to hold both simultaneously.
- **The problem is bigger than one product.** A patient-matching website solves discovery. It does not solve: how clinics manage caseloads, how psychologists get continuing education and accreditation, how companies get employee mental health support, how athletes get sport psychology support, how researchers get data, how universities train the next generation of therapists. UPsy's Mission is deliberately written at the level of "make evidence-based care structurally easier to access," not "build a booking site," because the roadmap already includes Clinic Management, CRM, Academy, Research Platform, Marketplace, Corporate Wellness, and Sport Psychology as first-class products, not future pivots.

---

## Goals

Goals are the measurable expression of the Mission. They exist so "are we on mission" is answerable with data, not opinion.

### Patient-facing goals
1. **Reduce time-to-first-qualified-match** from a multi-day, multi-call process (the status quo: ask around, call several offices, hope for a callback) to a single guided session under 3 minutes.
2. **Reduce abandonment at every step of the anxiety funnel.** A person searching for a psychologist is, by definition, often already anxious. Each additional required field, unclear price, or ambiguous next step disproportionately taxes exactly the user we exist to serve. Track and minimize drop-off at: assessment start, assessment completion, match reveal, booking confirmation, first session attendance.
3. **Make price and process fully legible before commitment.** No user should reach a payment screen confused about what they're paying for, how long a session is, or what happens if the fit is wrong. (See the "Free rebook if not the right fit" trust mechanism — this is a Mission-derived product decision, not a marketing gimmick.)

### Professional-facing goals
4. **Lower the operational overhead of running a psychology practice** to the point where a solo psychologist in a secondary city has the same scheduling, documentation, and client-management leverage as a well-staffed clinic in Casablanca.
5. **Make accreditation and continuing education a visible, trusted signal**, not paperwork that happens once and is never surfaced to patients again.

### Systemic goals
6. **Extend the same infrastructure to institutions** — schools, companies, sports federations, universities, NGOs, government health programs — so that psychological support scales through existing institutional relationships rather than requiring every individual to discover UPsy independently.
7. **Build a reusable evidence base.** Every product should be instrumented so that, over time, UPsy can make defensible, published claims about outcomes — not just usage metrics. This is what separates "a therapy app" from "psychological infrastructure."

Goals are revisited yearly. The Mission is not.

---

## Principles

These are the non-negotiable filters every design, feature, and word of copy must pass through.

1. **Calm is a feature, not an aesthetic.** Calm visual design exists to lower the physiological and cognitive load on an already-stressed user, measurably increasing the odds they complete the flow. It is never chosen "because it looks nice."
2. **Evidence over opinion.** Design decisions on anything touching clinical framing, assessment language, or matching logic must be traceable to psychological or UX research, not internal taste. When no evidence exists yet, say so explicitly rather than presenting a guess as a standard.
3. **Friction is a filter that removes exactly the people we exist to help.** Every required field, every additional click, every unclear microcopy string is evaluated against: "does this cost us more anxious users than it protects us from bad-faith ones?"
4. **Trust is earned through transparency, not asserted through branding.** Prefer showing real accreditation, real pricing, real process over claiming "trusted" or "premium" in copy.
5. **One system, many products.** A component, token, or pattern is never designed for a single product screen. If Patient Portal needs a card, and Clinic Management needs a card, they use the same card primitive, themed by context, not two different components that happen to look similar.
6. **Human first, clinical second, decorative never.** Copy and interface tone read as a calm, competent person — never as a legal disclaimer, and never as a lifestyle brand.
7. **Accessible by default, not by request.** WCAG AA is the floor for every product, including internal tools, because a portion of both patients and psychologists using UPsy will have visual, motor, cognitive, or situational impairments, and "we'll fix accessibility later" is a direct betrayal of the "Accessible" brand value and the Mission itself.

---

## Best Practices

- **Start every new product brief with this document, not with a competitor screenshot.** Competitor research informs execution; it must never define purpose.
- **Write the one-sentence "why does this screen exist" before opening a design tool.** If that sentence can't be written in a way that traces back to a Goal above, the screen is scope creep.
- **Default to removing steps, not adding reassurance copy.** If a step is causing anxiety, the first fix to try is deleting the step, not writing a friendlier sentence next to it.
- **Treat every new institutional product line (Corporate Wellness, Academy, Sport Psychology, etc.) as an extension of the same infrastructure**, reusing the Design System rather than spinning up a "sub-brand" visual language. Institutional buyers should recognize UPsy's calm, evidence-based identity even in a B2B sales deck.
- **Instrument for outcomes, not just engagement.** Session-completion and reported-fit metrics matter more than time-on-page or click-through rate; a fast, successful match that gets a user off the platform quickly is a win, not a failure to "engage."

---

## Examples

**Mission-aligned decision:** The booking flow offers a free rebooking with a different psychologist if the patient reports the match wasn't the right fit, with no interrogation of why. *Reasoning: removing the social cost of "admitting the first match failed" measurably increases the odds a person continues seeking care instead of giving up entirely — directly serving Goal 3 and Principle 3.*

**Mission-aligned decision:** The self-assessment intake form shows a visible, low progress indicator and explains upfront how many questions remain and why they're asked, rather than presenting an open-ended, unscoped questionnaire. *Reasoning: unscoped effort is a known anxiety amplifier (Principle 1); a visible, bounded task lowers perceived cost of starting.*

**Mission-violating decision (rejected):** A growth-team proposal to require phone-number verification before showing any psychologist profiles, in order to reduce fake sign-ups. *Reasoning: this adds a step before the user has received any value, disproportionately taxing hesitant first-time visitors — directly contradicts Principle 3 and Goal 2, even though it might reduce a KPI the growth team cares about (fake accounts).* This is the kind of tradeoff every team will face; the Mission is the tie-breaker.

---

## Rules

- No product surface (including internal admin tools) ships without an explicit answer to "which Goal above does this serve," recorded in the product brief.
- No copy claims a trust attribute ("premium," "trusted," "leading") without a visible, verifiable piece of evidence on the same screen (accreditation badge, real pricing, real credential).
- No flow that a patient must complete while potentially in psychological distress (assessment, crisis-adjacent screens, cancellation flows) may introduce a *new* required field or step without an explicit anxiety-cost review.
- No sub-brand, product line, or partner-facing microsite may deviate from the core Design System's color, type, and motion tokens without written sign-off from Design Leadership — see `Versioning.md` for the exception process.

---

## Do

- Do write the Mission-alignment sentence before starting any design brief.
- Do choose deletion over reassurance when a step causes anxiety.
- Do treat every institutional/B2B product as visually and tonally continuous with the consumer-facing product.
- Do instrument every funnel for drop-off, not just completion.
- Do default new patterns to the shared component library before proposing a new one.

## Don't

- Don't add a step, field, or gate "just to be safe" without measuring its anxiety cost against its risk-reduction benefit.
- Don't invent a new visual language for a new product line because "it's a different audience" — the audience still needs to trust the same brand.
- Don't ship clinical-sounding copy that reads as a disclaimer rather than a calm, competent person speaking.
- Don't optimize for engagement metrics that reward a user staying on the platform longer than the task required.
- Don't treat this document as marketing copy — it is an operating constraint, and it should be cited, argued with, and enforced like one.

---

## Accessibility

The Mission and accessibility are the same commitment, expressed twice. A platform that claims to remove barriers to psychological care while failing WCAG AA is failing its own reason for existing for the subset of patients and psychologists who rely on screen readers, keyboard navigation, captioning, or reduced-motion settings. Accessibility work is therefore never "nice to have," never deprioritized against a launch date, and never scoped as "add ARIA labels later." Concretely:

- Every flow that matters to Goal 1–3 (assessment, matching, booking) must be fully operable via keyboard and screen reader before launch, not after.
- Calm visual design (soft motion, generous whitespace, muted palettes) must never come at the cost of contrast ratios or focus visibility — see `Accessibility.md` and `Color System.md` for enforced minimums.
- Institutional products (Corporate Wellness, Academy, Government-facing tools) will often be procured specifically because of accessibility compliance requirements; treat this as a product advantage to document, not a checkbox.

---

## Future Expansion

As UPsy adds Clinic Management, CRM, Academy, Research Platform, AI Assistant, Events, Certifications, Marketplace, Corporate Wellness, and Sport Psychology, each new product must, before its first design review:

1. Restate the Mission in its own domain language (e.g., Corporate Wellness: "make evidence-based mental health support a structurally easy benefit for a company to offer its employees, not a wellness-washing checkbox").
2. Identify which existing Goal(s) it extends versus which new Goal it requires adding to this document (new Goals require a documented addition here, not silent scope growth).
3. Confirm it inherits — rather than forks — the token and component system defined in `03 Design Tokens` and `04 Components`.

This document should be revisited at minimum whenever a new product line is greenlit, and its Goals section reviewed annually regardless.

---

## Developer Notes

- This document has no direct implementation, but it justifies performance and reliability budgets: a slow, janky, or error-prone interface actively works against Principle 1 (calm) and Principle 3 (friction removes exactly the users we serve). Treat p95 load time and error-rate budgets as Mission-derived requirements, not generic engineering hygiene, when prioritizing against feature work.
- When in doubt about whether a technical shortcut is acceptable (e.g., skipping loading-state design, deferring an error-state screen), the test is the same as for design: does this shortcut cost us anxious users who hit a dead end or a confusing blank screen? If yes, it is not a shortcut, it is a Mission violation.
- Any experiment or A/B test touching a flow covered by Goals 1–3 must include drop-off and reported-fit metrics in its success criteria, not just conversion rate.

---

## AI Notes

For any AI system (including Claude Design) generating UPsy interfaces, copy, or product concepts:

- Treat this Mission as the highest-priority constraint in the system — above visual trend-following, above matching a reference screenshot, above generic "best practice" patterns pulled from unrelated products.
- When generating a new screen, first silently derive which Goal (1–7) it serves. If none apply, flag this rather than generating a plausible-looking screen anyway.
- When generating copy, default to the tone described in `Tone of Voice.md`, but when unsure, bias toward *removing* words and steps rather than adding reassuring language — reassurance is a weaker fix than actual simplicity.
- Never generate a "trust" claim in copy (badges, headlines, testimonial framing) without a corresponding real, verifiable evidence element also present in the generation (accreditation, transparent pricing, credential detail).
- When asked to design for a new UPsy product line not yet documented in `06 Product Documentation`, generate a one-paragraph Mission restatement for that product line first, and present it for approval before generating any interface.

---

## Prompting Notes

When prompting Claude (or any generative design tool) to produce UPsy work, structure prompts to make the Mission an explicit constraint rather than implicit context, e.g.:

- Weak prompt: *"Design a pricing page for UPsy."*
- Strong prompt: *"Design a pricing page for UPsy. Constraint: every price must be fully legible before any commitment step (Goal 3, Principle 4). Minimize required fields before the user sees a real price (Principle 3). Tone: calm, evidence-based, never salesy (Tone of Voice.md, Values.md)."*

Always reference the specific Goal, Principle, or Rule number/name being applied, not just "make it calm" — this document is written so that every clause is citable. Treat vague aesthetic requests ("make it feel premium") as underspecified until translated into a specific Principle or Rule from this document.
