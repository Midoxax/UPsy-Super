import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import {
  BookOpen, FileText, Headphones, Video, Download, ArrowRight,
  Search, Clock, Star, Sparkles, Play, ExternalLink,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import SEOHead from "@/components/SEOHead";
import { useResources, useTopics, useTrackResource, type Resource } from "@/hooks/useResources";
import { cn } from "@/lib/utils";

const FORMAT_ICONS: Record<string, any> = {
  article: FileText,
  guide: BookOpen,
  worksheet: Download,
  video: Video,
  audio: Headphones,
  toolkit: Sparkles,
};

const FORMAT_LABELS: Record<string, string> = {
  article: "Article",
  guide: "Guide",
  worksheet: "Worksheet",
  video: "Video",
  audio: "Audio",
  toolkit: "Toolkit",
};

const ResourceCard = ({ resource }: { resource: Resource }) => {
  const Icon = FORMAT_ICONS[resource.format] ?? FileText;
  const track = useTrackResource();

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
            {resource.category ?? resource.topic_slug ?? "General"}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-sm inline-flex items-center gap-1">
            <Icon className="w-3 h-3" /> {FORMAT_LABELS[resource.format]}
          </span>
        </div>
        <h3 className="font-semibold text-foreground mb-3 leading-snug min-h-[3rem]">
          {resource.title}
        </h3>
        {resource.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{resource.summary}</p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {resource.read_minutes ?? "—"} min
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {resource.rating?.toFixed(1) ?? "4.7"}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (!resource.content_url) {
    return <div onClick={handleClick}>{inner}</div>;
  }

  return isExternal ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
      {inner}
    </a>
  ) : (
    <Link to={href} onClick={handleClick}>
      {inner}
    </Link>
  );
};

const Resources = () => {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);

  const { data: topics = [] } = useTopics();
  const { data: resources = [], isLoading } = useResources({
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
    { value: null, label: "All", icon: Sparkles },
    { value: "article", label: "Articles", icon: FileText },
    { value: "guide", label: "Guides", icon: BookOpen },
    { value: "worksheet", label: "Worksheets", icon: Download },
    { value: "video", label: "Video", icon: Video },
    { value: "audio", label: "Audio", icon: Headphones },
  ];

  return (
    <>
      <SEOHead
        title="Resources & Mental Health Library | U.Psy"
        description="Free articles, guides, worksheets, audio and video on anxiety, depression, mindfulness, sport psychology and more."
        path="/resources"
      />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary/10 via-background to-primary/10 py-16 lg:py-20">
          <div className="container-custom text-center max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                Resource library
              </div>
              <h1 className="text-h1 text-foreground mb-6">
                Practical tools for your mental performance
              </h1>
              <p className="text-h3 text-muted-foreground mb-8 max-w-2xl mx-auto">
                Articles, worksheets, audio and video — curated by clinicians, free to use.
              </p>
              <div className="flex items-center gap-3 max-w-xl mx-auto bg-card border border-border rounded-xl p-2">
                <Search className="w-5 h-5 text-muted-foreground ml-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search resources..."
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
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                  {f.value && formatCounts[f.value] != null && (
                    <span className="text-[10px] opacity-70">({formatCounts[f.value]})</span>
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
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                All topics
              </button>
              {topics.map((tp) => (
                <button
                  key={tp.slug}
                  onClick={() => setTopic(tp.slug)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors inline-flex items-center gap-1",
                    topic === tp.slug
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tp.icon && <span>{tp.icon}</span>}
                  {tp.name}
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
                <h2 className="text-h2 text-foreground">Featured</h2>
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
              {search || topic || format ? "Results" : "All resources"}
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({resources.length})
              </span>
            </h2>
          </ScrollReveal>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <p className="text-muted-foreground mb-4">No resources match your filters.</p>
              <Button variant="ghost" onClick={() => { setSearch(""); setTopic(null); setFormat(null); }}>
                Clear filters
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
              <h2 className="text-h2 text-foreground mb-4">Want personalized resources?</h2>
              <p className="text-body text-muted-foreground mb-6">
                Track your mood, complete daily challenges, and earn XP — we'll recommend the right next steps.
              </p>
              <Button size="lg" variant="default" asChild>
                <Link to="/auth" className="inline-flex items-center gap-2">
                  Create free account <ArrowRight className="w-4 h-4" />
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