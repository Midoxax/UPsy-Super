import NewsletterSignup from "@/components/NewsletterSignup";
import { Link } from "@/lib/router-compat";
import { openConsentSettings } from "@/lib/consent";
import { Heart } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";
import { COMPANY } from "@/content/legal/company";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import UpsyLogo from "@/components/UpsyLogo";

const Footer = () => {
  const { locale, t } = useLocale();

  const columns = [
    {
      title: t("header.platform"),
      links: [
        { name: t("nav.findPsychologist"), href: "/psychologists" },
        { name: t("nav.programs"), href: "/services" },
        { name: t("nav.pricing") || "Pricing", href: "/pricing" },
        { name: t("nav.learning"), href: "/resources" },
        { name: t("nav.research"), href: "/talent-innovation-hub" },
      ],
    },
    {
      title: t("header.resources"),
      links: [
        { name: t("header.selfAssessment"), href: "/get-matched" },
        {
          name: t("assessments.labTitle") || "Assessment Lab",
          href: "/assessments",
        },
        { name: t("nav.blog"), href: "/blog" },
        { name: t("founder.navLabel") || "Founder", href: "/founder" },
        { name: "L'Observatoire U.Psy", href: "/observatoire" },
        { name: "Soleterre (schools)", href: "/soleterre" },
        { name: t("whyUs.navLabel") || "Why U.Psy", href: "/why-us" },
        { name: t("nav.contact"), href: "/contact" },
        { name: t("nav.applyAccreditation") || "Apply", href: "/apply" },
        { name: "Specialist pricing", href: "/pricing-specialists" },
      ],
    },
    {
      title: t("header.legal"),
      links: [
        { name: t("header.privacyTerms"), href: "/legal#documents" },
        { name: t("header.ethics"), href: "/legal#ethics" },
        { name: t("header.telehealthSecurity"), href: "/legal#telehealth" },
        {
          name: t("menu.pitch"),
          href: "/pitch",
        },
        {
          name:
            locale === "en" ? "Press" : locale === "ar" ? "الصحافة" : "Presse",
          href: "/press",
        },
        {
          name:
            locale === "en"
              ? "Site map"
              : locale === "ar"
                ? "خريطة الموقع"
                : "Plan du site",
          href: "/explore",
        },
      ],
    },
  ];

  return (
    <footer className="glass-effect border-t border-border/50">
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
              <UpsyLogo className="h-10 lg:h-12 dark:brightness-110" />
              <span className="text-muted-foreground text-xs font-sans">
                by Mehdi Felji
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm font-sans">
              {t("footer.strapline") ||
                "A modern mental-health platform combining psychological care, education, and performance support."}
            </p>

            <div className="space-y-2.5 text-sm mb-6 font-sans">
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">
                  {t("footer.email")}:
                </span>{" "}
                <a
                  href="mailto:contact@upsy.ma"
                  className="hover:text-primary transition-colors"
                >
                  contact@upsy.ma
                </a>
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">
                  {t("footer.whatsapp")}:
                </span>{" "}
                {/* text-foreground, not text-primary: --primary is gold in light
                    mode, which lands at 1.74:1 on the ivory background. */}
                <a
                  href={COMPANY.whatsappHref}
                  className="text-foreground hover:text-primary hover:underline font-mono tabular-nums"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {COMPANY.phone}
                </a>
              </p>
              <address className="text-muted-foreground not-italic">
                <span className="text-foreground font-medium">
                  {t("footer.address")}:
                </span>{" "}
                {COMPANY.address.join(", ")}
              </address>
            </div>

            {/* Social */}
            <SocialLinks />
            <NewsletterSignup source="footer" className="pt-4" />
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h3 className="text-foreground font-display text-base tracking-wide mb-4">
                {col.title}
              </h3>
              <div className="space-y-0.5">
                {col.links.map((link) => (
                  <Link
                    key={link.name}
                    to={addLocalePrefix(link.href, locale)}
                    className="text-muted-foreground hover:text-primary text-sm block py-1 transition-colors font-sans"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Language Switcher Column */}
          <div className="lg:col-span-2">
            <h3 className="text-foreground font-display text-base tracking-wide mb-4">
              Language
            </h3>
            <LanguageSwitcher compact />
          </div>
        </div>

        {/* Crisis Notice */}
        <div className="mt-10 pt-6 border-t border-border/40">
          <div className="glass-card !p-4 !shadow-none !transform-none hover:!transform-none text-center">
            <p className="text-muted-foreground text-xs">
              {/* Crisis guidance must never be the least readable text on the
                  page — gold on ivory measured 1.74:1. destructive is both
                  semantically right and high-contrast in either theme. */}
              <strong className="text-destructive dark:text-red-300">
                ⚠ Important:
              </strong>{" "}
              {t("footer.crisis") ||
                "If you are in immediate danger, please call emergency services. U.Psy is not a crisis service."}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs font-sans">
            ©{" "}
            <span className="font-mono tabular-nums">
              {new Date().getFullYear()}
            </span>{" "}
            <UpsyLogo className="h-[1.1em]" /> by Mehdi Felji.{" "}
            {t("header.copyright") || "All rights reserved."}{" "}
            <button
              type="button"
              onClick={openConsentSettings}
              className="inline-flex min-h-10 items-center sm:min-h-0 sm:py-1 underline hover:text-primary"
            >
              {t("consent.settings") || "Cookie settings"}
            </button>
          </p>
          <p className="text-muted-foreground text-xs flex items-center gap-1 font-sans">
            Made with{" "}
            <Heart className="w-3 h-3 text-secondary fill-secondary" /> in
            Morocco — serving clients worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
