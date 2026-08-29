# RTL (Arabic) Verification Checklist

Run this checklist whenever touching layout, typography, forms, or navigation.
All routes serve Arabic under `/ar/*`; the tree receives `<html lang="ar" dir="rtl">`
and every element inherits **Amiri** via `:lang(ar), [dir="rtl"]` scoping in
`src/index.css`.

## How to run

1. `bun run dev`
2. Open http://localhost:8080/ar/ (or any route prefixed with `/ar`).
3. Confirm the language switcher (Header + Footer) toggles EN → FR → AR and
   the choice persists across refresh (cookie `lng`, 180 days).
4. Walk the checklist below on each surface. Fail = file a ticket + add to the
   visual baseline (`bun run test:visual -- --update`).

## Global

- [ ] `<html>` has `lang="ar"` and `dir="rtl"` on `/ar/*` routes
- [ ] Body font is **Amiri** everywhere (headings, paragraphs, inputs, buttons)
- [ ] Numerals in prices / dates / durations stay LTR (JetBrains Mono +
      `tabular-nums`) — they should not flip
- [ ] Icons that indicate direction (arrows, chevrons, "next" carets) are
      mirrored or logically flipped
- [ ] No horizontal scroll on `/ar/`, `/ar/psychologists`, `/ar/pricing`

## Header / Navigation

- [ ] Logo appears on the **right**, action buttons (auth, language, theme) on the **left**
- [ ] Dropdown menus open aligned to the right edge of their trigger
- [ ] Mobile hamburger opens a drawer that slides in from the **right**
- [ ] Active-route underline / indicator sits under the correct nav item

## Forms (Auth, Get-Matched, Contact, Booking notes)

- [ ] Labels align to the **right**; input text is right-aligned; caret starts on the right
- [ ] Placeholders read naturally in Arabic (no clipped ellipsis)
- [ ] Password strength meter fills **right → left**
- [ ] Icons inside inputs (Eye, Search, Lock) sit on the **left** edge (was right in LTR)
- [ ] Error messages align right with their field
- [ ] Radio / checkbox rows: control on the right, label to its left

## Buttons & CTAs

- [ ] Primary CTA (`Book your first session`, `Continue to book`) reads right-to-left
- [ ] Icon-with-label buttons: icon appears on the **left** of the label
- [ ] Chevron / arrow icons in "Read more" style CTAs point **left** (toward the reading direction)
- [ ] Loading spinner + label stay in correct order

## Cards (Psychologist directory, Featured, Pricing tiers)

- [ ] Avatar on the **right**, meta (name, city, rating) flows to the **left**
- [ ] "Online now" pulse dot sits on the right edge of the card
- [ ] Price + `MAD` unit stays LTR (`MAD 600`, not `006 MAD`)
- [ ] Card action buttons align right in the footer of the card
- [ ] Grid gaps and container padding are symmetric (no leaked `pl-*` / `pr-*`)

## Booking widget (`/ar/psychologists/:id`)

- [ ] Week navigation: **← previous week** button on the **right**, **→ next week** on the **left**
- [ ] Day chips read Sunday → Saturday left-to-right (calendar convention)
      even in RTL — do NOT flip the calendar grid
- [ ] Time slots grid reads right → left row-wise
- [ ] Session-type toggle (Video / In-person / Phone): icon on the left, label on the right
- [ ] Confirm panel:
    - [ ] "With: {name}" — psychologist name in Amiri
    - [ ] "When: …" — date/time in LTR JetBrains Mono
    - [ ] "Fee: 600 MAD" — number LTR, unit label RTL
- [ ] Back / Confirm buttons: **Back on the right, Confirm on the left** (mirrors LTR order)
- [ ] Post-signup pending-booking banner text is right-aligned

## Footer

- [ ] Brand wordmark (`U.Psy` in Fraunces) on the **right**
- [ ] Link columns flow right → left; headings right-aligned
- [ ] Social icons row on the right, WhatsApp number stays LTR
- [ ] "Made with ♥ in Morocco — serving clients worldwide" reads right-to-left

## Typography specifics

- [ ] Fraunces headline weights render as **Amiri** on `/ar/*` (never fall back to Fraunces)
- [ ] Italic accents (`.accent-italic`) degrade gracefully — Amiri has no italic, so
      Cormorant Garamond italic should NOT leak into Arabic text
- [ ] Line-height feels comfortable — Amiri needs ~1.7 for body copy
- [ ] `text-h1` / `text-h2` don't cause diacritic clipping (padding-top OK)

## Automated regression

`bun run test:visual` snapshots every route in AR at desktop + mobile and diffs
against baseline (2% pixel tolerance). Any RTL regression above tolerance fails CI.
