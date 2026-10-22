import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";

const COPY = {
  en: {
    title: "One email a month",
    body: "Our new articles on mental health and performance. No spam, unsubscribe in one click.",
    placeholder: "Your email",
    cta: "Subscribe",
    done: "Check your inbox to confirm your subscription.",
    error: "That didn't work. Check the address and try again.",
  },
  fr: {
    title: "Un email par mois",
    body: "Nos nouveaux articles sur la santé mentale et la performance. Pas de spam, désinscription en un clic.",
    placeholder: "Votre email",
    cta: "S'inscrire",
    done: "Vérifiez votre boîte mail pour confirmer votre inscription.",
    error: "L'inscription n'a pas fonctionné. Vérifiez l'adresse et réessayez.",
  },
  ar: {
    title: "بريد واحد في الشهر",
    body: "مقالاتنا الجديدة حول الصحة النفسية والأداء. بدون إزعاج، وإلغاء الاشتراك بنقرة.",
    placeholder: "بريدك الإلكتروني",
    cta: "اشترك",
    done: "تحقق من بريدك لتأكيد اشتراكك.",
    error: "لم ينجح الاشتراك. تحقق من العنوان وحاول مجدداً.",
  },
};

/** Newsletter sign-up (double opt-in through the newsletter-subscribe function). */
export default function NewsletterSignup({
  source = "site",
  className = "",
}: {
  source?: string;
  className?: string;
}) {
  const { locale } = useLocale();
  const c = COPY[locale === "en" || locale === "ar" ? locale : "fr"];
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(
    "idle",
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    const { error } = await supabase.functions.invoke("newsletter-subscribe", {
      body: { email, locale, source },
    });
    setState(error ? "error" : "done");
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="font-display text-base text-foreground flex items-center gap-2">
        <Mail className="w-4 h-4 text-primary" />
        {c.title}
      </p>
      <p className="text-sm text-muted-foreground">{c.body}</p>
      {state === "done" ? (
        <p
          className="text-sm text-foreground flex items-start gap-2"
          role="status"
        >
          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          {c.done}
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={c.placeholder}
            aria-label={c.placeholder}
            maxLength={254}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={state === "busy"}
            className="shrink-0"
          >
            {state === "busy" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              c.cta
            )}
          </Button>
        </form>
      )}
      {state === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {c.error}
        </p>
      )}
    </div>
  );
}
