/** Integrity of the in-code Academy content. */
import { describe, it, expect } from "vitest";
import { ACADEMY_COURSES } from "@/content/academy";
import { findLibResource } from "@/content/library";

const PAGES = new Set(["/learn", "/psychologists", "/contact"]);

describe("academy content", () => {
  it("has unique slugs and contiguous module order", () => {
    const slugs = ACADEMY_COURSES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of ACADEMY_COURSES)
      expect(c.modules.map((m) => m.order)).toEqual(
        c.modules.map((_, i) => i + 1),
      );
  });

  it("writes every module in French and English with an Arabic title", () => {
    for (const c of ACADEMY_COURSES)
      for (const m of c.modules) {
        expect(m.content.en.length, `${c.slug} ${m.order} en`).toBeGreaterThan(
          400,
        );
        expect(m.content.fr.length, `${c.slug} ${m.order} fr`).toBeGreaterThan(
          400,
        );
        expect(m.title.ar.length).toBeGreaterThan(2);
      }
  });

  it("links only to existing resources and pages, the same in both languages", () => {
    const links = (s: string) =>
      [...s.matchAll(/\]\((\/[^)]+)\)/g)].map((x) => x[1]);
    for (const c of ACADEMY_COURSES)
      for (const m of c.modules) {
        const en = links(m.content.en);
        expect(links(m.content.fr), `${c.slug} ${m.order}`).toEqual(en);
        for (const l of en) {
          if (l.startsWith("/resources/"))
            expect(findLibResource(l.slice(11)), l).toBeDefined();
          else expect(PAGES.has(l), l).toBe(true);
        }
      }
  });
});
