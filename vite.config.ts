// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

/**
 * Modules that only ever run in the browser, replaced by an empty stand-in
 * in the server (Worker) build.
 *
 * Cloudflare caps a Worker at 3 MiB gzipped and the build had reached 91%,
 * mostly with code the server never executes: the WebGL scenes (three +
 * @react-three/drei, ~1.4 MB) are lazy-loaded only after the page is idle in
 * the browser, and leaflet is imported inside an effect. On the server they
 * are dead weight, and one more dependency would have made deploys fail.
 * jsPDF (with html2canvas and canvg, ~1.1 MB) only runs in click handlers.
 *
 * Only add modules here that the server cannot reach during render: anything
 * rendered on the server must stay real, or the HTML and the hydrated page
 * would disagree.
 */
const CLIENT_ONLY: RegExp[] = [
  /(^|\/)components\/three\/[^/]+$/, // HeroScene, PitchScene (React.lazy, client-only)
  /^leaflet(\/.*)?$/, // PsychologistsMap imports it inside useEffect
  /^jspdf$/, // imported on click to build a PDF (pulls html2canvas + canvg)
];
const STUB = "\0client-only-stub";

function clientOnlyStubs(): Plugin {
  return {
    name: "upsy:client-only-stubs",
    enforce: "pre",
    applyToEnvironment: (env) => env.config.consumer === "server",
    resolveId(id) {
      const bare = id.replace(/\.(tsx?|jsx?)$/, "");
      return CLIENT_ONLY.some((re) => re.test(bare)) ? STUB : null;
    },
    load(id) {
      if (id !== STUB) return null;
      return "export default function ClientOnly() { return null; }\n";
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [clientOnlyStubs()],
  },
});
