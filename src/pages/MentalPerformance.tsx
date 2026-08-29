import { Link } from "@/lib/router-compat";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trackCTAClick } from "@/lib/analytics/gtm";
import { Brain, Focus, Zap, Target, TrendingUp, ShieldCheck } from "lucide-react";


const FAQ = [
  {
    q: "What is mental performance?",
    a: "Mental performance is the trained capacity to think clearly, regulate emotion, and sustain focus under pressure. Unlike therapy, which resolves distress, mental performance training builds the cognitive and emotional skills that drive execution — attention control, stress tolerance, recovery, and decision-making.",
  },
  {
    q: "How do I improve my mental performance?",
    a: "Improvement follows a measurable loop: (1) baseline your cognitive and emotional state with a validated assessment, (2) identify the two or three levers with the highest leverage (sleep, focus, stress recovery, or self-talk), (3) train them for 6–12 weeks with a coach or protocol, (4) re-measure. Consistency beats intensity — 20 minutes daily outperforms occasional long sessions.",
  },
  {
    q: "How to build mental toughness?",
    a: "Mental toughness is built through graded exposure to controlled discomfort plus deliberate recovery. Train four pillars: confidence (evidence-based, not affirmations), concentration (single-task blocks), control (breath and physiology regulation), and commitment (values-anchored goals). Toughness without recovery becomes burnout.",
  },
  {
    q: "What causes brain fog and mental fatigue?",
    a: "The most common drivers are sleep debt, chronic stress load, blood-sugar instability, dehydration, and cognitive overload from context-switching. Rule out medical causes (thyroid, iron, B12, sleep apnea) before behavioral work. Most cases resolve within 3–4 weeks of sleep, hydration, and single-tasking discipline.",
  },
  {
    q: "How do I improve focus and productivity?",
    a: "Protect one 90-minute deep-work block per day, phone in another room. Use a fixed start cue (same time, same drink, same music). Batch shallow work into two windows. Sleep 7+ hours — every hour under 7 costs roughly one IQ point of working memory the next day.",
  },
  {
    q: "Do I need a mental performance coach or a therapist?",
    a: "A therapist treats clinical distress (anxiety, depression, trauma). A mental performance coach or psychologist trains healthy people to perform better under load — athletes, founders, executives, students, medical staff. If you feel functional but plateaued, coaching. If daily life is suffering, therapy first. U.Psy offers both and will route you correctly.",
  },
  {
    q: "How long does it take to see results?",
    a: "Focus and stress-regulation gains show within 2–4 weeks. Deeper shifts in confidence, self-talk, and identity take 8–12 weeks. Elite-level consistency is a 6–12 month arc. We re-measure every 4 weeks so progress is visible, not felt.",
  },
];

export default function MentalPerformance() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://upsy.ma",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mental Performance",
        item: "https://upsy.ma/mental-performance",
      },
    ],
  };

  const pillars = [
    { icon: Focus, title: "Attention Control", desc: "Train the ability to hold and release focus at will — the core skill under every high-stakes output." },
    { icon: Zap, title: "Stress Recovery", desc: "Move from reactive to regulated. Nervous-system tools that shorten recovery from setbacks and pressure." },
    { icon: Target, title: "Decision Under Load", desc: "Keep judgment sharp when stakes, ambiguity, and fatigue rise — the difference between good and elite operators." },
    { icon: Brain, title: "Cognitive Endurance", desc: "Sustain quality of thought across a full day, not just the first hour. Rebuild working memory and clarity." },
    { icon: TrendingUp, title: "Confidence Architecture", desc: "Evidence-based self-belief built from measured wins — not affirmations. Compounds week over week." },
    { icon: ShieldCheck, title: "Recovery & Sleep", desc: "The multiplier on every other skill. Protocols for sleep, downtime, and emotional recovery." },
  ];

  return (
    <>
      <SEOHead
        path="/mental-performance"
        title="Mental Performance Training — Focus, Toughness, Clarity | U.Psy"
        description="Measure, train, and sustain elite mental performance. Assessments, coaching, and protocols for focus, mental toughness, stress recovery, and decision-making."
        jsonLd={[breadcrumbJsonLd, faqJsonLd]}
      />

      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 py-24 md:py-32 max-w-5xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
              Performance Psychology System
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
              Train the mind like{" "}
              <em className="italic font-normal text-primary">elite operators do.</em>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              Focus, mental toughness, and clarity are trainable skills — not personality traits.
              U.Psy measures where you are, builds the protocol, and coaches you to a higher baseline
              in 8–12 weeks.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link
                  to="/free-score"
                  onClick={() =>
                    trackCTAClick("Start Free", "hero", "/mental-performance", { cta_action: "score_start" })
                  }
                >
                  Get your free Mental Performance Score
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link
                  to="/psychologists"
                  onClick={() =>
                    trackCTAClick("Book a Call", "hero", "/mental-performance", { cta_action: "book_intent" })
                  }
                >
                  Book a performance psychologist
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground font-mono tabular-nums">
              10 questions · 3 minutes · free rebook if not the right fit
            </p>
          </div>
        </section>

        {/* Pillars */}
        <section className="container mx-auto px-4 py-20 max-w-6xl">
          <div className="max-w-2xl mb-14">
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-4">
              Six pillars we measure and train
            </h2>
            <p className="text-muted-foreground text-lg">
              Every protocol pulls from these six trainable systems. You never work on all of them at
              once — assessment shows which two or three matter for you right now.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => (
              <Card key={p.title} className="border-border/60 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <p.icon className="w-6 h-6 text-primary mb-3" strokeWidth={1.5} />
                  <CardTitle className="font-display text-2xl">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Method */}
        <section className="border-y border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 py-20 max-w-5xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">The method</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-12">
              Measure. Identify. Train. Apply.
            </h2>
            <div className="grid gap-10 md:grid-cols-4">
              {[
                { n: "01", t: "Measure", d: "Validated cognitive and emotional baseline in under 15 minutes." },
                { n: "02", t: "Identify", d: "Two or three levers with the highest leverage — no generic advice." },
                { n: "03", t: "Train", d: "8–12 weeks of protocols and 1:1 coaching. Weekly checkpoints." },
                { n: "04", t: "Apply", d: "Transfer to your real context: sport, boardroom, exam, operating theatre." },
              ].map((s) => (
                <div key={s.n}>
                  <div className="font-mono tabular-nums text-sm text-primary mb-3">{s.n}</div>
                  <h3 className="font-display text-2xl mb-2">{s.t}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who */}
        <section className="container mx-auto px-4 py-20 max-w-5xl">
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-4">
            Built for people who <em className="italic font-normal text-primary">operate under load.</em>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mb-10">
            Athletes. Founders. Surgeons. Traders. Students in high-stakes exams. Anyone whose output
            depends on the quality of their attention.
          </p>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            {[
              "Athletes preparing for competition or coming back from injury",
              "Founders and executives holding decisions under uncertainty",
              "Medical, legal, and aviation professionals in high-consequence roles",
              "Students preparing for medical, bar, or graduate entrance exams",
              "Creatives protecting deep-work time from constant context-switching",
              "High performers coming off burnout who want a sustainable baseline",
            ].map((line) => (
              <div key={line} className="flex gap-3 p-4 rounded-xl border border-border/50">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p className="text-muted-foreground">{line}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 py-20 max-w-3xl">
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-10">
              Questions people ask before starting
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`i-${i}`}>
                  <AccordionTrigger className="text-left font-display text-lg md:text-xl">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-24 max-w-3xl text-center">
          <h2 className="font-display text-4xl md:text-6xl leading-tight mb-6">
            See your baseline in <em className="italic font-normal text-primary">3 minutes.</em>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Free, private, no card. Get a Mental Performance Score and a next-step protocol built for you.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link
                to="/free-score"
                onClick={() =>
                  trackCTAClick("Start Free", "bottom_cta", "/mental-performance", { cta_action: "score_start" })
                }
              >
                Start free assessment
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link
                to="/psychologists"
                onClick={() =>
                  trackCTAClick("Book a Call", "bottom_cta", "/mental-performance", { cta_action: "book_intent" })
                }
              >
                Meet the psychologists
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}