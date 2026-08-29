import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import BlogAuthor from "@/components/blog/BlogAuthor";
import RelatedArticles from "@/components/blog/RelatedArticles";
import heroImg from "@/assets/blog/need-therapy.jpg";
import { ArrowRight, AlertCircle, CheckCircle2, HelpCircle, TrendingUp, Heart } from "lucide-react";

const DoINeedTherapy = () => {
  const { t, locale } = useLocale();

  const signs = [
    { icon: AlertCircle, text: t("blog.therapy.sign1") || "You feel overwhelmed by emotions that are hard to manage on your own" },
    { icon: AlertCircle, text: t("blog.therapy.sign2") || "Your sleep, appetite, or energy have changed significantly" },
    { icon: AlertCircle, text: t("blog.therapy.sign3") || "You're withdrawing from activities or people you used to enjoy" },
    { icon: AlertCircle, text: t("blog.therapy.sign4") || "You find it hard to concentrate or make decisions" },
    { icon: AlertCircle, text: t("blog.therapy.sign5") || "You're using substances or unhealthy habits to cope" },
    { icon: AlertCircle, text: t("blog.therapy.sign6") || "You feel stuck and don't know how to move forward" },
  ];

  const myths = [
    {
      myth: t("blog.therapy.myth1") || "Therapy is only for people with serious mental illness",
      truth: t("blog.therapy.truth1") || "Therapy helps anyone looking to grow, manage stress, improve relationships, or simply understand themselves better.",
    },
    {
      myth: t("blog.therapy.myth2") || "I should be able to handle this on my own",
      truth: t("blog.therapy.truth2") || "Seeking help is a sign of strength, not weakness. Even high-performing individuals benefit from professional support.",
    },
    {
      myth: t("blog.therapy.myth3") || "Therapy takes years to work",
      truth: t("blog.therapy.truth3") || "Many people see meaningful progress within a few sessions. The timeline depends on your goals and situation.",
    },
  ];

  return (
    <>
      <SEOHead path="/blog/do-i-need-therapy" title={"Do I Need Therapy? 10 Signs It's Time to Talk to a Psychologist | U.Psy"} description={"Ten honest signs it's time to see a psychologist — and how to choose the right one for your situation."} />
      <BlogArticleSchema
        title={t("blog.therapy.title") || "Do I Need Therapy? Signs It Might Be Time"}
        description={t("blog.therapy.intro") || "Wondering if therapy is right for you? Here are key signs and myths debunked."}
        slug="do-i-need-therapy"
        datePublished="2025-01-18"
        category="Guide"
        readTimeMinutes={6}
      />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-neural-bg py-20 md:py-28">
          <div className="container-custom max-w-3xl">
            <ScrollReveal>
              <div className="text-center space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {t("blog.mentalHealth") || "Mental Health"}
                </span>
                <h1 className="text-display leading-tight">
                  {t("blog.therapy.title") || "Do I Need Therapy?"}
                </h1>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t("blog.therapy.intro") || "If you're asking this question, you're already taking a brave step. Here's how to recognize when professional support could help — and why there's no wrong time to start."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
        <div className="container-custom max-w-4xl -mt-10 md:-mt-14 mb-8 md:mb-12">
          <div className="blog-hero-need-therapy rounded-2xl overflow-hidden border border-border/40 shadow-xl">
            <img src={heroImg} alt="Open journal and pen — self-reflection on therapy" width={1024} height={1024} className="w-full h-auto object-cover aspect-[16/9]" />
          </div>
        </div>


        {/* Content */}
        <article className="py-16 md:py-24">
          <div className="container-custom max-w-3xl space-y-16">
            {/* Signs Section */}
            <ScrollReveal>
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.therapy.signsTitle") || "Signs You Might Benefit From Therapy"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.therapy.signsIntro") || "You don't need to be in crisis to benefit from therapy. Here are some common signs that professional support could help:"}
                </p>
                <div className="space-y-3">
                  {signs.map((sign, i) => (
                    <div key={i} className="flex items-start gap-3 glass-card p-4">
                      <sign.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{sign.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            </ScrollReveal>

            {/* Myths Section */}
            <ScrollReveal>
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.therapy.mythsTitle") || "Common Myths About Therapy"}</h2>
                </div>
                <div className="space-y-6">
                  {myths.map((item, i) => (
                    <div key={i} className="glass-card p-6 space-y-3">
                      <p className="text-sm font-semibold text-foreground">❌ {item.myth}</p>
                      <p className="text-sm text-muted-foreground">✅ {item.truth}</p>
                    </div>
                  ))}
                </div>
              </section>
            </ScrollReveal>

            {/* Benefits */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.therapy.benefitsTitle") || "What Therapy Can Do For You"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.therapy.benefitsText") || "Therapy provides a safe, confidential space to explore your thoughts and feelings with a trained professional. It can help you develop coping strategies, improve relationships, build self-awareness, and work through challenges in a structured way. Many people describe therapy as one of the most valuable investments they've made in themselves."}
                </p>
              </section>
            </ScrollReveal>

            {/* When to start */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-h2">{t("blog.therapy.whenTitle") || "When Is the Right Time?"}</h2>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {t("blog.therapy.whenText") || "There's no perfect time to start therapy. If you're thinking about it, that's often a sign that you're ready. You don't need to wait until things get worse. Taking proactive steps for your mental health is always worthwhile."}
                </p>
              </section>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal>
              <div className="glass-card p-8 md:p-12 text-center space-y-6">
                <h2 className="text-h2">{t("blog.therapy.ctaTitle") || "Take the First Step"}</h2>
                <p className="text-body text-muted-foreground max-w-lg mx-auto">
                  {t("blog.therapy.ctaText") || "Not sure where to start? Our free self-assessment can help you understand your needs and get personalized recommendations."}
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
              <RelatedArticles currentSlug="do-i-need-therapy" />
            </ScrollReveal>

        </article>
      </main>
    </>
  );
};

export default DoINeedTherapy;
