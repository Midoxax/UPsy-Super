CREATE SCHEMA IF NOT EXISTS pgmq;
CREATE TYPE pgmq.message_record AS (msg_id bigint, read_ct int, enqueued_at timestamptz, vt timestamptz, message jsonb);
CREATE FUNCTION pgmq.create(queue_name text) RETURNS void LANGUAGE sql AS $$ SELECT $$;
CREATE FUNCTION pgmq.send(queue_name text, msg jsonb, delay int DEFAULT 0) RETURNS SETOF bigint LANGUAGE sql AS $$ SELECT 1::bigint $$;
CREATE FUNCTION pgmq.read(queue_name text, vt int, qty int) RETURNS SETOF pgmq.message_record LANGUAGE sql AS $$ SELECT NULL::pgmq.message_record WHERE false $$;
CREATE FUNCTION pgmq.delete(queue_name text, msg_id bigint) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
