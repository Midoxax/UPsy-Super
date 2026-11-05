import { Check, Sparkles, Building2, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import SEOHead from "@/components/SEOHead";

const COPY = {
  en: {
    seoTitle: "Pricing — U.Psy",
    seoDescription:
      "Transparent pricing for mental health support in Morocco: individual sessions set by each psychologist, session packs with up to 20% off, and programmes for organisations.",
    heroTitle: "Simple, transparent pricing",
    heroSub:
      "No hidden fees. No subscription. Pay only for the sessions you need.",
    indTitle: "For individuals",
    indSub: "Book sessions with verified psychologists at transparent prices",
    single: "Single session",
    singleDesc: "To try it out, or for occasional support",
    perSession: "per session",
    setBy: "Price set by each psychologist",
    find: "Find your psychologist",
    off9: "9% OFF",
    off15: "15% OFF — POPULAR",
    off20: "20% OFF — BEST VALUE",
    pack5: "5-session pack",
    pack5Desc: "For short-term support or a specific goal",
    pack10: "10-session pack",
    pack10Desc: "For sustained progress and lasting change",
    pack20: "20-session pack",
    pack20Desc: "For in-depth work or long-term support",
    perSessionApprox: "MAD/session",
    regular: "Regular:",
    getStarted: "Get started",
    indFeatures: [
      "Access to verified psychologists",
      "Book online at your psychologist's available times",
      "Secure video sessions",
      "Confidential",
      "Free cancellation or rescheduling up to 24h before",
      "Invoices for your records",
    ],
    packFeatures: [
      "Everything in a single session",
      "Lower cost per session",
      "Valid for 6 months",
      "Track progress with the Mental Performance Score",
      "Can be offered to a friend or relative",
    ],
    orgTitle: "For organisations",
    orgSub:
      "Mental health programmes for your teams: confidential access to psychologists, workshops and manager training.",
    eap: "Programme for organisations",
    eapDesc: "A mental health benefit for your team",
    orgPrice: "On quote",
    orgPriceSub:
      "Adapted to the size of your teams. We start with one pilot team.",
    orgFeatures: [
      "Confidential access to verified psychologists",
      "Aggregated dashboard, no individual data",
      "CBT-based stress management workshops",
      "Manager training",
      "Pilot team, then a decision to extend",
    ],
    roiTitle: "Evidence-based return",
    roiBody:
      "Across 36 countries, treating depression and anxiety returns up to 3 times its cost in productivity, and up to 5.7 times counting health gains (Chisholm et al., Lancet Psychiatry, 2016).",
    accessTitle: "Flexible access",
    accessBody: "Employees book directly. You only see aggregated data.",
    demo: "Book a call",
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        q: "How does payment work?",
        a: "During launch, sessions are paid by bank transfer: you receive the details when you book. The price is the one shown on the psychologist's profile.",
      },
      {
        q: "Can I get reimbursed by insurance?",
        a: "AMO does not currently reimburse psychology sessions. Some private insurance policies may cover mental health: check with your insurer. We provide an invoice you can submit.",
      },
      {
        q: "What if I need to cancel?",
        a: "You can cancel or reschedule free of charge up to 24 hours before your session.",
      },
      {
        q: "Are sessions really confidential?",
        a: "Yes. Sessions and exchanges are encrypted in transit. Psychologists are bound by professional secrecy (article 446 of the Moroccan Penal Code). We never share your data without your explicit consent (Law 09-08).",
      },
      {
        q: "How long is each session?",
        a: "Standard sessions last 50 minutes. Some psychologists offer 30- or 90-minute sessions at different prices.",
      },
      {
        q: "Is there a free trial or consultation?",
        a: "The Mental Performance Score is free (12 questions, 2 minutes). The first session with a psychologist is paid, and if it isn't the right fit we rebook you for free.",
      },
      {
        q: "What's the difference between a single session and a pack?",
        a: "Single session: you pay per session. Packs: you buy several sessions upfront at a discount (9 to 20% off). Packs are valid for 6 months and can be offered to someone else.",
      },
      {
        q: "For organisations: is there a minimum size?",
        a: "We work with organisations of all sizes and always start with one pilot team. Pricing is quoted to fit your teams.",
      },
    ],
    ctaTitle: "Ready to start?",
    ctaSub: "Find your psychologist and book your first session online.",
    browse: "Browse psychologists",
    matched: "Get matched",
  },
  fr: {
    seoTitle: "Tarifs | U.Psy",
    seoDescription:
      "Des tarifs transparents pour l'accompagnement psychologique au Maroc : séances au tarif fixé par chaque psychologue, packs jusqu'à -20 % et programmes pour les organisations.",
    heroTitle: "Des tarifs simples et transparents",
    heroSub:
      "Pas de frais cachés. Pas d'abonnement. Vous ne payez que les séances dont vous avez besoin.",
    indTitle: "Pour les particuliers",
    indSub: "Réservez avec des psychologues vérifiés, à des tarifs affichés",
    single: "Séance individuelle",
    singleDesc: "Pour essayer, ou pour un besoin ponctuel",
    perSession: "par séance",
    setBy: "Tarif fixé par chaque psychologue",
    find: "Trouver mon psychologue",
    off9: "-9 %",
    off15: "-15 % · LE PLUS CHOISI",
    off20: "-20 % · LE MEILLEUR TARIF",
    pack5: "Pack 5 séances",
    pack5Desc: "Pour un accompagnement court ou un objectif précis",
    pack10: "Pack 10 séances",
    pack10Desc: "Pour progresser dans la durée",
    pack20: "Pack 20 séances",
    pack20Desc: "Pour un travail en profondeur ou un suivi long",
    perSessionApprox: "MAD/séance",
    regular: "Prix normal :",
    getStarted: "Commencer",
    indFeatures: [
      "Accès à des psychologues vérifiés",
      "Réservation en ligne selon les disponibilités de votre psychologue",
      "Séances vidéo sécurisées",
      "Confidentiel",
      "Annulation ou report gratuits jusqu'à 24 h avant",
      "Facture pour vos démarches",
    ],
    packFeatures: [
      "Tout ce que comprend une séance",
      "Coût par séance réduit",
      "Valable 6 mois",
      "Suivi des progrès avec le score de performance mentale",
      "Peut être offert à un proche",
    ],
    orgTitle: "Pour les organisations",
    orgSub:
      "Des programmes de santé mentale pour vos équipes : accès confidentiel à des psychologues, ateliers et formation des managers.",
    eap: "Programme organisations",
    eapDesc: "Un avantage santé mentale pour vos équipes",
    orgPrice: "Sur devis",
    orgPriceSub:
      "Adapté à la taille de vos équipes. On commence par une équipe pilote.",
    orgFeatures: [
      "Accès confidentiel à des psychologues vérifiés",
      "Tableau de bord agrégé, sans données individuelles",
      "Ateliers de gestion du stress fondés sur les TCC",
      "Formation des managers",
      "Équipe pilote, puis décision d'étendre",
    ],
    roiTitle: "Un retour démontré",
    roiBody:
      "Dans 36 pays, traiter la dépression et l'anxiété rapporte jusqu'à 3 fois son coût en productivité, et jusqu'à 5,7 fois en comptant les gains de santé (Chisholm et al., Lancet Psychiatry, 2016).",
    accessTitle: "Accès souple",
    accessBody:
      "Les collaborateurs réservent directement. Vous ne voyez que des données agrégées.",
    demo: "Réserver un appel",
    faqTitle: "Questions fréquentes",
    faqs: [
      {
        q: "Comment se passe le paiement ?",
        a: "Pendant le lancement, les séances se règlent par virement : vous recevez les coordonnées au moment de la réservation. Le prix est celui affiché sur le profil du psychologue.",
      },
      {
        q: "Puis-je être remboursé par mon assurance ?",
        a: "L'AMO ne rembourse pas les séances de psychologie à ce jour. Certains contrats d'assurance privée peuvent couvrir la santé mentale : renseignez-vous auprès de votre assureur. Nous vous fournissons une facture à transmettre.",
      },
      {
        q: "Et si je dois annuler ?",
        a: "Vous pouvez annuler ou reporter gratuitement jusqu'à 24 heures avant votre séance.",
      },
      {
        q: "Les séances sont-elles vraiment confidentielles ?",
        a: "Oui. Les séances et les échanges sont chiffrés pendant leur transmission. Les psychologues sont tenus au secret professionnel (article 446 du Code pénal marocain). Nous ne partageons jamais vos données sans votre consentement explicite (loi 09-08).",
      },
      {
        q: "Combien de temps dure une séance ?",
        a: "Une séance standard dure 50 minutes. Certains psychologues proposent des séances de 30 ou 90 minutes à d'autres tarifs.",
      },
      {
        q: "Y a-t-il un essai ou une consultation gratuite ?",
        a: "Le score de performance mentale est gratuit (12 questions, 2 minutes). La première séance avec un psychologue est payante, et si le courant ne passe pas, nous vous proposons une autre séance gratuitement.",
      },
      {
        q: "Quelle différence entre une séance et un pack ?",
        a: "Séance individuelle : vous payez à la séance. Packs : vous achetez plusieurs séances à l'avance avec une réduction (de 9 à 20 %). Les packs sont valables 6 mois et peuvent être offerts.",
      },
      {
        q: "Pour les organisations : y a-t-il une taille minimum ?",
        a: "Nous travaillons avec des organisations de toutes tailles et commençons toujours par une équipe pilote. Le tarif est établi sur devis.",
      },
    ],
    ctaTitle: "Prêt à commencer ?",
    ctaSub:
      "Trouvez votre psychologue et réservez votre première séance en ligne.",
    browse: "Voir les psychologues",
    matched: "Être orienté",
  },
  ar: {
    seoTitle: "الأسعار | U.Psy",
    seoDescription:
      "أسعار شفافة للمرافقة النفسية في المغرب: جلسات بسعر يحدده كل أخصائي، باقات بخصم يصل إلى 20٪ وبرامج للمؤسسات.",
    heroTitle: "أسعار بسيطة وشفافة",
    heroSub: "بلا رسوم خفية. بلا اشتراك. تدفع فقط مقابل الجلسات التي تحتاجها.",
    indTitle: "للأفراد",
    indSub: "احجز مع أخصائيين نفسيين موثَّقين بأسعار معلنة",
    single: "جلسة فردية",
    singleDesc: "للتجربة أو لحاجة عابرة",
    perSession: "للجلسة",
    setBy: "سعر يحدده كل أخصائي",
    find: "ابحث عن أخصائيك",
    off9: "خصم 9٪",
    off15: "خصم 15٪ · الأكثر اختياراً",
    off20: "خصم 20٪ · أفضل سعر",
    pack5: "باقة 5 جلسات",
    pack5Desc: "لمرافقة قصيرة أو هدف محدد",
    pack10: "باقة 10 جلسات",
    pack10Desc: "لتقدم مستمر وتغيير دائم",
    pack20: "باقة 20 جلسة",
    pack20Desc: "لعمل معمّق أو متابعة طويلة",
    perSessionApprox: "درهم/جلسة",
    regular: "السعر العادي:",
    getStarted: "ابدأ",
    indFeatures: [
      "الوصول إلى أخصائيين نفسيين موثَّقين",
      "حجز عبر الإنترنت حسب أوقات أخصائيك",
      "جلسات فيديو آمنة",
      "سري",
      "إلغاء أو تأجيل مجاني حتى 24 ساعة قبل الموعد",
      "فاتورة لمعاملاتك",
    ],
    packFeatures: [
      "كل ما تتضمنه الجلسة الفردية",
      "كلفة أقل للجلسة",
      "صالحة لمدة 6 أشهر",
      "تتبع التقدم بمؤشر الأداء الذهني",
      "يمكن إهداؤها لقريب",
    ],
    orgTitle: "للمؤسسات",
    orgSub:
      "برامج للصحة النفسية لفرقك: وصول سري إلى أخصائيين، ورشات وتكوين للمسيرين.",
    eap: "برنامج المؤسسات",
    eapDesc: "ميزة للصحة النفسية لفرقك",
    orgPrice: "حسب عرض سعر",
    orgPriceSub: "يتكيف مع حجم فرقك. نبدأ بفريق تجريبي.",
    orgFeatures: [
      "وصول سري إلى أخصائيين موثَّقين",
      "لوحة قيادة مجمَّعة دون بيانات فردية",
      "ورشات لتدبير الضغط قائمة على العلاج المعرفي السلوكي",
      "تكوين المسيرين",
      "فريق تجريبي ثم قرار التوسيع",
    ],
    roiTitle: "عائد مثبت",
    roiBody:
      "في 36 دولة، يعيد علاج الاكتئاب والقلق حتى 3 أضعاف كلفته في الإنتاجية، وحتى 5.7 أضعاف عند احتساب المكاسب الصحية (Chisholm وآخرون، Lancet Psychiatry، 2016).",
    accessTitle: "ولوج مرن",
    accessBody: "يحجز الموظفون مباشرة. لا ترى إلا بيانات مجمَّعة.",
    demo: "احجز مكالمة",
    faqTitle: "أسئلة شائعة",
    faqs: [
      {
        q: "كيف يتم الدفع؟",
        a: "خلال فترة الإطلاق، تُؤدى الجلسات عبر تحويل بنكي: تتوصل بالمعلومات عند الحجز. السعر هو المعروض على صفحة الأخصائي.",
      },
      {
        q: "هل يمكن أن يعوضني التأمين؟",
        a: "لا تعوض AMO جلسات علم النفس حالياً. قد تغطي بعض عقود التأمين الخاص الصحة النفسية: استفسر لدى مؤمّنك. نقدم لك فاتورة يمكنك إرسالها.",
      },
      {
        q: "وإذا احتجت إلى الإلغاء؟",
        a: "يمكنك الإلغاء أو التأجيل مجاناً حتى 24 ساعة قبل جلستك.",
      },
      {
        q: "هل الجلسات سرية فعلاً؟",
        a: "نعم. الجلسات والمراسلات مشفَّرة أثناء نقلها. الأخصائيون ملزمون بالسر المهني (الفصل 446 من القانون الجنائي المغربي). لا نشارك بياناتك أبداً دون موافقتك الصريحة (القانون 09-08).",
      },
      {
        q: "كم تدوم الجلسة؟",
        a: "تدوم الجلسة العادية 50 دقيقة. يقترح بعض الأخصائيين جلسات من 30 أو 90 دقيقة بأسعار مختلفة.",
      },
      {
        q: "هل هناك تجربة أو استشارة مجانية؟",
        a: "مؤشر الأداء الذهني مجاني (12 سؤالاً، دقيقتان). الجلسة الأولى مع أخصائي مؤدى عنها، وإن لم يكن الاختيار مناسباً نقترح عليك جلسة أخرى مجاناً.",
      },
      {
        q: "ما الفرق بين الجلسة الفردية والباقة؟",
        a: "الجلسة الفردية: تدفع لكل جلسة. الباقات: تشتري عدة جلسات مسبقاً بخصم (من 9 إلى 20٪). الباقات صالحة لمدة 6 أشهر ويمكن إهداؤها.",
      },
      {
        q: "للمؤسسات: هل هناك حد أدنى للحجم؟",
        a: "نعمل مع مؤسسات من كل الأحجام ونبدأ دائماً بفريق تجريبي. يُحدد السعر حسب عرض.",
      },
    ],
    ctaTitle: "مستعد للبدء؟",
    ctaSub: "اعثر على أخصائيك واحجز جلستك الأولى عبر الإنترنت.",
    browse: "تصفح الأخصائيين",
    matched: "احصل على توجيه",
  },
};

// Pack prices, in MAD. Discounts: 9%, 15%, 20% on a 450 MAD reference.
const PACKS = {
  p5: { total: 2045, per: 409, regular: 2250 },
  p10: { total: 3825, per: 383, regular: 4500 },
  p20: { total: 7200, per: 360, regular: 9000 },
};

const FeatureList = ({ items }: { items: string[] }) => (
  <ul className="space-y-3 mb-6">
    {items.map((feature) => (
      <li key={feature} className="flex items-start gap-2 text-sm">
        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <span>{feature}</span>
      </li>
    ))}
  </ul>
);

const Pricing = () => {
  const { locale } = useLocale();
  const c = COPY[locale === "ar" ? "ar" : locale === "en" ? "en" : "fr"];
  const fmt = (n: number) =>
    n.toLocaleString(
      locale === "fr" ? "fr-FR" : locale === "ar" ? "ar-MA" : "en-US",
    );

  const pack = (
    key: keyof typeof PACKS,
    badge: string,
    badgeClass: string,
    title: string,
    desc: string,
    cardClass: string,
    variant: "default" | "outline",
  ) => (
    <Card className={cardClass}>
      <CardHeader>
        <div
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 w-fit ${badgeClass}`}
        >
          {badge}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-3xl font-bold text-foreground">
            <bdi dir="ltr">{fmt(PACKS[key].total)} MAD</bdi>
          </div>
          <div className="text-sm text-muted-foreground">
            ≈ {fmt(PACKS[key].per)} {c.perSessionApprox}
          </div>
          <div className="text-xs text-muted-foreground mt-1 line-through">
            {c.regular} <bdi dir="ltr">{fmt(PACKS[key].regular)} MAD</bdi>
          </div>
        </div>
        <FeatureList items={c.packFeatures} />
        <Button className="w-full" variant={variant} asChild>
          <Link to="/psychologists">{c.getStarted}</Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEOHead
        path="/pricing"
        title={c.seoTitle}
        description={c.seoDescription}
      />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-h1 mb-4">{c.heroTitle}</h1>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              {c.heroSub}
            </p>
          </div>
        </section>

        {/* Individual */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-h2 mb-3">{c.indTitle}</h2>
              <p className="text-muted-foreground">{c.indSub}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {c.single}
                  </CardTitle>
                  <CardDescription>{c.singleDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-foreground">
                      <bdi dir="ltr">250–800 MAD</bdi>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {c.perSession}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {c.setBy}
                    </div>
                  </div>
                  <FeatureList items={c.indFeatures} />
                  <Button className="w-full" asChild>
                    <Link to="/psychologists">{c.find}</Link>
                  </Button>
                </CardContent>
              </Card>

              {pack(
                "p5",
                c.off9,
                "bg-primary/10 text-primary",
                c.pack5,
                c.pack5Desc,
                "border-primary/50",
                "outline",
              )}
              {pack(
                "p10",
                c.off15,
                "bg-primary text-primary-foreground",
                c.pack10,
                c.pack10Desc,
                "border-primary shadow-lg",
                "default",
              )}
            </div>

            <div className="max-w-2xl mx-auto">
              {pack(
                "p20",
                c.off20,
                "bg-accent/20 text-accent-foreground",
                c.pack20,
                c.pack20Desc,
                "border-primary/50",
                "default",
              )}
            </div>
          </div>
        </section>

        {/* Organizations */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-h2 mb-3">{c.orgTitle}</h2>
            <p className="text-muted-foreground">{c.orgSub}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {c.eap}
                </CardTitle>
                <CardDescription>{c.eapDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {c.orgPrice}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {c.orgPriceSub}
                      </div>
                    </div>
                    <FeatureList items={c.orgFeatures} />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="font-semibold text-sm">
                            {c.roiTitle}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {c.roiBody}{" "}
                            <a
                              href="https://doi.org/10.1016/S2215-0366(16)30024-4"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              doi
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="font-semibold text-sm">
                            {c.accessTitle}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {c.accessBody}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button size="lg" asChild className="w-full">
                      <Link to="/book-a-call">{c.demo}</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-h2 text-center mb-12">{c.faqTitle}</h2>
            <Accordion type="single" collapsible className="w-full">
              {c.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-start">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-h2 mb-4">{c.ctaTitle}</h2>
            <p className="text-muted-foreground mb-8">{c.ctaSub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/psychologists">{c.browse}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/get-matched">{c.matched}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Pricing;
