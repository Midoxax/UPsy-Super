import { describe, it, expect } from "vitest";
import { withAuto } from "@/lib/i18n/autoMerge";

describe("withAuto", () => {
  it("fills gaps without touching hand-written text", () => {
    const manual = { nav: { home: "Accueil" }, blog: { title: "Blog" } };
    const out = withAuto(manual, {
      "nav.home": "MACHINE",
      "nav.pricing": "Tarifs",
      "blog.anxiety.title": "Comprendre l'anxiété",
    });
    expect(out.nav).toEqual({ home: "Accueil", pricing: "Tarifs" });
    expect((out.blog as Record<string, unknown>).anxiety).toEqual({
      title: "Comprendre l'anxiété",
    });
    expect(manual.nav).toEqual({ home: "Accueil" }); // input not mutated
  });

  it("skips a key that would branch through a hand-written string", () => {
    const out = withAuto({ a: "texte" }, { "a.b": "x" });
    expect(out).toEqual({ a: "texte" });
  });
});
