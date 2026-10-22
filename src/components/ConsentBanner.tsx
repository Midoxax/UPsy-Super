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
      className="fixed inset-x-0 bottom-0 z-50 p-2 sm:p-6 pointer-events-none"
    >
      {/* Compact on phones: it used to cover the hero and its buttons. */}
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-border bg-background p-3 sm:p-5 shadow-2xl">
        <h2
          id="consent-title"
          className="sr-only sm:not-sr-only sm:mb-1 sm:block font-semibold text-foreground"
        >
          {t("consent.title") || "Your privacy"}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t("consent.body")}{" "}
          <Link
            to={addLocalePrefix("/privacy#cookies", locale)}
            className="inline-block text-foreground underline underline-offset-2 hover:text-primary"
          >
            {t("consent.learnMore") || "Cookie policy"}
          </Link>
        </p>
        <div className="mt-2 sm:mt-4 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button variant="outline" size="sm" onClick={() => choose("denied")}>
            {t("consent.decline") || "Decline"}
          </Button>
          <Button
            size="sm"
            className="h-auto min-h-9 whitespace-normal"
            onClick={() => choose("granted")}
          >
            {t("consent.accept") || "Accept analytics"}
          </Button>
        </div>
      </div>
    </section>
  );
}
