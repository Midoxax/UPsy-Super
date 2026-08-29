# Visual regression tests

Catches typography drift (Fraunces / Manrope / JetBrains Mono) and RTL layout
regressions across the main marketing routes in **EN**, **FR**, and **AR**
(right-to-left) at desktop (1440×900) and mobile (390×844).

## Setup (one-time)

```bash
bun add -d playwright pngjs pixelmatch @types/pixelmatch @types/pngjs
bunx playwright install chromium
```

## Baseline the current UI

```bash
bun run dev                      # in one terminal
bun run test:visual -- --update  # in another — writes tests/visual/baseline/
```

Commit the baseline PNGs.

## Run the regression suite

```bash
bun run test:visual
```

Exits non-zero if any capture drifts more than **2%** from baseline. Diffs land
in `tests/visual/diff/`; captured shots in `tests/visual/current/`.

## Covered routes × locales × viewports

Routes: `/`, `/psychologists`, `/pricing`, `/auth`, `/get-matched`, `/founder`
× `en` / `fr` / `ar` × `desktop` / `mobile` = **36 screenshots**.

The AR shots pin RTL layout: verify nav flip, form label alignment, card
gutters, and booking widget button order stay correct after future edits.
