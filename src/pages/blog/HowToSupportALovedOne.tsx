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
import heroImg from "@/assets/blog/support-loved-one.jpg";

const HowToSupportALovedOne = () => {
  const { t, locale } = useLocale();

  return (
    <>
      <SEOHead path="/blog/how-to-support-a-loved-one" title={"How to Support a Loved One Struggling with Mental Health | U.Psy"} description={"Practical scripts and boundaries for supporting a partner, friend, or family member through anxiety, depression, or burnout."} />
      <BlogArticleSchema
        title={t("blog.support.title") || "How to Support a Loved One with Mental Health Challenges"}
        description={t("blog.support.intro") || "When someone you care about is struggling, knowing how to help can make a real difference."}
        slug="how-to-support-a-loved-one"
        datePublished="2025-02-15"
        category="Guide"
        readTimeMinutes={5}
      />
      <main className="flex-1">
        <section className="hero-neural-bg py-20 md:py-28">
          <div className="container-custom max-w-3xl">
            <ScrollReveal>
              <div className="space-y-6">
                <Link to={addLocalePrefix("/blog", locale)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t("blog.backToBlog") || "Back to Blog"}
                </Link>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {t("blog.guide") || "Guide"}
                </span>
                <h1 className="text-display leading-tight">
                  {t("blog.support.title") || "How to Support a Loved One with Mental Health Challenges"}
                </h1>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.support.intro") || "When someone you care about is struggling, knowing what to say — and what not to say — can make all the difference."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
        <div className="container-custom max-w-4xl -mt-10 md:-mt-14 mb-8 md:mb-12">
          <div className="blog-hero-support-loved-one rounded-2xl overflow-hidden border border-border/40 shadow-xl">
            <img src={heroImg} alt="Two open hands — supporting a loved one" width={1024} height={1024} className="w-full h-auto object-cover aspect-[16/9]" />
          </div>
        </div>


        <section className="py-16 md:py-24">
          <div className="container-custom max-w-3xl">
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.support.listenTitle") || "1. Listen Without Judging"}</h2>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {t("blog.support.listenText") || "The most powerful thing you can do is simply be present. Don't try to fix the problem or minimize their feelings. Let them know you're there, and that what they're going through matters."}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.support.educateTitle") || "2. Educate Yourself"}</h2>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {t("blog.support.educateText") || "Learning about mental health conditions helps you understand what your loved one is experiencing. It reduces fear, prevents common mistakes, and shows them you care enough to learn."}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.support.encourageTitle") || "3. Encourage Professional Help"}</h2>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {t("blog.support.encourageText") || "Gently suggest speaking with a professional. Offer to help them find a psychologist or even accompany them to the first session if they'd like. Don't force it — let them decide at their own pace."}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.support.boundariesTitle") || "4. Set Healthy Boundaries"}</h2>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {t("blog.support.boundariesText") || "Supporting someone doesn't mean sacrificing your own wellbeing. It's okay to set limits, take breaks, and seek your own support. You can't pour from an empty cup."}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.support.avoidTitle") || "5. What to Avoid"}</h2>
                  <ul className="space-y-3">
                    {[
                      t("blog.support.avoid1") || "Don't say \"just cheer up\" or \"it's all in your head\"",
                      t("blog.support.avoid2") || "Don't compare their situation to others",
                      t("blog.support.avoid3") || "Don't take it personally if they withdraw",
                      t("blog.support.avoid4") || "Don't try to be their therapist",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-body text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-destructive mt-2.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="glass-card p-8 text-center space-y-4">
                  <h2 className="text-h2">{t("blog.support.ctaTitle") || "Need Guidance?"}</h2>
                  <p className="text-body text-muted-foreground">
                    {t("blog.support.ctaText") || "If you're supporting someone through a difficult time, UPsy can help you find the right resources and professional guidance."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button variant="primary" size="lg" asChild>
                      <Link to={addLocalePrefix("/psychologists", locale)} className="inline-flex items-center gap-2">
                        {t("common.ctaFindPsychologist") || "Find a Psychologist"} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="secondary" size="lg" asChild>
                      <Link to={addLocalePrefix("/resources", locale)}>
                        {t("nav.learning") || "Explore Resources"}
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
            <ScrollReveal><RelatedArticles currentSlug="how-to-support-a-loved-one" /></ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
};

export default HowToSupportALovedOne;
