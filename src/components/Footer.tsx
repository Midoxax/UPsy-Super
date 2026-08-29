import { Link } from "@/lib/router-compat";
import { Youtube, Linkedin, Instagram, Heart } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import logoAsset from "@/assets/upsy-logo.png.asset.json";

const Footer = () => {
  const { locale, t } = useLocale();

  const columns = [
    {
      title: t('header.platform'),
      links: [
        { name: t('nav.findPsychologist'), href: "/psychologists" },
        { name: t('nav.programs'), href: "/services" },
        { name: t('nav.pricing') || "Pricing", href: "/pricing" },
        { name: t('nav.learning'), href: "/resources" },
        { name: t('nav.research'), href: "/talent-innovation-hub" },
      ],
    },
    {
      title: t('header.resources'),
      links: [
        { name: t('header.selfAssessment'), href: "/get-matched" },
        { name: t('assessments.labTitle') || "Assessment Lab", href: "/assessments" },
        { name: t('nav.blog'), href: "/blog" },
        { name: t('founder.navLabel') || "Founder", href: "/founder" },
        { name: "L'Observatoire U.Psy", href: "/observatoire" },
        { name: t('whyUs.navLabel') || "Why U.Psy", href: "/why-us" },
        { name: t('nav.contact'), href: "/contact" },
        { name: t('nav.applyAccreditation') || "Apply", href: "/apply" },
        { name: "Specialist pricing", href: "/pricing-specialists" },
      ],
    },
    {
      title: t('header.legal'),
      links: [
        { name: t('header.privacyTerms'), href: "/legal" },
        { name: t('header.ethics'), href: "/legal" },
        { name: t('header.telehealthSecurity'), href: "/legal" },
      ],
    },
  ];

  const socials = [
    { icon: Youtube, href: "https://www.youtube.com/@UPsy-psychology", label: "U.Psy on YouTube" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/upsy-psychology", label: "U.Psy on LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/upsy.psychology", label: "U.Psy on Instagram" },
  ];

  return (
    <footer className="glass-effect border-t border-border/50">
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
              <img src={logoAsset.url} alt="U.Psy logo" className="h-10 lg:h-12 w-auto max-w-[40px] lg:max-w-[48px] object-contain dark:brightness-110" />
              <span className="text-muted-foreground text-xs font-sans">by Mehdi Felji</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm font-sans">
              {t('footer.strapline') || 'A modern mental-health platform combining psychological care, education, and performance support.'}
            </p>

            <div className="space-y-2.5 text-sm mb-6 font-sans">
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">{t('footer.email')}:</span>{" "}
                <a href="mailto:mypersonalpsychologist212@gmail.com" className="hover:text-primary transition-colors">
                  mypersonalpsychologist212@gmail.com
                </a>
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">{t('footer.whatsapp')}:</span>{" "}
                {/* text-foreground, not text-primary: --primary is gold in light
                    mode, which lands at 1.74:1 on the ivory background. */}
                <a href="https://wa.me/212668594699" className="text-foreground hover:text-primary hover:underline font-mono tabular-nums" target="_blank" rel="noopener noreferrer">
                  +212 668-594699
                </a>
              </p>
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label={s.label}
                >
                  <s.icon size={18} />
                </a>
              ))}
              <a
                href="https://www.tiktok.com/@upsy.psychology"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="U.Psy on TikTok"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h3 className="text-foreground font-display text-base tracking-wide mb-4">{col.title}</h3>
              <div className="space-y-2.5">
                {col.links.map((link) => (
                  <Link
                    key={link.name}
                    to={addLocalePrefix(link.href, locale)}
                    className="text-muted-foreground hover:text-primary text-sm block transition-colors font-sans"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Language Switcher Column */}
          <div className="lg:col-span-2">
            <h3 className="text-foreground font-display text-base tracking-wide mb-4">Language</h3>
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
              <strong className="text-destructive">⚠ Important:</strong> {t('footer.crisis') || 'If you are in immediate danger, please call emergency services. U.Psy is not a crisis service.'}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs font-sans">
            © <span className="font-mono tabular-nums">{new Date().getFullYear()}</span> U.Psy by Mehdi Felji. {t('header.copyright') || 'All rights reserved.'}
          </p>
          <p className="text-muted-foreground text-xs flex items-center gap-1 font-sans">
            Made with <Heart className="w-3 h-3 text-secondary fill-secondary" /> in Morocco — serving clients worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
