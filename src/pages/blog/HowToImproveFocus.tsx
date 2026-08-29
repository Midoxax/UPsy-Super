import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import BlogAuthor from "@/components/blog/BlogAuthor";
import RelatedArticles from "@/components/blog/RelatedArticles";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, Target, Timer, Moon, Coffee, Brain } from "lucide-react";

const FAQ = [
  {
    q: "How can I improve my focus quickly?",
    a: "In 24 hours you cannot rewire attention, but you can remove the two biggest leaks: phone in another room during one 60–90 minute block, and 7+ hours of sleep the night before. Together these two changes recover more focus than any supplement or app on the market.",
  },
  {
    q: "Why do I lose focus after 20 minutes?",
    a: "Sustained attention is a limited resource that depletes with every context-switch, notification, and micro-decision. Most people are not losing focus at 20 minutes — they are being pulled out of it by an interruption. Protect the block with airplane mode and a single-tab browser and the 20 minutes typically stretches to 60–90.",
  },
  {
    q: "How do high performers train focus?",
    a: "Elite operators treat focus as a trainable skill: one protected deep-work block per day at the same time, a fixed start ritual (same drink, same seat, same music), single-tasking discipline, and hard recovery blocks. Consistency beats intensity — 60 minutes daily outperforms an occasional 4-hour marathon.",
  },
  {
    q: "Is ADHD the reason I can't focus?",
    a: "Only a licensed clinician can diagnose ADHD. That said, most focus complaints in adults resolve with sleep, single-tasking, and phone hygiene. If those changes don't help after 4–6 weeks of honest effort, a proper assessment is worth doing — untreated ADHD is common and highly treatable.",
  },
  {
    q: "Do focus apps and supplements work?",
    a: "Website blockers help by removing the friction of self-control. Nootropic supplements have weak evidence — caffeine is the only one with robust support and it comes with a sleep cost. The highest-leverage 'stack' remains sleep, hydration, protein at breakfast, one deep-work block, and a phone in another room.",
  },
];

export default function HowToImproveFocus() {
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
        path="/blog/how-to-improve-focus"
        title="How to Improve Focus and Concentration — Evidence-Based Guide | U.Psy"
        description="Focus is trainable. A practical, science-backed guide to improving concentration in 4 weeks — deep work blocks, sleep, phone hygiene, and when to get help."
        jsonLd={faqJsonLd}
      />
      <BlogArticleSchema
        title="How to Improve Focus and Concentration — Evidence-Based Guide"
        description="A practical, science-backed guide to training focus: deep-work blocks, sleep, phone hygiene, and when to see a specialist."
        slug="how-to-improve-focus"
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
                  How to Improve Focus and Concentration
                </h1>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Focus is not a personality trait. It is a trainable skill — and the levers that
                  move it most are surprisingly few. Here is the evidence-based playbook.
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
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2 font-display">What focus actually is</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  Focus is the trained capacity to <em>hold</em> attention on one thing and{" "}
                  <em>release</em> it when you choose. Most focus problems are not attention
                  deficits — they are release deficits. The mind gets grabbed by a notification,
                  a thought, a tab, and never returns cleanly. Improving focus means reducing what
                  grabs you and training the return.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2 font-display">The four levers that move it</h2>
                </div>
                <div className="grid gap-4">
                  {[
                    { t: "One protected deep-work block", d: "60–90 minutes, same time daily, phone in another room. This single habit outperforms every productivity system." },
                    { t: "Sleep 7+ hours", d: "Every hour under 7 costs roughly one IQ point of working memory the next day. There is no workaround." },
                    { t: "Single-tasking discipline", d: "Every context-switch costs 15–25 minutes of recovery time. Batch shallow work into two windows a day." },
                    { t: "A fixed start ritual", d: "Same drink, same seat, same music. The ritual becomes a conditioned start signal — you stop needing willpower." },
                  ].map((lever, i) => (
                    <div key={i} className="glass-card p-5 flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="font-mono tabular-nums text-sm text-primary">{i + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-display text-lg mb-1">{lever.t}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{lever.d}</p>
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
                    <Timer className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2 font-display">A 4-week focus protocol</h2>
                </div>
                <ul className="space-y-3 text-body text-muted-foreground leading-relaxed list-none">
                  <li><strong className="text-foreground">Week 1 — Remove leaks.</strong> Phone in another room during your first deep block. Notifications off for everything but calls and family.</li>
                  <li><strong className="text-foreground">Week 2 — Install the block.</strong> 60 minutes, same time, one tab, one document. Miss a day, restart the streak the next day.</li>
                  <li><strong className="text-foreground">Week 3 — Add the ritual.</strong> Same start cue every day. Extend the block to 90 minutes if the 60 feels easy.</li>
                  <li><strong className="text-foreground">Week 4 — Protect recovery.</strong> Hard stop on work by 8pm three nights per week. Sleep is the multiplier under every other lever.</li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2 font-display">When to get help</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  If four weeks of honest sleep + block + phone hygiene do not move the needle, book
                  a session. Persistent focus problems commonly come from anxiety, low-grade
                  depression, thyroid or iron deficiency, or undiagnosed ADHD — all treatable, none
                  reachable through willpower alone.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coffee className="w-5 h-5 text-primary" />
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
                <h2 className="text-h2 font-display">Measure your focus baseline</h2>
                <p className="text-body text-muted-foreground max-w-xl mx-auto">
                  Take the 2-minute Mental Performance Score and see where focus sits against
                  regulation, recovery, and meaning. Free, private, no card.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button variant="primary" size="lg" asChild>
                    <Link to="/free-score" className="inline-flex items-center gap-2">
                      Get your free score <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <Link to="/mental-performance">Explore the method</Link>
                  </Button>
                </div>
              </section>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <BlogAuthor />
          </ScrollReveal>
          <ScrollReveal>
            <RelatedArticles currentSlug="how-to-improve-focus" />
          </ScrollReveal>
        </article>
      </main>
    </>
  );
}