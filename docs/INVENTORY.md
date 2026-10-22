# What exists, and where to find it

Nothing built is deleted. This is the map of the platform: where every page
is linked, which pages are reached only from outside the site, and which
components are kept but not mounted, with where they would go.

Keep it current: a new public page goes into `src/content/siteMap.ts`, which
feeds the site-map page (`/explore`, linked in the footer) and the XML
sitemap. A page in that list is never unreachable.

## Public pages

All grouped in `src/content/siteMap.ts` and shown at `/explore`:

| Group | Pages |
| --- | --- |
| Find care | /psychologists, /get-matched, /book-a-call, /pricing, /services, /free-score, /assessment-lab, /assessments, /ai-assistant, /membership, /install |
| Sport and performance | /mental-performance, /mental-toughness-athletes, /for-athletes, /athlete-hub, /talent-innovation-hub |
| Organizations and schools | /for-organizations, /services/consulting-for-organizations, /apply/organization, /center, /center/schools, /soleterre |
| Learn | /blog (+ every post), /resources, /learn, /observatoire, /skool |
| For psychologists | /apply, /pricing-specialists, /campaigns/join-specialist, /campaigns/lsspm, /moroccan-umbrella, /psf |
| About | /about, /founder, /why-us, /press, /brand, /campaigns/first-session, /contact |
| Legal | /legal, /privacy, /terms |

Every page exists in English and under `/fr`, `/ar`, `/ber`.

## Signed-in spaces

| Space | Path | Reached from |
| --- | --- | --- |
| Client dashboard | /dashboard/client | sign-in, "My space" |
| Psychologist dashboard | /dashboard/specialist | sign-in, "My space" (tabs include Athletes; sidebar has the LSSPM sharing switch) |
| Organization dashboard | /dashboard/organization | sign-in |
| Athlete Hub (9 modules) | /athlete-hub | header, site map, sign-in for athletes |
| League portal (LSSPM) | /league | sign-in for League reviewers, dashboard switcher |
| Admin console | /admin | sign-in for admins; Content & social and Monitoring tabs |
| Admin workspaces | /admin/applications, /admin/crm, /admin/finance, /admin/audit, /admin/growth-leads, /admin/dns | admin "Tools" menu |
| Ops workspaces | /ops/* | admin "Tools" menu |
| Notifications | /notifications | the bell |
| Account security | /auth/mfa-setup | the security settings |

## Reached only from outside the site (by design)

| Path | Comes from |
| --- | --- |
| /b/$slug | a psychologist's shareable booking link |
| /invite/$code | referral links |
| /booking/respond/$token | session proposal emails |
| /intake/$bookingId | intake reminder emails |
| /reset-password | password reset emails |
| /unsubscribe | every marketing email |
| /newsletter/confirm | newsletter confirmation email |
| /session/$id | the session link in dashboards and emails |

## Feeds

- `/blog-feed.json`, `/rss.xml`, `/rss-fr.xml`: generated at build by
  `scripts/generate-feeds.ts`. The newsletter and the social posting read
  the JSON feed.
- `/social/<slug>.jpg`: Instagram cards, one per post.

## Components kept but not mounted

Kept on purpose; each is ready to be placed again.

| Component | What it is | Where it could go |
| --- | --- | --- |
| `components/admin/AdminStats.tsx` | Older admin KPI block | Admin Overview, if a metric there is missing |
| `components/admin/PsychologistDirectory.tsx` | Older psychologist list | Superseded by the Psychologists tab |
| `components/admin/UserManagement.tsx` | Older users table with role editing | Superseded by Users tab (`UsersPanel`), which took over its invite dialog |
| `components/MegaMenu.tsx` | Large dropdown navigation | Header, if the menu grows |
| `components/home/ScrollGuide.tsx` | Mascot that appears while scrolling | Home page, as an experiment |
| `components/home/PathwaysSection.tsx` | "Choose your path" cards (care, performance, organizations) | Home page, under the hero |
| `components/home/PillarsSection.tsx` | The four pillars | Home or /about |
| `components/home/ResearchSection.tsx` | Research highlights | /observatoire |
| `components/home/LearningSection.tsx` | Courses teaser | /learn or home |
| `components/home/PsfSection.tsx` | Psychologists without borders block | /psf or home |
| `components/home/SelfAssessmentSection.tsx` | Self-assessment call to action | Home or blog posts |
| `components/home/CommunitySection.tsx` | Community teaser | /skool |
| `components/home/SectionDivider.tsx` | Decorative divider | Any section break |
| `components/dashboard/BillingTab.tsx` | Older client billing tab | Superseded by the client Billing tab |
| `components/dashboard/SimulateCheckoutDialog.tsx` | Test checkout | Development only |

## Automations

All visible in Admin → Monitoring, with their last run:

| Job | Schedule | Does |
| --- | --- | --- |
| process-email-queue | every 5 s | sends queued email through Resend |
| session-reminders-cron-every-10min | every 10 min | session reminders by email and WhatsApp |
| anamnesis-reminder-every-6h | every 6 h | intake form reminders |
| content-automation-hourly | hourly | blog to LinkedIn / Facebook / Instagram, monthly newsletter |
| ops-task-watcher | every 5 min | ops workspace tasks |
| home-hero-auto-promote | daily | promotes the winning home hero |
| purge-app-logs, purge-audit-log, purge-expired-clinical-records | monthly | retention |
