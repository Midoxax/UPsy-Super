import { Download, Mail, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import { toast } from "sonner";

const boilerplateEN = `U.Psy is a performance psychology platform connecting individuals, athletes, and organizations with accredited psychologists across Morocco and worldwide. Built around a proprietary six-pillar Mental Performance System, U.Psy blends clinical rigor with operational tools — assessments, coaching, and B2B workplace programs — to make measurable mental performance accessible in EN / FR / AR.`;

const boilerplateFR = `U.Psy est une plateforme de psychologie de la performance qui met en relation particuliers, sportifs et organisations avec des psychologues accrédités au Maroc et à l'international. Structurée autour d'un système propriétaire à six piliers, U.Psy combine rigueur clinique et outils opérationnels — évaluations, coaching, programmes B2B en entreprise — pour rendre la performance mentale mesurable et accessible en EN / FR / AR.`;

const facts = [
  { label: "Founded", value: "2024" },
  { label: "Founder", value: "Mehdi Felji" },
  { label: "HQ", value: "Casablanca, Morocco" },
  { label: "Languages", value: "EN · FR · AR" },
  { label: "Category", value: "Performance Psychology SaaS" },
  { label: "Domain", value: "upsy.ma" },
];

function CopyBlock({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs inline-flex items-center gap-1 text-primary hover:opacity-80"
        >
          <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-sm leading-relaxed p-4 rounded-lg bg-muted/50 border border-border">{text}</p>
    </div>
  );
}

const Press = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        path="/press"
        title="Press & Media Kit — U.Psy"
        description="Media kit, founder bio, boilerplate, and press contact for U.Psy, the performance psychology platform."
      />

      <section className="py-20 border-b border-border">
        <div className="container-custom max-w-4xl">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4">Press · Media Kit</p>
          <h1 className="font-display text-5xl md:text-6xl mb-6">
            Reporting on the future of <em className="italic">mental performance</em>?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Everything you need to cover U.Psy — founder bio, boilerplate, brand assets, and a direct line to our press desk.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="mailto:press@upsy.ma?subject=Press%20inquiry%20%E2%80%94%20U.Psy">
                <Mail className="mr-2 h-4 w-4" /> press@upsy.ma
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/upsy-logo-oauth.png" download>
                <Download className="mr-2 h-4 w-4" /> Download logo
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-border">
        <div className="container-custom max-w-4xl grid md:grid-cols-2 gap-3">
          {facts.map((f) => (
            <div key={f.label} className="flex items-baseline justify-between gap-4 p-4 rounded-lg border border-border bg-card">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{f.label}</span>
              <span className="font-display text-lg">{f.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 border-b border-border">
        <div className="container-custom max-w-4xl space-y-6">
          <h2 className="font-display text-3xl mb-2">Boilerplate</h2>
          <CopyBlock label="English (≈75 words)" text={boilerplateEN} />
          <CopyBlock label="Français (≈75 mots)" text={boilerplateFR} />
        </div>
      </section>

      <section className="py-16 border-b border-border">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl mb-6">Founder</h2>
          <Card className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                  <span className="font-display text-6xl">MF</span>
                </div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-3 text-center">
                  Mehdi Felji · Founder
                </p>
              </div>
              <div className="md:w-2/3 space-y-4">
                <CopyBlock
                  label="Short bio"
                  text="Mehdi Felji is the founder of U.Psy, a performance psychology platform building the operational infrastructure for measurable mental performance in Morocco and beyond."
                />
                <CopyBlock
                  label="Long bio"
                  text="Mehdi Felji is the founder of U.Psy. He built the platform to close the gap between clinical psychology and everyday performance — bringing assessments, coaching, and organizational programs into a single system designed for individuals, athletes, and companies operating across Morocco, Europe, and the Middle East."
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-16 border-b border-border">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl mb-6">Story angles we can speak to</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Why mental performance is becoming an economic issue in Morocco",
              "Six pillars of a modern mental performance system",
              "Athletes, executives, and the hidden cost of unmeasured stress",
              "Building bilingual (EN/FR/AR) clinical infrastructure in emerging markets",
              "How SaaS is quietly reshaping the psychology profession",
              "Corporate wellbeing beyond meditation apps — a performance framework",
            ].map((s) => (
              <div key={s} className="p-4 rounded-lg border border-border bg-card">
                <p className="font-display text-lg leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl mb-6">Press contact</h2>
          <Card className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Email</p>
                <a href="mailto:press@upsy.ma" className="font-display text-xl text-primary inline-flex items-center gap-2">
                  press@upsy.ma <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Response time</p>
                <p className="font-display text-xl">Within 24h · Mon–Fri</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Press;