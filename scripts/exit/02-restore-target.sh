#!/usr/bin/env bash
#
# Phase 2, step 2 — build the NEW database (the one on your own account) and
# load the data into it.
#
# The schema is NOT copied from the dump. It is rebuilt by replaying the 110
# migrations in supabase/migrations, in order. That is the whole point of the
# exit: from this moment the repository, not a dashboard, is the definition of
# the database. schema.sql from step 1 exists only so you can diff the result
# and prove the two agree.
#
# Usage:
#   export TARGET_DB_URL='postgresql://postgres:...@db.<new-ref>.supabase.co:5432/postgres'
#   bun run exit:restore
#
# Safe to re-run against an EMPTY target. Refuses to run against a target that
# already has application tables, so a half-finished attempt can never be
# silently doubled.

set -euo pipefail

if [ -z "${TARGET_DB_URL:-}" ]; then
  echo "TARGET_DB_URL is not set. Export it first (see the header of this file)." >&2
  exit 1
fi

OUT="exit-dump"
for f in roles.sql data.sql auth.sql storage.sql; do
  [ -f "$OUT/$f" ] || { echo "Missing $OUT/$f — run 'bun run exit:export' first." >&2; exit 1; }
done

command -v psql >/dev/null 2>&1 || { echo "psql is required (part of postgresql-client)." >&2; exit 1; }
command -v supabase >/dev/null 2>&1 || { echo "The Supabase CLI is required." >&2; exit 1; }

# --- Guard: never load into a database that already holds application data ---
EXISTING=$(psql "$TARGET_DB_URL" -tAc \
  "select count(*) from information_schema.tables where table_schema='public'")
if [ "$EXISTING" -gt 0 ]; then
  echo "Target already has $EXISTING tables in 'public'." >&2
  echo "Restoring on top of them would duplicate rows. Reset the project (or drop" >&2
  echo "and recreate the public schema) and re-run." >&2
  exit 1
fi

echo "==> 1/4 roles"
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$OUT/roles.sql"

echo "==> 2/4 schema, by replaying supabase/migrations"
supabase db push --db-url "$TARGET_DB_URL"

echo "==> 3/4 accounts (auth schema)"
# Accounts go in before public data: almost every application table has a
# user_id, and the foreign keys will reject rows whose owner does not exist yet.
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$OUT/auth.sql"

echo "==> 4/4 application data + storage index"
# Triggers are disabled for the load so that the audit-log, CRM-automation and
# gamification triggers do not fire on historical rows and manufacture events
# that never happened. session_replication_role is the standard way to do this.
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 <<SQL
set session_replication_role = replica;
\i $OUT/data.sql
\i $OUT/storage.sql
set session_replication_role = default;
SQL

echo
echo "Restore complete. Now prove it:"
echo "  bun run exit:verify"
