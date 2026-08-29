import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "@/lib/router-compat";
import { Sparkles, X } from "lucide-react";
import { FilterState } from "@/types/psychologist";
import { usePsychologists } from "@/hooks/usePsychologists";
import { PsychologistFilters } from "@/components/psychologists/PsychologistFilters";
import { PsychologistCard } from "@/components/psychologists/PsychologistCard";
import { PsychologistCardSkeleton } from "@/components/psychologists/PsychologistCardSkeleton";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import ScrollReveal from "@/components/ScrollReveal";
import MaroonDivider from "@/components/ui/maroon-divider";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Users, Search, Shield, Globe, FlaskConical, SlidersHorizontal, BarChart3 } from "lucide-react";
import { ClipboardCheck, MessageCircle, CalendarCheck, Repeat, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import SEOHead from "@/components/SEOHead";

const Psychologists = () => {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const pillar = searchParams.get("pillar");
  const source = searchParams.get("source");
  const pillarQ = searchParams.get("q") || "";

  // Pillar → filter presets (specialties + therapy approaches).
  const PILLAR_FILTERS: Record<string, { specialties: string[]; therapyApproaches: string[] }> = {
    focus:      { specialties: [],                                               therapyApproaches: ["CBT", "Mindfulness"] },
    regulation: { specialties: ["Anxiety & Stress", "Anger Management"],         therapyApproaches: ["CBT", "ACT", "DBT"] },
    recovery:   { specialties: ["Sleep Disorders", "Burnout"],                   therapyApproaches: ["Mindfulness", "CBT"] },
    meaning:    { specialties: ["Grief & Loss", "Couples Therapy", "Family Therapy"], therapyApproaches: ["Humanistic", "ACT"] },
  };

  const [filters, setFilters] = useState<FilterState>({
    specialties: [],
    languages: [],
    therapyApproaches: [],
    city: "",
    online: false,
    inPerson: false,
    gender: "",
    availability: "",
    minPrice: 0,
    maxPrice: 2000,
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (pillarQ && !searchQuery) setSearchQuery(pillarQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillarQ]);

  // Seed filters from pillar score presets (only when user hasn't tweaked yet).
  useEffect(() => {
    if (!pillar) return;
    const preset = PILLAR_FILTERS[pillar];
    if (!preset) return;
    setFilters((prev) =>
      prev.specialties.length === 0 && prev.therapyApproaches.length === 0
        ? { ...prev, specialties: preset.specialties, therapyApproaches: preset.therapyApproaches }
        : prev
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillar]);

  const pillarBanner = useMemo(() => {
    if (!pillar) return null;
    const map: Record<string, { title: string; body: string }> = {
      focus: {
        title: "Matched for your Focus results",
        body: "Showing psychologists trained in attention protocols, performance coaching, and ADHD support.",
      },
      regulation: {
        title: "Matched for your Emotional Regulation results",
        body: "Showing psychologists trained in anxiety, CBT, ACT, and rumination-focused work.",
      },
      recovery: {
        title: "Matched for your Recovery & Energy results",
        body: "Showing psychologists trained in CBT-I for sleep, burnout recovery, and nervous-system regulation.",
      },
      meaning: {
        title: "Matched for your Meaning & Connection results",
        body: "Showing psychologists trained in values-based (ACT), relational, and existential work.",
      },
    };
    return map[pillar] || null;
  }, [pillar]);

  const clearPillar = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("pillar");
    next.delete("q");
    next.delete("source");
    setSearchParams(next, { replace: true });
    setSearchQuery("");
    setFilters((prev) => ({ ...prev, specialties: [], therapyApproaches: [] }));
  };

  const { data, isLoading } = usePsychologists({ filters, page, pageSize: 12 });
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const filteredProfiles = data?.profiles.filter((p) =>
    searchQuery ? p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const activeFilterCount = [
    filters.specialties.length > 0,
    filters.languages.length > 0,
    filters.therapyApproaches.length > 0,
    filters.city !== "",
    filters.online,
    filters.inPerson,
    filters.gender !== "",
    filters.availability !== "",
    filters.minPrice > 0 || filters.maxPrice < 2000,
  ].filter(Boolean).length;

  const itemListJsonLd = filteredProfiles && filteredProfiles.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Accredited Psychologists on U.Psy",
    itemListElement: filteredProfiles.slice(0, 20).map((p: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://upsy.ma/psychologists/${p.slug || p.id}`,
      name: p.full_name,
    })),
  } : undefined;

  return (
    <div className="min-h-screen">
      <SEOHead
        path="/psychologists"
        title="Find a Psychologist in Morocco — U.Psy Directory"
        description="Browse accredited psychologists in Morocco. Filter by specialty, language, city, and approach. Online and in-person sessions available."
        jsonLd={itemListJsonLd}
      />
      {/* Hero Section */}
      <section className="hero-neural-bg relative py-20">
        <div className="container-custom relative z-10">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-display leading-tight">
                {t('psychologists.pageTitle')} <span className="text-u-gold">{t('psychologists.pageTitleHighlight')}</span> {t('psychologists.pageTitleEnd')}
              </h1>
              <p className="text-body text-u-gray-200 max-w-xl mx-auto">
                {t('psychologists.pageSubtitle')}
              </p>

              {/* Search Bar */}
              <div className="max-w-lg mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-u-gray-400" />
                  <Input
                    placeholder={t('psychologists.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base"
                  />
                </div>
              </div>

              {/* Hero CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Button variant="primary" size="lg" asChild>
                  <Link to="/get-matched">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t('psychologists.takeSelfAssessment')}
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
                  {t('psychologists.browsePsychologists')}
                </Button>
              </div>

              {/* Trust Strip */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                {[
                  { icon: Shield, label: t('psychologists.licensedVerified') },
                  { icon: Globe, label: t('psychologists.onlineInPerson') },
                  { icon: FlaskConical, label: t('hero.evidenceBasedCare') },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-u-gold" />
                    <span className="text-xs text-u-gray-300 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MaroonDivider />

      {/* How to find the right psychologist */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-h2">How to find the right psychologist</h2>
              <p className="text-body text-u-gray-300 max-w-2xl mx-auto">
                Choosing well matters more than choosing fast. Four steps we recommend to every client — whether you book here or elsewhere.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: ClipboardCheck,
                step: "01",
                title: "Name the goal, not just the pain",
                body: "Write one sentence: what would be different in your life 3 months from now? Anxiety relief, decision clarity, sleep, performance, a specific relationship. This filters 80% of the directory.",
              },
              {
                icon: Search,
                step: "02",
                title: "Match the method to the goal",
                body: "CBT for anxiety and thought loops. Schema/psychodynamic for recurring relationship patterns. EMDR for trauma. Performance psychology for competition, focus, decision-load. Filter by approach, not just city.",
              },
              {
                icon: MessageCircle,
                step: "03",
                title: "Use the first session as an interview",
                body: "You are hiring a specialist. Ask: how do you work, what does progress look like, when would you refer me out. If you don't feel safe, curious, or respected — it's not the right fit.",
              },
              {
                icon: Repeat,
                step: "04",
                title: "Give it 3 sessions, then decide",
                body: "Rapport is real data. If after three sessions you don't feel movement or a working alliance, rebook with someone else. On U.Psy the first rebook is free — that's the guarantee.",
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-6 space-y-3">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.3)' }}>
                    <item.icon className="w-5 h-5 text-u-gold" />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-u-gold tracking-widest mb-1">{item.step}</div>
                    <h3 className="text-h4 mb-2">{item.title}</h3>
                    <p className="text-sm text-u-gray-300 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MaroonDivider />

      {/* Inquiry CTA */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <div className="glass-card p-10 md:p-14 max-w-3xl mx-auto text-center">
            <ScrollReveal>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(255,179,0,0.1)', border: '2px solid rgba(255,179,0,0.3)' }}>
                <Mail className="w-8 h-8 text-u-gold" />
              </div>
              <h2 className="text-h2 mb-4">Still not sure who to book?</h2>
              <p className="text-body text-u-gray-300 max-w-xl mx-auto mb-8">
                Tell us your situation in a few lines. Our clinical team responds within 24 hours with 2–3 named recommendations — free, confidential, no obligation.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="primary" size="lg" asChild>
                  <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Send an inquiry</Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/get-matched"><CalendarCheck className="mr-2 h-4 w-4" /> Take the 2-min match</Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <MaroonDivider />

      {/* Main Content */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden mb-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {t('psychologists.filters')}
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-u-gold text-u-charcoal text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0 overflow-y-auto" style={{ background: 'rgba(26,26,26,0.98)', border: 'none' }}>
                <SheetHeader className="p-6 pb-0">
                  <SheetTitle className="text-u-white">{t('psychologists.filterPsychologists')}</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <PsychologistFilters filters={filters} onFiltersChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid lg:grid-cols-[300px_1fr] gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block lg:sticky lg:top-24 h-fit">
              <PsychologistFilters filters={filters} onFiltersChange={setFilters} />
            </aside>

            {/* Psychologists Grid */}
            <div className="space-y-6">
              {pillarBanner && (
                <div className="glass-card p-5 md:p-6 border border-u-gold/30" role="status" aria-live="polite">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(255,179,0,0.12)', border: '1px solid rgba(255,179,0,0.35)' }}>
                      <Sparkles className="w-5 h-5 text-u-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-u-gold mb-1">
                        {source === "free-score" ? "From your Mental Performance Score" : "Matched view"}
                      </div>
                      <h3 className="text-h4 mb-1">{pillarBanner.title}</h3>
                      <p className="text-sm text-u-gray-300">{pillarBanner.body}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearPillar} aria-label="Clear pillar filter">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Results Count */}
              {data && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-u-gray-300">
                    <Search className="w-4 h-4" />
                    <span className="text-sm">
                      {filteredProfiles?.length ?? 0} / {data.total} {t('psychologists.ofPsychologists')}
                    </span>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PsychologistCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && (filteredProfiles?.length ?? 0) === 0 && (
                <div className="glass-card p-12 text-center">
                  <Users className="w-12 h-12 text-u-gray-400 mx-auto mb-4" />
                  <h3 className="text-h3 mb-2">{t('psychologists.noResults')}</h3>
                  <p className="text-u-gray-300 mb-6">{t('psychologists.noResultsDesc')}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="primary" asChild>
                      <Link to="/get-matched">{t('psychologists.getMatchedInstead')}</Link>
                    </Button>
                    <Button variant="secondary" onClick={() => {
                      setSearchQuery("");
                      setFilters({ specialties: [], languages: [], therapyApproaches: [], city: "", online: false, inPerson: false, gender: "", availability: "", minPrice: 0, maxPrice: 2000 });
                    }}>
                      {t('psychologists.clearAllFilters')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Cards Grid */}
              {!isLoading && filteredProfiles && filteredProfiles.length > 0 && (
                <>
                  <StaggerContainer staggerDelay={0.08}>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProfiles.map((psychologist) => (
                        <StaggerItem key={psychologist.id}>
                          <PsychologistCard psychologist={psychologist} />
                        </StaggerItem>
                      ))}
                    </div>
                  </StaggerContainer>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination className="mt-8">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className={`text-u-gray-300 hover:text-u-white ${page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={page === pageNum}
                              className={`cursor-pointer ${page === pageNum ? "text-u-gold border-u-gold" : "text-u-gray-300 hover:text-u-white"}`}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className={`text-u-gray-300 hover:text-u-white ${page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <MaroonDivider />

      {/* Self-Assessment CTA */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <div className="glass-card p-10 md:p-14 max-w-3xl mx-auto text-center">
            <ScrollReveal>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(255,179,0,0.1)', border: '2px solid rgba(255,179,0,0.3)' }}>
                <BarChart3 className="w-8 h-8 text-u-gold" />
              </div>
              <h2 className="text-h2 mb-4">{t('psychologists.notSureTitle')}</h2>
              <p className="text-body text-u-gray-300 max-w-xl mx-auto mb-8">
                {t('psychologists.notSureDesc')}
              </p>
              <Button variant="primary" size="lg" asChild>
                <Link to="/get-matched">{t('psychologists.takeSelfAssessment')}</Link>
              </Button>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Psychologists;