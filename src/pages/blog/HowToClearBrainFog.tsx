import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import BlogAuthor from "@/components/blog/BlogAuthor";
import RelatedArticles from "@/components/blog/RelatedArticles";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, CloudFog, Droplet, Utensils, Stethoscope, AlarmClock } from "lucide-react";

const FAQ = [
  {
    q: "What causes brain fog?",
    a: "The most common drivers are sleep debt, chronic stress load, blood-sugar instability, dehydration, and cognitive overload from context-switching. Medical causes to rule out include thyroid dysfunction, iron and B12 deficiency, sleep apnea, and post-viral syndromes. Most non-medical brain fog resolves within 3–4 weeks of consistent sleep, hydration, and single-tasking.",
  },
  {
    q: "How do I get rid of brain fog fast?",
    a: "In 48 hours you can move the needle: 7+ hours of sleep two nights running, 2–3 litres of water daily, protein at breakfast, one deep-work block instead of constant switching, and a 20-minute walk outdoors. If nothing shifts in a week, the cause is likely medical or clinical — get bloodwork done.",
  },
  {
    q: "Is brain fog a sign of something serious?",
    a: "Usually no. Occasionally yes. Persistent fog lasting more than a month, especially with weight change, cold intolerance, hair changes, unexplained fatigue, or new depressive symptoms, warrants a GP visit. Ask specifically for thyroid panel (TSH, T3, T4), ferritin, B12, vitamin D, and fasting glucose.",
  },
  {
    q: "Can stress cause brain fog?",
    a: "Yes. Chronic stress elevates cortisol, which impairs prefrontal cortex function — the brain region responsible for focus, planning, and working memory. Stress-driven fog typically comes with poor sleep and rumination. The fix is nervous-system regulation, not more coffee.",
  },
  {
    q: "Does brain fog mean I have depression or ADHD?",
    a: "Not necessarily, but both commonly present with brain fog. If low mood, loss of interest, or lifelong distractibility accompany the fog, a proper assessment is worth it. Both conditions are highly treatable and improve cognitive clarity within weeks of the right support.",
  },
];

export default function HowToClearBrainFog() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SEOHead
        path="/blog/how-to-clear-brain-fog"
        title="How to Clear Brain Fog — Causes, Fixes & When to See a Doctor | U.Psy"
        description="Brain fog is not laziness. A clinical guide to the real causes — sleep, stress, nutrition, medical — and a 2-week protocol to restore mental clarity."
        jsonLd={faqJsonLd}
      />
      <BlogArticleSchema
        title="How to Clear Brain Fog — Causes, Fixes and When to See a Doctor"
        description="A clinical guide to the real causes of brain fog and a 2-week protocol to restore mental clarity."
        slug="how-to-clear-brain-fog"
        datePublished="2026-07-01"
        category="Performance"
        readTimeMinutes={7}
      />

      <main className="flex-1">
        <section className="hero-neural-bg py-20 md:py-28">
          <div className="container-custom max-w-3xl">
            <ScrollReveal>
              <div className="text-center space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Performance
                </span>
                <h1 className="text-display leading-tight font-display">
                  How to Clear Brain Fog
                </h1>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Brain fog is not laziness and it is not "just stress". It is a signal — usually
                  from sleep, blood sugar, nervous-system load, or something medical worth checking.
                  Here is how to read the signal and act on it.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <article className="py-16 md:py-24">
          <div className="container-custom max-w-3xl space-y-14">
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CloudFog className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2 font-display">What brain fog actually is</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  Brain fog is a subjective loss of mental clarity — slow processing, weak working
                  memory, difficulty finding words, and a sense that thinking takes effort. It is a
                  symptom, not a diagnosis. The job is to find the driver and remove it.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <AlarmClock className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2 font-display">The five most common drivers</h2>
                </div>
                <div className="grid gap-4">
                  {[
                    { t: "Sleep debt", d: "Under 7 hours consistently — the single biggest contributor. Fix this first before anything else." },
                    { t: "Chronic stress load", d: "Elevated cortisol degrades prefrontal cortex function. Fog is often the first sign of nervous-system overload." },
                    { t: "Blood-sugar instability", d: "Skipped meals, refined carbs, no protein at breakfast. The mid-morning crash is a fog trigger." },
                    { t: "Dehydration", d: "Even 1–2% dehydration measurably impairs concentration. Most people run chronically low." },
                    { t: "Cognitive overload", d: "Constant context-switching depletes attention. The fog is the bill for switching costs." },
                  ].map((item, i) => (
                    <div key={i} className="glass-card p-5 flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="font-mono tabular-nums text-sm text-primary">{i + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-display text-lg mb-1">{item.t}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2 font-display">A 2-week clarity protocol</h2>
                </div>
                <ul className="space-y-3 text-body text-muted-foreground leading-relaxed list-none">
                  <li><strong className="text-foreground">Day 1–3.</strong> Sleep 7+ hours. 2 litres of water before 6pm. Protein at breakfast within 60 minutes of waking.</li>
                  <li><strong className="text-foreground">Day 4–7.</strong> One 60-minute single-task block per day. Phone in another room. 20-minute outdoor walk.</li>
                  <li><strong className="text-foreground">Day 8–14.</strong> Add nervous-system down-regulation: 5 minutes of slow nasal breathing morning and night (6 breaths/min).</li>
                  <li><strong className="text-foreground">Day 14 review.</strong> If clarity improved, keep going. If not, book bloodwork and a psychologist — the driver is deeper than lifestyle.</li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2 font-display">When to see a doctor</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  Fog persisting past four weeks despite good sleep and hydration deserves a full
                  workup. Ask specifically for thyroid panel (TSH, T3, T4), ferritin, B12, vitamin
                  D, fasting glucose, and HbA1c. Rule out sleep apnea if you snore or wake unrested.
                  Rule out anxiety and depression with a psychologist — both routinely present as
                  fog before mood.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2 font-display">Frequently asked questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {FAQ.map((f, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left font-display text-base md:text-lg">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="glass-card p-8 md:p-12 text-center space-y-4">
                <h2 className="text-h2 font-display">Not sure where the fog is coming from?</h2>
                <p className="text-body text-muted-foreground max-w-xl mx-auto">
                  The 2-minute Mental Performance Score checks recovery, regulation, focus, and
                  meaning — and tells you which pillar to address first. Free, private, no card.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button variant="primary" size="lg" asChild>
                    <Link to="/free-score" className="inline-flex items-center gap-2">
                      Take the free score <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <Link to="/psychologists">Talk to a psychologist</Link>
                  </Button>
                </div>
              </section>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <BlogAuthor />
          </ScrollReveal>
          <ScrollReveal>
            <RelatedArticles currentSlug="how-to-clear-brain-fog" />
          </ScrollReveal>
        </article>
      </main>
    </>
  );
}