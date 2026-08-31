#!/usr/bin/env bash
#
# Phase 2, step 1 — take a complete, restorable copy of the CURRENT (Lovable-
# managed) database. This script only reads. It cannot damage the live project.
#
# What it produces, in ./exit-dump/ :
#
#   roles.sql   — database roles (needed before anything else restores)
#   schema.sql  — the public schema as the live database actually has it,
#                 used only as a reference to diff against the migrations
#   data.sql    — every row in the public schema
#   auth.sql    — auth.users, identities and sessions: the accounts themselves
#   storage.sql — storage bucket + object metadata (the FILES are copied
#                 separately, see the runbook; this is only the index)
#
# Why a dump and not a hand-written export: 158 tables with foreign keys
# between them have exactly one safe insertion order, and pg_dump already
# knows it. Writing that order by hand is how people lose rows.
#
# Usage:
#   export SOURCE_DB_URL='postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres'
#   bun run exit:export
#
# The connection string comes from the source project's database settings.
# Do not paste it into a chat, a commit, or this file.

set -euo pipefail

if [ -z "${SOURCE_DB_URL:-}" ]; then
  echo "SOURCE_DB_URL is not set. Export it first (see the header of this file)." >&2
  exit 1
fi

command -v supabase >/dev/null 2>&1 || {
  echo "The Supabase CLI is not installed. Install it, then re-run:" >&2
  echo "  brew install supabase/tap/supabase   # or see supabase.com/docs/guides/cli" >&2
  exit 1
}

OUT="exit-dump"
mkdir -p "$OUT"

echo "==> roles"
supabase db dump --db-url "$SOURCE_DB_URL" --role-only        -f "$OUT/roles.sql"

echo "==> public schema (reference copy)"
supabase db dump --db-url "$SOURCE_DB_URL"                    -f "$OUT/schema.sql"

echo "==> public data"
supabase db dump --db-url "$SOURCE_DB_URL" --data-only        -f "$OUT/data.sql"

echo "==> auth schema (accounts, identities, sessions)"
supabase db dump --db-url "$SOURCE_DB_URL" --data-only \
  --schema auth                                               -f "$OUT/auth.sql"

echo "==> storage metadata"
supabase db dump --db-url "$SOURCE_DB_URL" --data-only \
  --schema storage                                            -f "$OUT/storage.sql"

echo
echo "Done. Files in ./$OUT :"
ls -lh "$OUT"
echo
echo "These files contain personal and clinical data."
echo "Keep them on an encrypted disk, never commit them, and delete them once"
echo "the new project has passed 'bun run exit:verify'."
