import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import LsspmLogo from "@/components/league/LsspmLogo";
import { LEAGUE_NAME, useMembershipCopy } from "@/lib/league/membershipCopy";

type Check = {
  full_name: string;
  member_number: string;
  category: string;
  plan_fr: string;
  plan_en: string | null;
  plan_ar: string | null;
  valid_until: string;
  valid: boolean;
};

/** Public page behind the QR code of an LSSPM card: genuine and valid today? */
export default function CardVerify() {
  const { token } = useParams();
  const { t, locale } = useMembershipCopy();
  const { data, isLoading } = useQuery({
    queryKey: ["card-verify", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("league_verify", {
        _token: token ?? "",
      });
      if (error) throw error;
      return (data as Check | null) ?? null;
    },
  });
  const plan =
    data &&
    ((locale === "en" && data.plan_en) ||
      (locale === "ar" && data.plan_ar) ||
      data.plan_fr);

  return (
    <>
      <SEOHead path={`/card/${token}`} title={`${t.verifyTitle} | LSSPM`} />
      <div className="container-custom py-12 max-w-md mx-auto space-y-6 text-center">
        <LsspmLogo className="h-20 w-20 mx-auto" />
        <div>
          <h1 className="text-xl font-semibold">{t.verifyTitle}</h1>
          <p className="text-xs text-muted-foreground">{LEAGUE_NAME}</p>
        </div>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        ) : !data ? (
          <p className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
            {t.verifyUnknown}
          </p>
        ) : (
          <div
            className={`rounded-2xl border p-5 space-y-2 ${data.valid ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30" : "border-destructive/50 bg-destructive/5"}`}
          >
            <p className="flex items-center justify-center gap-2 font-semibold">
              {data.valid ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              {data.valid ? t.verifyValid : t.verifyInvalid}
            </p>
            <p className="text-lg font-medium">{data.full_name}</p>
            <p className="font-mono text-sm">{data.member_number}</p>
            <p className="text-sm text-muted-foreground">{plan}</p>
            <p className="text-sm">
              {t.validUntil(
                new Date(data.valid_until).toLocaleDateString(
                  locale === "ar"
                    ? "ar-MA"
                    : locale === "en"
                      ? "en-GB"
                      : "fr-FR",
                ),
              )}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
