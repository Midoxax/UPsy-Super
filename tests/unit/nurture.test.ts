import { describe, expect, it } from "vitest";
import {
  ALL_LANGS,
  ctaUrl,
  LANGS,
  nextStep,
  renderNurture,
  SEQUENCES,
  sendLang,
} from "../../supabase/functions/_shared/nurture/index";

const FEES = [
  {
    label_fr: "Praticien",
    label_en: "Practitioner",
    label_ar: "ممارس",
    amount_mad: 900,
  },
];

describe("nurture sequences", () => {
  for (const seq of Object.values(SEQUENCES)) {
    it(`${seq.id}: every language has every email, filled in`, () => {
      for (const lang of ALL_LANGS) {
        const emails = seq.copy[lang];
        expect(emails, `${seq.id}/${lang}`).toHaveLength(seq.steps.length);
        for (const e of emails) {
          for (const k of [
            "subject",
            "preheader",
            "eyebrow",
            "title",
            "cta",
          ] as const) {
            expect(e[k].trim(), `${seq.id}/${lang}/${k}`).not.toBe("");
          }
          expect(
            e.subject.length,
            `${seq.id}/${lang} subject`,
          ).toBeLessThanOrEqual(60);
          expect(e.body.length).toBeGreaterThan(0);
        }
        // Same structure in every language: same generated blocks per email.
        const shape = (l: typeof lang) =>
          seq.copy[l].map((e) =>
            e.body
              .map((b) => (typeof b === "string" ? "p" : Object.keys(b)[0]))
              .filter((k) => k === "fees" || k === "safety")
              .join(","),
          );
        expect(shape(lang), `${seq.id}/${lang} blocks`).toEqual(shape("fr"));
      }
    });

    it(`${seq.id}: renders in every language with unsubscribe and a tracked button`, () => {
      for (const lang of ALL_LANGS) {
        for (let step = 0; step < seq.steps.length; step++) {
          const r = renderNurture({
            seq,
            step,
            lang,
            fullName: "Salma Benali",
            unsubscribeUrl: "https://example.test/unsub?t=x",
            languageLinks: [{ lang: "ar", url: "https://example.test/l?l=ar" }],
            fees: FEES,
          });
          expect(r.html).toContain("https://example.test/unsub?t=x");
          expect(r.html).toContain("utm_source=nurture");
          expect(r.html).toContain(`lang="${lang}"`);
          expect(r.html).toContain("Salma");
          expect(r.text.length).toBeGreaterThan(100);
          if (LANGS[lang].layout === "ar")
            expect(r.html).toContain('dir="rtl"');
        }
      }
    });
  }

  it("League fees come from the plans passed in", () => {
    const r = renderNurture({
      seq: SEQUENCES.lsspm,
      step: 2,
      lang: "fr",
      unsubscribeUrl: "u",
      fees: FEES,
    });
    expect(r.html).toContain("Praticien");
    expect(r.html).toContain("900 MAD / an");
  });

  it("patient emails carry the emergency numbers in the first and last email", () => {
    const s = SEQUENCES.free_score;
    for (const step of [0, s.steps.length - 1]) {
      const r = renderNurture({
        seq: s,
        step,
        lang: "fr",
        unsubscribeUrl: "u",
      });
      expect(r.html).toContain("141");
    }
  });

  it("onboarding skips the steps already done", () => {
    const s = SEQUENCES.onboarding;
    expect(nextStep(s, 1, { slots: true })).toBe(2);
    expect(
      nextStep(s, 1, { slots: true, photo: true, bio: true, rate: true }),
    ).toBe(3);
    expect(nextStep(s, s.steps.length, {})).toBeNull();
  });

  it("languages not reviewed yet fall back to a reviewed one", () => {
    for (const l of ALL_LANGS) expect(LANGS[sendLang(l)].reviewed).toBe(true);
    expect(sendLang("ary")).toBe(LANGS.ary.reviewed ? "ary" : "ar");
  });

  it("buttons open the site in the email's language", () => {
    expect(ctaUrl(SEQUENCES.lsspm, 0, "ar")).toMatch(
      /^https:\/\/upsy\.ma\/ar\/apply\/wizard\?source=lsspm&utm_source=nurture/,
    );
    expect(ctaUrl(SEQUENCES.free_score, 1, "en")).toMatch(
      /^https:\/\/upsy\.ma\/en\/free-score\?utm_source=nurture/,
    );
  });
});
