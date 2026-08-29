import { useLocale } from "@/contexts/LocaleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { Lightbulb, FlaskConical, BarChart3, Globe, ArrowRight, Microscope, Brain, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";

const researchAreas = [
  { titleKey: "Workplace Mental Health in MENA", status: "ongoing", year: "2025–2026", lead: "Dr. Karim Benali" },
  { titleKey: "Digital Therapy Efficacy Study", status: "published", year: "2024", lead: "Dr. Amina Tazi" },
  { titleKey: "Athlete Mental Resilience Framework", status: "ongoing", year: "2025", lead: "Mr. Mehdi Felji" },
  { titleKey: "Cultural Adaptation of CBT in Morocco", status: "published", year: "2024", lead: "Dr. Sarah Ahmed" },
  { titleKey: "AI-Assisted Psychological Assessment", status: "pilot", year: "2026", lead: "Research Team" },
];

const TalentInnovationHub = () => {
  const { t } = useLocale();

  const pillars = [
    { icon: FlaskConical, title: t('talentHubPage.appliedResearch'), description: t('talentHubPage.appliedResearchDesc') },
    { icon: Lightbulb, title: t('talentHubPage.innovationLab'), description: t('talentHubPage.innovationLabDesc') },
    { icon: BarChart3, title: t('talentHubPage.dataInsights'), description: t('talentHubPage.dataInsightsDesc') },
    { icon: Globe, title: t('talentHubPage.globalPartnerships'), description: t('talentHubPage.globalPartnershipsDesc') },
  ];

  const impactNumbers = [
    { value: "12", label: t('talentHubPage.researchPapers') },
    { value: "5", label: t('talentHubPage.universityPartners') },
    { value: "3", label: t('talentHubPage.countriesCovered') },
    { value: "8,000+", label: t('talentHubPage.peopleImpacted') },
  ];

  const statusLabels: Record<string, string> = {
    ongoing: t('talentHubPage.ongoing'),
    published: t('talentHubPage.published'),
    pilot: t('talentHubPage.pilot'),
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-primary/10 py-20 lg:py-28">
        <div className="container-custom text-center max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t('talentHubPage.badge')}
            </div>
            <h1 className="text-h1 text-foreground mb-6">{t('talentHubPage.title')}</h1>
            <p className="text-h3 text-muted-foreground mb-8 max-w-2xl mx-auto">{t('talentHubPage.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="default" asChild>
                <Link to="/contact">{t('talentHubPage.partnerWithUs')}</Link>
              </Button>
              <Button size="lg" variant="outline">{t('talentHubPage.viewPublications')}</Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="border-y border-border bg-card/50 py-10">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactNumbers.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="container-custom section-spacing">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-h2 text-foreground mb-4">{t('talentHubPage.fourPillars')}</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">{t('talentHubPage.fourPillarsDesc')}</p>
          </div>
        </ScrollReveal>
        <StaggerContainer staggerDelay={0.12}>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pillars.map((pillar) => (
              <StaggerItem key={pillar.title}>
                <Card className="h-full border-2 hover:border-accent/30 transition-colors">
                  <CardHeader className="flex flex-row items-start gap-4 pb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent/10 shrink-0">
                      <pillar.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div><CardTitle className="text-lg">{pillar.title}</CardTitle></div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </section>

      {/* Research Projects */}
      <section className="bg-card/50 border-y border-border py-16 lg:py-20">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-h2 text-foreground mb-4">{t('talentHubPage.researchProjects')}</h2>
              <p className="text-body text-muted-foreground">{t('talentHubPage.researchProjectsDesc')}</p>
            </div>
          </ScrollReveal>
          <div className="max-w-3xl mx-auto space-y-4">
            {researchAreas.map((project) => (
              <ScrollReveal key={project.titleKey}>
                <div className="flex items-center justify-between p-5 rounded-xl bg-background border border-border hover:border-accent/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 shrink-0">
                      <Microscope className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{project.titleKey}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{project.lead} · {project.year}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'published' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                    project.status === 'pilot' ? 'bg-accent/10 text-accent' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {statusLabels[project.status]}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Call for Collaboration */}
      <section className="container-custom section-spacing text-center">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto">
            <Brain className="w-12 h-12 text-accent mx-auto mb-6" />
            <h2 className="text-h2 text-foreground mb-4">{t('talentHubPage.collaborateWithUs')}</h2>
            <p className="text-body text-muted-foreground mb-8">{t('talentHubPage.collaborateDesc')}</p>
            <Button size="lg" variant="default" asChild>
              <Link to="/contact" className="inline-flex items-center gap-2">
                {t('talentHubPage.getInTouch')} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
};

export default TalentInnovationHub;
