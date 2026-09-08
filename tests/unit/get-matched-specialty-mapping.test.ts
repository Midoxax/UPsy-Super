/**
 * The `/get-matched` wizard shows localized need labels ("Anxiety", "Sport
 * Performance", ...) but specialties are named freely by clinicians in the
 * database ("Anxiety & Depression", "Sport Psychology", ...). Matching them
 * by exact string equality can never succeed — a real production bug that
 * surfaced as "See Recommended Psychologists" throwing a generic error
 * instead of returning matches, because the client fell back to sending an
 * arbitrary specialty ID that then failed to resolve to real matches, or
 * (when the specialties/languages fetch came back empty) sent no valid
 * specialty ID at all and tripped the edge function's previously-required
 * `specialtyNeeded` validation.
 *
 * Verified at the source level: mounting the wizard needs Supabase, router,
 * and locale context, none of which is what's under test here.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");

describe("GetMatched need-to-specialty mapping", () => {
  const source = read("src/pages/GetMatched.tsx");

  it("no longer matches need labels against specialty names by exact equality", () => {
    expect(source).not.toMatch(/s\.name\.toLowerCase\(\) === need\.toLowerCase\(\)/);
  });

  it("matches by keyword substring instead", () => {
    expect(source).toMatch(/def\.specialtyKeywords\.some\(\(kw\) => s\.name\.toLowerCase\(\)\.includes\(kw\)\)/);
  });

  it("never falls back to an arbitrary specialty when nothing matched", () => {
    expect(source).not.toMatch(/specialties\[0\]\?\.id/);
  });

  it("omits specialtyNeeded from the request instead of sending a bogus value", () => {
    expect(source).toMatch(/if \(needToSpecialty\[0\]\) body\.specialtyNeeded = needToSpecialty\[0\];/);
  });

  it("omits languagesPreferred instead of sending an empty array that fails validation", () => {
    expect(source).toMatch(/if \(languageId\) body\.languagesPreferred = \[languageId\];/);
  });
});

describe("find-matches edge function accepts an unfiltered request", () => {
  const source = read("supabase/functions/find-matches/index.ts");

  it("no longer requires specialtyNeeded", () => {
    expect(source).toMatch(/specialtyNeeded: z\.string\(\)\.uuid\("Invalid specialty ID format"\)\.optional\(\)/);
  });

  it("no longer requires at least one language", () => {
    expect(source).not.toMatch(/\.min\(1, "At least one language is required"\)/);
  });

  it("skips the strict specialty query entirely when none was given", () => {
    expect(source).toMatch(/if \(specialtyNeeded\) \{/);
  });
});
