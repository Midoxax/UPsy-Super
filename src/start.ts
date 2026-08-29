import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    // Fire-and-forget: persist the runtime error to app_logs for the admin
    // Operations-log viewer. Never awaited so the 500 response isn't delayed,
    // and failures here must not mask the original error.
    void (async () => {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const status =
          error != null && typeof error === "object" && "status" in error
            ? Number((error as { status: unknown }).status) || null
            : null;
        await supabaseAdmin.rpc("log_app_event", {
          _event: "server_error",
          _level: "error",
          _source: "runtime",
          _message: error instanceof Error ? (error.stack ?? error.message) : String(error).slice(0, 2000),
          _environment: process.env["NODE_ENV"] ?? "production",
          _release: process.env["COMMIT_SHA"] ?? null,
          _status_code: status,
          _metadata: {},
        } as never);
      } catch {
        // Logging is best-effort; never surface a logging failure to the user.
      }
    })();
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
