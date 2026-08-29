import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import BlogAuthor from "@/components/blog/BlogAuthor";
import RelatedArticles from "@/components/blog/RelatedArticles";
import heroImg from "@/assets/blog/mental-health-work.jpg";
import { ArrowRight, Briefcase, TrendingUp, Users, AlertTriangle } from "lucide-react";

const MentalHealthAtWork = () => {
  const { t, locale } = useLocale();

  return (
    <>
      <SEOHead path="/blog/mental-health-at-work" title={"Mental Health at Work — Burnout, Boundaries & Employer Support | U.Psy"} description={"How to spot burnout early, set boundaries that hold, and get real mental-health support from your employer."} />
      <BlogArticleSchema
        title={t("blog.work.title") || "Mental Health at Work: Why It Matters"}
        description={t("blog.work.intro") || "Workplace mental health affects productivity, relationships, and overall well-being."}
        slug="mental-health-at-work"
        datePublished="2025-02-01"
        category="Workplace"
        readTimeMinutes={5}
      />
      <main className="flex-1">
        <section className="hero-neural-bg py-20 md:py-28">
          <div className="container-custom max-w-3xl">
            <ScrollReveal>
              <div className="text-center space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                  {t("blog.workplace") || "Workplace"}
                </span>
                <h1 className="text-display leading-tight">
                  {t("blog.work.title") || "Mental Health at Work: Why It Matters and What You Can Do"}
                </h1>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t("blog.work.intro") || "Work is one of the biggest factors affecting our mental health. Learn how to recognize burnout, set boundaries, and create a healthier work environment."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
        <div className="container-custom max-w-4xl -mt-10 md:-mt-14 mb-8 md:mb-12">
          <div className="blog-hero-mental-health-work rounded-2xl overflow-hidden border border-border/40 shadow-xl">
            <img src={heroImg} alt="Calm workspace with plant — mental health at work" width={1024} height={1024} className="w-full h-auto object-cover aspect-[16/9]" />
          </div>
        </div>


        <article className="py-16 md:py-24">
          <div className="container-custom max-w-3xl space-y-16">
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.work.burnoutTitle") || "Recognizing Burnout"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.work.burnoutText") || "Burnout isn't just feeling tired. It's a state of chronic physical and emotional exhaustion that comes from prolonged workplace stress. Signs include feeling detached from your work, reduced performance, and persistent fatigue that doesn't improve with rest."}
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.work.statsTitle") || "The Numbers Speak"}</h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { stat: "76%", label: t("blog.work.stat1") || "of workers report stress affecting their mental health" },
                    { stat: "1 in 4", label: t("blog.work.stat2") || "people will experience a mental health issue each year" },
                    { stat: "50%", label: t("blog.work.stat3") || "of long-term absences are caused by stress and anxiety" },
                  ].map((item, i) => (
                    <div key={i} className="glass-card p-6 text-center">
                      <p className="text-2xl font-bold text-primary mb-2">{item.stat}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.work.tipsTitle") || "What You Can Do"}</h2>
                </div>
                <ul className="space-y-3">
                  {[
                    t("blog.work.tip1") || "Set clear boundaries between work and personal time",
                    t("blog.work.tip2") || "Take regular breaks throughout the day",
                    t("blog.work.tip3") || "Talk to a manager or HR about workload concerns",
                    t("blog.work.tip4") || "Consider speaking with a psychologist who specializes in workplace issues",
                    t("blog.work.tip5") || "Practice stress management techniques like mindfulness or exercise",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">{i + 1}</span>
                      </span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.work.orgTitle") || "For Organizations"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.work.orgText") || "Investing in employee mental health isn't just the right thing to do — it's smart business. Organizations that prioritize psychological wellbeing see improved productivity, reduced absenteeism, and higher retention rates."}
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="glass-card p-8 md:p-12 text-center space-y-4">
                <h2 className="text-h2">{t("blog.work.ctaTitle") || "Need Support With Workplace Stress?"}</h2>
                <p className="text-body text-muted-foreground max-w-xl mx-auto">
                  {t("blog.work.ctaText") || "Whether you're an individual or an organization, UPsy can help. Take a self-assessment or explore our consulting services."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button variant="primary" size="lg" asChild>
                    <Link to={addLocalePrefix("/get-matched", locale)} className="inline-flex items-center gap-2">
                      {t("hero.startAssessment") || "Start Your Self-Assessment"} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <Link to={addLocalePrefix("/services/consulting-for-organizations", locale)}>
                      {t("blog.work.orgCta") || "Explore Organization Services"}
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
              <RelatedArticles currentSlug="mental-health-at-work" />
            </ScrollReveal>

        </article>
      </main>
    </>
  );
};

export default MentalHealthAtWork;
