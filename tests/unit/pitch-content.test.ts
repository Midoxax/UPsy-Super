import { describe, expect, it } from "vitest";
import {
  AUDIENCES,
  REFERENCES,
  cleanRecipient,
  parseAudience,
  pitchCopy,
  pitchUrl,
  splitCitations,
} from "@/lib/pitch/content";

describe("pitch share link", () => {
  it("carries audience, recipient and UTM tags", () => {
    const u = new URL(
      pitchUrl(
        "https://upsy.ma/",
        "/fr/pitch",
        "club",
        " Coach  Amine ",
        "whatsapp",
      ),
    );
    expect(u.pathname).toBe("/fr/pitch");
    expect(u.searchParams.get("for")).toBe("club");
    expect(u.searchParams.get("to")).toBe("Coach Amine");
    expect(u.searchParams.get("utm_source")).toBe("whatsapp");
    expect(u.searchParams.get("utm_medium")).toBe("pitch");
    expect(u.searchParams.get("utm_campaign")).toBe("pitch");
    expect(u.searchParams.get("utm_content")).toBe("club");
  });

  it("omits for= on the generic pitch and marks copied links as direct", () => {
    const u = new URL(pitchUrl("https://upsy.ma", "/pitch", "all", "", "copy"));
    expect(u.searchParams.has("for")).toBe(false);
    expect(u.searchParams.has("to")).toBe(false);
    expect(u.searchParams.get("utm_source")).toBe("direct");
  });

  it("keeps names readable and drops markup", () => {
    expect(cleanRecipient("<script>alert(1)</script>Sara")).toBe(
      "scriptalertscriptSara",
    );
    expect(cleanRecipient("أمين")).toBe("أمين");
    expect(cleanRecipient("Zoë O'Neil-Ba")).toBe("Zoë O'Neil-Ba");
    expect(cleanRecipient("x".repeat(80))).toHaveLength(40);
    expect(cleanRecipient(undefined)).toBe("");
  });

  it("falls back to the generic pitch for unknown audiences", () => {
    expect(parseAudience("club")).toBe("club");
    expect(parseAudience("hacker")).toBe("all");
    expect(parseAudience(null)).toBe("all");
  });
});

describe("pitch copy", () => {
  it("splits citation markers", () => {
    expect(splitCitations("34% of athletes [1] and more [2,4].")).toEqual([
      "34% of athletes",
      [1],
      " and more",
      [2, 4],
      ".",
    ]);
  });

  it("cites only references that exist, in every language and audience", () => {
    const ids = new Set(REFERENCES.map((r) => r.id));
    for (const lang of ["fr", "en", "ar"] as const) {
      const { audiences } = pitchCopy(lang);
      for (const a of AUDIENCES) {
        const json = JSON.stringify(audiences[a]);
        for (const m of json.matchAll(/\[(\d+(?:,\s?\d+)*)\]/g))
          for (const n of m[1].split(","))
            expect(ids.has(Number(n)), `${lang}/${a} cites [${n}]`).toBe(true);
        expect(audiences[a].cta.primary.to.startsWith("/")).toBe(true);
      }
    }
  });
});
