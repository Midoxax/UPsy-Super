# Phase 4 — Growth, SEO, Content & Newsletter

Traffic already exists; conversion is the gap. This phase targets professionals
specifically, automates distribution, and turns the audience into a list.

## Part 1 — Two audiences, two funnels

| | B2C / athletes & clients | B2B & professionals |
|---|---|---|
| Search intent | symptom and outcome queries | credential, supervision, business queries |
| Entry | quiz, blog, directory | training pages, PSF, organisation funnels |
| Conversion | booked session | application, cohort enrolment, org proposal |
| Proof needed | "will this help me" | "is this credible and worth my time" |

They must not share a landing page. Mixed intent is why traffic does not convert.

## Part 2 — Keyword map for professionals

Build `docs/seo/keyword-map.md` with columns: query, language, monthly volume,
intent, target URL, current rank, gap. Use the SEMrush tools in the workspace for
volumes rather than guessing.

Clusters to cover (FR primary, AR second, EN third):

- **Supervision** — "supervision clinique psychologue", "superviseur agréé Maroc",
  "heures de supervision psychologue"
- **Continuing education** — "formation continue psychologue Maroc", "TCC
  formation certifiante", "EMDR formation Maroc"
- **Practice building** — "s'installer psychologue libéral Maroc", "logiciel
  gestion cabinet psychologue", "tarifs consultation psychologue Maroc"
- **Instruments** — "GAD-7 français", "PHQ-9 interprétation", "échelles
  d'évaluation psychologique"
- **Performance** — "psychologie de la performance", "préparation mentale
  sportif", "mental toughness"

Rule: one URL per cluster, not per query. Cannibalisation across near-identical
pages is the most common self-inflicted ranking loss.

## Part 3 — Content architecture

```text
/                                marketing home (B2C)
/for-professionals               B2B hub — the professional's landing page
  /for-professionals/supervision
  /for-professionals/training
  /for-professionals/practice-tools
/blog                            index
  /blog/<slug>                   articles, one per cluster, cross-linked
/observatoire                    research authority asset
/learn                           courses (Phase 7)
/press                           media kit
```

Every article carries:
- One H1 matching the target query.
- A `head()` with unique title (<60 chars), description (<160), og:title,
  og:description, and og:image as an absolute URL.
- JSON-LD: `Article` + `Person` (author) + `Organization`. `FAQPage` where the
  page genuinely answers questions.
- `hreflang` for fr/en/ar with a self-referencing canonical.
- Internal links: three outbound to sibling articles, one to a conversion page.
- A visible author with credentials — E-E-A-T is not optional for health content.

### The content engine

```sql
CREATE TABLE public.content_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL,
  locale        text NOT NULL,
  title         text NOT NULL,
  excerpt       text,
  body_md       text NOT NULL,
  cover_path    text,
  author_id     uuid,
  cluster       text,                 -- links to the keyword map
  status        text NOT NULL DEFAULT 'draft', -- draft|review|published
  published_at  timestamptz,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, locale)
);
GRANT SELECT ON public.content_posts TO anon;        -- published only, by policy
GRANT SELECT, INSERT, UPDATE ON public.content_posts TO authenticated;
GRANT ALL ON public.content_posts TO service_role;
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads published posts" ON public.content_posts
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Authors read own drafts" ON public.content_posts
  FOR SELECT TO authenticated USING (author_id = auth.uid());
CREATE POLICY "Admins manage posts" ON public.content_posts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

Note the owner-read policy: without it authors cannot see their own drafts, since
the public policy filters them out.

Moving the existing hardcoded blog pages into this table makes automation
possible; leave them as routes and they stay manual forever.

## Part 4 — Automatic distribution

On `status → published`, an `event_outbox` event fans out:

| Target | Payload | Notes |
|--------|---------|-------|
| `sitemap.xml` | regenerate | already scripted in `scripts/generate-sitemap.ts` |
| LinkedIn | title + hook + link | primary channel for professionals |
| Instagram / Facebook | cover + caption | B2C |
| X | thread from section headings | optional |
| Newsletter queue | added to next issue | not sent immediately |
| Internal links | related-post links refreshed both ways | keeps the graph dense |

Implementation: a `social_posts` table (`content_id, network, status,
scheduled_for, external_id, error`) drained by the same cron as the outbox. Each
network needs its own app credentials as runtime secrets. Start with LinkedIn
only — one working channel beats four half-wired ones.

## Part 5 — Newsletter

### Model

```sql
CREATE TABLE public.newsletter_issues (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject      text NOT NULL,
  preheader    text,
  body_md      text NOT NULL,
  audience     text NOT NULL,      -- clients | professionals | organisations
  locale       text NOT NULL,
  status       text NOT NULL DEFAULT 'draft', -- draft|review|scheduled|sent
  scheduled_for timestamptz,
  sent_at      timestamptz,
  stats        jsonb
);
```

Recipients are resolved at send time from `crm_contacts` joined to
`crm_consents` (`purpose = 'newsletter'`, granted, not withdrawn) — never from a
frozen list, or withdrawals get ignored.

### AI-assisted drafting

A server function that takes the last N published posts plus a brief and drafts
subject, preheader, and body. Hard rules:

- **No clinical data is ever sent to a model.** Inputs are published content and
  aggregate metrics only.
- **Human approval is mandatory.** `draft → review → scheduled` cannot be skipped;
  no path exists from AI output to a send.
- The model drafts; the founder's voice edits. Publishing raw AI copy in a mental
  health context is a credibility risk that outweighs the time saved.

### Deliverability

Own sending domain with SPF, DKIM, DMARC. One-click unsubscribe header plus a
visible link (the unsubscribe handler already exists). Suppression list honoured
before every send. Warm the domain gradually; a cold domain sending thousands
lands in spam and takes months to recover.

## Part 6 — Measurement

Track only what changes a decision:

| Metric | Where |
|--------|-------|
| Organic sessions by cluster | Search Console |
| Cluster → conversion rate | `crm_activities` joined to `crm_deals` |
| Quiz completion → booking | funnel query |
| Newsletter open / click / unsubscribe | `newsletter_issues.stats` |
| Cost per qualified professional | manual, monthly |

Wire Search Console and review the keyword map monthly. Rankings move slowly;
monthly is the right cadence, weekly is noise.

## Deliverables

- [ ] `docs/seo/keyword-map.md` with real volumes
- [ ] `/for-professionals` hub + three cluster pages
- [ ] `content_posts` + existing articles migrated
- [ ] Per-article metadata, JSON-LD, hreflang, internal-link rules enforced
- [ ] Publish → LinkedIn + sitemap automation
- [ ] Newsletter with consent-resolved recipients and AI-draft + human approval
- [ ] SPF/DKIM/DMARC verified on the sending domain
