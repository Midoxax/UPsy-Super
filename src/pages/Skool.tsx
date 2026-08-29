import { useLocale } from "@/contexts/LocaleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { Users, MessageCircle, BookOpen, Video, Star, ArrowRight, Globe, Award, Calendar, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import SEOHead from "@/components/SEOHead";

const Skool = () => {
  const { t } = useLocale();

  const communityFeatures = [
    { icon: MessageCircle, title: t('skoolPage.discussionForums'), description: t('skoolPage.discussionForumsDesc') },
    { icon: Video, title: t('skoolPage.liveWorkshops'), description: t('skoolPage.liveWorkshopsDesc') },
    { icon: BookOpen, title: t('skoolPage.resourceLibrary'), description: t('skoolPage.resourceLibraryDesc') },
    { icon: Users, title: t('skoolPage.peerSupport'), description: t('skoolPage.peerSupportDesc') },
  ];

  const upcomingEvents = [
    { title: "Mindfulness in Clinical Practice", date: "March 15, 2026", speaker: "Dr. Amina Tazi", type: t('skoolPage.workshop') },
    { title: "Burnout Prevention Strategies", date: "March 22, 2026", speaker: "Dr. Karim Benali", type: t('skoolPage.webinar') },
    { title: "Sport Psychology Roundtable", date: "March 29, 2026", speaker: "Mr. Mehdi Felji", type: t('skoolPage.discussion') },
  ];

  const stats = [
    { value: "2,500+", label: t('skoolPage.communityMembers') },
    { value: "150+", label: t('skoolPage.expertSessions') },
    { value: "40+", label: t('skoolPage.countriesRepresented') },
    { value: "98%", label: t('skoolPage.satisfactionRate') },
  ];

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        path="/skool"
        title="U.Psy Skool — Mental Health Learning Community"
        description="Join U.Psy Skool — workshops, forums, and live sessions for psychologists and curious learners in Morocco and beyond."
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 lg:py-28">
        <div className="container-custom text-center max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t('skoolPage.badge')}
            </div>
            <h1 className="text-h1 text-foreground mb-6">{t('skoolPage.title')}</h1>
            <p className="text-h3 text-muted-foreground mb-8 max-w-2xl mx-auto">{t('skoolPage.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="default" asChild>
                <Link to="/auth">{t('skoolPage.joinCommunity')}</Link>
              </Button>
              <Button size="lg" variant="outline">{t('skoolPage.exploreForFree')}</Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Band */}
      <section className="border-y border-border bg-card/50 py-10">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-custom section-spacing">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-h2 text-foreground mb-4">{t('skoolPage.whatYoullFind')}</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">{t('skoolPage.whatYoullFindDesc')}</p>
          </div>
        </ScrollReveal>
        <StaggerContainer staggerDelay={0.12}>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {communityFeatures.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="h-full border-2 hover:border-primary/30 transition-colors">
                  <CardHeader className="flex flex-row items-start gap-4 pb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div><CardTitle className="text-lg">{feature.title}</CardTitle></div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </section>

      {/* Upcoming Events */}
      <section className="bg-card/50 border-y border-border py-16 lg:py-20">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-h2 text-foreground mb-4">{t('skoolPage.upcomingEvents')}</h2>
              <p className="text-body text-muted-foreground">{t('skoolPage.upcomingEventsDesc')}</p>
            </div>
          </ScrollReveal>
          <StaggerContainer staggerDelay={0.1}>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {upcomingEvents.map((event) => (
                <StaggerItem key={event.title}>
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">{event.type}</div>
                      <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />{event.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="w-4 h-4" />{event.speaker}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="container-custom section-spacing text-center">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto">
            <Globe className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-h2 text-foreground mb-4">{t('skoolPage.readyToJoin')}</h2>
            <p className="text-body text-muted-foreground mb-8">{t('skoolPage.readyToJoinDesc')}</p>
            <Button size="lg" variant="default" asChild>
              <Link to="/auth" className="inline-flex items-center gap-2">
                {t('skoolPage.getStarted')} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
};

export default Skool;
