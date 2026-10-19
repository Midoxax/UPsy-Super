#!/usr/bin/env bash
# Applies every migration in supabase/migrations to a throwaway database,
# then runs each supabase/tests/*.sql against it.
#
# Nothing else in CI ever executed the migrations, so a migration that broke
# writes (log_sensitive_change made every session-note insert fail) could
# merge unnoticed. Production runs on Supabase; here a plain PostgreSQL gets
# the small part of Supabase the migrations touch: its roles, the auth /
# storage / realtime schemas (supabase/tests/support/bootstrap.sql) and
# stand-ins for pg_cron, pg_net, pgmq and supabase_vault
# (supabase/tests/support/extensions/).
#
# Needs a running PostgreSQL 16. Environment:
#   PSQL   command to connect as a superuser   (default: psql)
#   SUDO   prefix to write into the server's extension directory (CI: sudo)
#   EXTDIR the server's extension directory    (default: detected)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PSQL=${PSQL:-psql}
SUDO=${SUDO:-}
EXTDIR=${EXTDIR:-$(ls -d /usr/share/postgresql/*/extension | sort -V | tail -1)}
DB=upsy_migration_test
# Keep the log to what matters: migration notices ("skipping", "already
# exists") are noise here. Test results are RAISE NOTICE 'ok: ...' and are
# shown by the tests' own client_min_messages.
export PGOPTIONS="${PGOPTIONS:-} -c client_min_messages=warning"

echo "Installing extension stand-ins into $EXTDIR"
for f in "$ROOT"/supabase/tests/support/extensions/*; do
  $SUDO cp "$f" "$EXTDIR/"
done

$PSQL -v ON_ERROR_STOP=1 -qc "DROP DATABASE IF EXISTS $DB" -qc "CREATE DATABASE $DB"
$PSQL -d $DB -v ON_ERROR_STOP=1 -q -f "$ROOT/supabase/tests/support/bootstrap.sql" 2>&1 \
  | grep -v "wal_level is insufficient\|before creating subscriptions" || true

applied=0
for f in $(ls "$ROOT"/supabase/migrations/*.sql | sort); do
  if ! out=$($PSQL -d $DB -v ON_ERROR_STOP=1 -q --single-transaction -f "$f" 2>&1); then
    echo "::error file=supabase/migrations/$(basename "$f")::migration failed to apply"
    echo "$out" | grep -E "ERROR|LINE|DETAIL" | head -10
    exit 1
  fi
  applied=$((applied + 1))
done
echo "Applied $applied migrations."

failed=0
for t in "$ROOT"/supabase/tests/*.sql; do
  name=$(basename "$t")
  # Each test runs in its own transaction and rolls back, so they are independent.
  if out=$(PGOPTIONS="-c client_min_messages=notice" $PSQL -d $DB -v ON_ERROR_STOP=1 -q -f "$t" 2>&1); then
    echo "PASS $name ($(echo "$out" | grep -c "ok:") checks)"
  else
    failed=1
    echo "::error file=supabase/tests/$name::database test failed"
    echo "$out" | grep -E "ERROR|FAILED" | head -10
  fi
done

$PSQL -qc "DROP DATABASE IF EXISTS $DB"
exit $failed
