import { lazy, Suspense } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import {
  ArrowRight,
  Globe,
  Heart,
  Users,
  Shield,
  BookOpen,
  HandHeart,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import MaroonDivider from "@/components/ui/maroon-divider";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";

const PSF_PILLARS = [
  {
    icon: HandHeart,
    titleKey: "psf.pillarAccess",
    descKey: "psf.pillarAccessDesc",
    fallbackTitle: "Access to Care",
    fallbackDesc:
      "Free and subsidized sessions for individuals in underserved communities who cannot afford traditional therapy.",
  },
  {
    icon: Globe,
    titleKey: "psf.pillarOutreach",
    descKey: "psf.pillarOutreachDesc",
    fallbackTitle: "Community Outreach",
    fallbackDesc:
      "Workshops, awareness campaigns, and crisis response in rural and peri-urban areas across Morocco.",
  },
  {
    icon: BookOpen,
    titleKey: "psf.pillarTraining",
    descKey: "psf.pillarTrainingDesc",
    fallbackTitle: "Capacity Building",
    fallbackDesc:
      "Training local volunteers, teachers, and community workers in psychological first aid and mental health literacy.",
  },
  {
    icon: Shield,
    titleKey: "psf.pillarEthics",
    descKey: "psf.pillarEthicsDesc",
    fallbackTitle: "Ethical Standards",
    fallbackDesc:
      "All volunteers adhere to U.Psy's professional code of conduct and are supervised by accredited practitioners.",
  },
];

const PSF_STATS = [
  { value: "500+", labelKey: "psf.statSessions", fallback: "Free Sessions Delivered" },
  { value: "12", labelKey: "psf.statRegions", fallback: "Regions Covered" },
  { value: "50+", labelKey: "psf.statVolunteers", fallback: "Volunteer Psychologists" },
  { value: "3,000+", labelKey: "psf.statBeneficiaries", fallback: "Beneficiaries Reached" },
];

const PSF_PROGRAMS = [
  {
    title: "Crisis Response",
    description:
      "Rapid deployment of psychologists after natural disasters, collective trauma events, and community emergencies.",
    icon: Phone,
  },
  {
    title: "School Mental Health",
    description:
      "Partnerships with public schools to deliver age-appropriate mental health education and early screening.",
    icon: BookOpen,
  },
  {
    title: "Rural Clinics",
    description:
      "Pop-up psychology clinics in rural communes, offering free individual and group sessions.",
    icon: MapPin,
  },
  {
    title: "Refugee & Migrant Support",
    description:
      "Culturally sensitive psychological support for displaced populations and migrants in transit.",
    icon: Heart,
  },
];

const PsychologuesSansFrontieres = () => {
  const { t } = useLocale();

  const safeT = (key: string, fallback: string) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  return (
    <main className="flex-1 bg-background">
      {/* Hero */}
      <section className="section-spacing liquid-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 30% 50%, hsl(var(--secondary)), transparent 60%)" }} />
        <div className="container-custom relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 bg-secondary/10 border-2 border-secondary/30">
                <div className="relative">
                  <Globe className="w-12 h-12 text-secondary" />
                  <Heart className="w-6 h-6 text-primary absolute -bottom-1 -right-1 fill-primary" />
                </div>
              </div>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-secondary/10 text-secondary border border-secondary/20 mb-6">
                {safeT("psf.badge", "A U.Psy Social Impact Initiative")}
              </span>
              <h1 className="text-h1 mb-6 text-foreground">
                {safeT("psf.heroTitle", "Psychologues Sans Frontières")}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                {safeT(
                  "psf.heroSubtitle",
                  "Bringing free, ethical mental health support to underserved communities across Morocco and beyond. Because mental health is a right, not a privilege."
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="hero" asChild>
                  <Link to="/apply" className="inline-flex items-center gap-2">
                    {safeT("psf.volunteerCta", "Volunteer as Psychologist")} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">
                    {safeT("psf.partnerCta", "Partner With Us")}
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MaroonDivider />

      {/* Mission & Pillars */}
      <section className="section-spacing">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-h2 mb-4">
                {safeT("psf.missionTitle", "Our Mission")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {safeT(
                  "psf.missionDesc",
                  "Psychologues Sans Frontières operates under the U.Psy umbrella to bridge the gap between mental health need and access. We deploy volunteer psychologists to communities where professional support is scarce or nonexistent."
                )}
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.1}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PSF_PILLARS.map((pillar, i) => (
                <StaggerItem key={i}>
                  <div className="glass-card p-6 text-center h-full">
                    <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 border border-secondary/20">
                      <pillar.icon className="w-7 h-7 text-secondary" />
                    </div>
                    <h3 className="text-h3 mb-3">
                      {safeT(pillar.titleKey, pillar.fallbackTitle)}
                    </h3>
                    <p className="text-body text-muted-foreground">
                      {safeT(pillar.descKey, pillar.fallbackDesc)}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </section>

      <MaroonDivider />

      {/* Impact Stats */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <ScrollReveal>
            <div className="glass-card p-10 md:p-14">
              <div className="text-center mb-12">
                <h2 className="text-h2 mb-4">
                  {safeT("psf.impactTitle", "Our Impact So Far")}
                </h2>
                <p className="text-body text-muted-foreground">
                  {safeT("psf.impactDesc", "Every number represents a life touched, a community strengthened.")}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {PSF_STATS.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{safeT(stat.labelKey, stat.fallback)}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MaroonDivider />

      {/* Programs */}
      <section className="section-spacing">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-h2 mb-4">
                {safeT("psf.programsTitle", "Our Programs")}
              </h2>
              <p className="text-body text-muted-foreground max-w-2xl mx-auto">
                {safeT("psf.programsDesc", "Targeted interventions designed for maximum community impact.")}
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.1}>
            <div className="grid md:grid-cols-2 gap-6">
              {PSF_PROGRAMS.map((program, i) => (
                <StaggerItem key={i}>
                  <div className="glass-card p-8 flex gap-5 items-start h-full">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                      <program.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{program.title}</h3>
                      <p className="text-body text-muted-foreground">{program.description}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </section>

      <MaroonDivider />

      {/* How to Get Involved */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-h2 mb-4">
                {safeT("psf.involvedTitle", "How to Get Involved")}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: Users,
                title: "Volunteer",
                desc: "Licensed psychologists can join our volunteer network and be deployed to communities in need.",
                cta: "Apply Now",
                link: "/apply",
              },
              {
                step: "02",
                icon: HandHeart,
                title: "Donate",
                desc: "Fund free therapy sessions, training workshops, and community outreach programs.",
                cta: "Contact Us",
                link: "/contact",
              },
              {
                step: "03",
                icon: Globe,
                title: "Partner",
                desc: "NGOs, schools, and institutions can partner with PSF to bring mental health services to their communities.",
                cta: "Learn More",
                link: "/contact",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="glass-card p-8 text-center h-full flex flex-col">
                  <div className="text-xs font-mono text-secondary/60 mb-3">{item.step}</div>
                  <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 border border-secondary/20">
                    <item.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 flex-1">{item.desc}</p>
                  <Button variant="secondary" size="sm" asChild className="w-full">
                    <Link to={item.link}>{item.cta}</Link>
                  </Button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <MaroonDivider />

      {/* Final CTA */}
      <section className="section-spacing relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, hsl(var(--secondary) / 0.15), transparent 70%)" }} />
        <div className="container-custom relative z-10">
          <ScrollReveal>
            <div className="glass-card p-10 md:p-16 max-w-3xl mx-auto text-center">
              <h2 className="text-h2 mb-4">
                {safeT("psf.ctaTitle", "Mental Health Is a Right, Not a Privilege")}
              </h2>
              <p className="text-body text-muted-foreground mb-8">
                {safeT(
                  "psf.ctaDesc",
                  "Join Psychologues Sans Frontières and help us reach every community in Morocco that needs mental health support."
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="hero" asChild>
                  <Link to="/apply" className="inline-flex items-center gap-2">
                    {safeT("psf.ctaVolunteer", "Become a Volunteer")} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact" className="inline-flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {safeT("psf.ctaContact", "Get in Touch")}
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
};

export default PsychologuesSansFrontieres;
