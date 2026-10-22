import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import SEOHead from "@/components/SEOHead";
import { ARTICLES, articleLang } from "@/content/blog/articles";
import { LEGACY_POSTS as articles } from "@/content/blog/legacy";

const BlogIndex = () => {
  const { t, locale } = useLocale();
  // Sport psychology articles (written as data) first, then the guides.
  const lang = articleLang(locale);
  const cards = [
    ...ARTICLES.map((a) => ({
      slug: a.slug,
      title: a.content[lang].title,
      desc: a.content[lang].description,
      category: a.content[lang].category,
      readTime: `${a.readMinutes} min`,
      color: "bg-primary/10 text-primary",
    })),
    ...articles.map((a) => ({
      slug: a.slug,
      title: t(a.titleKey) || a.fallbackTitle,
      desc: t(a.descKey) || a.fallbackDesc,
      category: t(a.categoryKey) || a.category,
      readTime: a.readTime,
      color: a.color,
    })),
  ];

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
                  {t("blog.indexSubtitle") ||
                    "Practical guides, insights, and resources to help you understand your mental health and take meaningful action."}
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
                {cards.map((article) => (
                  <StaggerItem key={article.slug}>
                    <Link
                      to={addLocalePrefix(`/blog/${article.slug}`, locale)}
                      className="glass-card p-0 overflow-hidden group block h-full"
                    >
                      {/* Thumbnail placeholder */}
                      <div className="h-48 flex items-center justify-center bg-primary/5 border-b border-border/30 relative overflow-hidden">
                        <span className="text-6xl font-bold text-primary/10 group-hover:scale-110 transition-transform duration-500">
                          {article.title.charAt(0)}
                        </span>
                        <div className="absolute top-4 left-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${article.color}`}
                          >
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 space-y-3">
                        <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                          {article.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {article.desc}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                            <Clock className="w-3.5 h-3.5" /> {article.readTime}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                            {t("research.readMore") || "Read more"}{" "}
                            <ArrowRight className="w-4 h-4" />
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
