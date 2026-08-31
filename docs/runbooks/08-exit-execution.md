# 8 — Exit execution: the actual click-by-click

`00-exit-and-ownership.md` explains *why*. This file is the *doing*. Follow it
top to bottom. Nothing here is reversible-by-accident: the old project stays
running and untouched until the very last step.

Budget: two working days if nothing surprises you, three if something does.

---

## Before you start

You need four accounts, all in your own name (or your company's), none of them
shared with anyone:

| Account | What it holds | Cost |
|---------|---------------|------|
| GitHub organisation | the code | free |
| Supabase | database, accounts, files, backend functions | free tier fits today's size; ~$25/mo when you outgrow it |
| Cloudflare | the running website, the domain routing | free tier fits; ~$5/mo at volume |
| Google Cloud | sign-in, Maps, Search Console | free for what this app uses |

And three tools installed locally:

```bash
# Node 22 (the version in .nvmrc), bun, the Supabase CLI, psql, wrangler
node --version      # v22.x
bun --version
supabase --version
psql --version
```

**One rule for the whole procedure:** connection strings, service-role keys and
API tokens go into your terminal and your password manager. Never into a
commit, a document, or a chat window. If one lands somewhere it should not,
rotate it the same hour.

---

## Phase 1 — The repository is yours (MERGE, do not overwrite)

An earlier draft of this runbook said to import the tree as one clean commit
and not preserve history. **That was wrong and it is dangerous.** The code
already lives at `github.com/Midoxax/UPsy-Super`, `main` is green, and that
repo carries fixes made after the Lovable copy diverged. A clean re-import
deletes every one of them, silently, with no conflict to warn you.

The repo is the source of truth. Lovable is one editor of it, and anything
Lovable produces arrives as a branch and a pull request like any other change.

### 1.1 Take the changes as a patch

The Lovable-side changes are exported as a patch plus a list of files, never as
a tree that replaces yours:

```bash
git checkout -b lovable/exit-tooling
git apply --3way lovable-exit.patch      # --3way so conflicts are conflicts, not silence
git status                               # read this before committing anything
```

If `git apply` reports a conflict, resolve it in favour of **your** repo unless
you can articulate why the incoming version is better. Your ten commits were
made against a working deployment; the incoming copy was not.

### 1.2 Reconcile the migrations before anything else

The two trees disagree on the migration set, in both directions. Reconcile it
explicitly — this is the one divergence that a merge will not surface for you,
because migration files never conflict, they just accumulate:

```bash
diff <(ls supabase/migrations) <(ls ../lovable-copy/supabase/migrations)
```

Migrations are append-only and named by timestamp, so the merge is a union: add
what you are missing, keep what the other side does not have. Never renumber
and never edit an already-applied migration except to fix a replay bug (see
1.3). After merging, `bun run check:supabase` must be clean.

### 1.3 Re-run the replay test after merging

A migration set that applies cleanly to the live database can still fail on a
fresh one — the live database already has the rows the migration assumes.
`bun run exit:restore` against an empty scratch project is the only honest test,
and it is worth doing on the merged branch before it reaches `main`.

### 1.4 Lock `main`

Settings → Branches → add a rule for `main`:

- Require a pull request, one approving review
- Require status checks: `lint`, `typecheck`, `test`, `check:env`,
  `check:deploy`, `migration-safety`, `build`, `bundle-budget`
- Require branches to be up to date
- Dismiss stale approvals on new commits
- No force pushes, no deletions
- **Include administrators** — a rule you can bypass is not a rule

Add `.github/CODEOWNERS` per `handoff/02-repo-bootstrap.md`, and enable
Dependabot (Settings → Code security).

Check that `.env` is not tracked:

```bash
git ls-files | grep -x '.env' && echo "STOP — remove it and rotate every key in it"
```

Phase 1 is done when the Lovable changes are merged through a pull request that
CI passed, and no commit was lost in the process.


---

## Phase 2 — The database is yours

One day. This is the only phase with real risk, which is why every step below
is verified rather than assumed.

The timing is deliberate: at the moment of writing the live database holds
**20 accounts, 5 bookings, 22 CRM contacts**. That is small enough that a
mistake costs an afternoon. It will not stay that way.

### 2.1 Create the new project

Supabase dashboard → New project. Region: **eu-west** (Ireland or Frankfurt).
Not the US — Moroccan Law 09-08 and GDPR both become harder to argue with data
sitting under US jurisdiction, and the runbook `01-compliance-and-audit.md`
assumes EU.

Save the database password in your password manager immediately. It is shown
once.

### 2.2 Export the old, build the new

```bash
export SOURCE_DB_URL='postgresql://postgres:...@db.<old-ref>.supabase.co:5432/postgres'
export TARGET_DB_URL='postgresql://postgres:...@db.<new-ref>.supabase.co:5432/postgres'

bun run exit:export      # reads only; produces ./exit-dump/
bun run exit:restore     # replays 110 migrations, then loads the data
bun run exit:verify      # proves the two databases match
```

`exit:verify` compares every table's row count, every RLS flag and every policy
count across both databases, plus the account total. **If it exits non-zero,
stop.** Fix the difference it names and re-run. A restore that "looked fine" is
not evidence; this is.

### 2.3 Files

The dumps carry the storage *index*, not the *files*. Copy the objects in each
bucket across (dashboard download/upload is fine at this volume), then confirm
a signed URL from the new project actually opens a document. `user-documents`
is private and must stay private — verify that an unauthenticated request to it
returns 400/403, not the file.

### 2.4 Backend functions and their secrets

```bash
supabase link --project-ref <new-ref>
supabase functions deploy          # all 35
```

Then set every server secret on the new project: `RESEND_API_KEY`,
`CRON_SECRET`, `CI_WEBHOOK_SECRET`, `CRM_EMAIL_WEBHOOK_SECRET`,
`LOVABLE_API_KEY` (or its replacement — see the note below), and the rest of
the list in `handoff/04-environment-contract.md`.

**Note on AI features.** Nour, the journal synthesis, the clinical brief and
the OPS director currently call the Lovable AI gateway. Off Lovable that key
stops working. Replace it with a direct provider key (OpenAI or Google) in the
same environment variable position — the call sites are already isolated in the
functions, so this is a key swap, not a rewrite.

### 2.5 Auth configuration

The new project starts with default auth settings. Re-apply:

- Email confirmation **required** (it is mandatory in this product)
- Leaked-password protection (HIBP) **on**
- Google and Apple providers enabled, with the OAuth clients re-pointed to the
  new project's callback URL in the Google Cloud console and Apple developer
  portal
- Site URL and redirect allow-list set to `https://www.upsy.ma`

**Expect one visible consequence:** every currently signed-in user is signed
out once and has to sign in again. With 20 accounts this is a non-event. Say
so in advance rather than fielding twenty confused messages.

### 2.6 Re-point the repo

In the new repo, `.env` (local) and the GitHub Actions secrets both move to the
new project's values: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`VITE_SUPABASE_PROJECT_ID`. Also update `supabase/config.toml`'s `project_id`.

```bash
bun run check:supabase   # asserts config.toml, .env and the URL all name ONE project
bun run verify           # the full gate
```

`check:supabase` exists precisely because this wiring was wrong once before and
nothing noticed for 96 migrations. Do not skip it.

---

## Phase 3 — Hosting and the domain

Half a day.

### 3.1 Cloudflare

```bash
bunx wrangler login
bun run deploy           # first run creates the Worker
```

Server-only secrets go on the Worker, never in a config file:

```bash
bunx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
bunx wrangler secret put CRON_SECRET
bunx wrangler secret put CI_WEBHOOK_SECRET
bunx wrangler secret put CRM_EMAIL_WEBHOOK_SECRET
```

### 3.2 Deploy from CI, not from your laptop

Add to the repo's Actions secrets: `CLOUDFLARE_API_TOKEN` (scoped to *Edit
Cloudflare Workers*, nothing more), `CLOUDFLARE_ACCOUNT_ID`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SITE_URL`.

Push to `main`. `deploy.yml` names any missing secret before it wastes eight
minutes on a build.

### 3.3 Test on the Worker URL before touching DNS

Against `https://upsy.<subdomain>.workers.dev`, walk:

- the homepage, in English, French and Arabic (RTL)
- sign in with Google, then with Apple
- `/get-matched` end to end
- a booking, through to the payment step
- `/admin` — CRM, audit log, operations log, finance
- `/api/public/health` returns a green status

Anything broken gets fixed here, where nobody is watching.

### 3.4 DNS — note that there is nothing to cut over from

Check before you plan the cutover, because it changes the shape of it:

```bash
dig +short upsy.ma
dig +short www.upsy.ma
```

Both return nothing today. `upsy.ma` has **no DNS record at all** — neither the
apex nor `www` resolves anywhere. This is not a migration between two hosts; it
is a first publication.

That makes it easier, not harder, and the TTL dance below does not apply on the
first pass: there is no cached record anywhere in the world to expire. Create
the records pointing at the Worker and they are simply correct from the moment
they propagate. Set TTL to 300s while you are still verifying, and raise it to
3600s after a stable day.

It also means one thing is more urgent than it looks: until those records
exist, every canonical tag, `og:url`, hreflang alternate and sitemap entry in
the site points at a hostname that does not resolve, which suppresses indexing
rather than merely misfiling it. Publishing DNS is an SEO fix, not just a
hosting step.

The ordering below is what you follow for any *subsequent* move.


Follow `/admin/dns`, which lists the exact records. Order matters:

1. Lower the TTL on the existing records to 300s and **wait for the old TTL to
   expire** — a day earlier is ideal. Skipping this is what turns a five-minute
   cutover into a six-hour one.
2. Add `upsy.ma` and `www.upsy.ma` as custom domains on the Worker.
3. Switch the records. `www` is canonical; the apex 301-redirects to it.
4. Watch: HTTP 200 on both, certificate valid, `/api/public/health` green,
   Search Console not reporting a spike in 404s.
5. Raise the TTL back to 3600s once it has been stable for a day.

`VITE_SITE_URL` must be exactly `https://www.upsy.ma` — sitemap, canonical tags
and OAuth redirects are all derived from it.

### 3.5 Rollback

If it goes wrong: run the `rollback.yml` workflow, which restores the last good
Worker version in about a minute. DNS does not need to move back. The old
Lovable deployment also still exists; you have two nets, not one.

---

### 3.6 Prove the clinical notes still decrypt — before decommissioning anything

This is the one step in the whole exit that is not reversible if you get it
wrong, and it is the one most likely to be skipped, because nothing fails
loudly. Session notes are stored encrypted: `session_notes.encrypted_content`
holds ciphertext, `content` holds the literal string `[encrypted]`, and
`encryption_key_id` points at a **pgsodium/vault key that lives inside the
source Supabase project**.

`pg_dump` copies the ciphertext and the key *id*. It does not copy the key
material out of the vault. A restore can therefore look perfect —
`exit:verify` green, every row present, every count matching — while every
clinical note in the new database is permanently unreadable. The parity check
cannot detect this, because from its point of view nothing is missing.

So before you decommission the source project, and while it is still there to
fall back to:

1. Sign in on the **new** deployment as a psychologist who has at least one
   existing note.
2. Open that note in the dashboard. It must render the real text — not
   `[encrypted]`, not an error, not an empty body. That path exercises
   `decrypt-note`, the vault key and `encrypt_text`/`decrypt_text` together.
3. Write a **new** note and reopen it. This proves the write path provisioned
   a key correctly in the new project, which is a different question from
   whether the old keys survived.
4. Repeat for a second psychologist. Keys are per-psychologist
   (`psychologist_encryption_keys`), so one working account proves one key.

If step 2 fails, the vault keys did not come across. Stop. Do not delete the
source project; the plaintext is not recoverable from anywhere else. The
recovery path is to decrypt the notes in the source project, transfer the
plaintext over an encrypted channel, and re-encrypt them under new keys in the
target — which is only possible while the source still exists.

### 3.7 Swap the Lovable AI gateway

Eleven functions call Lovable-hosted endpoints with `LOVABLE_API_KEY`. They
keep working while the Lovable project exists, so this does not block the
cutover — but every one of them is a dependency you said you were removing, and
they will all fail on the same day if the key is revoked.

`https://ai.gateway.lovable.dev/v1/chat/completions` — OpenAI-compatible, so
swapping it is a base-URL and key change, not a rewrite:

| Function | What breaks if the key dies |
|---|---|
| `supabase/functions/ai-assistant/index.ts` | Nour AI chat |
| `supabase/functions/ops-director/index.ts` | OPS Director chat |
| `supabase/functions/ops-generate-protocol/index.ts` | Event protocol generation |
| `supabase/functions/crisis-screening/index.ts` | **Crisis detection** — treat as priority one |
| `supabase/functions/session-summary/index.ts` | Session summaries |
| `supabase/functions/journal-synthesize/index.ts` | Journal synthesis |
| `supabase/functions/generate-clinical-brief/index.ts` | Intake clinical briefs |

`https://connector-gateway.lovable.dev/resend/emails` — this one is a *mail*
relay, not an AI call, and it is the more urgent swap: point it at Resend
directly with your own `RESEND_API_KEY`.

| Function | What breaks |
|---|---|
| `supabase/functions/send-notification/index.ts` | Notification email |
| `supabase/functions/auth-email-hook/index.ts` | **Sign-up, verification and password-reset email** |
| `supabase/functions/process-email-queue/index.ts` | The queued-email dispatcher |
| `supabase/functions/handle-email-suppression/index.ts` | Bounce/complaint handling |

`preview-transactional-email` also reads `LOVABLE_API_KEY`, but only as a
shared secret to authenticate its caller — it makes no outbound call. Replace
the value; there is no provider to swap.

Also update the CSP: `src/lib/security-headers.ts` allow-lists
`https://ai.gateway.lovable.dev`. Whatever host replaces it goes there, or the
browser blocks the request with no useful error.

### 3.8 `app_logs`

Both trees now carry it, from different directions, and both are idempotent:
your `20260829170000_app_logs_baseline.sql` creates the table and its four
routines; the Lovable side has a later migration that only `REVOKE`s on those
routines, guarded by `to_regprocedure(...) IS NOT NULL`. Keep the baseline —
it is the one that actually defines the objects — and let the later migration
run after it. Order is already correct by timestamp.

---

## Phase 4 — Only now, the bugs


The 404s, the failed deploys, the payment gateway. Fixed on the new pipeline so
that every fix is verified in the place it will actually live. Payments are
blocked on a business decision (CMI merchant contract vs. bank transfer vs. an
international gateway), not on code.

---

## Phase 5 — Handover

Update `handoff/00-CLAUDE-PROMPT.md` and `handoff/CLAUDE.md` with the real repo
URL and the real project ref, then hand that file to whichever agent or
engineer takes over. It is written to be read cold.

---

## When you are done

- [ ] Code lives in `<org>/upsy`, `main` protected, CI green
- [ ] Database on your own Supabase account, `exit:verify` clean
- [ ] Files copied, private buckets still private
- [ ] 35 functions deployed, every secret set
- [ ] Auth: confirmation on, HIBP on, Google + Apple working
- [ ] Worker deployed from CI, secrets on the Worker
- [ ] `upsy.ma` and `www.upsy.ma` serving from Cloudflare, certificate valid
- [ ] Rollback workflow tested once, deliberately
- [ ] `exit-dump/` deleted from your laptop
- [ ] Lovable changes merged into the existing repo via PR, no commit lost
- [ ] Migration sets reconciled in both directions, `exit:restore` replayed clean
- [ ] **A pre-existing clinical note opens as readable plaintext on the new deployment**
- [ ] `LOVABLE_API_KEY` call sites swapped, CSP updated, auth email verified end to end
- [ ] `upsy.ma` and `www.upsy.ma` resolve at all — they did not before
- [ ] Old Lovable project left published as an archive, not deleted, for 30 days


At that point nothing in the running product depends on Lovable, and you can
stop paying for it whenever you like.
