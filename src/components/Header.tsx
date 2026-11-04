import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Menu, X, User, ChevronDown, LogOut, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix, stripLocalePrefix } from "@/lib/i18n/utils";
import UpsyLogo from "@/components/UpsyLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import InstallAppButton from "@/components/pwa/InstallAppButton";
import ViewAsSwitcher from "@/components/ViewAsSwitcher";
import { getNav, type NavSection } from "@/components/nav/siteNav";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();
  const nav = getNav(locale);
  const to = (href: string) => addLocalePrefix(href, locale);

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenSection(null);
  };

  const handleSignOut = async () => {
    closeMenu();
    await signOut();
    navigate(addLocalePrefix("/auth", locale));
  };

  // Scroll-aware glass header: light over hero, solid after scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation closes the menu.
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // Open menu: lock the page behind it, close on Escape.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isMobileMenuOpen]);

  // Build a redirect-aware /auth path so post-login returns to current page.
  const authHref = (() => {
    const path = location.pathname + location.search;
    const safe =
      path && !path.startsWith("/auth") && !path.startsWith("/reset-password")
        ? path
        : "";
    const base = addLocalePrefix("/auth", locale);
    return safe ? `${base}?redirect=${encodeURIComponent(safe)}` : base;
  })();

  const isActive = (href: string) => {
    const strippedPath = stripLocalePrefix(location.pathname);
    const bare = href.split("?")[0];
    if (bare === "/") return strippedPath === "/";
    return strippedPath === bare || strippedPath.startsWith(bare + "/");
  };
  const sectionActive = (s: NavSection) =>
    isActive(s.href) || s.items.some((i) => isActive(i.href));

  const toggleMenu = () => {
    if (isMobileMenuOpen) return closeMenu();
    // Open on the section the visitor is in, so they see where they are.
    setOpenSection(nav.sections.find(sectionActive)?.id ?? null);
    setIsMobileMenuOpen(true);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ${
        isMobileMenuOpen
          ? "bg-background border-b border-border shadow-lg"
          : scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border/80 shadow-md"
            : "bg-background/60 backdrop-blur-md border-b border-border/20"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            aria-label={t("menu.homeAria")}
            className="flex items-center shrink-0 focus:outline-hidden focus:ring-2 focus:ring-ring rounded-md"
          >
            <UpsyLogo
              decorative
              className="h-8 md:h-9 lg:h-10 align-middle transition-all duration-200 dark:brightness-110"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden xl:flex items-center gap-0.5 2xl:gap-1"
            aria-label={t("menu.primaryNav")}
          >
            {nav.sections.map((section) => (
              <div key={section.id} className="relative group">
                <Link
                  to={to(section.href)}
                  aria-current={sectionActive(section) ? "page" : undefined}
                  className={`flex items-center gap-1 px-2 2xl:px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    sectionActive(section)
                      ? "text-foreground bg-primary/15"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {section.label}
                  <ChevronDown className="hidden 2xl:block h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                </Link>
                <div className="absolute top-full start-0 mt-2 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50">
                  <div className="rounded-xl border border-border bg-background py-1.5 shadow-xl">
                    <p className="px-4 pt-2 pb-1 text-xs text-muted-foreground">
                      {section.intro}
                    </p>
                    {section.items.map((item) => (
                      <Link
                        key={item.href + item.label}
                        to={to(item.href)}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className="flex items-start gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        {item.icon && (
                          <item.icon className="h-4 w-4 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="block truncate">{item.label}</span>
                          {item.desc && (
                            <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
                              {item.desc}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2 shrink-0">
            <span className="hidden 2xl:inline-flex">
              <ThemeToggle />
            </span>
            <LanguageSwitcher className="mr-1" />
            <InstallAppButton
              variant="ghost"
              size="sm"
              label=""
              aria-label={t("menu.installApp")}
              className="hidden 2xl:inline-flex"
            />
            {user && <ViewAsSwitcher />}
            {user && <NotificationBell />}
            {user ? (
              <>
                <Button variant="primary" size="sm" asChild>
                  <Link to={to("/my-space")}>
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.mySpace")}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  aria-label={t("nav.logout")}
                  title={t("nav.logout")}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link
                  to={authHref}
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors px-2 py-2 whitespace-nowrap"
                >
                  {t("nav.login")}
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  asChild
                  className="whitespace-nowrap"
                >
                  <Link to={to("/psychologists")}>
                    {t("nav.findPsychologist")}
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 xl:hidden">
            {user && <NotificationBell />}
            <button
              onClick={toggleMenu}
              className="flex items-center gap-2 ps-3 pe-2 py-2 text-sm font-medium text-foreground rounded-full border border-border/60 hover:bg-muted/50 transition-colors"
              aria-label={t("menu.toggleMenu")}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span>{nav.menuTitle}</span>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="xl:hidden h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain bg-background border-t border-border/40 animate-in fade-in slide-in-from-top-2 duration-200"
          data-lenis-prevent
        >
          <nav
            className="container-custom flex flex-col gap-5 py-5"
            aria-label={t("menu.mobileNav")}
          >
            {/* The two things most visitors came for */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="primary" size="lg" asChild className="w-full">
                <Link to={to(nav.primaryCta.href)} onClick={closeMenu}>
                  {nav.primaryCta.label}
                  <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full text-foreground"
              >
                <Link to={to(nav.secondaryCta.href)} onClick={closeMenu}>
                  {nav.secondaryCta.label}
                </Link>
              </Button>
            </div>

            {/* Sections */}
            <ul className="flex flex-col gap-2">
              {nav.sections.map((section) => {
                const open = openSection === section.id;
                const active = sectionActive(section);
                return (
                  <li
                    key={section.id}
                    className={`rounded-2xl border transition-colors ${
                      open
                        ? "border-primary/30 bg-primary/[0.03]"
                        : "border-border/60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenSection(open ? null : section.id)}
                      aria-expanded={open}
                      aria-controls={`mobile-section-${section.id}`}
                      className="flex w-full items-center gap-3 px-4 py-3 text-start"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          active || open
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground/80"
                        }`}
                      >
                        <section.icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-base font-semibold text-foreground">
                          {section.label}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate">
                          {section.intro}
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    {open && (
                      <ul
                        id={`mobile-section-${section.id}`}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-2 pb-3 animate-in fade-in slide-in-from-top-1 duration-200"
                      >
                        {section.items.map((item) => {
                          const here = isActive(item.href);
                          return (
                            <li key={item.href + item.label}>
                              <Link
                                to={to(item.href)}
                                onClick={closeMenu}
                                aria-current={here ? "page" : undefined}
                                className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                                  here
                                    ? "bg-primary/15 text-foreground font-semibold"
                                    : "text-foreground hover:bg-muted/60"
                                }`}
                              >
                                {item.icon && (
                                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                )}
                                <span className="min-w-0">
                                  <span className="block text-sm font-medium">
                                    {item.label}
                                  </span>
                                  {item.desc && (
                                    <span className="block text-xs text-muted-foreground leading-snug">
                                      {item.desc}
                                    </span>
                                  )}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2">
              {nav.quickLinks.map((q) => (
                <Link
                  key={q.href}
                  to={to(q.href)}
                  onClick={closeMenu}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-sm text-foreground/85 hover:bg-muted/60"
                >
                  {q.icon && <q.icon className="h-3.5 w-3.5" />}
                  {q.label}
                </Link>
              ))}
            </div>

            {/* Preferences */}
            <div className="rounded-2xl border border-border/60 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {nav.settings}
              </p>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              <InstallAppButton
                variant="outline"
                size="sm"
                className="w-full"
                label={t("menu.installApp")}
              />
            </div>

            {/* Account */}
            {user ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {nav.account}
                </p>
                <ViewAsSwitcher onChoose={closeMenu} />
                <Button variant="primary" size="sm" asChild>
                  <Link to={to("/my-space")} onClick={closeMenu}>
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.mySpace")}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full text-foreground"
              >
                <Link to={authHref} onClick={closeMenu}>
                  <User className="mr-2 h-4 w-4" />
                  {t("nav.login")}
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
