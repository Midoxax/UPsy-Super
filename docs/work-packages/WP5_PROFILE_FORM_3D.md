# WP5 — Profile form (3D layer)

Status: **WP5a + WP5b built on branch `claude/profile-form-3d`, not yet
released.** The remaining packages below are specified for whoever picks them
up next; each has acceptance criteria and a stop condition.

## The decision

The site already had 3D: the decorative orb on the homepage hero
(`components/three/HeroScene.tsx`) and the pitch scene. Both are backdrop.
This package adds the first 3D element that _is the product_: after the free
self-score, the visitor's four pillar scores become one shape.

Rejected alternatives, so nobody reopens them without a reason:

- **Six-axis MCPI form.** The live self-score measures four pillars (focus,
  regulation, recovery, meaning). Drawing six axes would display two
  dimensions nobody measured. Six axes become possible only when an
  instrument that measures them ships.
- **WebGL for everyone.** `canAffordWebGL()` already excludes phones, slow
  networks and weak GPUs — most Moroccan visitors. So the SVG outline is the
  real figure and WebGL is the upgrade, not the other way round.
- **More 3D on more pages.** One signature object. Restraint is the signal.

## What exists

| File                                                          | Role                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/lib/profile/profileShape.ts`                             | Pure geometry: scores → outline. Single source for both renderings. |
| `src/components/profile/ProfileGlyph.tsx`                     | SVG outline. Everyone gets this; zero extra JS.                     |
| `src/components/three/ProfileForm.tsx`                        | WebGL form, lazy chunk, sphere → profile morph.                     |
| `src/components/profile/ProfileFigure.tsx`                    | Chooses between them, labels, text alternative, pause off-screen.   |
| `src/pages/FreeScore.tsx`                                     | Renders the figure on the results screen, above the breakdown.      |
| `tests/unit/profile-shape.test.ts`, `profile-figure.test.tsx` | Geometry invariants, a11y text, single-colour rule.                 |

## Guardrails (apply to every later package)

1. **Shape, never verdict.** No colour, label or animation may depend on
   whether a score is high or low. One fill for every profile. A test
   enforces this.
2. **No new data flow.** The figure takes scores as props. It does not store
   them, put them in a URL, or emit analytics.
3. **Never the only carrier.** Every figure has a text alternative listing
   each pillar and score.
4. **Fail to the outline.** Chunk failure, no GPU, reduced motion → SVG.
5. **Not in the initial bundle.** Anything importing `three` is lazy.

## Remaining packages

### WP5c — Release gate (do first)

- Run `bun run verify` and `bun run check:bundle` against a real preview
  (`bun run preview:cf`); the bundle check could not be run in the build
  sandbox.
- Check the results screen in `en`, `fr`, `ar` on a 360 px phone and a
  desktop, light and dark theme. Labels must not overlap the figure.
- **Done when:** initial JS/CSS within `bundle-budget.json`; no label overlap
  in any locale; reduced-motion shows the SVG.

### WP5d — Hero continuity (needs an owner decision first)

Idea: a returning visitor who has taken the score sees their own form in the
homepage hero instead of the generic orb.

- **Stop condition:** this requires keeping the four scores on the device.
  That is a data decision, not an engineering one. Do not build until the
  owner has decided (a) whether scores may be kept in `localStorage`,
  (b) for how long, (c) what the consent wording is.

### WP5e — Athletes and Organisations variants

- Athletes: same form, three narrated states (calm / load / recovery), fixed
  illustrative values, clearly not the visitor's data.
- Organisations: a cluster of small forms for team-level aggregates.
- **Stop condition:** the organisation view must never be built on fewer
  profiles than the anonymity floor set in `docs/data-classification.md`;
  if that document does not set one, ask before building.

## Open items found while building (owner decisions, not done here)

- **Done in this branch:** the lowest band was labelled "At risk / À risque /
  في خطر". The self-score is a 12-item questionnaire, not a validated
  instrument, so a risk label on it was a clinical claim. It now reads
  "Under heavy load / Sous forte charge / تحت ضغط شديد".
- `free_score_completed` sends the four pillar scores to PostHog and the data
  layer. Check that against hard rule 7 ("clinical data … never to
  analytics") and decide whether the free score counts as clinical data.
