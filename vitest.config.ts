/**
 * Test runner config, deliberately separate from vite.config.ts.
 *
 * vite.config.ts builds the application through the TanStack Start plugin,
 * which expects a real Vite dev/build environment. Vitest creates its own
 * stripped-down server, and the Start plugin crashes on it during
 * `configureServer` ("Cannot read properties of undefined (reading 'client')"),
 * which took the whole unit suite down in CI before this file existed.
 *
 * The unit tests exercise plain modules and React components — i18n fallback
 * resolution, theme resolution, route authorization, CSP construction. None of
 * them need the Start plugin, so this config gives them just React, the `@`
 * alias and jsdom.
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
  },
});
