# U.Psy — Design Guidelines

## Emotional Thesis

> Calm, supportive, and quietly confident—like someone who listens before they speak.

Feels like a private museum crossed with a calm therapy room: editorial, warm, and deeply reassuring, with a burgundy-and-gold identity carried through both light and cinematic dark modes.

---

## Typography

### Principles
- Prioritize clarity over style
- Avoid dense text blocks
- Let content breathe

### Type System

| Level | Size (desktop / mobile) | Weight | Font | Usage |
|-------|--------------------------|--------|------|-------|
| Display | 68px / 44px | 600 | Fraunces | Hero, marquee moments |
| H1 | 44px / 34px | 600 | Fraunces | Page hero titles |
| H2 | 32px / 26px | 600 | Fraunces | Section anchors |
| H3 | 22px / 20px | 500 | Fraunces | Sub-structure |
| Body | 17px / 16px | 400 | Manrope | Paragraphs, line-height 1.65 |
| Small | 15px | 400 | Manrope | Labels, meta info, muted text |
| Accent italic | inherits | 500 italic | Cormorant Garamond | Softer editorial counterpoint to Fraunces |

### Font Stack
- **Sans (body/UI):** Manrope, system-ui, -apple-system, sans-serif
- **Display (headings):** Fraunces, Cormorant Garamond, Georgia, serif
- **Accent italic:** Cormorant Garamond, Fraunces, Georgia, serif
- **Arabic (`:lang(ar)`, `[dir="rtl"]`):** Amiri, serif — bold (700) for headings
- **Mono (numerals/data):** JetBrains Mono, ui-monospace, monospace

All five families are self-hosted via `@fontsource` packages, imported directly in `src/main.tsx` (one `import` per weight/style, e.g. `@fontsource/fraunces/600.css`). Keep those imports in sync whenever a weight is added or dropped here — don't reintroduce a Google Fonts CDN link for these, it would duplicate what's already self-hosted and add an unnecessary third-party request.

### Rules
- Max body width: ~68 characters (`.text-body` caps at `68ch`)
- Line height: 1.65 body, 1.05–1.3 for display/headings
- Letter-spacing: −0.02 to −0.03em for headings, −0.005em for body
- Tabular numerals (`font-variant-numeric: tabular-nums`) on `.font-mono` / `[data-numeric]` for prices and data

---

## Color System

### Emotional Direction
Calm → Safe → Non-clinical → Warm, editorial confidence

### Palette — Light ("Frosted Crystal Museum")

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--background` | 36 41% 95% | #F8F4EE | Ivory pearl canvas |
| `--foreground` | 0 0% 10% | #1A1A1A | Ink black text |
| `--primary` (`--warm-gold`) | 45 96% 48% | #F2B705 | CTA / brand identity |
| `--secondary` / `--accent` (`--warm-maroon`) | 350 76% 24% | #6D0F22 | Emotional burgundy accent |
| `--warm-crimson` | 348 80% 13% | #3D0611 | Cinematic shadow |
| `--card` | 0 0% 100% | #FFFFFF | Card surface |
| `--border` | 36 20% 86% | — | Hairlines |
| `--muted-foreground` | 0 0% 32% | — | Soft text |

### Palette — Dark (`.dark`)

| Token | Source | Usage |
|-------|--------|-------|
| `--background` | `--charcoal` (0 0% 10%, #1A1A1A) | Base surface |
| `--primary` | `--gold-accent` (42 100% 50%, #FFB300) | CTA |
| `--secondary` / `--accent` | `--burgundy` (348 82% 26%, #7A0C20) | Accent |
| `--card` | 0 0% 13% | Card surface |

### Palette — Marketing Night (`.marketing-night`, public/marketing routes)

A cinematic near-black variant that keeps the burgundy/gold/ivory identity, inverted:

| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | 348 40% 5% | Near-black burgundy |
| `--foreground` | 36 30% 96% | Ivory text |
| `--primary` | 45 96% 60% | Luminous gold |
| `--secondary` | 350 76% 40% | Deep maroon |

Includes an `.aurora-layer` ambient sweep and a subtle SVG grain overlay for cinematic depth.

### Brand anchors
`--burgundy` (#7A0C20), `--gold-accent` (#FFB300), `--gold-highlight` (#F4A300), `--crimson` (#A3263A), plus supporting `--clinical-blue`, `--lavender`, `--turquoise` for data/illustration accents.

### Rules
- Maintain contrast ≥ 4.5:1 (WCAG AA)
- Avoid pure white backgrounds in the default light theme (use `--background`, not `#fff`)
- Prefer soft gradients (`--gradient-gold`, `--gradient-burgundy`) over flat harsh colors
- All colors must use HSL via CSS custom properties
- Never hardcode color values in components — the one sanctioned exception is `Button`'s `primary` variant gradient, which is intentionally inlined for a precise diagonal sweep

---

## Spacing & Layout

### Grid
- Base unit: 8px
- Section padding: `--section-spacing` 80px desktop / `--section-spacing-mobile` 56px mobile
- Max content width: `--max-width` 1200px
- Gutter: `--gutter` 24px

### Radii
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-btn` | 14px | Buttons |
| `--radius-card` | 20px | Cards, glass surfaces |
| `--radius-input` | 12px | Inputs |
| `--radius` | 0.5rem | Generic shadcn fallback |

### Layout Principles
- One idea per section
- Clear vertical rhythm
- Avoid visual clutter
- Mobile-first: stack everything cleanly

### Breakpoints
- Mobile: < 768px
- Tablet: 768–1024px
- Desktop: > 1024px

---

## Surfaces & Glassmorphism

The card system is built on `.glass-card` / `.glass-effect` / `.card-float`: `backdrop-filter: blur(16–24px) saturate(140%)`, translucent background (`--glass-bg`), and a soft shadow that intensifies on hover (`--glass-shadow-hover`). Light and dark themes each define their own glass tint — don't reuse one theme's glass values in the other.

---

## Motion & Interaction

### Philosophy
> Motion should support, not distract. Feedback should feel gentle, not mechanical.

### Rules

| Property | Value | Usage |
|----------|-------|-------|
| Duration (UI) | 300ms (`--duration-ui`) | Buttons, toggles, inputs |
| Duration (emphasis) | 500ms (`--duration-emphasis`) | Section reveals, modals |
| Duration (ambient) | 800ms (`--duration-ambient`) | Background animations |
| Easing (calm) | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Most transitions |
| Easing (bounce) | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful confirmations |

### Motion Language

| Class | Pattern | Usage | Duration |
|-------|---------|-------|----------|
| `.motion-float` | Float | Hero objects, decorative icons | 6s infinite |
| `.motion-pulse` | Pulse | Emotional states, AI indicators | 3s infinite |
| `.motion-breathe` | Breathe | Loading states | 2.4s infinite |
| `.motion-breath` | Brand breath | 4-7-8 box-breathing cadence | 19s infinite |
| `.motion-aurora-drift` | Aurora drift | Ambient burgundy/gold backdrop | 40s infinite |
| `.motion-orbit` | Orbit | Cognitive/learning metaphors | 12s infinite |
| `.motion-flow` | Flow | Data/insights wave | 8s infinite |
| `.motion-fade-rise` | Fade-rise | Section entrance | 500ms once |
| `.motion-ring-pulse` | Ring pulse | Session reminders | 2s infinite |
| `.motion-shimmer` | Shimmer | Completion states | 3s infinite |

### Interactions

| Element | Hover Effect |
|---------|-------------|
| Cards (`.hover-lift`, `.card-float`, `.glass-card`) | `translateY(-6px) scale(1.02)` + enhanced shadow |
| Buttons | `scale(1.02–1.05)` + `hover-glow` shadow |
| Links (`.link-underline`) | Underline animation (`scaleX`) |
| Section load | Fade-in via `.motion-fade-rise` |

### Avoid
- Aggressive spinners
- Sudden jumps
- Flashy/distracting animations
- Animations > 800ms for UI elements

All motion classes respect `prefers-reduced-motion: reduce` — verify new animations are added to that media query.

---

## Voice & Tone

### Personality
Calm • Supportive • Non-judgmental • Human

### Microcopy Examples

| Context | Copy |
|---------|------|
| Onboarding | "Let's take this one step at a time." |
| Success | "You're making progress. Keep going." |
| Error | "Something went wrong. We're here to help." |
| Trust | "You're in safe hands." |
| CTA | "Start with a 2-minute check-in" |

---

## System Consistency

### Design Anchors
- Apple HIG → warmth + clarity
- Linear → clean structure
- Headspace → emotional tone

### Patterns
- Cards = safe containers, always `--radius-card` (20px)
- Clear hierarchy always visible
- Glass morphism for depth and layering — but themed per light/dark/marketing-night, never shared

---

## Accessibility

- Semantic HTML structure (proper heading hierarchy)
- Keyboard navigable (all interactive elements)
- Visible focus states: `:focus-visible` gets a 3px `--ring` outline + double box-shadow ring, with `border-radius: inherit` on interactive elements
- No color-only meaning
- Readable font sizes (minimum 14–15px)
- `prefers-reduced-motion` respected across all motion classes
- Alt text on all images

---

## Emotional Audit Checklist

- [ ] Does this feel safe within 3 seconds?
- [ ] Does any element create stress?
- [ ] Is the next step obvious without thinking?
- [ ] Does the UI feel patient, not demanding?

## Technical QA Checklist

- [ ] Typography follows scale (Fraunces display / Manrope body — confirm the font is actually loading, not falling back)
- [ ] Spacing consistent (8pt grid)
- [ ] Contrast passes WCAG AA+
- [ ] Motion within 150–300ms for UI
- [ ] No layout shifts during load
- [ ] All colors use design tokens (no hardcoded values)
- [ ] Glass tokens match the active theme (light / dark / marketing-night) — never cross-themed
