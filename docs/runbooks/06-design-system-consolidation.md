# Phase 6 — Design System Consolidation

The platform has grown three visual worlds: the marketing site (editorial luxe,
deep burgundy and gold), the app dashboards (light maroon/beige/gold), and the
OPS command centre (cyan cinematic). Each is internally coherent; together they
read as three products.

Do this **after** the feature set settles. Consolidating a moving target means
doing it twice.

## Step 1 — Audit

Produce `docs/design/audit.md` by walking every route and recording, per surface:
heading font and scale, body font, primary CTA style, card treatment, spacing
rhythm, radius, shadow, and the token (or hardcoded value) behind each.

Find the hardcoded values first:
```bash
# raw colours
rg -n "#[0-9a-fA-F]{6}\b" src --glob '!src/styles.css' --glob '!*.test.*'
# raw hsl / rgb
rg -n "hsl\(|rgba?\(" src --glob '!src/styles.css'
# arbitrary Tailwind values
rg -n "\[[0-9]+px\]|\[#" src
# font families outside the token set
rg -n "font-family|fontFamily" src --glob '!src/styles.css'
```

Every hit is either a token that should exist or a token that exists and was
bypassed. Both go in the audit table.

## Step 2 — Settle the three-layer token model

Keep three themes, but derive them from one primitive set so they cannot drift.

```text
Layer 1 — primitives (src/styles.css @theme)
   raw scales: maroon-50..900, gold-50..900, cyan-50..900,
   neutral-0..1000, spacing, radii, shadows, durations
        │
Layer 2 — semantic aliases per theme
   --background --surface --foreground --primary --accent
   --muted --border --ring --destructive --success
        │  .marketing-night   (deep burgundy canvas, gold accent)
        │  :root / light      (app dashboards)
        │  .ops-theme         (cyan command centre)
        │
Layer 3 — components
   consume semantic names ONLY. A component never names a primitive,
   never inlines a hex, never hardcodes a px radius.
```

Rules that make it stick:
- Components reference `var(--primary)` / `bg-primary`, never `--maroon-700`.
- A theme is switched by a class on a wrapper, nothing else.
- New value needed? Add a primitive and a semantic alias. Never inline.

## Step 3 — Typography, once

Per the settled stack:

| Role | Font | Notes |
|------|------|-------|
| Display / headings | Fraunces | editorial weight, optical sizing |
| Serif accent | Cormorant Garamond | pull quotes, italic accents |
| Body / UI | Manrope | all interface text |
| Arabic | Amiri | `:lang(ar)`, `[dir="rtl"]` |
| Numerals | JetBrains Mono | `tabular-nums` for money, dates, metrics |

One scale across all three surfaces — display / h1 / h2 / h3 / body-lg / body /
body-sm / caption — defined once as tokens, with responsive clamps. A dashboard
h2 and a marketing h2 differ in colour and spacing, never in scale.

Arabic needs explicit verification, not assumption: nav, forms, buttons, cards,
tables, and the footer, in RTL, on every main route. `docs/RTL_CHECKLIST.md`
already exists — extend it into the pass.

## Step 4 — Component inventory

One canonical implementation each. Delete near-duplicates rather than adding a
variant:

- `Button` — variants `primary | secondary | ghost | outline | destructive`,
  sizes `sm | md | lg | icon`. No inline `style` gradients; the gold gradient is
  a token.
- `Card` — `default | elevated | glass | outline`, one radius token, one padding
  scale. `CardTitle` and `CardSubtitle` use the shared type scale everywhere.
- `Input` / `Select` / `Textarea` — one height scale, one focus ring, one error
  state.
- `Badge` — including the five accreditation tiers as named variants.
- `Section` — one page-section wrapper owning vertical rhythm, so pages stop
  inventing their own spacing.
- `PageHeader` — title, subtitle, breadcrumb, actions.
- `EmptyState`, `LoadingState`, `ErrorState` — currently reinvented per page.

## Step 5 — Fix order

Work surface by surface so nothing regresses mid-flight:

1. Tokens and typography (`src/styles.css`) — no component edits yet.
2. Primitives in `src/components/ui/` — verify against every page that uses them.
3. Marketing pages (home, funnels, blog, legal).
4. Auth and onboarding.
5. Client dashboard and booking.
6. Specialist and organisation dashboards.
7. Admin.
8. OPS — last, and it keeps its cyan theme; only the primitives underneath change.

After each step: `bun run build`, then the visual regression suite in
`tests/visual/`. Extend the snapshot set before starting, not after — snapshots
taken after a change prove nothing.

## Step 6 — Guardrails

Keep it consolidated:

- An ESLint rule (or CI grep) failing the build on raw hex outside `styles.css`.
- Every new component ships with a props interface and a barrel export.
- `design-guidelines.md` updated to describe the settled system, with the three
  themes and when each applies.
- The existing previews in `design-system/previews/` regenerated from the real
  tokens so they cannot go stale.

## Deliverables

- [ ] `docs/design/audit.md` listing every inconsistency
- [ ] Three-layer token model in `src/styles.css`, one type scale
- [ ] Component inventory reduced to one canonical implementation each
- [ ] Zero raw hex outside `styles.css`
- [ ] RTL verified across all main routes
- [ ] Visual regression suite extended and green
- [ ] CI guardrail against re-drift
