import { useState } from "react";
import { Building2, TrendingUp, Users, Heart, Trophy, Target, FileText, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MethodsMetricsBand } from "@/components/MethodsMetricsBand";
import { ProposalRequestModal } from "@/components/services/ProposalRequestModal";

const ConsultingForOrganizations = () => {
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const valueProps = [
    {
      icon: Heart,
      title: "Reduce Burnout",
      description: "Evidence-based interventions to restore energy and resilience",
      stat: "42% reduction in emotional exhaustion scores"
    },
    {
      icon: Users,
      title: "Improve Retention",
      description: "Keep your top talent engaged and committed long-term",
      stat: "28% decrease in voluntary turnover"
    },
    {
      icon: Trophy,
      title: "Perform Under Pressure",
      description: "Build psychological skills for high-stakes moments",
      stat: "34% improvement in clutch performance"
    },
    {
      icon: TrendingUp,
      title: "Healthy Culture",
      description: "Foster psychological safety and collective well-being",
      stat: "56% increase in team psychological safety"
    }
  ];

  const programs = [
    {
      title: "Sport-Elite",
      description: "Peak performance psychology for athletes and high-stakes teams",
      inputs: ["Performance assessments", "Mental skills training", "Pressure simulations"],
      deliverables: ["Personalized mental training plans", "Pre-competition protocols", "Quarterly performance reviews"],
      kpis: ["Competition readiness scores", "Mental toughness index", "Recovery quality metrics"]
    },
    {
      title: "Well-Being 360",
      description: "Holistic mental health programs for workforce wellness",
      inputs: ["Organizational health audit", "Stress & burnout screening", "Leadership interviews"],
      deliverables: ["Wellness curriculum (8-12 weeks)", "Manager mental health toolkit", "Crisis response protocols"],
      kpis: ["GAD-7 & PHQ-9 scores", "Absenteeism rates", "Employee engagement index"]
    },
    {
      title: "Campus Mental Health Lab",
      description: "Student psychological services and prevention infrastructure",
      inputs: ["Campus climate survey", "Student focus groups", "Counseling demand analysis"],
      deliverables: ["Peer support training", "24/7 crisis hotline setup", "Faculty mental health literacy workshops"],
      kpis: ["Service utilization rates", "Wait time reduction", "Student retention metrics"]
    },
    {
      title: "Leadership & Purpose",
      description: "Executive coaching and values-driven organizational transformation",
      inputs: ["360° leadership assessments", "Core values workshops", "Strategic alignment sessions"],
      deliverables: ["Executive coaching (6-12 months)", "Purpose-driven strategy roadmap", "Cultural transformation playbook"],
      kpis: ["Leadership effectiveness scores", "Values alignment index", "Strategic clarity metrics"]
    }
  ];

  const faqs = [
    {
      question: "What are typical project timelines?",
      answer: "Pilot programs run 8-12 weeks. Full implementations range from 6-18 months depending on scope, organizational size, and customization needs. We provide phased rollout options with clear milestones."
    },
    {
      question: "Do you offer services in multiple languages?",
      answer: "Yes. Our network includes psychologists fluent in English, Spanish, Portuguese, French, and German. We can arrange interpretation services for additional languages as needed."
    },
    {
      question: "Can programs be delivered remotely or do they require onsite presence?",
      answer: "We offer fully remote, hybrid, and onsite delivery models. Most programs work effectively in all formats, though elite sport and immersive leadership intensives benefit from some in-person components."
    },
    {
      question: "How do you handle data governance and confidentiality?",
      answer: "All individual-level data is encrypted, GDPR/HIPAA-compliant, and never shared with employers. Organizations receive only aggregated, anonymized insights. We sign NDAs and can accommodate custom data residency requirements."
    },
    {
      question: "What is your pricing model?",
      answer: "We use transparent value-based pricing: pilot programs start at €15K, workforce programs scale per-employee (€40-120/employee/year), and elite sport/executive coaching is quoted based on scope. All proposals include clear deliverables and ROI projections."
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-neural-bg py-24 md:py-32">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 text-lg px-6 py-2">
              Institutional Solutions
            </Badge>
            <h1 className="text-display mb-6">
              Sport, Work, Campus
            </h1>
            <p className="text-h3 text-muted-foreground mb-8">
              Outcomes-driven, evidence-based psychological interventions for organizations that demand excellence
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={() => setIsProposalModalOpen(true)}>
                <FileText className="w-5 h-5" />
                Request a Proposal
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Download className="w-5 h-5" />
                Download Program PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Grid */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((prop, index) => (
              <Card key={index} className="card-float border-accent/10">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 theme-halo">
                    <prop.icon className="w-6 h-6 theme-accent" strokeWidth={2} />
                  </div>
                  <CardTitle className="text-h3">{prop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body text-muted-foreground mb-4">{prop.description}</p>
                  <div className="text-small font-semibold theme-accent">{prop.stat}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Program Modules */}
      <section className="section-spacing bg-surface/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-h2 mb-4">Program Modules</h2>
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              Modular, scalable interventions designed for measurable impact across sport, corporate, and academic environments
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-h3 mb-2">{program.title}</CardTitle>
                  <CardDescription className="text-body">{program.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 theme-accent" />
                      Inputs
                    </h4>
                    <ul className="space-y-2">
                      {program.inputs.map((input, i) => (
                        <li key={i} className="text-small text-muted-foreground flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          {input}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 theme-accent" />
                      Deliverables
                    </h4>
                    <ul className="space-y-2">
                      {program.deliverables.map((deliverable, i) => (
                        <li key={i} className="text-small text-muted-foreground flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 theme-accent" />
                      KPIs
                    </h4>
                    <ul className="space-y-2">
                      {program.kpis.map((kpi, i) => (
                        <li key={i} className="text-small text-muted-foreground flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          {kpi}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Block */}
      <section className="section-spacing">
        <div className="container-custom">
          <Card className="glass-effect max-w-5xl mx-auto overflow-hidden">
            <CardHeader className="bg-accent/5 border-b border-accent/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 theme-accent" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Case Study</Badge>
                  <CardTitle className="text-h3">European Professional Football Club</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-lg">Problem</h4>
                  <p className="text-body text-muted-foreground">
                    High-pressure environment leading to performance anxiety, squad fragmentation, and inconsistent results in critical matches.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-lg">Intervention</h4>
                  <p className="text-body text-muted-foreground">
                    12-week Sport-Elite program: mental skills workshops, pre-match routines, psychological safety protocols, 1:1 sessions with key players.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-lg">KPI Lift</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-small text-muted-foreground mb-1">Win rate in decisive matches</div>
                      <div className="flex items-center gap-3">
                        <span className="text-body line-through opacity-50">38%</span>
                        <span className="text-h3 theme-accent">→ 64%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-small text-muted-foreground mb-1">Team cohesion index</div>
                      <div className="flex items-center gap-3">
                        <span className="text-body line-through opacity-50">6.2/10</span>
                        <span className="text-h3 theme-accent">→ 8.7/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Proof Band */}
      <section className="py-16 bg-accent/5 border-y border-accent/10">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-h3 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full theme-accent theme-halo" />
                Methods We Use
              </h3>
              <div className="flex flex-wrap gap-3">
                {["CBT", "Schema Therapy", "Performance Psychology", "ACT", "Motivational Interviewing", "Systems Consultation"].map((method) => (
                  <Badge key={method} variant="outline" className="bg-background/50 border-accent/20">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-h3 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full theme-accent theme-halo" />
                How We Measure
              </h3>
              <div className="flex flex-wrap gap-3">
                {["GAD-7", "PHQ-9", "Routine Adherence", "Absenteeism", "Performance Readiness", "Team Cohesion Index"].map((metric) => (
                  <Badge key={metric} variant="outline" className="bg-background/50 border-accent/20">
                    {metric}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methods & Metrics Band */}
      <MethodsMetricsBand />

      {/* CTA Row */}
      <section className="section-spacing">
        <div className="container-custom">
          <Card className="glass-effect border-accent/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-h2 mb-4">Ready to Transform Your Organization?</h2>
              <p className="text-body text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get a customized proposal with clear deliverables, timelines, and ROI projections tailored to your institutional needs.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="gap-2" onClick={() => setIsProposalModalOpen(true)}>
                  <FileText className="w-5 h-5" />
                  Request a Proposal
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Download className="w-5 h-5" />
                  Download Program PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing bg-surface/30">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-h2 mb-4">Frequently Asked Questions</h2>
            <p className="text-body text-muted-foreground">
              Everything you need to know about partnering with U.Psy for institutional solutions
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="glass-effect border-accent/10 rounded-2xl px-6">
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-body font-semibold text-foreground pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-body text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <ProposalRequestModal 
        open={isProposalModalOpen}
        onOpenChange={setIsProposalModalOpen}
      />
    </main>
  );
};

export default ConsultingForOrganizations;
