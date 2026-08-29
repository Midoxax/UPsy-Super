/**
 * Content-Security-Policy invariants.
 *
 * The policy used to live in `vercel.json`. It now lives in
 * `src/lib/security-headers.ts` and is applied by the server entry, so it
 * survives a host migration — but the failure mode it guards is unchanged: a
 * third-party service configured in `.env` whose origin is absent from
 * `connect-src` is blocked by the browser, silently, in production only, with
 * no build error. Error reporting fails this way especially quietly: the tool
 * whose job is to tell you something broke is the thing that is broken, so the
 * first sign is an eerily clean dashboard.
 *
 * These tests hold the policy to two properties: the origins the app is
 * configured to call are allowed, and the directives that make the policy worth
 * having are still present.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { SECURITY_HEADERS } from "@/lib/security-headers";

const ROOT = resolve(__dirname, "../..");

const csp: string = (() => {
  const value = SECURITY_HEADERS["content-security-policy"];
  if (!value) throw new Error("No Content-Security-Policy in SECURITY_HEADERS");
  return value;
})();

/** The origins a directive allows, e.g. directiveOf("connect-src"). */
function directiveOf(name: string): string[] {
  const found = csp
    .split(";")
    .map((d) => d.trim())
    .find((d) => d === name || d.startsWith(`${name} `));
  return found ? found.split(/\s+/).slice(1) : [];
}

/**
 * True when `origin` is permitted, accounting for CSP's single-label wildcard:
 * `https://*.posthog.com` matches `https://eu.posthog.com` but not a bare
 * `https://posthog.com`.
 */
function allows(directive: string, origin: string): boolean {
  const host = new URL(origin).host;
  return directiveOf(directive).some((source) => {
    if (source === "'self'" || source === "*") return source === "*";
    let candidate = source;
    if (candidate.startsWith("https://") || candidate.startsWith("wss://")) {
      candidate = candidate.replace(/^(https|wss):\/\//, "");
    }
    if (candidate.startsWith("*.")) {
      const suffix = candidate.slice(1); // ".posthog.com"
      return host.endsWith(suffix) && host.length > suffix.length;
    }
    return candidate === host;
  });
}

/**
 * Third-party origins the app is configured to talk to, read from the tracked
 * .env.
 *
 * The site's own origin is excluded: `connect-src 'self'` already covers
 * same-origin requests, and requiring an explicit entry for it would demand a
 * redundant CSP source that changes every time the domain does.
 */
function configuredOrigins(): Array<{ key: string; origin: string }> {
  const env = readFileSync(resolve(ROOT, ".env"), "utf8");
  const ownOrigin = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")).homepage;
  const out: Array<{ key: string; origin: string }> = [];
  for (const line of env.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\n]+)"?/);
    if (!m) continue;
    // A DSN embeds credentials before the host; a URL does not. Both reduce to
    // an origin the browser will be asked to reach.
    const value = m[2].trim();
    const url = value.match(/https:\/\/(?:[^@\s/]*@)?([^/\s]+)/);
    if (!url) continue;
    const origin = `https://${url[1]}`;
    if (origin === ownOrigin) continue; // covered by 'self'
    out.push({ key: m[1], origin });
  }
  return out;
}

describe("CSP covers configured services", () => {
  it("allows every external origin configured in .env", () => {
    for (const { key, origin } of configuredOrigins()) {
      expect(
        allows("connect-src", origin),
        `${key} points at ${origin}, which connect-src does not allow. The browser ` +
          `will block every request to it in production. Add it to CONNECT_SRC in ` +
          `src/lib/security-headers.ts.`
      ).toBe(true);
    }
  });

  it("allows Supabase over both HTTPS and websockets", () => {
    // Realtime subscriptions use wss://; allowing only https:// breaks them in
    // a way that looks like a Supabase outage rather than a policy problem.
    expect(allows("connect-src", "https://vuawmihxcaewzmkuarkr.supabase.co")).toBe(true);
    expect(
      directiveOf("connect-src").some((s) => s.startsWith("wss://")),
      "connect-src has no wss:// source — Supabase Realtime cannot connect"
    ).toBe(true);
  });
});

describe("CSP keeps its load-bearing directives", () => {
  it("denies framing entirely", () => {
    // Clickjacking protection for an authenticated clinical surface.
    expect(directiveOf("frame-ancestors")).toEqual(["'none'"]);
  });

  it("blocks plugin content and restricts form targets", () => {
    expect(directiveOf("object-src")).toEqual(["'none'"]);
    expect(directiveOf("form-action")).toEqual(["'self'"]);
  });

  it("defaults to same-origin", () => {
    expect(directiveOf("default-src")).toEqual(["'self'"]);
  });

  it("never allows a wildcard origin in connect-src", () => {
    expect(directiveOf("connect-src")).not.toContain("*");
  });

  it("still sends the non-CSP hardening headers", () => {
    // These moved out of vercel.json with the CSP; losing one is invisible
    // until someone frames the app or sniffs a MIME type.
    expect(SECURITY_HEADERS["x-content-type-options"]).toBe("nosniff");
    expect(SECURITY_HEADERS["x-frame-options"]).toBe("DENY");
    expect(SECURITY_HEADERS["strict-transport-security"]).toMatch(/max-age=\d+/);
    expect(SECURITY_HEADERS["referrer-policy"]).toBeTruthy();
  });
});

/**
 * SEO origin consistency.
 *
 * The canonical origin was hardcoded in 21 files and pointed at a host with no
 * DNS record. A canonical tag is an instruction to search engines — naming an
 * unreachable host tells Google the indexable version of every page does not
 * exist, which suppresses indexing rather than merely misattributing it. The
 * same literal in og:image is why link previews did not render.
 *
 * The static index.html is gone with the move to server rendering; the head is
 * now declared in the root route, so that is what these read.
 */
const rootRoute = readFileSync(resolve(ROOT, "src/routes/__root.tsx"), "utf8");

/** Pull a head entry's content, e.g. metaContent("og:url"). */
function metaContent(name: string): string | undefined {
  const re = new RegExp(
    `(?:property|name):\\s*"${name.replace(/[.*+?^$()|[\\]\\\\]/g, "\\\\$&")}"\\s*,\\s*content:\\s*"([^"]+)"`
  );
  return rootRoute.match(re)?.[1];
}

describe("SEO origin is internally consistent", () => {
  const robots = readFileSync(resolve(ROOT, "public/robots.txt"), "utf8");
  const homepage: string = JSON.parse(
    readFileSync(resolve(ROOT, "package.json"), "utf8")
  ).homepage;

  it("package.json declares a homepage", () => {
    expect(homepage, "homepage drives the sitemap, robots and production check").toMatch(
      /^https:\/\/[^/]+$/
    );
  });

  it("the root canonical and og:url match the declared homepage", () => {
    const canonical = rootRoute.match(/rel:\s*"canonical",\s*href:\s*"([^"]+)"/)?.[1];
    const ogUrl = metaContent("og:url");
    for (const [name, value] of [["canonical", canonical], ["og:url", ogUrl]] as const) {
      expect(value, `${name} is absent from src/routes/__root.tsx`).toBeTruthy();
      expect(
        new URL(value!).origin,
        `${name} points at ${value}, but the site is served from ${homepage}`
      ).toBe(homepage);
    }
  });

  it("robots.txt advertises the sitemap on that same origin", () => {
    const advertised = robots.match(/^Sitemap:\s*(\S+)/m)?.[1];
    expect(advertised, "robots.txt has no Sitemap line").toBeTruthy();
    expect(new URL(advertised!).origin).toBe(homepage);
  });

  it("no absolute URL in the root head points at a different first-party origin", () => {
    // Third-party hosts are expected; a *different* first-party origin is the bug.
    const origins = [...rootRoute.matchAll(/https:\/\/[a-z0-9.-]+/g)].map((m) => m[0]);
    const strayFirstParty = [...new Set(origins.filter((o) => /upsy/i.test(o) && o !== homepage))];
    expect(strayFirstParty, "a stale first-party origin is still hardcoded").toEqual([]);
  });
});

/**
 * The social preview image must exist and be what it claims to be.
 *
 * Two separate faults lived here. The og:image pointed at a published path
 * absent from the build, so every share requested a 404. And the asset that
 * *should* have been used, public/og-image.png, was a JPEG carrying a .png
 * extension — served as image/png under `X-Content-Type-Options: nosniff`,
 * which tells the client not to correct the mismatch.
 *
 * Neither is visible from the app: link previews are rendered by other people's
 * crawlers, so the only symptom is that shares look broken somewhere you never
 * look.
 */
describe("og:image is real and correctly typed", () => {
  const ogImage = metaContent("og:image") ?? "";
  const declaredType = metaContent("og:image:type") ?? "";

  /** Magic bytes, because the extension has already lied once. */
  function sniff(buf: Buffer): "png" | "jpeg" | "unknown" {
    if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
    return "unknown";
  }

  it("points at a file that ships in public/", () => {
    expect(ogImage, "the root route declares no og:image").toBeTruthy();
    const path = new URL(ogImage).pathname;
    expect(
      existsSync(resolve(ROOT, "public", path.replace(/^\//, ""))),
      `og:image points at ${path}, which is not in public/ — every share will request a 404`
    ).toBe(true);
  });

  it("declares the content type the bytes actually are", () => {
    const path = new URL(ogImage).pathname.replace(/^\//, "");
    const actual = sniff(readFileSync(resolve(ROOT, "public", path)));
    const declared = declaredType.split("/")[1]?.replace("jpg", "jpeg");
    expect(
      actual,
      `${path} contains ${actual} bytes but og:image:type says ${declaredType}. ` +
        `nosniff is set, so the client is told not to correct this.`
    ).toBe(declared);
  });

  it("has an extension matching its bytes, so the server sends the right MIME", () => {
    const path = new URL(ogImage).pathname.replace(/^\//, "");
    const actual = sniff(readFileSync(resolve(ROOT, "public", path)));
    const ext = path.split(".").pop()?.replace("jpg", "jpeg");
    expect(actual, `${path} is ${actual} data — rename it so its extension matches`).toBe(ext);
  });
});

/**
 * Deep links are served by the server, not by a hosting rewrite.
 *
 * Under the old Vite SPA build, every route below `/` existed only once React
 * had booted, and a missing `vercel.json` catch-all rewrite 404ed all of them
 * in production. The app now server-renders through a Worker entry, so the
 * property to hold is that the entry exists and the route files a link can
 * point at are real — there is no hosting-level rewrite left to forget.
 */
describe("deep links have a server entry behind them", () => {
  it("builds from the SSR wrapper entry", () => {
    expect(existsSync(resolve(ROOT, "src/server.ts"))).toBe(true);
    const viteConfig = readFileSync(resolve(ROOT, "vite.config.ts"), "utf8");
    expect(
      viteConfig,
      "vite.config.ts must point tanstackStart.server.entry at src/server.ts, " +
        "or the SSR error wrapper is never invoked"
    ).toMatch(/server:\s*{\s*entry:\s*"server"/);
  });

  it("keeps no Vercel routing config that could contradict the server", () => {
    expect(
      existsSync(resolve(ROOT, "vercel.json")),
      "vercel.json is back — routing now lives in the Worker entry, and two " +
        "sources of routing truth is how the deep-link 404 happened before"
    ).toBe(false);
  });
});
