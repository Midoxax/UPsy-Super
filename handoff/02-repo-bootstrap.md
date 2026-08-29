# 2 — Repository bootstrap

Goal: a clean repository that is the single source of truth, with guard rails
that make a bad merge hard.

## What travels

Carry over, unchanged:

```
src/  supabase/  scripts/  tests/  public/  docs/
.github/workflows/  package.json  bun.lock  bunfig.toml
vite.config.ts  vitest.config.ts  tsconfig.json  eslint.config.js
components.json  .nvmrc  .env.example  bundle-budget.json
ARCHITECTURE.md  DEPLOYMENT.md  README.md  SECURITY.md
design-guidelines.md  design-system/
```

## What stays behind

| Path | Why |
|------|-----|
| `.lovable/` | Registers the app as a design-system library; also holds stale plans and a `design-system.json` that does not describe this product. |
| `.wrangler/` | Local state, regenerated. |
| `fill_form.js`, `request.txt` | Scratch files. |
| `mem_i18n_update.txt`, `mem_intake_form.md` | Session notes. |
| `implementation-plan.md`, `masterplan.md`, `project_map.md` | Superseded by `docs/`. |
| `scripts/check-vercel-config.mjs` | Vercel is not the target; delete with the workflow step that calls it, or keep only if Vercel stays a declared fallback. |
| `.env` | Never commit. `.env.example` is the contract. |

Rewriting history is not worth it: start the new repo with a single
`chore: import U.Psy platform` commit from a clean working tree. The old repo
stays read-only as an archive.

## Root layout of the new repo

```
CLAUDE.md              ← moved from docs/handoff, agent rules
README.md              ← what it is, how to run it, where the docs are
CONTRIBUTING.md        ← branch, commit, review, release conventions
SECURITY.md            ← vulnerability disclosure + internal security policy
docs/                  ← this handoff pack
  inventory/*.json
  runbooks/*.md        ← carried over from docs/runbooks
.github/
  workflows/           ← ci, deploy, production-check, rollback, security-scan
  CODEOWNERS
  pull_request_template.md
  ISSUE_TEMPLATE/{bug.yml,task.yml,security.yml}
  dependabot.yml
```

## First-commit sequence

```bash
gh repo create <org>/upsy --private --description "U.Psy platform"
git init && git branch -M main
# copy the carry-over set into the working tree
git add -A && git commit -m "chore: import U.Psy platform"
git remote add origin git@github.com:<org>/upsy.git
git push -u origin main
```

Create the repo under an **organisation**, not a personal account, so access
survives any single person.

## Branch protection on `main`

- Require a pull request; at least one approving review.
- Require these status checks to pass: `lint`, `typecheck`, `test`,
  `check:env`, `check:deploy`, `migration-safety`, `build`, `bundle-budget`.
- Require branches to be up to date before merging.
- Require conversation resolution.
- Dismiss stale approvals on new commits.
- No force pushes, no deletions.
- Include administrators — the rule is worthless if the owner can bypass it.

## CODEOWNERS

```
*                       @<org>/engineering
/supabase/migrations/   @<org>/engineering @<org>/security
/src/lib/security-headers.ts  @<org>/security
/.github/workflows/     @<org>/engineering
/docs/08-security-compliance.md @<org>/security
```

Anything touching migrations, security headers, or CI needs a second pair of
eyes. That is where the expensive mistakes are.

## Pull request template

```markdown
## What changed

## User-visible impact

## How I verified it
- [ ] `bun run verify` green
- [ ] `node scripts/check-migrations-safety.mjs` clean
- [ ] Walked the affected screens (list them)
- [ ] Checked `ar` / RTL if strings changed

## Rollback

## Security / privacy notes
- [ ] No clinical data crosses a new boundary
- [ ] New tables have GRANT + RLS + policies
- [ ] No secret added to client-visible code
```

## Environments

Two GitHub environments: `preview` and `production`. Production requires a
reviewer before deploy. Secrets are scoped per environment — see
`docs/04-environment-contract.md`.

## Dependabot

Weekly, grouped by ecosystem, security updates immediately. Pin the runtime:
`.nvmrc` for Node, `oven-sh/setup-bun` for Bun in CI. Bun is the package
manager — `bun.lock` is the committed lockfile and there is no
`package-lock.json`, so `npm ci` has nothing to install from.

## Local setup, for the record

```bash
git clone git@github.com:<org>/upsy.git && cd upsy
bun install
cp .env.example .env      # fill from the secret store, never from a chat log
bun run dev               # http://localhost:8080
```
