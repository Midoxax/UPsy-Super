import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Link, useLocation } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/content/legal/company";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix, stripLocalePrefix } from "@/lib/i18n/utils";

// Pages where a booking CTA would get in the way: app areas, flows already
// in progress, and the directory itself.
const HIDDEN =
  /^\/(admin|dashboard|my-space|ops|booking|session|auth|intake|apply|psychologists|reset-password|invite|notifications|center|install)(\/|$)/;

/** Phone-only bar with the main action, shown once the hero has scrolled away
 *  and hidden again at the footer so it never covers its links. */
export default function StickyMobileCta() {
  const { locale, t } = useLocale();
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const nearEnd =
        window.innerHeight + window.scrollY >
        document.documentElement.scrollHeight - 320;
      setShow(window.scrollY > 480 && !nearEnd);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (HIDDEN.test(stripLocalePrefix(pathname))) return null;

  return (
    <div
      aria-hidden={!show}
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex gap-2">
        <Button asChild size="lg" className="flex-1" tabIndex={show ? 0 : -1}>
          <Link to={addLocalePrefix("/psychologists", locale)}>
            {t("footer.bookNow")}
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          aria-label="WhatsApp"
          tabIndex={show ? 0 : -1}
        >
          <a
            href={COMPANY.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
