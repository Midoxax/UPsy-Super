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
import heroImg from "@/assets/blog/mindfulness.jpg";

const MindfulnessForBeginners = () => {
  const { t, locale } = useLocale();

  return (
    <>
      <SEOHead path="/blog/mindfulness-for-beginners" title={"Mindfulness for Beginners — A Simple 7-Day Starter Guide | U.Psy"} description={"A beginner-friendly guide to mindfulness: what it is, why it works, and a 7-day plan you can start today in 10 minutes a day."} />
      <BlogArticleSchema
        title={t("blog.mindfulness.title") || "Mindfulness for Beginners: A Practical Guide"}
        description={t("blog.mindfulness.intro") || "Mindfulness can reduce stress, improve focus, and enhance emotional well-being."}
        slug="mindfulness-for-beginners"
        datePublished="2025-02-20"
        category="Wellness"
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
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground">
                  {t("blog.wellness") || "Wellness"}
                </span>
                <h1 className="text-display leading-tight">
                  {t("blog.mindfulness.title") || "Mindfulness for Beginners: A Practical Guide"}
                </h1>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.mindfulness.intro") || "Mindfulness isn't about emptying your mind. It's about paying attention to the present moment — without judgment. Here's how to start."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
        <div className="container-custom max-w-4xl -mt-10 md:-mt-14 mb-8 md:mb-12">
          <div className="blog-hero-mindfulness rounded-2xl overflow-hidden border border-border/40 shadow-xl">
            <img src={heroImg} alt="Smooth stones in warm light — mindfulness practice" width={1024} height={1024} className="w-full h-auto object-cover aspect-[16/9]" />
          </div>
        </div>


        <section className="py-16 md:py-24">
          <div className="container-custom max-w-3xl">
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.mindfulness.whatTitle") || "What Is Mindfulness?"}</h2>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {t("blog.mindfulness.whatText") || "Mindfulness is the practice of bringing your full attention to the present moment. It's a skill backed by decades of research showing benefits for stress reduction, emotional regulation, focus, and overall mental health."}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.mindfulness.benefitsTitle") || "Benefits of Regular Practice"}</h2>
                  <ul className="space-y-3">
                    {[
                      t("blog.mindfulness.benefit1") || "Reduced stress and anxiety",
                      t("blog.mindfulness.benefit2") || "Improved focus and concentration",
                      t("blog.mindfulness.benefit3") || "Better emotional regulation",
                      t("blog.mindfulness.benefit4") || "Enhanced self-awareness",
                      t("blog.mindfulness.benefit5") || "Better sleep quality",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-body text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.mindfulness.startTitle") || "How to Start (3 Simple Exercises)"}</h2>
                  <div className="space-y-6">
                    <div className="glass-card p-6 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{t("blog.mindfulness.exercise1Title") || "1. The 5-Minute Breathing Exercise"}</h3>
                      <p className="text-sm text-muted-foreground">{t("blog.mindfulness.exercise1Text") || "Sit comfortably, close your eyes, and focus on your breath. Inhale for 4 counts, hold for 4, exhale for 4. When your mind wanders, gently bring it back. Start with 5 minutes daily."}</p>
                    </div>
                    <div className="glass-card p-6 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{t("blog.mindfulness.exercise2Title") || "2. The Body Scan"}</h3>
                      <p className="text-sm text-muted-foreground">{t("blog.mindfulness.exercise2Text") || "Lie down and slowly move your attention from your toes to the top of your head. Notice any tension, warmth, or sensation without trying to change anything."}</p>
                    </div>
                    <div className="glass-card p-6 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{t("blog.mindfulness.exercise3Title") || "3. Mindful Observation"}</h3>
                      <p className="text-sm text-muted-foreground">{t("blog.mindfulness.exercise3Text") || "Pick one routine activity — eating, walking, or brushing your teeth — and do it with full attention. Notice every detail: textures, temperatures, sounds."}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-h2">{t("blog.mindfulness.tipsTitle") || "Tips for Building a Habit"}</h2>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {t("blog.mindfulness.tipsText") || "Start small — even 2 minutes counts. Practice at the same time each day. Be patient with yourself. Mindfulness is not about perfection; it's about awareness."}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="glass-card p-8 text-center space-y-4">
                  <h2 className="text-h2">{t("blog.mindfulness.ctaTitle") || "Want Guided Mindfulness Support?"}</h2>
                  <p className="text-body text-muted-foreground">
                    {t("blog.mindfulness.ctaText") || "Our mindfulness programs and psychologists can help you build a sustainable practice tailored to your needs."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button variant="primary" size="lg" asChild>
                      <Link to={addLocalePrefix("/services", locale)} className="inline-flex items-center gap-2">
                        {t("programs.cta") || "Explore Programs"} <ArrowRight className="w-4 h-4" />
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
            <ScrollReveal><RelatedArticles currentSlug="mindfulness-for-beginners" /></ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
};

export default MindfulnessForBeginners;
