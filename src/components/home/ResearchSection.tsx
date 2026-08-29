import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { ArrowRight, FileText, Clock, BookOpen } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";

const articles = [
  { slug: "mental-health-at-work", titleKey: "research.article1.title" as const, summaryKey: "research.article1.summary" as const, categoryKey: "research.article1.category" as const, fallbackTitle: "Mental Health in Sport", fallbackSummary: "How elite athletes manage psychological pressure and build resilience.", fallbackCategory: "Sport Psychology", readTime: "6 min" },
  { slug: "mental-health-at-work", titleKey: "research.article2.title" as const, summaryKey: "research.article2.summary" as const, categoryKey: "research.article2.category" as const, fallbackTitle: "Burnout Prevention", fallbackSummary: "Evidence-based strategies for recognizing and preventing professional burnout.", fallbackCategory: "Workplace", readTime: "5 min" },
  { slug: "understanding-anxiety", titleKey: "research.article3.title" as const, summaryKey: "research.article3.summary" as const, categoryKey: "research.article3.category" as const, fallbackTitle: "Psychological Resilience", fallbackSummary: "Building mental toughness through structured cognitive-behavioral techniques.", fallbackCategory: "Research", readTime: "7 min" },
  { slug: "mindfulness-for-beginners", titleKey: "research.article4.title" as const, summaryKey: "research.article4.summary" as const, categoryKey: "research.article4.category" as const, fallbackTitle: "Mindfulness in Practice", fallbackSummary: "How short, daily attention exercises rewire stress responses.", fallbackCategory: "Wellness", readTime: "4 min" },
  { slug: "understanding-depression", titleKey: "research.article5.title" as const, summaryKey: "research.article5.summary" as const, categoryKey: "research.article5.category" as const, fallbackTitle: "Understanding Depression", fallbackSummary: "Recognising the signs and what evidence-based treatment looks like.", fallbackCategory: "Mental Health", readTime: "6 min" },
  { slug: "how-to-support-a-loved-one", titleKey: "research.article6.title" as const, summaryKey: "research.article6.summary" as const, categoryKey: "research.article6.category" as const, fallbackTitle: "Supporting a Loved One", fallbackSummary: "What to say, what to avoid, and how to stay present without burning out.", fallbackCategory: "Guide", readTime: "5 min" },
];

const ResearchSection = () => {
  const { t } = useLocale();

  return (
    <section className="section-spacing liquid-bg">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Research & Insights
            </div>
            <h2 className="text-h2 mb-4">{t("research.title") || "Mental Health Insights"}</h2>
            <p className="text-body text-muted-foreground">
              {t("research.subtitle") || "Research-backed articles and clinical insights from the U.Psy team — read in five minutes, apply for a lifetime."}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.1}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {articles.map((article) => (
              <StaggerItem key={article.fallbackTitle}>
                <Link to={`/blog/${article.slug}`} className="glass-card p-7 h-full flex flex-col group transition-all hover:border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-xs text-primary font-medium">{t(article.categoryKey) || article.fallbackCategory}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{t(article.titleKey) || article.fallbackTitle}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{t(article.summaryKey) || article.fallbackSummary}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                    {t("research.readMore") || "Read more"} <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <div className="text-center mt-10">
          <Button variant="secondary" size="lg" asChild>
            <Link to="/blog" className="inline-flex items-center gap-2">
              {t("research.cta") || "Browse all articles"} <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ResearchSection;
