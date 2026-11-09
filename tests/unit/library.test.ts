/** Integrity of the in-code clinical resource library. */
import { describe, it, expect } from "vitest";
import { LIBRARY, findLibResource } from "@/content/library";

const TOPICS = [
  "anxiety",
  "depression",
  "mindfulness",
  "relationships",
  "self-esteem",
  "sport",
  "stress",
  "workplace",
];

describe("resource library", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = LIBRARY.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(findLibResource("schemas-les-modes")?.approach).toBe("schema");
  });

  it("files every resource under an existing topic, with references", () => {
    for (const r of LIBRARY) {
      expect(TOPICS).toContain(r.topic);
      expect(r.references.length).toBeGreaterThan(0);
      expect(r.ar.title.length).toBeGreaterThan(3);
    }
  });

  it("gives French and English the same structure", () => {
    for (const r of LIBRARY) {
      const { fr, en } = r.content;
      expect(fr.sections.length, r.slug).toBe(en.sections.length);
      fr.sections.forEach((s, i) => {
        const e = en.sections[i];
        for (const k of ["body", "bullets", "steps"] as const)
          expect(s[k]?.length ?? 0, `${r.slug} §${i} ${k}`).toBe(
            e[k]?.length ?? 0,
          );
        expect(s.table?.columns.length ?? 0, `${r.slug} §${i} table`).toBe(
          e.table?.columns.length ?? 0,
        );
        if (s.table?.example)
          expect(s.table.example.length).toBe(s.table.columns.length);
        expect(!!s.tip, `${r.slug} §${i} tip`).toBe(!!e.tip);
      });
    }
  });
});
