import { Download, Mail, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";

// Boilerplate and bios: the approved texts from the press kit, in each language.
const BOILERPLATE = {
  en: "U.Psy is a Moroccan mental health and mental performance platform. It connects individuals, athletes and organisations with verified psychologists, by video or in person, in Darija, Arabic, French and English, with tools to measure, follow up and support people between sessions. Founded by Mehdi Felji, clinical sport psychologist.",
  fr: "U.Psy est une plateforme marocaine de psychologie et de performance mentale. Elle relie particuliers, sportifs et organisations à des psychologues vérifiés, en visio ou au cabinet, en darija, arabe, français et anglais, avec des outils pour mesurer, suivre et accompagner entre les séances. Fondée par Mehdi Felji, psychologue clinicien du sport.",
  ar: "U.Psy منصة مغربية للصحة النفسية والأداء الذهني. تربط الأفراد والرياضيين والمؤسسات بأخصائيين نفسيين موثَّقين، عن بعد أو في العيادة، بالدارجة والعربية والفرنسية والإنجليزية، مع أدوات للقياس والمتابعة والمرافقة بين الجلسات. أسسها Mehdi Felji، أخصائي نفسي سريري رياضي.",
};

const COPY = {
  en: {
    seoTitle: "Press & Media Kit — U.Psy",
    seoDescription:
      "Media kit, founder bio, boilerplate, and press contact for U.Psy, the Moroccan mental health and mental performance platform.",
    eyebrow: "Press · Media Kit",
    titleBefore: "Reporting on the future of",
    titleEm: "mental performance",
    titleAfter: "?",
    sub: "Everything you need to cover U.Psy: founder bio, boilerplate, brand assets, and a direct line to our press desk.",
    downloadLogo: "Download logo",
    facts: [
      ["Founder", "Mehdi Felji"],
      ["Headquarters", "Casablanca, Morocco"],
      ["Languages", "Darija · Arabic · French · English"],
      ["Category", "Mental health & mental performance"],
      ["Domain", "upsy.ma"],
    ],
    boilerplate: "Boilerplate",
    founder: "Founder",
    founderCaption: "Mehdi Felji · Founder",
    shortBio: "Short bio",
    longBio: "Long bio",
    bioShort:
      "Mehdi Felji is a clinical sport psychologist and the founder of U.Psy. His work has taken him from elite sport to humanitarian and migration settings with Psychologues Sans Frontières, and to coordinating mental health programmes. He champions psychology that is operational, measurable and usable under pressure.",
    bioLong:
      "Mehdi Felji is a clinical sport psychologist and the founder of U.Psy. Working with athletes in performance, with vulnerable populations through Psychologues Sans Frontières, and coordinating mental health projects, he kept meeting the same limit: what works in an office does not always work under urgency, uncertainty or the pressure to perform. U.Psy is his answer: not a directory, but a system that ties together clinical rigour, mental performance and impact at scale.",
    anglesTitle: "Story angles we can speak to",
    angles: [
      "Why mental health is becoming an economic issue in Morocco",
      "Athletes and the hidden cost of unmeasured stress",
      "Mental health care in Darija, Arabic, French and English",
      "Psychology that works under pressure, not only in the office",
      "Workplace mental health beyond meditation apps",
      "What sport psychology can teach companies",
    ],
    contactTitle: "Press contact",
    email: "Email",
    responseTime: "Response time",
    responseValue: "Within 24h · Mon–Fri",
    copied: "Copied",
    copy: "Copy",
    copiedToast: "Copied to clipboard",
  },
  fr: {
    seoTitle: "Presse et kit média | U.Psy",
    seoDescription:
      "Kit média, biographie du fondateur, présentation et contact presse de U.Psy, plateforme marocaine de psychologie et de performance mentale.",
    eyebrow: "Presse · Kit média",
    titleBefore: "Vous écrivez sur l'avenir de la",
    titleEm: "performance mentale",
    titleAfter: " ?",
    sub: "Tout ce qu'il faut pour parler de U.Psy : biographie du fondateur, texte de présentation, éléments de marque et contact direct avec notre service presse.",
    downloadLogo: "Télécharger le logo",
    facts: [
      ["Fondateur", "Mehdi Felji"],
      ["Siège", "Casablanca, Maroc"],
      ["Langues", "Darija · arabe · français · anglais"],
      ["Catégorie", "Santé mentale et performance mentale"],
      ["Site", "upsy.ma"],
    ],
    boilerplate: "Texte de présentation",
    founder: "Fondateur",
    founderCaption: "Mehdi Felji · Fondateur",
    shortBio: "Biographie courte",
    longBio: "Biographie longue",
    bioShort:
      "Mehdi Felji est psychologue clinicien du sport et fondateur de U.Psy. Son parcours l'a mené du sport de haut niveau aux contextes humanitaires et migratoires, avec Psychologues Sans Frontières, et à la coordination de programmes en santé mentale. Il défend une psychologie opérationnelle, mesurable et utilisable sous pression.",
    bioLong:
      "Mehdi Felji est psychologue clinicien du sport, fondateur de U.Psy. Sur le terrain, auprès d'athlètes en performance, de populations vulnérables avec Psychologues Sans Frontières et dans la coordination de projets en santé mentale, il a constaté la même limite : ce qui fonctionne en cabinet ne fonctionne pas toujours dans l'urgence, l'incertitude ou la pression de la performance. U.Psy est sa réponse : non pas un annuaire, mais un système qui relie rigueur clinique, performance mentale et impact à grande échelle.",
    anglesTitle: "Sujets sur lesquels nous pouvons intervenir",
    angles: [
      "Pourquoi la santé mentale devient un enjeu économique au Maroc",
      "Les sportifs et le coût caché du stress non mesuré",
      "Soigner en darija, arabe, français et anglais",
      "Une psychologie qui fonctionne sous pression, pas seulement en cabinet",
      "La santé mentale au travail, au-delà des applis de méditation",
      "Ce que la psychologie du sport peut apprendre aux entreprises",
    ],
    contactTitle: "Contact presse",
    email: "E-mail",
    responseTime: "Délai de réponse",
    responseValue: "Sous 24 h · du lundi au vendredi",
    copied: "Copié",
    copy: "Copier",
    copiedToast: "Copié dans le presse-papiers",
  },
  ar: {
    seoTitle: "الصحافة وملف الإعلام | U.Psy",
    seoDescription:
      "ملف إعلامي، سيرة المؤسس، نص تعريفي وجهة اتصال صحفية لـ U.Psy، المنصة المغربية للصحة النفسية والأداء الذهني.",
    eyebrow: "الصحافة · الملف الإعلامي",
    titleBefore: "تكتب عن مستقبل",
    titleEm: "الأداء الذهني",
    titleAfter: "؟",
    sub: "كل ما تحتاجه للكتابة عن U.Psy: سيرة المؤسس، نص تعريفي، عناصر الهوية البصرية، واتصال مباشر بمكتبنا الصحفي.",
    downloadLogo: "تحميل الشعار",
    facts: [
      ["المؤسس", "Mehdi Felji"],
      ["المقر", "الدار البيضاء، المغرب"],
      ["اللغات", "الدارجة · العربية · الفرنسية · الإنجليزية"],
      ["المجال", "الصحة النفسية والأداء الذهني"],
      ["الموقع", "upsy.ma"],
    ],
    boilerplate: "نص تعريفي",
    founder: "المؤسس",
    founderCaption: "Mehdi Felji · المؤسس",
    shortBio: "سيرة مختصرة",
    longBio: "سيرة مفصلة",
    bioShort:
      "Mehdi Felji أخصائي نفسي سريري رياضي ومؤسس U.Psy. قاده مساره من الرياضة عالية المستوى إلى السياقات الإنسانية والهجرة مع Psychologues Sans Frontières، ثم إلى تنسيق برامج في الصحة النفسية. يدافع عن علم نفس عملي، قابل للقياس وصالح للاستعمال تحت الضغط.",
    bioLong:
      "Mehdi Felji أخصائي نفسي سريري رياضي ومؤسس U.Psy. في الميدان، مع رياضيين في سياق الأداء، ومع فئات هشة عبر Psychologues Sans Frontières، وفي تنسيق مشاريع الصحة النفسية، واجه الحد نفسه: ما ينجح في العيادة لا ينجح دائماً في الطوارئ أو الغموض أو ضغط الأداء. U.Psy هي إجابته: ليست دليلاً، بل نظاماً يربط الصرامة السريرية بالأداء الذهني وبالأثر على نطاق واسع.",
    anglesTitle: "مواضيع يمكننا الحديث عنها",
    angles: [
      "لماذا أصبحت الصحة النفسية رهاناً اقتصادياً في المغرب",
      "الرياضيون والكلفة الخفية للضغط غير المقيس",
      "العلاج بالدارجة والعربية والفرنسية والإنجليزية",
      "علم نفس ينجح تحت الضغط، لا في العيادة فقط",
      "الصحة النفسية في العمل، أبعد من تطبيقات التأمل",
      "ما يمكن أن يعلّمه علم النفس الرياضي للشركات",
    ],
    contactTitle: "الاتصال الصحفي",
    email: "البريد الإلكتروني",
    responseTime: "مدة الرد",
    responseValue: "خلال 24 ساعة · من الاثنين إلى الجمعة",
    copied: "تم النسخ",
    copy: "نسخ",
    copiedToast: "تم النسخ إلى الحافظة",
  },
};

function CopyBlock({
  text,
  label,
  copy,
  copied: copiedLabel,
  toastText,
}: {
  text: string;
  label: string;
  copy: string;
  copied: string;
  toastText: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success(toastText);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs inline-flex min-h-10 items-center gap-1 px-2 text-primary hover:opacity-80"
        >
          <Copy className="h-3 w-3" /> {copied ? copiedLabel : copy}
        </button>
      </div>
      <p className="text-sm leading-relaxed p-4 rounded-lg bg-muted/50 border border-border">
        {text}
      </p>
    </div>
  );
}

const Press = () => {
  const { locale } = useLocale();
  const c = COPY[locale === "ar" ? "ar" : locale === "en" ? "en" : "fr"];
  const copyProps = {
    copy: c.copy,
    copied: c.copied,
    toastText: c.copiedToast,
  };
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        path="/press"
        title={c.seoTitle}
        description={c.seoDescription}
      />

      <section className="py-20 border-b border-border">
        <div className="container-custom max-w-4xl">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4">
            {c.eyebrow}
          </p>
          <h1 className="font-display text-5xl md:text-6xl mb-6">
            {c.titleBefore} <em className="italic">{c.titleEm}</em>
            {c.titleAfter}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            {c.sub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="mailto:press@upsy.ma?subject=Press%20inquiry%20%E2%80%94%20U.Psy">
                <Mail className="me-2 h-4 w-4" /> press@upsy.ma
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/upsy-logo-oauth.png" download>
                <Download className="me-2 h-4 w-4" /> {c.downloadLogo}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-border">
        <div className="container-custom max-w-4xl grid md:grid-cols-2 gap-3">
          {c.facts.map(([label, value]) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 p-4 rounded-lg border border-border bg-card"
            >
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <span className="font-display text-lg text-end">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 border-b border-border">
        <div className="container-custom max-w-4xl space-y-6">
          <h2 className="font-display text-3xl mb-2">{c.boilerplate}</h2>
          <CopyBlock label="Français" text={BOILERPLATE.fr} {...copyProps} />
          <CopyBlock label="English" text={BOILERPLATE.en} {...copyProps} />
          <CopyBlock label="العربية" text={BOILERPLATE.ar} {...copyProps} />
        </div>
      </section>

      <section className="py-16 border-b border-border">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl mb-6">{c.founder}</h2>
          <Card className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                  <span className="font-display text-6xl">MF</span>
                </div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-3 text-center">
                  {c.founderCaption}
                </p>
              </div>
              <div className="md:w-2/3 space-y-4">
                <CopyBlock
                  label={c.shortBio}
                  text={c.bioShort}
                  {...copyProps}
                />
                <CopyBlock label={c.longBio} text={c.bioLong} {...copyProps} />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-16 border-b border-border">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl mb-6">{c.anglesTitle}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {c.angles.map((s) => (
              <div
                key={s}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <p className="font-display text-lg leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl mb-6">{c.contactTitle}</h2>
          <Card className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  {c.email}
                </p>
                <a
                  href="mailto:press@upsy.ma"
                  className="font-display text-xl text-primary inline-flex items-center gap-2"
                >
                  press@upsy.ma <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  {c.responseTime}
                </p>
                <p className="font-display text-xl">{c.responseValue}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Press;
