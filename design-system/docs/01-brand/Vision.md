# Vision

> **In ten years, "UPsy" is the name Morocco uses for the entire category of getting psychological help — the way "Doctolib" became the verb for booking a doctor in France, or "Stripe" became shorthand for accepting payments online.**

Where `Mission.md` answers "why does UPsy exist right now," this document answers "what does UPsy become if it succeeds completely." The Mission is a constraint every product must satisfy today. The Vision is the destination every roadmap decision should be narrowing the distance to. A feature can be Mission-compliant (it doesn't add friction, it's evidence-based, it's accessible) and still be Vision-irrelevant (it doesn't move UPsy any closer to being the category-defining infrastructure layer). Both checks are required.

---

## Purpose

This document exists so that ten years of product decisions, made by people who have never met each other, converge on the same destination instead of ten years of locally-reasonable features that add up to an incoherent product. It gives Design, Product, Engineering, and any AI system generating UPsy artifacts a shared mental image of the finished thing, so that "does this fit where we're going" is answerable without a meeting.

The Vision is deliberately written as a description of a future *state of the world*, not a list of features — because features are how you get there, and the specific list will change every year, but the destination should not.

---

## The Vision Statement

**Primary (external, one sentence):**
> A single, trusted layer of psychological infrastructure underneath every institution in Morocco that touches mental health — clinics, schools, companies, federations, universities, and government.

**Long-form (the finished picture):**
> In the UPsy future state: a patient anywhere in Morocco reaches a qualified psychologist in the time it takes to order a taxi, in their own dialect, at a transparent price, through whichever door they walked in — a company benefits portal, a university counseling office, a sports federation's athlete-wellness program, a government clinic referral, or UPsy's own consumer app. Every psychologist in the country, whether solo practitioner or hospital-employed, runs their practice's scheduling, documentation, continuing education, and accreditation on UPsy because it is simply the best tool available for that job, not because they were sold on it. Researchers and policymakers cite UPsy-originated data when making claims about mental health access and outcomes in Morocco, the way health-ministry statistics get cited today. "Get on UPsy" is the answer a school counselor, HR director, or worried parent gives without thinking twice, the same reflexive way a Moroccan today says "check Doctolib" or "just take an Uber."

**One more frame (for hiring and investor narrative):**
> We are not competing to be the biggest therapy app. We are building the operating system the entire mental-health ecosystem of a country runs on — patients, professionals, and institutions alike — the way Stripe didn't win by being the flashiest checkout button, it won by becoming infrastructure so reliable that not using it stopped being a serious option.

---

## Goals (Vision Horizon: 5-10 Years)

These are directional, not quarterly-measurable like `Mission.md`'s Goals — they exist to check whether a multi-year roadmap is still pointed at the Vision.

1. **Category ownership, not market share.** Success is measured by whether "UPsy" becomes the generic term Moroccans reach for, not by percentage share against named competitors who may not exist yet.
2. **Institutional depth over consumer breadth.** A future where 200 companies, 500 schools, and 50 sports federations run their psychological-support programs on UPsy is a stronger Vision outcome than one where UPsy has more individual app downloads but no institutional embedding — because institutional relationships compound and are defensible; app downloads are not.
3. **Professional gravity.** Psychologists should eventually choose UPsy the way developers choose a dominant platform — not because of a sales pitch, but because their peers are already there, the tooling is better than anything they could assemble themselves, and leaving would mean losing infrastructure they depend on daily (scheduling, records, accreditation tracking, continuing education, referral network).
4. **Evidence infrastructure.** UPsy's aggregated, de-identified outcome and access data should become a resource cited in Moroccan (and eventually regional) mental-health policy discussions — turning a private platform into a public evidence layer.
5. **Regional replication.** The same infrastructure model — matching, practice management, accreditation, institutional integration — should be provably portable to another underserved Francophone or Arabic-speaking market beyond Morocco, proving the Mission generalizes rather than being a one-market solution.
6. **Design as competitive moat.** By the time competitors exist, "UPsy feels calmer, clearer, and more trustworthy than anything else in this category" should be an actual, felt, defensible differentiator — not an accident of being first, but a compounding result of the discipline documented in this entire Design Operating System.

---

## Principles

1. **Build the boring infrastructure first, the exciting features later.** Scheduling reliability, data security, and accreditation tracking are less exciting to design than an AI assistant or a slick matching animation, but they are what makes UPsy indispensable rather than merely delightful. A Vision built on infrastructure survives; one built on features gets leapfrogged.
2. **Design for the institution that hasn't signed up yet.** Every product decision in the consumer-facing app should be evaluated for whether it would also make sense inside a corporate wellness dashboard or a university counseling portal — because those are the same design system wearing a different hat, not a different product.
3. **Optimize for being trusted by people who never see the product.** Policymakers, journalists, and institutional procurement committees will judge UPsy on reputation and evidence before anyone in that chain opens the app. The Vision requires designing credibility that travels by word of mouth and citation, not just by UI polish.
4. **Ubiquity is a function of reliability, not marketing.** The path from "an app" to "the category" runs through years of the product simply working, correctly, calmly, every time — not through a campaign. Every reliability shortcut taken today is a tax on the Vision, paid later.
5. **The Vision is regional-portable by design.** Nothing in the product should be so Morocco-specific (beyond language, accreditation bodies, and payment rails, which are explicitly meant to be swappable) that expanding to a second market requires rebuilding rather than reconfiguring.

---

## Best Practices

- When scoping a new institutional product (Corporate Wellness, Academy, etc.), design the first version as if it will need to support the 200th company, not the 1st — because Goal 2 (institutional depth) requires the underlying model to scale without a redesign.
- Treat every accreditation, credentialing, or data-quality feature as Vision-critical infrastructure, even when it has no visible UI and generates no immediate growth metric — this is what Principle 1 asks for.
- When two roadmap items are equally Mission-compliant, prefer the one that deepens an institutional relationship or professional dependency over the one that adds a consumer-facing feature, per Goal 2 and Goal 3.
- Periodically (at minimum yearly, alongside the `Mission.md` Goals review) ask literally: "if we fully succeeded, would this document's Vision Statement be true?" and audit the last year's shipped work against it.

---

## Examples

**Vision-aligned decision:** Building a Continuing Education / accreditation-tracking module inside the Therapist Portal before building a flashier AI-assisted note-taking feature, because accreditation infrastructure is what makes psychologists structurally dependent on UPsy (Goal 3), while a note-taking feature is easily replicated by a competitor. *This is a case where a Mission-neutral prioritization call is resolved by the Vision.*

**Vision-aligned decision:** Structuring the Corporate Wellness product so that a company's HR admin can onboard 500 employees through an existing HRIS integration, rather than requiring each employee to independently discover and sign up for UPsy. *Reasoning: this is what "institutional depth over consumer breadth" (Goal 2) looks like as an actual product decision, not just a slogan.*

**Vision-misaligned decision (rejected):** A proposal to spend a full quarter building a viral social-sharing feature ("share your progress") to drive consumer download numbers. *Reasoning: this optimizes for a vanity metric (app downloads) that Goal 1 explicitly says is not how success is measured, and does nothing to deepen institutional or professional dependency.*

---

## Rules

- Any new product line's founding brief must include a one-paragraph answer to "how does this deepen institutional depth or professional gravity, per Goals 2–3," not just "how does this grow users."
- No roadmap prioritization document may rank a feature purely by projected download/signup growth without also stating its institutional or infrastructure value, per Principle 1.
- Any market-expansion proposal (new country, new region) must explicitly verify against Goal 5 that the underlying product model needs configuration, not reconstruction, before being approved.
- Data and evidence infrastructure work (Goal 4) may not be indefinitely deprioritized in favor of visible feature work; it must appear in every annual roadmap in some form.

---

## Do

- Do design every new feature to also make sense inside an institutional (B2B) context, even when building it for the consumer app first.
- Do prioritize reliability and accreditation/data infrastructure over visually exciting but structurally replicable features.
- Do check new market or product expansion against "configuration, not reconstruction."
- Do keep this document's Vision Statement literally true as a test — read it back once a year and ask if the last year's work made it more or less true.

## Don't

- Don't measure success primarily by consumer download or signup counts.
- Don't build a market-specific hack that would block regional replication (Goal 5) to save a sprint of work now.
- Don't let "boring" infrastructure work (scheduling reliability, accreditation tracking, data quality) lose roadmap priority to more demo-able features quarter after quarter.
- Don't treat this document as aspirational marketing language — every Goal here should be falsifiable by looking at what actually shipped.

---

## Accessibility

A Vision built on "category ownership" and "institutional depth" is, definitionally, a Vision that must work for the full range of human ability — a platform cannot become the infrastructure an entire country's mental-health ecosystem depends on while excluding users with disabilities, whether patients, psychologists, or institutional administrators. Concretely, this means: institutional buyers (schools, companies, government) will increasingly require documented accessibility compliance as a procurement condition, not a nice-to-have — treat every accessibility investment made today as also being a future sales requirement, not just an ethical one. See `Accessibility.md` for enforced standards.

---

## Future Expansion

As new products and markets are added:

1. Every new product line brief must restate not just its Mission-alignment (per `Mission.md`) but its Vision-contribution — which Goal(s) above it advances.
2. Regional expansion planning (Goal 5) should maintain a running document (outside this file) of every Morocco-specific assumption baked into the product, so expansion work starts from a known list, not a rediscovery process.
3. As institutional products mature, expect this document to eventually need a companion "Vision by Product Line" appendix once there are enough institutional products that a single Vision Statement can no longer hold all their nuance — but the root Vision Statement above should still summarize all of them.

---

## Developer Notes

- Infrastructure investments (uptime, data integrity, integration reliability with institutional systems like HRIS/school information systems) should be understood and budgeted as Vision-critical, not generic technical debt — deprioritizing them has a direct cost against Goal 1 and Goal 3, not just an abstract "tech health" cost.
- When building integrations for institutional products, design the integration layer to be reusable across institution types (a company's HRIS and a university's student information system should ideally share an integration abstraction) — this directly serves Goal 5's "configuration, not reconstruction" requirement.

---

## AI Notes

- When generating roadmap, prioritization, or product-strategy content for UPsy, weigh proposals against both `Mission.md` (does it reduce friction/serve an existing Goal) and this Vision (does it deepen institutional depth, professional gravity, or evidence infrastructure) — a proposal can pass one check and fail the other, and both should be reported.
- When asked to brainstorm new features, do not default to consumer-engagement patterns borrowed from unrelated consumer apps (social sharing, streaks, gamified virality) without first checking them against Goal 1 ("category ownership, not market share") — these patterns are frequently Vision-misaligned even when superficially engaging.
- When generating a new institutional product concept, always sketch how it would look at a scale of hundreds of institutions (per Goal 2), not just for a single pilot customer.

---

## Prompting Notes

- Weak prompt: *"What features should we build next quarter?"*
- Strong prompt: *"What features should we build next quarter that deepen institutional depth or professional gravity (Vision Goals 2–3), without sacrificing the friction-reduction principles in Mission.md?"*

When prompting for strategic or roadmap content, explicitly ask the model to flag any proposal that only serves consumer growth metrics without institutional or infrastructure value, per Vision Goal 1 — this keeps output honest about the tradeoff rather than presenting every growth idea as strategically sound by default.
