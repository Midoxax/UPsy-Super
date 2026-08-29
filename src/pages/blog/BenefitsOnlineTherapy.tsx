import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import BlogAuthor from "@/components/blog/BlogAuthor";
import RelatedArticles from "@/components/blog/RelatedArticles";
import heroImg from "@/assets/blog/online-therapy.jpg";
import { ArrowRight, Globe, Clock, Shield, Laptop, Heart } from "lucide-react";

const BenefitsOnlineTherapy = () => {
  const { t, locale } = useLocale();

  const benefits = [
    { icon: Globe, titleKey: "blog.online.benefit1Title", textKey: "blog.online.benefit1Text", fallbackTitle: "Access From Anywhere", fallbackText: "Connect with qualified psychologists regardless of your location. All you need is an internet connection." },
    { icon: Clock, titleKey: "blog.online.benefit2Title", textKey: "blog.online.benefit2Text", fallbackTitle: "Flexible Scheduling", fallbackText: "Book sessions that fit your schedule — early morning, lunch break, or evening. No commute time needed." },
    { icon: Shield, titleKey: "blog.online.benefit3Title", textKey: "blog.online.benefit3Text", fallbackTitle: "Privacy & Comfort", fallbackText: "Attend sessions from the comfort of your own space. Many people find it easier to open up in familiar surroundings." },
    { icon: Laptop, titleKey: "blog.online.benefit4Title", textKey: "blog.online.benefit4Text", fallbackTitle: "Same Quality of Care", fallbackText: "Research shows that online therapy is just as effective as in-person sessions for most conditions." },
  ];

  return (
    <>
      <SEOHead path="/blog/benefits-online-therapy" title={"The Benefits of Online Therapy — Is It as Effective as In-Person? | U.Psy"} description={"The research, the pros, the trade-offs — and how to get the most out of online therapy sessions."} />
      <BlogArticleSchema
        title={t("blog.online.title") || "The Benefits of Online Therapy"}
        description={t("blog.online.intro") || "Online therapy has transformed mental health care. Discover why more people are choosing virtual sessions."}
        slug="benefits-online-therapy"
        datePublished="2025-01-25"
        category="Guide"
        readTimeMinutes={5}
      />
      <main className="flex-1">
        <section className="hero-neural-bg py-20 md:py-28">
          <div className="container-custom max-w-3xl">
            <ScrollReveal>
              <div className="text-center space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {t("blog.guide") || "Guide"}
                </span>
                <h1 className="text-display leading-tight">
                  {t("blog.online.title") || "The Benefits of Online Therapy"}
                </h1>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t("blog.online.intro") || "Online therapy has transformed mental health care. Discover why more people are choosing virtual sessions and how they can work for you."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
        <div className="container-custom max-w-4xl -mt-10 md:-mt-14 mb-8 md:mb-12">
          <div className="blog-hero-online-therapy rounded-2xl overflow-hidden border border-border/40 shadow-xl">
            <img src={heroImg} alt="Laptop with video call and tea — online therapy" width={1024} height={1024} className="w-full h-auto object-cover aspect-[16/9]" />
          </div>
        </div>


        <article className="py-16 md:py-24">
          <div className="container-custom max-w-3xl space-y-16">
            <ScrollReveal>
              <section className="space-y-4">
                <h2 className="text-h2">{t("blog.online.whyTitle") || "Why Online Therapy?"}</h2>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.online.whyText") || "The shift to online therapy has made mental health support more accessible than ever. Whether you live in a remote area, have a busy schedule, or simply prefer the comfort of home, online therapy removes many traditional barriers to getting help."}
                </p>
              </section>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, i) => (
                <ScrollReveal key={i}>
                  <div className="glass-card p-6 h-full space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{t(benefit.titleKey) || benefit.fallbackTitle}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(benefit.textKey) || benefit.fallbackText}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.online.worksTitle") || "Does Online Therapy Really Work?"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.online.worksText") || "Multiple studies have shown that online therapy can be just as effective as face-to-face therapy for conditions like anxiety, depression, and stress. The key is finding a qualified therapist and committing to the process."}
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="glass-card p-8 md:p-12 text-center space-y-4">
                <h2 className="text-h2">{t("blog.online.ctaTitle") || "Ready to Try Online Therapy?"}</h2>
                <p className="text-body text-muted-foreground max-w-xl mx-auto">
                  {t("blog.online.ctaText") || "Browse UPsy's network of qualified psychologists offering online sessions. Find your match today."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button variant="primary" size="lg" asChild>
                    <Link to={addLocalePrefix("/psychologists", locale)} className="inline-flex items-center gap-2">
                      {t("hero.findPsychologist") || "Explore Psychologists"} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            </ScrollReveal>
          </div>
            <ScrollReveal>
              <BlogAuthor />
            </ScrollReveal>

            <ScrollReveal>
              <RelatedArticles currentSlug="benefits-online-therapy" />
            </ScrollReveal>

        </article>
      </main>
    </>
  );
};

export default BenefitsOnlineTherapy;
