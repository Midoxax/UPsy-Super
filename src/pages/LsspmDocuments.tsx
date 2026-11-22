import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import LsspmLogo from "@/components/league/LsspmLogo";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { LEAGUE_NAME } from "@/lib/league/membershipCopy";
import type { Commitment, LegalText } from "@/content/lsspm/types";
import { CONFIDENTIALITY, ETHICS, HONOUR } from "@/content/lsspm/commitments";

type Doc = "reglement" | "honour" | "ethics" | "confidentiality";
type Lang = "fr" | "en";

const UI = {
  fr: {
    title: "Documents de la Ligue",
    tabs: {
      reglement: "Règlement intérieur",
      honour: "Déclaration sur l'honneur",
      ethics: "Charte éthique",
      confidentiality: "Engagement du bureau",
    } as Record<Doc, string>,
    print: "Imprimer / PDF",
    arabic: "Original arabe (PDF)",
    legalize:
      "À imprimer, signer et faire légaliser (signature légalisée), puis à déposer depuis votre tableau de bord.",
    article: "Article",
  },
  en: {
    title: "League documents",
    tabs: {
      reglement: "Internal rules",
      honour: "Sworn declaration",
      ethics: "Ethics charter",
      confidentiality: "Bureau commitment",
    } as Record<Doc, string>,
    print: "Print / PDF",
    arabic: "Arabic original (PDF)",
    legalize:
      "Print, sign and have the signature legalised, then upload it from your dashboard.",
    article: "Article",
  },
};

const ARABIC: Partial<Record<Doc, string>> = {
  reglement: "/docs/lsspm-reglement-interieur-ar.pdf",
  confidentiality: "/docs/lsspm-engagement-confidentialite-ar.pdf",
};

/** Public page: the League's rules, declarations and charter, FR / EN. */
export default function LsspmDocuments() {
  const { locale } = useLocale();
  const [lang, setLang] = useState<Lang>(locale === "en" ? "en" : "fr");
  const [doc, setDoc] = useState<Doc>("reglement");
  const [reglement, setReglement] = useState<LegalText | null>(null);
  const u = UI[lang];

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("doc");
    if (d && d in UI.fr.tabs) setDoc(d as Doc);
  }, []);
  useEffect(() => {
    (lang === "en"
      ? import("@/content/lsspm/reglement.en")
      : import("@/content/lsspm/reglement.fr")
    ).then((m) => setReglement(m.default));
  }, [lang]);

  const commitment: Commitment | null =
    doc === "honour"
      ? HONOUR[lang]
      : doc === "ethics"
        ? ETHICS[lang]
        : doc === "confidentiality"
          ? CONFIDENTIALITY[lang]
          : null;

  return (
    <>
      <SEOHead
        path="/lsspm"
        title={`${u.title} | LSSPM`}
        description={LEAGUE_NAME}
      />
      <div className="container-custom py-8 md:py-12 max-w-3xl space-y-6">
        <header className="flex items-center gap-4 print:mb-6">
          <LsspmLogo className="h-16 w-16 shrink-0" />
          <div>
            <h1 className="text-2xl font-display">{u.title}</h1>
            <p className="text-sm text-muted-foreground">{LEAGUE_NAME}</p>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {(Object.keys(u.tabs) as Doc[]).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={doc === k ? "default" : "outline"}
              onClick={() => setDoc(k)}
            >
              {u.tabs[k]}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {(["fr", "en"] as const).map((l) => (
            <Button
              key={l}
              size="sm"
              variant={lang === l ? "secondary" : "ghost"}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 me-1" /> {u.print}
          </Button>
          {ARABIC[doc] && (
            <Button size="sm" variant="outline" asChild>
              <a href={ARABIC[doc]} download>
                <Download className="h-4 w-4 me-1" /> {u.arabic}
              </a>
            </Button>
          )}
        </div>

        {doc === "reglement" && reglement && <Legal t={reglement} u={u} />}
        {commitment && (
          <CommitmentView
            c={commitment}
            legalize={doc === "honour" ? u.legalize : null}
          />
        )}
      </div>
    </>
  );
}

function Legal({ t, u }: { t: LegalText; u: (typeof UI)["fr"] }) {
  return (
    <article className="space-y-6 text-sm leading-relaxed">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>
      <p className="rounded-lg border border-amber-500/40 bg-amber-50 p-3 text-xs dark:bg-amber-950/30">
        {t.notice}
      </p>
      <ul className="list-disc ps-5 text-xs text-muted-foreground space-y-1">
        {t.meta.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <section className="space-y-2">
        {t.preamble.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>
      {t.parts.map((part) => (
        <section key={part.title} className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-1">{part.title}</h3>
          {part.chapters.map((ch) => (
            <div key={ch.title} className="space-y-3">
              <h4 className="font-semibold">{ch.title}</h4>
              {ch.articles.map((a) => (
                <div key={a.n} className="space-y-1 break-inside-avoid">
                  <p className="font-medium">
                    {u.article} {a.n} — {a.title}
                  </p>
                  {a.body.map((b) => (
                    <p key={b} className={/^\d+\./.test(b) ? "ps-4" : ""}>
                      {b}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
      <section className="space-y-1 text-xs text-muted-foreground">
        {t.closing.map((c) => (
          <p key={c}>{c}</p>
        ))}
      </section>
    </article>
  );
}

function CommitmentView({
  c,
  legalize,
}: {
  c: Commitment;
  legalize: string | null;
}) {
  return (
    <article className="space-y-4 text-sm leading-relaxed">
      <h2 className="text-xl font-semibold text-center">{c.title}</h2>
      {c.notice && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-50 p-3 text-xs dark:bg-amber-950/30 print:hidden">
          {c.notice}
        </p>
      )}
      {legalize && (
        <p className="text-xs text-muted-foreground print:hidden">{legalize}</p>
      )}
      {c.fields && (
        <dl className="space-y-2">
          {c.fields.map((f) => (
            <div key={f} className="flex gap-2">
              <dt className="whitespace-nowrap">{f} :</dt>
              <dd className="flex-1 border-b border-dotted" />
            </div>
          ))}
        </dl>
      )}
      <p>{c.intro}</p>
      <ol className="list-decimal ps-5 space-y-2">
        {c.items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ol>
      <div className="space-y-6 pt-4">
        {c.closing.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
    </article>
  );
}
