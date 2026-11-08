# Booking funnel (PostHog)

What the site sends to PostHog (EU, project key in the build), and how to read
it. PostHog only starts after a visitor clicks **Accept analytics**; nothing
is sent before that or without it. Persistence is in memory (no cookies), so a
"person" is one visit: a full reload or an email link starts a new one.

## Events

| Event                                  | Fired when                                                   | Useful properties                                                |
| -------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `$pageview`                            | every page, including in-app navigation                      | `$current_url`                                                   |
| `experiment_view`                      | the home hero renders                                        | `experiment_id`, `experiment_variant`                            |
| `cta_click`                            | a tracked button is clicked (hero, etc.)                     | `cta_label`, `cta_location`, `destination`                       |
| `free_score_completed`                 | the free score is finished                                   | pillar scores                                                    |
| `signup_completed`                     | an email sign-up succeeds                                    | `method`, `locale`                                               |
| `booking.step_viewed`                  | each step of the booking modal: `slot`, `confirm`, `success` | `step`, `step_index`, `is_authenticated`, `price_bucket`         |
| `booking.completed` / `booking.failed` | booking made / refused                                       | `reason_code` on failure (`not_authenticated`, `request_failed`) |
| `match.step_viewed`                    | each step of `/get-matched`: `welcome` … `results`           | `step`, `step_index`, `selection_count`                          |
| `match.completed` / `match.failed`     | matching results shown / none or error                       | `result_count`, `reason_code`                                    |

Every event after the hero renders also carries `exp_home_hero_v1`, the variant
that visitor saw, so variants can be compared on bookings, not only on clicks.

## The funnel to build

PostHog → **Product analytics → New insight → Funnel**, conversion window 1 day:

1. `$pageview` where `$current_url` matches the home page
2. `$pageview` where `$current_url` contains `/psychologists`
3. `booking.step_viewed` where `step = slot` (booking modal opened)
4. `booking.step_viewed` where `step = confirm`
5. `booking.completed`

Then **Breakdown → `exp_home_hero_v1`** to compare the hero variants, and save
it to a dashboard named "Booking funnel". Duplicate it with steps 3 to 5 replaced
by `match.step_viewed` (one step per `step` value) and `match.completed` to see
where the matching questionnaire loses people. `booking.failed` broken down by
`reason_code` shows how many bookings stop at sign-in.

## Checking it works

PostHog drops events from automated browsers (headless Chrome, `navigator.webdriver`),
so a scripted test sees nothing. Check from a normal browser: accept analytics on
upsy.ma, click around, then open PostHog → **Activity → Live events**.
