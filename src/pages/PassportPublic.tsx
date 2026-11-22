import { useQuery } from "@tanstack/react-query";
import { useParams } from "@/lib/router-compat";
import { withLogo } from "@/components/UpsyLogo";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Loader2, Printer, ShieldCheck } from "lucide-react";
import LsspmLogo from "@/components/league/LsspmLogo";
import { PASSPORT_KINDS, usePassportCopy } from "@/lib/passport/passportCopy";

type PublicEntry = {
  kind: string;
  title: string;
  organization: string | null;
  role: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  url: string | null;
  doi: string | null;
  status: string;
  validated_at: string | null;
};
type PublicPassport = {
  full_name: string | null;
  avatar_url: string | null;
  issued_at: string;
  upsy_accredited: boolean;
  league: { member_number: string; since: string; until: string } | null;
  certificates: {
    title: string;
    number: string;
    issued_at: string;
    cpd_hours: number | null;
  }[];
  entries: PublicEntry[];
};

/** A psychologist's passport as shown through a share link (printable). */
export default function PassportPublic() {
  const { token } = useParams();
  const { t, locale } = usePassportCopy();
  const { data, isLoading } = useQuery({
    queryKey: ["passport-public", token],
    enabled: !!token,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("passport_public", {
        _token: token!,
      });
      if (error) throw error;
      return data as unknown as PublicPassport | null;
    },
  });
  const date = (d: string) =>
    new Date(d).toLocaleDateString(
      locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR",
      { day: "numeric", month: "long", year: "numeric" },
    );
  const years = (e: PublicEntry) => {
    const a = e.start_date?.slice(0, 4);
    const b = e.end_date?.slice(0, 4);
    return a && b && a !== b ? `${a}–${b}` : (a ?? b ?? "");
  };

  return (
    <>
      <SEOHead path={`/passport/${token}`} title={`${t.pubTitle} | U.Psy`} />
      <main className="container-custom max-w-3xl py-10 space-y-8 print:py-0">
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        ) : !data ? (
          <p className="text-center text-muted-foreground py-20">
            {t.pubInvalid}
          </p>
        ) : (
          <>
            <header className="flex flex-wrap items-center gap-5 border-b pb-6">
              {data.avatar_url && (
                <img
                  src={data.avatar_url}
                  alt={data.full_name ?? ""}
                  className="h-20 w-20 rounded-full object-cover"
                />
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t.pubTitle}
                </p>
                <h1 className="text-3xl font-display">{data.full_name}</h1>
                {data.upsy_accredited && (
                  <p className="text-sm flex items-center gap-1 text-primary">
                    <ShieldCheck className="h-4 w-4" /> {t.pubAccredited}
                  </p>
                )}
                {data.league && (
                  <p className="text-sm">
                    {withLogo(t.pubMember(data.league.member_number))}
                  </p>
                )}
              </div>
              {data.league && <LsspmLogo className="h-20 w-20" />}
            </header>

            {PASSPORT_KINDS.filter((k) =>
              data.entries.some((e) => e.kind === k),
            ).map((k) => (
              <section key={k} className="space-y-3">
                <h2 className="text-lg font-semibold">{t.kinds[k]}</h2>
                <ul className="space-y-3">
                  {data.entries
                    .filter((e) => e.kind === k)
                    .map((e, i) => (
                      <li key={i} className="space-y-0.5">
                        <p className="font-medium">
                          {e.title}
                          {years(e) && (
                            <span className="ms-2 text-sm text-muted-foreground">
                              {years(e)}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {[e.organization, e.role, e.location]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {e.description && (
                          <p className="text-sm">{e.description}</p>
                        )}
                        {(e.url || e.doi) && (
                          <p className="text-xs break-all">
                            {e.url && (
                              <a
                                href={e.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                              >
                                {e.url}
                              </a>
                            )}
                            {e.doi && ` DOI ${e.doi}`}
                          </p>
                        )}
                        {e.status === "validated" && e.validated_at && (
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {withLogo(t.pubValidated(date(e.validated_at)))}
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
              </section>
            ))}

            {data.certificates.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">{t.pubCerts}</h2>
                <ul className="space-y-1 text-sm">
                  {data.certificates.map((c) => (
                    <li key={c.number}>
                      {c.title}
                      {c.cpd_hours ? ` · ${c.cpd_hours} h` : ""}
                      <span className="ms-2 text-xs text-muted-foreground">
                        {c.number} · {date(c.issued_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <footer className="border-t pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{t.pubIssued(date(data.issued_at))}</span>
              <Button
                size="sm"
                variant="outline"
                className="print:hidden"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 me-1" /> {t.print}
              </Button>
            </footer>
          </>
        )}
      </main>
    </>
  );
}
