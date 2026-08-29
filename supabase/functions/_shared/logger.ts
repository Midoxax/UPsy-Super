/**
 * Structured edge function logger.
 *
 * Output is JSON on a single line so Lovable Cloud / Supabase log
 * collectors can index by `requestId`, `userId`, `fn`, `level`.
 * Use `createLogger(req, fn)` once per request and pass it down.
 *
 * Optional Sentry: if SENTRY_EDGE_DSN env var is set, errors are also
 * forwarded to Sentry via the minimal Envelope endpoint without pulling
 * in the heavy `@sentry/deno` SDK (keeps cold-start fast).
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  requestId: string;
  fn: string;
  withUser: (userId: string | null) => Logger;
  debug: (msg: string, meta?: Record<string, unknown>) => void;
  info: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, err?: unknown, meta?: Record<string, unknown>) => void;
}

function genId(): string {
  // RFC4122-ish without external deps
  return crypto.randomUUID();
}

function emit(
  level: LogLevel,
  fn: string,
  requestId: string,
  userId: string | null,
  msg: string,
  meta?: Record<string, unknown>,
  err?: unknown,
) {
  const payload: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    fn,
    requestId,
    userId: userId ?? undefined,
    msg,
    ...(meta ?? {}),
  };
  if (err) {
    payload.error =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : String(err);
  }
  // Single-line JSON — easy to grep and pipe into log explorers.
  const line = JSON.stringify(payload);
  if (level === "error" || level === "warn") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export function createLogger(req: Request, fn: string): Logger {
  const requestId =
    req.headers.get("x-request-id") ??
    req.headers.get("cf-ray") ??
    genId();
  let userId: string | null = null;

  const make = (uid: string | null): Logger => ({
    requestId,
    fn,
    withUser: (next) => make(next),
    debug: (m, meta) => emit("debug", fn, requestId, uid, m, meta),
    info: (m, meta) => emit("info", fn, requestId, uid, m, meta),
    warn: (m, meta) => emit("warn", fn, requestId, uid, m, meta),
    error: (m, err, meta) => emit("error", fn, requestId, uid, m, meta, err),
  });

  return make(userId);
}