import ScrollReveal from "@/components/ScrollReveal";
import { useLocale } from "@/contexts/LocaleContext";
import umbrellaLogo from "@/assets/umbrella-logo.png";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { ArrowRight, Users, Award, Heart, Globe } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const MoroccanUmbrella = () => {
  const { t } = useLocale();

  const pillars = [
    { icon: Users, title: t('moroccanUmbrellaPage.professionalUnity'), description: t('moroccanUmbrellaPage.professionalUnityDesc') },
    { icon: Award, title: t('moroccanUmbrellaPage.excellenceStandards'), description: t('moroccanUmbrellaPage.excellenceStandardsDesc') },
    { icon: Heart, title: t('moroccanUmbrellaPage.communityImpact'), description: t('moroccanUmbrellaPage.communityImpactDesc') },
    { icon: Globe, title: t('moroccanUmbrellaPage.culturalIntegration'), description: t('moroccanUmbrellaPage.culturalIntegrationDesc') },
  ];

  const stats = [
    { value: "300+", label: t('moroccanUmbrellaPage.registeredPsychologists') },
    { value: "12", label: t('moroccanUmbrellaPage.regionsCovered') },
    { value: "50+", label: t('moroccanUmbrellaPage.partnerInstitutions') },
    { value: "25", label: t('moroccanUmbrellaPage.trainingPrograms') },
  ];

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        path="/moroccan-umbrella"
        title="Moroccan Umbrella — U.Psy Psychologist Network"
        description="A national umbrella uniting accredited Moroccan psychologists under shared standards of excellence, ethics, and community impact."
      />
      {/* Hero Section */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <img src={umbrellaLogo} alt={t('moroccanUmbrellaPage.title')} className="h-32 w-auto object-contain" />
              </div>
              <h1 className="text-h1 mb-6 text-foreground">{t('moroccanUmbrellaPage.title')}</h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">{t('moroccanUmbrellaPage.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="primary" asChild>
                  <Link to="/apply" className="inline-flex items-center gap-2">
                    {t('moroccanUmbrellaPage.joinNetwork')} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/contact">{t('moroccanUmbrellaPage.learnMore')}</Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-spacing">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-h2 mb-6">{t('moroccanUmbrellaPage.ourMission')}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t('moroccanUmbrellaPage.missionDesc')}</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="glass-card p-6 text-center h-full">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <pillar.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-h3 mb-3">{pillar.title}</h3>
                  <p className="text-body text-muted-foreground">{pillar.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <ScrollReveal>
            <div className="glass-card p-10 md:p-14">
              <div className="text-center mb-12">
                <h2 className="text-h2 mb-4">{t('moroccanUmbrellaPage.growingNetwork')}</h2>
                <p className="text-body text-muted-foreground">{t('moroccanUmbrellaPage.growingNetworkDesc')}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-spacing">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-h2 mb-6">{t('moroccanUmbrellaPage.joinMovement')}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t('moroccanUmbrellaPage.joinMovementDesc')}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="primary" asChild>
                  <Link to="/apply" className="inline-flex items-center gap-2">
                    {t('moroccanUmbrellaPage.becomeMember')} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">{t('moroccanUmbrellaPage.contactUs')}</Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
};

export default MoroccanUmbrella;
