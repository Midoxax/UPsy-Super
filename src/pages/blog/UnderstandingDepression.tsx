import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import BlogAuthor from "@/components/blog/BlogAuthor";
import RelatedArticles from "@/components/blog/RelatedArticles";
import heroImg from "@/assets/blog/depression.jpg";

const UnderstandingDepression = () => {
  const { t, locale } = useLocale();

  return (
    <>
      <SEOHead path="/blog/understanding-depression" title={"Understanding Depression — Signs, Causes & Paths to Recovery | U.Psy"} description={"Learn to recognize depression, why it happens, and the therapies that actually help — with guidance from accredited psychologists."} />
      <BlogArticleSchema
        title={t("blog.depression.title") || "Understanding Depression: Signs, Causes, and Hope"}
        description={t("blog.depression.intro") || "Depression is more than feeling sad. Learn about the signs, causes, and pathways to recovery."}
        slug="understanding-depression"
        datePublished="2025-02-10"
        category="Mental Health"
        readTimeMinutes={6}
      />
      <main className="flex-1">
        <section className="hero-neural-bg py-20 md:py-28">
          <div className="container-custom max-w-3xl">
            <ScrollReveal>
              <div className="space-y-6">
                <Link to={addLocalePrefix("/blog", locale)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t("blog.backToBlog") || "Back to Blog"}
                </Link>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                  {t("blog.mentalHealth") || "Mental Health"}
                </span>
                <h1 className="text-display leading-tight">
                  {t("blog.depression.title") || "Understanding Depression: More Than Just Sadness"}
                </h1>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.depression.intro") || "Depression is one of the most common mental health conditions worldwide. Understanding what it really is — and what it isn't — is the first step toward recovery."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
        <div className="container-custom max-w-4xl -mt-10 md:-mt-14 mb-8 md:mb-12">
          <div className="blog-hero-depression rounded-2xl overflow-hidden border border-border/40 shadow-xl">
            <img src={heroImg} alt="Warm light through window — depression recovery" width={1024} height={1024} className="w-full h-auto object-cover aspect-[16/9]" />
          </div>
        </div>


        <section className="py-16 md:py-24">
          <div className="container-custom max-w-3xl">
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.depression.whatTitle") || "What Is Depression?"}</h2>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {t("blog.depression.whatText") || "Depression is more than feeling sad or going through a rough patch. It's a serious mental health condition that affects how you think, feel, and handle daily activities. It can last for weeks, months, or even years if left untreated."}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.depression.signsTitle") || "Common Signs of Depression"}</h2>
                  <ul className="space-y-3">
                    {[
                      t("blog.depression.sign1") || "Persistent feelings of sadness, emptiness, or hopelessness",
                      t("blog.depression.sign2") || "Loss of interest in activities you once enjoyed",
                      t("blog.depression.sign3") || "Changes in appetite or weight",
                      t("blog.depression.sign4") || "Difficulty sleeping or sleeping too much",
                      t("blog.depression.sign5") || "Fatigue and lack of energy",
                      t("blog.depression.sign6") || "Difficulty concentrating or making decisions",
                      t("blog.depression.sign7") || "Feelings of worthlessness or excessive guilt",
                    ].map((sign, i) => (
                      <li key={i} className="flex items-start gap-3 text-body text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-secondary mt-2.5 shrink-0" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.depression.typesTitle") || "Types of Depression"}</h2>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {t("blog.depression.typesText") || "Depression isn't one-size-fits-all. Major depressive disorder, persistent depressive disorder (dysthymia), seasonal affective disorder, and postpartum depression are all different forms. A qualified psychologist can help determine what you're experiencing and recommend the right approach."}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.depression.treatmentTitle") || "How Is Depression Treated?"}</h2>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {t("blog.depression.treatmentText") || "Depression is highly treatable. The most common approaches include psychotherapy (especially CBT), medication, lifestyle changes, and social support. Many people see significant improvement with professional help."}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="glass-card p-8 text-center space-y-4">
                  <h2 className="text-h2">{t("blog.depression.ctaTitle") || "You Don't Have to Face Depression Alone"}</h2>
                  <p className="text-body text-muted-foreground">
                    {t("blog.depression.ctaText") || "If you recognize these signs in yourself or someone you care about, reaching out is the first step. Our self-assessment can help you understand your situation."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button variant="primary" size="lg" asChild>
                      <Link to={addLocalePrefix("/get-matched", locale)} className="inline-flex items-center gap-2">
                        {t("selfAssessment.cta") || "Take the Self-Assessment"} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="secondary" size="lg" asChild>
                      <Link to={addLocalePrefix("/psychologists", locale)}>
                        {t("common.ctaFindPsychologist") || "Find a Psychologist"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
        <section className="pb-16 md:pb-24">
          <div className="container-custom max-w-4xl space-y-12">
            <ScrollReveal><BlogAuthor /></ScrollReveal>
            <ScrollReveal><RelatedArticles currentSlug="understanding-depression" /></ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
};

export default UnderstandingDepression;
