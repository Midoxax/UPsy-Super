import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import {
  Brain, Trophy, ClipboardList, HeartHandshake, Landmark, Globe2,
  Presentation, Building2, FlaskConical, Sparkles, Briefcase, ArrowRight,
  ShieldCheck, Scale,
} from "lucide-react";

const schools = [
  {
    icon: Brain,
    name: "Clinical Psychology & Mental Health",
    domains: "Clinical practice, psychopathology, assessment, CBT, ACT, Schema, psychodynamic, trauma, EMDR foundations",
    audience: "Psychology & mental-health learners",
  },
  {
    icon: Trophy,
    name: "Sport, Performance & Expertise",
    domains: "Sport psychology, mental skills, mental strength, expertise, combat sports",
    audience: "Athletes, coaches, performance professionals",
  },
  {
    icon: ClipboardList,
    name: "Psychometrics & Assessment",
    domains: "Measurement, validity, reliability, screening, personality, wellbeing, organizational assessment",
    audience: "Psychologists, researchers, HR",
  },
  {
    icon: HeartHandshake,
    name: "Social Work & Community Development",
    domains: "Social diagnosis, case management, safeguarding, youth, community development",
    audience: "Social workers, NGOs, community practitioners",
  },
  {
    icon: Landmark,
    name: "Political Psychology & Civic Leadership",
    domains: "Political psychology, leadership, civic engagement, public communication, negotiation",
    audience: "Civic leaders, youth, NGOs",
  },
  {
    icon: Globe2,
    name: "MHPSS, Humanitarian & NGO Practice",
    domains: "PFA, MHPSS, trauma, migration, humanitarian practice, MEAL",
    audience: "NGO / humanitarian workers",
  },
  {
    icon: Presentation,
    name: "Education, Training & TOT",
    domains: "Adult learning, training engineering, facilitation, evaluation",
    audience: "Trainers, educators, school leaders",
  },
  {
    icon: Building2,
    name: "Organizational Psychology & Leadership",
    domains: "Workplace wellbeing, burnout, leadership, teams, HR",
    audience: "HR, managers, consultants",
  },
  {
    icon: FlaskConical,
    name: "Research & Applied Science",
    domains: "Research methods, statistics, neuroscience, computational approaches",
    audience: "Researchers, students, PhD candidates",
  },
  {
    icon: Sparkles,
    name: "AI, Digital Psychology & Innovation",
    domains: "AI literacy, digital mental health, ethics, automation, product design",
    audience: "Professionals, founders, researchers",
  },
  {
    icon: Briefcase,
    name: "Psychology & Social Entrepreneurship",
    domains: "Practice management, business models, branding, partnerships",
    audience: "Psychologists, trainers, founders",
  },
];

const civicPathways = [
  { name: "Political Psychology", detail: "Political attitudes, group identity, polarization, collective behavior, social influence" },
  { name: "Civic Leadership", detail: "Ethical leadership, public speaking, negotiation, mediation, coalition building" },
  { name: "Public Affairs", detail: "Governance, public policy, policy analysis, public consultation, institutions" },
  { name: "Civic Engagement", detail: "Civic education, advocacy, youth engagement, community organizing" },
  { name: "Political Communication", detail: "Strategic communication, media literacy, debate, crisis communication" },
  { name: "Social Work Foundations", detail: "Social diagnosis, vulnerability, inclusion, social determinants" },
  { name: "Case Management", detail: "Intake, assessment, case plan, referral, follow-up, documentation" },
  { name: "Youth & Child Protection", detail: "Safeguarding, child protection, adolescent development, school intervention" },
  { name: "Community Development", detail: "Participatory diagnosis, mobilization, social cohesion, peer programs" },
  { name: "Humanitarian Social Work", detail: "Migration, refugees, displacement, protection, psychosocial support" },
  { name: "MHPSS & NGO Practice", detail: "PFA, MHPSS, trauma-informed practice, crisis response, NGO delivery" },
  { name: "MEAL & Social Impact", detail: "Monitoring, evaluation, accountability, learning, indicators" },
];

const flagshipPathways = [
  { name: "Sport & Performance Psychology Certificate", why: "Strong differentiation and existing expertise" },
  { name: "Psychometrics & Psychological Assessment", why: "Connects the assessment lab to structured learning" },
  { name: "Training of Trainers", why: "Existing content base and institutional demand" },
  { name: "Social Work & Case Management", why: "Opens applied training for social workers" },
  { name: "MHPSS & NGO Practice", why: "Connects U.Psy to humanitarian and NGO work" },
  { name: "Political Psychology & Civic Leadership", why: "Distinctive civic and social-impact positioning" },
  { name: "Clinical Psychology Foundations", why: "Core psychology pathway" },
  { name: "AI for Psychology & Social Impact", why: "Future-facing differentiator" },
];

export default function Schools() {
  return (
    <>
      <SEOHead
        path="/center/schools"
        title="Schools & Academies — U.Psy Training Center"
        description="Eleven schools spanning clinical psychology, sport performance, psychometrics, social work, civic leadership, humanitarian practice, research and AI — one integrated academy."
      />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Training Center
          </Badge>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            One academy. Eleven schools.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Clinical care, sport performance, psychometrics, social work, civic leadership,
            humanitarian practice, research and AI — connected under a single progression:
            Foundation → Practitioner → Specialist → Advanced → Expert/CPD.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link to="/learn">Browse courses</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/membership">See membership tiers <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        {/* Schools grid */}
        <section className="container mx-auto px-4 pb-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">
            Master School Architecture
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((s) => (
              <Card key={s.name} className="glass-card h-full">
                <CardContent className="p-6 space-y-3">
                  <s.icon className="h-8 w-8 text-primary" />
                  <h3 className="font-display text-lg font-semibold leading-snug">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.domains}</p>
                  <p className="text-xs text-muted-foreground/80 uppercase tracking-wide">{s.audience}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Civic & Social Impact Academy */}
        <section className="border-y border-border bg-card/40 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <Badge variant="secondary" className="mb-4">
                <Landmark className="h-3 w-3 mr-1.5" />
                Civic & Social Impact Academy
              </Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Political, social-worker, community and humanitarian training
              </h2>
              <p className="text-muted-foreground">
                A dedicated home for political and social-work training — non-partisan,
                psychologically informed, socially responsible and evidence-based. Educational
                certificates here are clearly distinguished from regulated professional licensure.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {civicPathways.map((p) => (
                <Card key={p.name} className="h-full bg-background/60">
                  <CardContent className="p-5 space-y-1.5">
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="max-w-3xl mx-auto mt-8 flex items-start gap-3 rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p>
                Political education stays non-partisan and evidence-based. Social-work certificates
                document educational achievement — not a substitute for regulated professional licensure.
              </p>
            </div>
          </div>
        </section>

        {/* Flagship launch portfolio */}
        <section className="container mx-auto px-4 py-16 lg:py-20">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Flagship pathways
            </h2>
            <p className="text-muted-foreground">
              The first certificates and certifications launching across the Training Center.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {flagshipPathways.map((f, i) => (
              <div
                key={f.name}
                className="flex items-start gap-4 rounded-lg border border-border/60 bg-card/40 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-sm font-semibold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-sm">{f.name}</h3>
                  <p className="text-xs text-muted-foreground">{f.why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card/40 py-16 text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <Scale className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Certificates, not shortcuts
            </h2>
            <p className="text-muted-foreground mb-8">
              Every pathway is competency-based, with practical evidence required for advanced
              credentials. Explore courses, certifications, and membership to find your path.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link to="/learn?tab=certifications">Explore certifications</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/center">Back to Training Center</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
