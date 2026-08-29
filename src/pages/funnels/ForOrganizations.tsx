import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";

export default function ForOrganizations() {
  return (
    <>
      <SEOHead
        path="/for-organizations"
        title="Workplace Mental Health — U.Psy for Organizations"
        description="Anonymized wellbeing analytics, EAP-grade clinical care, and Morocco-compliant invoicing for forward-thinking employers."
      />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">A healthier team is a higher-performing team.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Anonymized wellbeing analytics, certified clinical care, and CNDP-compliant reporting.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild size="lg"><Link to="/apply/organization">Apply as organization</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/services/consulting-for-organizations">Request a proposal <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </section>
        <section className="container mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: BarChart3, title: "Anonymized pulse", desc: "K-anonymity ≥5 — never expose individuals." },
            { icon: ShieldCheck, title: "Law 09-08 compliant", desc: "ICE, IF, RC fields and Moroccan TVA on every invoice." },
            { icon: Building2, title: "Scalable seats", desc: "Add or remove employee licenses anytime." },
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
