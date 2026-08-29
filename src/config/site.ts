/**
 * The public origin this site is served from.
 *
 * WHY THIS EXISTS
 *
 * Every canonical tag, `og:url`, hreflang alternate and sitemap entry has to
 * agree on one origin, and until this file they did not agree with reality:
 * all of them pointed at `https://upsy.ma`, which has **no DNS record**. The
 * site is served from Vercel.
 *
 * That is not a cosmetic mismatch. A canonical tag is an instruction to search
 * engines — "the real version of this page lives here" — so pointing it at a
 * host that does not resolve tells Google the indexable version of every page
 * is unreachable. The likely outcome is not "indexed under the wrong domain",
 * it is "not indexed". The same literal in `og:image` and `og:url` is why link
 * previews do not render.
 *
 * ONE VALUE, NOT TWENTY-ONE
 *
 * The origin was hardcoded in 21 files, so correcting it meant finding all of
 * them and moving the domain later meant finding them again. It resolves here
 * instead, and moving to the real domain is one environment variable.
 *
 * WHY www AND NOT THE APEX
 *
 * `upsy.ma` answers 308 and redirects to `www.upsy.ma`, so www is where a
 * visitor actually lands. A canonical tag should name the URL that serves the
 * page, not one that bounces to it — an extra hop on every crawl, and two URLs
 * competing to represent one page.
 *
 * Do not point this at a host before it serves the site. This file exists
 * because all of it named `upsy.ma` while that domain had no DNS record at all,
 * and a canonical pointing somewhere dead suppresses indexing rather than
 * merely misfiling it.
 *
 * IF THE ORIGIN CHANGES AGAIN
 *
 * Set `VITE_SITE_URL` and `homepage` in package.json together, then re-run
 * `npm run sitemap`. `tests/unit/csp.test.ts` fails if index.html, robots.txt
 * and package.json stop agreeing, so a half-finished change cannot ship.
 * Confirm with `PROD_URL=https://www.upsy.ma npm run check:production` first.
 */

/**
 * Public origin, no trailing slash.
 *
 * `VITE_SITE_URL` overrides the default without a code change; both are kept
 * in step with package.json `homepage` by the SEO origin tests.
 */
export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) || "https://www.upsy.ma"
).replace(/\/$/, "");

/** Absolute URL for a root-relative path. */
export const absoluteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
