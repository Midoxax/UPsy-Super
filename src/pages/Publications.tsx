import { useQuery } from "@tanstack/react-query";
import { BookOpen, Loader2 } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { usePublicationsCopy } from "@/lib/shop/publicationsCopy";
import SEOHead from "@/components/SEOHead";
import LsspmLogo from "@/components/league/LsspmLogo";
import MyOrders from "@/components/shop/MyOrders";

/** Catalogue of U.Psy booklets, printed and ebook, with LSSPM member prices. */
export default function Publications() {
  const { t, locale } = usePublicationsCopy();
  const loc = useLocalizedField();
  const { data = [], isLoading } = useQuery({
    queryKey: ["publications-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("is_published", true)
        .order("position")
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
  const from = (a: number | null, b: number | null) => {
    const v = [a, b].filter((x): x is number => x != null).map(Number);
    return v.length ? Math.min(...v) : null;
  };

  return (
    <>
      <SEOHead
        path="/publications"
        title={`${t.title} | U.Psy`}
        description={t.subtitle}
      />
      <div className="container-custom py-10 md:py-14 space-y-8">
        <header className="space-y-3 max-w-2xl">
          <h1 className="text-display font-display">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <LsspmLogo className="h-6 w-6" /> {t.memberHint}
          </p>
        </header>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : data.length === 0 ? (
          <p className="text-muted-foreground">{t.none}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => {
              const pub = from(p.price_print, p.price_ebook);
              const mem = from(
                p.price_print_member ?? p.price_print,
                p.price_ebook_member ?? p.price_ebook,
              );
              return (
                <Link
                  key={p.id}
                  to={addLocalePrefix(`/publications/${p.slug}`, locale)}
                  className="group rounded-2xl border border-border bg-surface overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt={loc(p, "title")}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="font-semibold group-hover:text-primary">
                      {loc(p, "title")}
                    </p>
                    {p.author && (
                      <p className="text-xs text-muted-foreground">
                        {t.by(p.author)}
                      </p>
                    )}
                    <p className="text-sm">
                      {[
                        p.price_print != null && t.formats.print,
                        p.price_ebook != null && t.formats.ebook,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {pub != null && (
                      <p className="text-sm">
                        <span className="font-medium">{t.mad(pub)}</span>
                        {mem != null && mem < pub && (
                          <span className="text-primary">
                            {" "}
                            · {t.memberPrice} {t.mad(mem)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <MyOrders />
      </div>
    </>
  );
}
