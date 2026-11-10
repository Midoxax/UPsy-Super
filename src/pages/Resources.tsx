import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { addLocalePrefix } from "@/lib/i18n/utils";
import {
  BookOpen,
  FileText,
  Headphones,
  Video,
  Download,
  ArrowRight,
  Search,
  Clock,
  Star,
  Sparkles,
  Play,
  ExternalLink,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import SEOHead from "@/components/SEOHead";
import {
  useResources,
  useTopics,
  useTrackResource,
  type Resource,
} from "@/hooks/useResources";
import { cn } from "@/lib/utils";

const FORMAT_ICONS: Record<string, any> = {
  article: FileText,
  guide: BookOpen,
  worksheet: Download,
  video: Video,
  audio: Headphones,
  toolkit: Sparkles,
};

const COPY = {
  en: {
    fmt: {
      article: "Article",
      guide: "Guide",
      worksheet: "Worksheet",
      video: "Video",
      audio: "Audio",
      toolkit: "Toolkit",
    } as Record<string, string>,
    general: "General",
    min: "min",
    all: "All",
    articles: "Articles",
    guides: "Guides",
    worksheets: "Worksheets",
    videoChip: "Video",
    audioChip: "Audio",
    seoTitle: "Resources & Mental Health Library | U.Psy",
    seoDescription:
      "Free articles, guides, worksheets, audio and video on anxiety, depression, mindfulness, sport psychology and more.",
    badge: "Resource library",
    title: "Practical tools for your mental performance",
    sub: "Articles, worksheets, audio and video — curated by clinicians, free to use.",
    search: "Search resources...",
    allTopics: "All topics",
    featured: "Featured",
    results: "Results",
    allResources: "All resources",
    loadError: "We couldn't load the resource library just now.",
    retry: "Try again",
    noMatch: "No resources match your filters.",
    clear: "Clear filters",
    ctaTitle: "Want personalized resources?",
    ctaSub:
      "Track your mood, complete daily challenges, and earn XP — we'll recommend the right next steps.",
    ctaBtn: "Create free account",
  },
  fr: {
    fmt: {
      article: "Article",
      guide: "Guide",
      worksheet: "Fiche pratique",
      video: "Vidéo",
      audio: "Audio",
      toolkit: "Boîte à outils",
    } as Record<string, string>,
    general: "Général",
    min: "min",
    all: "Tout",
    articles: "Articles",
    guides: "Guides",
    worksheets: "Fiches pratiques",
    videoChip: "Vidéo",
    audioChip: "Audio",
    seoTitle: "Ressources et bibliothèque santé mentale | U.Psy",
    seoDescription:
      "Articles, guides, fiches pratiques, audios et vidéos gratuits sur l'anxiété, la dépression, la pleine conscience, la psychologie du sport et plus.",
    badge: "Bibliothèque de ressources",
    title: "Des outils concrets pour votre performance mentale",
    sub: "Articles, fiches pratiques, audios et vidéos, sélectionnés par des cliniciens, en accès libre.",
    search: "Rechercher une ressource…",
    allTopics: "Tous les thèmes",
    featured: "À la une",
    results: "Résultats",
    allResources: "Toutes les ressources",
    loadError: "Impossible de charger la bibliothèque pour le moment.",
    retry: "Réessayer",
    noMatch: "Aucune ressource ne correspond à vos filtres.",
    clear: "Effacer les filtres",
    ctaTitle: "Des ressources personnalisées ?",
    ctaSub:
      "Suivez votre humeur, relevez des défis quotidiens et gagnez des points : nous vous recommandons les bonnes étapes suivantes.",
    ctaBtn: "Créer un compte gratuit",
  },
  ar: {
    fmt: {
      article: "مقال",
      guide: "دليل",
      worksheet: "بطاقة عملية",
      video: "فيديو",
      audio: "صوت",
      toolkit: "عدة أدوات",
    } as Record<string, string>,
    general: "عام",
    min: "د",
    all: "الكل",
    articles: "مقالات",
    guides: "أدلة",
    worksheets: "بطاقات عملية",
    videoChip: "فيديو",
    audioChip: "صوت",
    seoTitle: "الموارد ومكتبة الصحة النفسية | U.Psy",
    seoDescription:
      "مقالات وأدلة وبطاقات عملية وتسجيلات صوتية وفيديوهات مجانية عن القلق والاكتئاب واليقظة الذهنية وعلم النفس الرياضي وغيرها.",
    badge: "مكتبة الموارد",
    title: "أدوات عملية لأدائك الذهني",
    sub: "مقالات وبطاقات عملية وتسجيلات صوتية وفيديوهات، يختارها أطباء نفسيون، ومتاحة مجاناً.",
    search: "ابحث عن مورد…",
    allTopics: "كل المواضيع",
    featured: "مميز",
    results: "النتائج",
    allResources: "كل الموارد",
    loadError: "تعذر تحميل المكتبة حالياً.",
    retry: "أعد المحاولة",
    noMatch: "لا توجد موارد تطابق اختياراتك.",
    clear: "امسح الفلاتر",
    ctaTitle: "تريد موارد مخصصة؟",
    ctaSub:
      "تتبّع مزاجك، أنجز تحديات يومية واجمع النقاط: نقترح عليك الخطوات المناسبة.",
    ctaBtn: "أنشئ حساباً مجانياً",
  },
};

function useCopy() {
  const { locale } = useLocale();
  return COPY[locale === "ar" ? "ar" : locale === "en" ? "en" : "fr"];
}

const ResourceCard = ({ resource }: { resource: Resource }) => {
  const Icon = FORMAT_ICONS[resource.format] ?? FileText;
  const track = useTrackResource();
  const c = useCopy();
  const { locale } = useLocale();
  const loc = useLocalizedField();
  const title = loc(resource, "title");
  const summary = loc(resource, "summary");

  const handleClick = () => {
    track.mutate({ resource_id: resource.id, action: "view" });
  };

  const isExternal = resource.content_url?.startsWith("http");
  const href = resource.content_url ?? "#";

  const inner = (
    <Card className="h-full hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
            {resource.category ?? resource.topic_slug ?? c.general}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-sm inline-flex items-center gap-1">
            <Icon className="w-3 h-3" />{" "}
            {c.fmt[resource.format] ?? resource.format}
          </span>
        </div>
        <h3 className="font-semibold text-foreground mb-3 leading-snug min-h-[3rem]">
          {title}
        </h3>
        {summary && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {summary}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {resource.read_minutes ?? "—"} {c.min}
          </span>
          {resource.rating != null && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {resource.rating.toFixed(1)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!resource.content_url) {
    return <div onClick={handleClick}>{inner}</div>;
  }

  return isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      {inner}
    </a>
  ) : (
    <Link to={addLocalePrefix(href, locale)} onClick={handleClick}>
      {inner}
    </Link>
  );
};

const Resources = () => {
  const c = useCopy();
  const loc = useLocalizedField();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);

  const { data: topics = [] } = useTopics();
  const {
    data: resources = [],
    isLoading,
    isError,
    refetch,
  } = useResources({
    search: search || null,
    topic,
    format,
  });

  const featured = resources.filter((r) => r.is_featured);
  const formatCounts = resources.reduce<Record<string, number>>((acc, r) => {
    acc[r.format] = (acc[r.format] ?? 0) + 1;
    return acc;
  }, {});

  const formatChips = [
    { value: null, label: c.all, icon: Sparkles },
    { value: "article", label: c.articles, icon: FileText },
    { value: "guide", label: c.guides, icon: BookOpen },
    { value: "worksheet", label: c.worksheets, icon: Download },
    { value: "video", label: c.videoChip, icon: Video },
    { value: "audio", label: c.audioChip, icon: Headphones },
  ];

  return (
    <>
      <SEOHead
        title={c.seoTitle}
        description={c.seoDescription}
        path="/resources"
      />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary/10 via-background to-primary/10 py-16 lg:py-20">
          <div className="container-custom text-center max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                {c.badge}
              </div>
              <h1 className="text-h1 text-foreground mb-6">{c.title}</h1>
              <p className="text-h3 text-muted-foreground mb-8 max-w-2xl mx-auto">
                {c.sub}
              </p>
              <div className="flex items-center gap-3 max-w-xl mx-auto bg-card border border-border rounded-xl p-2">
                <Search className="w-5 h-5 text-muted-foreground ml-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={c.search}
                  className="flex-1 bg-transparent border-none outline-hidden text-foreground placeholder:text-muted-foreground py-2"
                />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Format chips */}
        <section className="border-y border-border bg-card/40 py-5">
          <div className="container-custom flex flex-wrap gap-2 justify-center">
            {formatChips.map((f) => {
              const active = format === f.value;
              const Icon = f.icon;
              return (
                <button
                  key={f.label}
                  onClick={() => setFormat(f.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-colors inline-flex items-center gap-1.5",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                  {f.value && formatCounts[f.value] != null && (
                    <span className="text-[10px] opacity-70">
                      ({formatCounts[f.value]})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Topics */}
        {topics.length > 0 && (
          <section className="py-6">
            <div className="container-custom flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setTopic(null)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  !topic
                    ? "border-secondary bg-secondary/10 text-secondary dark:text-rose-300"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {c.allTopics}
              </button>
              {topics.map((tp) => (
                <button
                  key={tp.slug}
                  onClick={() => setTopic(tp.slug)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors inline-flex items-center gap-1",
                    topic === tp.slug
                      ? "border-secondary bg-secondary/10 text-secondary dark:text-rose-300"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tp.icon && <span>{tp.icon}</span>}
                  {loc(tp, "name")}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Featured */}
        {!search && !topic && !format && featured.length > 0 && (
          <section className="container-custom section-spacing">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-h2 text-foreground">{c.featured}</h2>
              </div>
            </ScrollReveal>
            <StaggerContainer staggerDelay={0.06}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((r) => (
                  <StaggerItem key={r.id}>
                    <ResourceCard resource={r} />
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </section>
        )}

        {/* All resources */}
        <section className="container-custom pb-20">
          <ScrollReveal>
            <h2 className="text-h2 text-foreground mb-6">
              {search || topic || format ? c.results : c.allResources}
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({resources.length})
              </span>
            </h2>
          </ScrollReveal>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          ) : isError ? (
            // A failed fetch is not an empty library. Rendering "no resources
            // match your filters" for a backend error sent visitors hunting for
            // a filter to clear while every resource was actually unreachable.
            <div className="text-center py-16 glass-card" role="alert">
              <p className="text-muted-foreground mb-4">{c.loadError}</p>
              <Button variant="ghost" onClick={() => void refetch()}>
                {c.retry}
              </Button>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <p className="text-muted-foreground mb-4">{c.noMatch}</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setTopic(null);
                  setFormat(null);
                }}
              >
                {c.clear}
              </Button>
            </div>
          ) : (
            <StaggerContainer staggerDelay={0.04}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((r) => (
                  <StaggerItem key={r.id}>
                    <ResourceCard resource={r} />
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          )}
        </section>

        {/* CTA */}
        <section className="container-custom pb-20 text-center">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto glass-card p-8">
              <h2 className="text-h2 text-foreground mb-4">{c.ctaTitle}</h2>
              <p className="text-body text-muted-foreground mb-6">{c.ctaSub}</p>
              <Button size="lg" variant="default" asChild>
                <Link to="/auth" className="inline-flex items-center gap-2">
                  {c.ctaBtn} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </section>
      </main>
    </>
  );
};

export default Resources;
