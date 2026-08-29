import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Brain, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";

export default function ForAthletes() {
  return (
    <>
      <SEOHead
        path="/for-athletes"
        title="Performance Psychology for Athletes — U.Psy"
        description="Mental performance coaching for elite athletes in Morocco. Focus, resilience, recovery — backed by sport psychologists."
      />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">Train your mind. Win the moment.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Performance psychology for athletes — focus protocols, resilience training, and recovery science.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild size="lg"><Link to="/free-score">Free Performance Score</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/get-matched">Match with a sport psychologist <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </section>
        <section className="container mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "Focus protocols", desc: "Pre-competition routines that lock you in." },
            { icon: Brain, title: "Resilience training", desc: "Tools to rebound from setbacks." },
            { icon: Trophy, title: "Peak performance", desc: "Visualization and arousal regulation." },
          ].map((f, i) => (
            <Card key={i} className="glass-card"><CardContent className="p-6 space-y-2">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </CardContent></Card>
          ))}
        </section>
      </main>
    </>
  );
}
