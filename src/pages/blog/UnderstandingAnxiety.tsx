import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import BlogAuthor from "@/components/blog/BlogAuthor";
import RelatedArticles from "@/components/blog/RelatedArticles";
import heroImg from "@/assets/blog/anxiety.jpg";
import { ArrowRight, AlertCircle, Brain, Heart, Shield } from "lucide-react";

const UnderstandingAnxiety = () => {
  const { t, locale } = useLocale();

  return (
    <>
      <SEOHead path="/blog/understanding-anxiety" title={"Understanding Anxiety — Causes, Symptoms & How to Manage It | U.Psy"} description={"What anxiety really is, how it shows up in daily life, and evidence-based ways to manage it — from breathing to therapy."} />
      <BlogArticleSchema
        title={t("blog.anxiety.title") || "Understanding Anxiety: What It Is and How to Manage It"}
        description={t("blog.anxiety.intro") || "Anxiety is one of the most common mental health experiences. Learn what it really means and practical steps to manage it."}
        slug="understanding-anxiety"
        datePublished="2025-01-20"
        category="Mental Health"
        readTimeMinutes={6}
      />
      <main className="flex-1">
        <section className="hero-neural-bg py-20 md:py-28">
          <div className="container-custom max-w-3xl">
            <ScrollReveal>
              <div className="text-center space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground">
                  {t("blog.mentalHealth") || "Mental Health"}
                </span>
                <h1 className="text-display leading-tight">
                  {t("blog.anxiety.title") || "Understanding Anxiety: What It Is and How to Manage It"}
                </h1>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t("blog.anxiety.intro") || "Anxiety is one of the most common mental health experiences. Learn what it really means, how it affects you, and practical steps to manage it."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
        <div className="container-custom max-w-4xl -mt-10 md:-mt-14 mb-8 md:mb-12">
          <div className="blog-hero-anxiety rounded-2xl overflow-hidden border border-border/40 shadow-xl">
            <img src={heroImg} alt="Calm hands resting — anxiety relief" width={1024} height={1024} className="w-full h-auto object-cover aspect-[16/9]" />
          </div>
        </div>


        <article className="py-16 md:py-24">
          <div className="container-custom max-w-3xl space-y-16">
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.anxiety.whatTitle") || "What Is Anxiety?"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.anxiety.whatText") || "Anxiety is your body's natural response to stress. It's a feeling of fear or apprehension about what's to come. While occasional anxiety is normal, persistent anxiety that interferes with daily life may indicate an anxiety disorder."}
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.anxiety.symptomsTitle") || "Common Symptoms"}</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    t("blog.anxiety.symptom1") || "Excessive worry or fear",
                    t("blog.anxiety.symptom2") || "Restlessness or feeling on edge",
                    t("blog.anxiety.symptom3") || "Difficulty concentrating",
                    t("blog.anxiety.symptom4") || "Sleep disturbances",
                    t("blog.anxiety.symptom5") || "Physical tension or headaches",
                    t("blog.anxiety.symptom6") || "Avoiding situations that trigger anxiety",
                  ].map((symptom, i) => (
                    <div key={i} className="glass-card p-4 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{symptom}</p>
                    </div>
                  ))}
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.anxiety.manageTitle") || "How to Manage Anxiety"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.anxiety.manageText") || "Managing anxiety is possible with the right strategies. Regular exercise, mindfulness practices, adequate sleep, and limiting caffeine can all help. Most importantly, talking to a professional can provide personalized strategies and support."}
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.anxiety.helpTitle") || "When to Seek Help"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.anxiety.helpText") || "If anxiety is interfering with your work, relationships, or daily activities, it's time to reach out. A psychologist can help you understand the root causes and develop effective coping strategies tailored to your situation."}
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="glass-card p-8 md:p-12 text-center space-y-4">
                <h2 className="text-h2">{t("blog.anxiety.ctaTitle") || "You Don't Have to Face Anxiety Alone"}</h2>
                <p className="text-body text-muted-foreground max-w-xl mx-auto">
                  {t("blog.anxiety.ctaText") || "Take our free self-assessment to better understand your anxiety and get matched with a psychologist who can help."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button variant="primary" size="lg" asChild>
                    <Link to={addLocalePrefix("/get-matched", locale)} className="inline-flex items-center gap-2">
                      {t("hero.startAssessment") || "Start Your Self-Assessment"} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <Link to={addLocalePrefix("/psychologists", locale)}>
                      {t("hero.findPsychologist") || "Explore Psychologists"}
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
              <RelatedArticles currentSlug="understanding-anxiety" />
            </ScrollReveal>

        </article>
      </main>
    </>
  );
};

export default UnderstandingAnxiety;
