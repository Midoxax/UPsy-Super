import { Link } from "@/lib/router-compat";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Timer, Wind, Brain, Trophy, ShieldCheck, RefreshCw } from "lucide-react";

const FAQ = [
  {
    q: "How do I stop overthinking before a competition?",
    a: "Overthinking is a signal that your attention has drifted from the process to the outcome. The fix is not to think less — it is to think about the right thing. Anchor to one or two performance cues you control (breath, first movement, tempo). When the mind spirals to results, name the thought ('outcome thought'), exhale, and return to the cue. Trained daily, this cuts pre-event rumination by 40–60% within four weeks.",
  },
  {
    q: "Why do I get nervous or freeze in competition when I'm fine in training?",
    a: "Training loads your body; competition loads your identity. When self-worth is on the line, the nervous system tilts toward threat and pulls resources from fine motor control and decision-making. The solution combines physiology (slow exhale, 6-second out-breath) and cognition (values-based pre-performance script). This is trainable in 6–8 sessions.",
  },
  {
    q: "How do I build real mental toughness as an athlete?",
    a: "Mental toughness is not grit under punishment — it is the trained capacity to regulate, refocus, and re-engage under load. Four pillars: confidence built from evidence (not affirmations), concentration held on process cues, control of physiology through breath, and commitment to values that survive bad days. Toughness without recovery becomes burnout.",
  },
  {
    q: "What is the best pre-competition routine to calm nerves?",
    a: "A repeatable 10-minute sequence beats any single technique: 3 minutes of nasal breathing at 6 breaths/min, 3 minutes of movement rehearsal with eyes closed, 2 minutes of a self-selected cue word or trigger phrase, and 2 minutes of the first competitive action at low intensity. Same sequence every time — the ritual itself becomes a down-regulation signal.",
  },
  {
    q: "How do I stop replaying mistakes during a game or match?",
    a: "Elite athletes use a 'reset window' — a defined 5- to 10-second protocol between plays: physical trigger (touch wristband, adjust cap), one deep exhale, one process cue, then re-engage. The trigger interrupts rumination physically before it entrenches. Trained in 3–4 sessions, applied for a season.",
  },
  {
    q: "How do I come back mentally strong after an injury?",
    a: "Physical recovery is only half. Athletes returning from injury commonly carry re-injury fear, identity loss, and confidence gaps that show up as hesitation or over-caution. A structured 8–12 week protocol combines graded exposure to competitive cues, imagery rehearsal, self-talk restructuring, and confidence rebuilding around small measurable wins.",
  },
  {
    q: "Do I need a sport psychologist or a mental performance coach?",
    a: "A sport psychologist is a licensed clinician who can also treat anxiety, depression, eating issues, and trauma common in athlete populations. A mental performance coach trains healthy athletes to perform better — no clinical scope. If nerves are affecting daily life beyond sport, choose the psychologist. If it is purely performance, either works. U.Psy routes you to the right specialist.",
  },
  {
    q: "How long does it take to see results?",
    a: "Pre-competition nerves and overthinking respond within 3–5 sessions. Deeper shifts in confidence and identity take 8–12 weeks. A full competitive season is the standard arc for lasting change. We re-measure every 4 weeks so progress is visible, not felt.",
  },
];

export default function MentalToughnessAthletes() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const pillars = [
    { icon: Wind, title: "Nerve Regulation", desc: "Nasal breathing, exhale extension, and pre-performance rituals that shift the nervous system out of threat before you compete." },
    { icon: Brain, title: "Attention Anchors", desc: "One or two process cues you own — so the mind cannot spiral to outcome, judgement, or the scoreboard mid-play." },
    { icon: RefreshCw, title: "Reset Windows", desc: "A defined 5–10 second protocol between plays that interrupts rumination physically before it entrenches." },
    { icon: Trophy, title: "Confidence Architecture", desc: "Evidence-based self-belief built from measured wins and reviewed film — not affirmations, not vibes." },
    { icon: Timer, title: "Recovery Load", desc: "Sleep, downtime, and nervous-system recovery treated as training. The multiplier under every other skill." },
    { icon: ShieldCheck, title: "Return-from-Injury", desc: "Graded exposure, imagery rehearsal, and confidence rebuilds so hesitation and re-injury fear do not linger in the body." },
  ];

  return (
    <>
      <SEOHead
        path="/mental-toughness-athletes"
        title="Mental Toughness for Athletes — Beat Competition Nerves & Overthinking | U.Psy"
        description="Stop overthinking before competition. Train mental toughness, nerve regulation, and focus with sport psychologists. Assessments, protocols, 1:1 coaching."
        jsonLd={faqJsonLd}
      />

      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 py-24 md:py-32 max-w-5xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
              Sport Psychology · Performance System
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
              You train the body every day.{" "}
              <em className="italic font-normal text-primary">Train the mind that runs it.</em>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              Competition nerves, overthinking, freezing when it matters — these are not personality
              flaws. They are trainable patterns. U.Psy pairs athletes with sport psychologists and
              measured protocols that hold up on match day.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/free-score">Get your free Mental Performance Score</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/psychologists?specialty=sport">Book a sport psychologist</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground font-mono tabular-nums">
              12 questions · 2 minutes · free rebook if not the right fit
            </p>
          </div>
        </section>

        {/* Signals */}
        <section className="container mx-auto px-4 py-20 max-w-5xl">
          <div className="max-w-2xl mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">Signals we hear</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-4">
              Any of this sound familiar?
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            {[
              "I'm fine in training — I fall apart in competition.",
              "The night before a match I can't stop replaying what could go wrong.",
              "One mistake and my head is gone for the rest of the game.",
              "I overthink every movement and lose the instinct I have in practice.",
              "Since the injury, my body hesitates even though I'm cleared to play.",
              "I've plateaued. Technically I'm ready, mentally something is capping me.",
            ].map((line) => (
              <div key={line} className="flex gap-3 p-4 rounded-xl border border-border/50">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p className="text-muted-foreground italic">"{line}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pillars */}
        <section className="border-y border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 py-20 max-w-6xl">
            <div className="max-w-2xl mb-14">
              <h2 className="font-display text-3xl md:text-5xl leading-tight mb-4">
                Six systems we train
              </h2>
              <p className="text-muted-foreground text-lg">
                Assessment shows which two or three matter for you right now. No generic mindset
                talks — every protocol is measured, sport-specific, and reviewed every four weeks.
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
          </div>
        </section>

        {/* Method */}
        <section className="container mx-auto px-4 py-20 max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">The method</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-12">
            Measure. Regulate. Refocus. Repeat.
          </h2>
          <div className="grid gap-10 md:grid-cols-4">
            {[
              { n: "01", t: "Measure", d: "Baseline nerves, focus, confidence, and recovery in under 15 minutes." },
              { n: "02", t: "Regulate", d: "Breath and physiology protocols that shift the nervous system on demand." },
              { n: "03", t: "Refocus", d: "Attention anchors, reset windows, and sport-specific cue words trained daily." },
              { n: "04", t: "Repeat", d: "8–12 week arcs with weekly 1:1 sessions and monthly re-measurement." },
            ].map((s) => (
              <div key={s.n}>
                <div className="font-mono tabular-nums text-sm text-primary mb-3">{s.n}</div>
                <h3 className="font-display text-2xl mb-2">{s.t}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 py-20 max-w-3xl">
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-10">
              What athletes ask before starting
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
            See your baseline in <em className="italic font-normal text-primary">2 minutes.</em>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Free, private, no card. Get a Mental Performance Score and a next-step protocol built
            for your sport.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/free-score">Start free assessment</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/psychologists?specialty=sport">Meet the sport psychologists</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}