import { Brain, Clock, Flower2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@/lib/router-compat";
import { MethodsMetricsBand } from "@/components/MethodsMetricsBand";
import { useLocale } from "@/contexts/LocaleContext";
import { translations } from "@/lib/i18n/translations";
import SEOHead from "@/components/SEOHead";

const seoByLocale = {
  en: {
    title: "Clinical Services — CBT, EMDR, Schema Therapy & More | U.Psy",
    description: "Evidence-based psychological services including CBT, EMDR, Schema Therapy, ACT & psychometric assessments (GAD-7, PHQ-9, WAIS-IV). Online & in-person across Morocco.",
  },
  fr: {
    title: "Services Cliniques — TCC, EMDR, Thérapie des Schémas | U.Psy",
    description: "Services psychologiques fondés sur les preuves : TCC, EMDR, Thérapie des Schémas, ACT et évaluations psychométriques (GAD-7, PHQ-9, WAIS-IV). En ligne et en présentiel au Maroc.",
  },
  ar: {
    title: "الخدمات السريرية — العلاج المعرفي السلوكي، EMDR | U.Psy",
    description: "خدمات نفسية مبنية على الأدلة تشمل العلاج المعرفي السلوكي، EMDR، علاج المخططات، ACT والتقييمات النفسية. عبر الإنترنت وحضورياً في المغرب.",
  },
} as const;

const Services = () => {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  
  const serviceItems = (translations[locale] as any).services?.items ?? (translations.en as any).services.items;
  const expectationsList = (translations[locale] as any).services?.expectations?.list ?? (translations.en as any).services.expectations.list;
  const seo = (seoByLocale as unknown as Record<string, { title: string; description: string }>)[locale] ?? seoByLocale.en;

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        path="/services"
        title={seo.title}
        description={seo.description}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          name: "U.Psy Clinical Services",
          url: "https://upsy.ma/services",
          areaServed: { "@type": "Country", name: "Morocco" },
          medicalSpecialty: "Psychiatric",
          availableService: (serviceItems as any[]).map((s) => ({
            "@type": "MedicalTherapy",
            name: s.title,
            description: s.description,
          })),
        }}
      />
      {/* Methods & Metrics Band */}
      <MethodsMetricsBand />

      {/* Intro Section */}
      <section className="container-custom section-spacing">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-h1 text-foreground mb-6">
            {t('services.intro.title')}
          </h1>
          <p className="text-h3 text-muted-foreground">
            {t('services.intro.subtitle')}
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {serviceItems.map((service: any, index: number) => {
            const icons = [Brain, TrendingUp, Flower2, Brain, Clock];
            const colors = ["text-accent", "text-secondary", "text-accent", "text-secondary", "text-accent"];
            const Icon = icons[index];
            return (
              <Card key={index} className="border-2 hover:border-accent transition-all duration-300 hover:shadow-elegant">
                <CardHeader>
                  <Icon className={`w-12 h-12 mb-4 ${colors[index]}`} strokeWidth={1.5} aria-hidden="true" />
                  <CardTitle className="text-h3">{service.title}</CardTitle>
                  <CardDescription className="text-body mt-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">
                    {service.price}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* What to Expect Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-h2 text-foreground mb-8 text-center">{t('services.expectations.title')}</h2>
          <div className="space-y-4">
            {expectationsList.map((item: any, index: number) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-body text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-20">
          <Button 
            size="lg" 
            onClick={() => navigate('/get-matched')}
            className="hover-glow hover:scale-105 transition-transform"
          >
            {t('services.cta')}
          </Button>
        </div>
      </section>

      {/* Transition Banner to Institutional */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-background to-secondary py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 80%, currentColor 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            color: 'var(--secondary)'
          }} />
        </div>
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-h2 text-white mb-6">
            {t('services.transition.title')}
          </h2>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/services/consulting-for-organizations')}
            className="hover:scale-105 transition-transform"
          >
            {t('services.transition.button')}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Services;