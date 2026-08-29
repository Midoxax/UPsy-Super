import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import BlogAuthor from "@/components/blog/BlogAuthor";
import RelatedArticles from "@/components/blog/RelatedArticles";
import heroImg from "@/assets/blog/find-psychologist.jpg";
import { ArrowRight, CheckCircle2, Search, Heart, Shield, Users } from "lucide-react";

const FindRightPsychologist = () => {
  const { t, locale } = useLocale();

  return (
    <>
      <SEOHead path="/blog/find-right-psychologist" title={"How to Find the Right Psychologist for You | U.Psy"} description={"A clear framework for choosing the right psychologist: modality, credentials, chemistry, and what to ask in the first call."} />
      <BlogArticleSchema
        title={t("blog.findPsych.title") || "How to Find the Right Psychologist for You"}
        description={t("blog.findPsych.intro") || "Finding the right psychologist can feel overwhelming. This guide breaks down the process into simple, actionable steps."}
        slug="find-right-psychologist"
        datePublished="2025-01-15"
        category="Guide"
        readTimeMinutes={5}
      />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-neural-bg py-20 md:py-28">
          <div className="container-custom max-w-3xl">
            <ScrollReveal>
              <div className="text-center space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {t("blog.guide") || "Guide"}
                </span>
                <h1 className="text-display leading-tight">
                  {t("blog.findPsych.title") || "How to Find the Right Psychologist for You"}
                </h1>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t("blog.findPsych.intro") || "Finding the right psychologist can feel overwhelming. This guide breaks down the process into simple, actionable steps so you can make a confident choice."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
        <div className="container-custom max-w-4xl -mt-10 md:-mt-14 mb-8 md:mb-12">
          <div className="blog-hero-find-psychologist rounded-2xl overflow-hidden border border-border/40 shadow-xl">
            <img src={heroImg} alt="Two people in conversation — finding the right psychologist" width={1024} height={1024} className="w-full h-auto object-cover aspect-[16/9]" />
          </div>
        </div>


        {/* Content */}
        <article className="py-16 md:py-24">
          <div className="container-custom max-w-3xl space-y-16">
            {/* Section 1 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.findPsych.step1Title") || "1. Know What You Need"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.findPsych.step1Text") || "Before searching, take a moment to reflect on what you're experiencing. Are you dealing with anxiety, relationship issues, work stress, or something else? Understanding your needs helps narrow your search and find someone with the right expertise."}
                </p>
                <div className="glass-card p-5 mt-4">
                  <p className="text-sm text-muted-foreground italic">
                    {t("blog.findPsych.step1Tip") || "💡 Tip: If you're unsure, try our free self-assessment to better understand your needs before choosing a psychologist."}
                  </p>
                </div>
              </section>
            </ScrollReveal>

            {/* Section 2 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.findPsych.step2Title") || "2. Check Credentials"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.findPsych.step2Text") || "Always verify that your psychologist is licensed and accredited. Look for professional certifications, university degrees in psychology, and membership in recognized professional bodies. A qualified psychologist will be transparent about their credentials."}
                </p>
              </section>
            </ScrollReveal>

            {/* Section 3 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.findPsych.step3Title") || "3. Find the Right Fit"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.findPsych.step3Text") || "The therapeutic relationship is one of the strongest predictors of successful therapy. Consider factors like communication style, cultural understanding, language preferences, and whether you feel comfortable and safe. It's okay to try a few sessions before committing."}
                </p>
              </section>
            </ScrollReveal>

            {/* Section 4 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.findPsych.step4Title") || "4. Understand the Approach"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.findPsych.step4Text") || "Different psychologists use different therapeutic approaches — CBT, psychodynamic therapy, humanistic therapy, and more. Each has its strengths. Ask your psychologist to explain their approach and how it applies to your situation."}
                </p>
              </section>
            </ScrollReveal>

            {/* Section 5 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.findPsych.step5Title") || "5. Consider Practical Factors"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.findPsych.step5Text") || "Think about availability, location (or online options), session fees, and scheduling flexibility. These practical considerations matter for maintaining consistency in your therapy journey."}
                </p>
              </section>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal>
              <div className="glass-card p-8 md:p-12 text-center space-y-6">
                <h2 className="text-h2">{t("blog.findPsych.ctaTitle") || "Ready to Find Your Psychologist?"}</h2>
                <p className="text-body text-muted-foreground max-w-lg mx-auto">
                  {t("blog.findPsych.ctaText") || "UPsy makes it easy to find verified psychologists matched to your specific needs. Start with a quick self-assessment or browse our directory."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="primary" size="lg" asChild>
                    <Link to={addLocalePrefix("/get-matched", locale)}>
                      {t("hero.startAssessment")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <Link to={addLocalePrefix("/psychologists", locale)}>
                      {t("hero.findPsychologist")}
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
            <ScrollReveal>
              <BlogAuthor />
            </ScrollReveal>

            <ScrollReveal>
              <RelatedArticles currentSlug="find-right-psychologist" />
            </ScrollReveal>

        </article>
      </main>
    </>
  );
};

export default FindRightPsychologist;
