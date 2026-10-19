import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { Link } from "@/lib/router-compat";
import { addLocalePrefix } from "@/lib/i18n/utils";
import {
  consentEvents,
  getConsent,
  setConsent,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * Asks once for analytics consent; reopened by the footer's "Cookie
 * settings" link. Rendered only after mount: the stored choice lives in
 * localStorage, which the server cannot see, so rendering it during SSR
 * would differ from the first client render.
 */
export function ConsentBanner() {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(getConsent() === null);
    const reopen = () => setOpen(true);
    window.addEventListener(consentEvents.open, reopen);
    return () => window.removeEventListener(consentEvents.open, reopen);
  }, []);

  if (!open) return null;

  const choose = (choice: ConsentChoice) => {
    setConsent(choice);
    setOpen(false);
  };

  return (
    <section
      role="region"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-border bg-background p-5 shadow-2xl">
        <h2 id="consent-title" className="font-semibold text-foreground mb-1">
          {t("consent.title") || "Your privacy"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("consent.body")}{" "}
          <Link
            to={addLocalePrefix("/privacy#cookies", locale)}
            className="inline-block py-1 text-foreground underline underline-offset-2 hover:text-primary"
          >
            {t("consent.learnMore") || "Cookie policy"}
          </Link>
        </p>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => choose("denied")}>
            {t("consent.decline") || "Decline"}
          </Button>
          <Button onClick={() => choose("granted")}>
            {t("consent.accept") || "Accept analytics"}
          </Button>
        </div>
      </div>
    </section>
  );
}
