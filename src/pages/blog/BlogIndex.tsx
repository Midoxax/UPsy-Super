import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import SEOHead from "@/components/SEOHead";

interface BlogArticle {
  slug: string;
  titleKey: string;
  descKey: string;
  fallbackTitle: string;
  fallbackDesc: string;
  category: string;
  categoryKey: string;
  readTime: string;
  color: string;
}

const articles: BlogArticle[] = [
  {
    slug: "find-right-psychologist",
    titleKey: "blog.findPsych.title",
    descKey: "blog.findPsych.intro",
    fallbackTitle: "How to Find the Right Psychologist for You",
    fallbackDesc: "Finding the right psychologist can feel overwhelming. This guide breaks down the process into simple, actionable steps so you can make a confident choice.",
    category: "Guide",
    categoryKey: "blog.guide",
    readTime: "5 min",
    color: "bg-primary/10 text-primary",
  },
  {
    slug: "do-i-need-therapy",
    titleKey: "blog.therapy.title",
    descKey: "blog.therapy.intro",
    fallbackTitle: "Do I Need Therapy?",
    fallbackDesc: "If you're asking this question, you're already taking a brave step. Here's how to recognize when professional support could help.",
    category: "Mental Health",
    categoryKey: "blog.mentalHealth",
    readTime: "6 min",
    color: "bg-secondary/10 text-secondary",
  },
  {
    slug: "understanding-anxiety",
    titleKey: "blog.anxiety.title",
    descKey: "blog.anxiety.intro",
    fallbackTitle: "Understanding Anxiety: What It Is and How to Manage It",
    fallbackDesc: "Anxiety is one of the most common mental health experiences. Learn what it really means and practical steps to manage it.",
    category: "Mental Health",
    categoryKey: "blog.mentalHealth",
    readTime: "5 min",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    slug: "benefits-online-therapy",
    titleKey: "blog.online.title",
    descKey: "blog.online.intro",
    fallbackTitle: "The Benefits of Online Therapy",
    fallbackDesc: "Online therapy has transformed mental health care. Discover why more people are choosing virtual sessions.",
    category: "Guide",
    categoryKey: "blog.guide",
    readTime: "4 min",
    color: "bg-primary/10 text-primary",
  },
  {
    slug: "mental-health-at-work",
    titleKey: "blog.work.title",
    descKey: "blog.work.intro",
    fallbackTitle: "Mental Health at Work: Why It Matters",
    fallbackDesc: "Work is one of the biggest factors affecting our mental health. Learn how to recognize burnout and create healthier boundaries.",
    category: "Workplace",
    categoryKey: "blog.workplace",
    readTime: "6 min",
    color: "bg-secondary/10 text-secondary",
  },
  {
    slug: "understanding-depression",
    titleKey: "blog.depression.title",
    descKey: "blog.depression.intro",
    fallbackTitle: "Understanding Depression: More Than Just Sadness",
    fallbackDesc: "Depression is one of the most common mental health conditions worldwide. Understanding what it really is — and what it isn't — is the first step toward recovery.",
    category: "Mental Health",
    categoryKey: "blog.mentalHealth",
    readTime: "5 min",
    color: "bg-secondary/10 text-secondary",
  },
  {
    slug: "how-to-support-a-loved-one",
    titleKey: "blog.support.title",
    descKey: "blog.support.intro",
    fallbackTitle: "How to Support a Loved One with Mental Health Challenges",
    fallbackDesc: "When someone you care about is struggling, knowing what to say — and what not to say — can make all the difference.",
    category: "Guide",
    categoryKey: "blog.guide",
    readTime: "5 min",
    color: "bg-primary/10 text-primary",
  },
  {
    slug: "mindfulness-for-beginners",
    titleKey: "blog.mindfulness.title",
    descKey: "blog.mindfulness.intro",
    fallbackTitle: "Mindfulness for Beginners: A Practical Guide",
    fallbackDesc: "Mindfulness isn't about emptying your mind. It's about paying attention to the present moment — without judgment.",
    category: "Wellness",
    categoryKey: "blog.wellness",
    readTime: "6 min",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    slug: "how-to-improve-focus",
    titleKey: "blog.focus.title",
    descKey: "blog.focus.intro",
    fallbackTitle: "How to Improve Focus and Concentration",
    fallbackDesc: "Focus is not a personality trait — it's a trainable skill. The four evidence-based levers, a 4-week protocol, and when to get help.",
    category: "Performance",
    categoryKey: "blog.performance",
    readTime: "7 min",
    color: "bg-primary/10 text-primary",
  },
  {
    slug: "how-to-clear-brain-fog",
    titleKey: "blog.brainFog.title",
    descKey: "blog.brainFog.intro",
    fallbackTitle: "How to Clear Brain Fog — Causes, Fixes and When to See a Doctor",
    fallbackDesc: "Brain fog is a signal, not a personality flaw. The five most common drivers, a 2-week clarity protocol, and the bloodwork to ask for.",
    category: "Performance",
    categoryKey: "blog.performance",
    readTime: "7 min",
    color: "bg-primary/10 text-primary",
  },
];

const BlogIndex = () => {
  const { t, locale } = useLocale();

  return (
    <>
      <SEOHead
        path="/blog"
        title="U.Psy Blog — Mental Health Insights from Morocco"
        description="Evidence-based articles on therapy, anxiety, depression, workplace mental health, and mindfulness from the U.Psy clinical team."
      />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-neural-bg py-20 md:py-28">
          <div className="container-custom max-w-3xl">
            <ScrollReveal>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-primary/10 border-2 border-primary/20">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-display leading-tight">
                  {t("blog.indexTitle") || "Mental Health Blog"}
                </h1>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t("blog.indexSubtitle") || "Practical guides, insights, and resources to help you understand your mental health and take meaningful action."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 md:py-24">
          <div className="container-custom max-w-4xl">
            <StaggerContainer staggerDelay={0.15}>
              <div className="grid md:grid-cols-2 gap-8">
                {articles.map((article) => (
                  <StaggerItem key={article.slug}>
                    <Link
                      to={addLocalePrefix(`/blog/${article.slug}`, locale)}
                      className="glass-card p-0 overflow-hidden group block h-full"
                    >
                      {/* Thumbnail placeholder */}
                      <div className="h-48 flex items-center justify-center bg-primary/5 border-b border-border/30 relative overflow-hidden">
                        <span className="text-6xl font-bold text-primary/10 group-hover:scale-110 transition-transform duration-500">
                          {(t(article.titleKey) || article.fallbackTitle).charAt(0)}
                        </span>
                        <div className="absolute top-4 left-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${article.color}`}>
                            {t(article.categoryKey) || article.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 space-y-3">
                        <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                          {t(article.titleKey) || article.fallbackTitle}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {t(article.descKey) || article.fallbackDesc}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                            <Clock className="w-3.5 h-3.5" /> {article.readTime}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                            {t("research.readMore") || "Read more"} <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>
      </main>
    </>
  );
};

export default BlogIndex;
