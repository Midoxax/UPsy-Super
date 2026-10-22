import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";

const COPY = {
  en: {
    ok: "You're subscribed",
    okBody: "One email a month with our new articles. See you soon.",
    bad: "This link no longer works",
    badBody:
      "It may have been used already. You can subscribe again from any page footer.",
    blog: "Read the blog",
  },
  fr: {
    ok: "Inscription confirmée",
    okBody: "Un email par mois avec nos nouveaux articles. À bientôt.",
    bad: "Ce lien ne fonctionne plus",
    badBody:
      "Il a peut-être déjà servi. Vous pouvez vous réinscrire depuis le bas de n'importe quelle page.",
    blog: "Lire le blog",
  },
  ar: {
    ok: "تم تأكيد اشتراكك",
    okBody: "بريد واحد في الشهر بمقالاتنا الجديدة. إلى اللقاء.",
    bad: "هذا الرابط لم يعد صالحاً",
    badBody: "ربما استُخدم من قبل. يمكنك الاشتراك مجدداً من أسفل أي صفحة.",
    blog: "اقرأ المدونة",
  },
};

export default function NewsletterConfirm() {
  const { locale } = useLocale();
  const c = COPY[locale === "en" || locale === "ar" ? locale : "fr"];
  const [params] = useSearchParams();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const token = params.get("token");
    if (!token) return setOk(false);
    supabase
      .rpc("newsletter_confirm", { p_token: token })
      .then(({ data }) => setOk(!!data));
  }, [params]);

  return (
    <div className="container-custom py-24 flex justify-center">
      <div className="glass-card p-8 max-w-md text-center space-y-4">
        {ok === null ? (
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
        ) : (
          <>
            {ok ? (
              <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
            ) : (
              <XCircle className="w-10 h-10 text-muted-foreground mx-auto" />
            )}
            <h1 className="text-h2">{ok ? c.ok : c.bad}</h1>
            <p className="text-muted-foreground">{ok ? c.okBody : c.badBody}</p>
            <Button asChild variant="primary">
              <Link to={addLocalePrefix("/blog", locale)}>{c.blog}</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
