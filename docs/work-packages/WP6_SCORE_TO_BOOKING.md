# WP6 — From self-score to a first booked session

Status: **specified, not built.** Written 15 Nov 2026 for whoever builds it.
Depends on nothing else in the backlog.

## The problem, with numbers

Read from production on 15 Nov 2026 (counts only; may include internal tests):

- 5 self-score leads since July; 15 new accounts in the last 30 days.
- 17 bookings ever, 13 cancelled, 1 paid.
- **1 published specialist**, 7 unpublished.

The results screen ends with "See your matched psychologists", which opens the
directory filtered by the visitor's lowest pillar. With one published
specialist that promise is not kept: the visitor arrives on a list of one, or
of none if the filter excludes them. The step most likely to lose people is
the one right after the product has their attention.

## The decision

Stop sending the visitor to a directory. Offer **one concrete next step**
chosen by what is actually available, in this order:

1. **A specialist is bookable in the next 7 days and covers the visitor's
   lowest pillar** → show that one person (name, photo, one line, next free
   slot, price) with a single button that opens the booking modal on that slot.
2. **A specialist is bookable but none covers that pillar** → show the next
   available specialist, described honestly as a first conversation to orient
   the visitor, not as a match.
3. **Nobody is bookable in 7 days** → no dead end: offer to be contacted when
   a slot opens (the email is already captured by the form), and say when to
   expect it. ⚠️ The founder sets the promised delay.

Rejected:

- **Keep the directory link as the main action.** It only works with supply
  the platform does not have yet.
- **Recommend an AI programme first.** It moves the visitor away from the paid
  session, which is the only thing the business measures today.
- **Show three specialists.** Choice lowers conversion when the visitor cannot
  judge the difference; and there are not three.

## Guardrails

1. **No result in a URL.** Today the link carries `pillar=<lowest>` and a
   query derived from it, in the address bar and in the email. The lowest
   pillar is the visitor's result. Pass it in memory (router state) inside the
   site, and in the email link only an opaque lead reference that the server
   resolves. Remove `pillar` and `q` from both links.
2. **No result in analytics.** Events for this step go through
   `src/lib/analytics/freeScore.ts` and carry the band at most. Add the new
   keys to `ALLOWED_KEYS` and extend its test.
3. **No clinical promise.** The copy must not say the specialist will "fix" or
   "treat" the pillar, nor a number of sessions. The current text promises
   results "in 4–6 sessions"; remove that claim or have the clinical lead
   approve wording he can defend.
4. **"Matched" means something.** Use the word only in case 1.
5. **Price shown before the click**, as the terms of use already require.

## What to build

| Piece                                | Detail                                                                                                                                                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server function `next_step_for_lead` | Input: pillar. Output: one of the three cases above, with the specialist's public card and next slot. Reads only published specialists and public availability; no client data. Callable by anonymous visitors, rate-limited. |
| Results screen                       | Replace the single call to action with the card for the returned case. Keep the pillar breakdown and the profile figure. The pillar rows stop being links.                                                                    |
| Email                                | Same case logic at send time; link by opaque reference.                                                                                                                                                                       |
| Events                               | `free_score_next_step_shown` and `free_score_next_step_clicked`, each with `case` (`matched`, `available`, `waitlist`) and `band`. Nothing else.                                                                              |
| Copy                                 | EN, FR, AR for the three cases. ⚠️ Clinical lead approves before release.                                                                                                                                                     |

## Done when

- A visitor in each of the three cases sees the right card, in the three
  locales, on a 360 px phone.
- No URL produced by this flow contains a pillar name or a score, checked by a
  test.
- The analytics test still passes with the two new events.
- A database test proves `next_step_for_lead` returns no unpublished
  specialist and no data about any client.
- The booking modal opens on the proposed slot in one tap.

## How to judge it afterwards

Baseline to beat, last 30 days before release: self-scores completed →
bookings created → bookings paid. With volumes this small, read counts, not
percentages, and wait for at least 30 completed self-scores before concluding
anything.

## Stop conditions

- Any need to store more about the lead than today → back to the owner.
- Any wording about outcomes or number of sessions → clinical lead.
- If no specialist is published at release time, ship case 3 only.

## The larger point

This package improves a step. It does not fix supply. Publishing verified
specialists (7 profiles are waiting) will move bookings more than any change
to this screen.
