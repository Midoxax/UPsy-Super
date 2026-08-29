import { useEffect, useState } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import {
  Menu, X, User, ChevronDown, Umbrella, Heart, Award,
  HeartPulse, GraduationCap, Activity, Building2, Users, Sparkles,
  BookOpen, Brain, Trophy, Stethoscope, Compass, Crown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix, stripLocalePrefix } from "@/lib/i18n/utils";
import logoAsset from "@/assets/upsy-logo.png.asset.json";
const logo = logoAsset.url;
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import InstallAppButton from "@/components/pwa/InstallAppButton";
import ViewAsSwitcher from "@/components/ViewAsSwitcher";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { locale, t } = useLocale();

  // Scroll-aware glass header: light over hero, solid after scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Build a redirect-aware /auth path so post-login returns to current page.
  const authHref = (() => {
    const path = location.pathname + location.search;
    const safe = path && !path.startsWith("/auth") && !path.startsWith("/reset-password") ? path : "";
    const base = addLocalePrefix("/auth", locale);
    return safe ? `${base}?redirect=${encodeURIComponent(safe)}` : base;
  })();

  // U.Psy 2.0 IA — 5 top-level pillars
  type NavDropdownItem = { name: string; href: string; icon?: React.ComponentType<any>; featured?: boolean; desc?: string };
  const navigation: { name: string; href: string; icon?: React.ComponentType<any>; dropdown?: NavDropdownItem[] }[] = [
    {
      name: "Care",
      href: "/psychologists",
      icon: HeartPulse,
      dropdown: [
        { name: "Find a psychologist", href: "/psychologists", icon: Stethoscope, desc: "Browse accredited specialists" },
        { name: "Get matched", href: "/get-matched", icon: Compass, desc: "6-step intelligent matching" },
        { name: "Self-assessment", href: "/assessment-lab", icon: Brain, desc: "Clinical screenings (GAD-7, PHQ-9)" },
        { name: "Programs & services", href: "/services", icon: BookOpen },
      ],
    },
    {
      name: "Training Center",
      href: "/center",
      icon: GraduationCap,
      dropdown: [
        { name: "Communities", href: "/center", icon: Users, featured: true, desc: "Spaces, feeds, discussions" },
        { name: "Courses & learning", href: "/learn", icon: BookOpen, desc: "Cohort-based & self-paced" },
        { name: "Certifications", href: "/learn?tab=certifications", icon: Award, desc: "Performance Psychology pathways" },
        { name: "Mentors", href: "/psychologists?type=mentor", icon: Sparkles, desc: "1:1 elite guidance" },
      ],
    },
    {
      name: "Athlete Hub",
      href: "/athlete-hub",
      icon: Activity,
      dropdown: [
        { name: "Performance dashboard", href: "/athlete-hub", icon: Trophy, featured: true, desc: "Readiness, protocols, journal" },
        { name: "AI Coach (Nour)", href: "/ai-assistant", icon: Sparkles, desc: "Performance & reflective AI" },
        { name: "For athletes", href: "/for-athletes", icon: Activity, desc: "Why elite performers train here" },
      ],
    },
    {
      name: "For Organizations",
      href: "/for-organizations",
      icon: Building2,
      dropdown: [
        { name: "Teams & enterprises", href: "/for-organizations", icon: Building2, desc: "Pulse, programs, dashboards" },
        { name: "Consulting", href: "/services/consulting-for-organizations", icon: Stethoscope },
        { name: "Talent Innovation Hub", href: "/talent-innovation-hub", icon: Brain, desc: "Research & applied science" },
        { name: "Apply as an organization", href: "/apply/organization", icon: Award },
      ],
    },
    {
      name: "About",
      href: "/about",
      dropdown: [
        { name: "Membership", href: "/membership", icon: Crown, featured: true, desc: "7 tiers — Discover → Elite" },
        { name: "Founder", href: "/founder", icon: Award, featured: true },
        { name: "Our story", href: "/about" },
        { name: "The Moroccan Umbrella", href: "/moroccan-umbrella", icon: Umbrella },
        { name: "Psychologues Sans Frontières", href: "/psf", icon: Heart },
        { name: "Blog", href: "/blog", icon: BookOpen },
        { name: t('nav.contact'), href: "/contact" },
        { name: "Apply for accreditation", href: "/apply" },
        { name: "For specialists · Pricing", href: "/pricing-specialists" },
      ],
    },
  ];

  const isActive = (href: string) => {
    const strippedPath = stripLocalePrefix(location.pathname);
    if (href === "/" && strippedPath === "/") return true;
    if (href !== "/" && strippedPath.startsWith(href)) return true;
    return false;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/80 shadow-md"
          : "bg-background/60 backdrop-blur-md border-b border-border/20"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            aria-label="U.Psy — Go to homepage"
            className="flex items-center min-w-0 focus:outline-hidden focus:ring-2 focus:ring-ring rounded-md"
          >
            <img
              src={logo}
              alt="U.Psy logo"
              className="h-10 md:h-12 lg:h-16 w-auto max-w-[40px] md:max-w-[48px] lg:max-w-[64px] object-contain transition-all duration-200 dark:brightness-110"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  to={addLocalePrefix(item.href, locale)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-primary/8"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.name}
                  {item.dropdown && <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />}
                </Link>
                {item.dropdown && (
                  <div className={`absolute top-full left-0 mt-2 ${item.dropdown.some(d => d.desc) ? 'w-80' : 'w-60'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
                    <div className="glass-effect rounded-xl border border-border/50 py-1.5 shadow-lg">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={addLocalePrefix(subItem.href, locale)}
                          aria-current={isActive(subItem.href) ? "page" : undefined}
                          className={`flex items-start gap-3 px-4 py-2.5 text-sm transition-colors ${
                            subItem.featured
                              ? "text-primary font-semibold bg-primary/5 hover:bg-primary/10"
                              : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                          }`}
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{subItem.name}</span>
                              {subItem.featured && (
                                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            {subItem.desc && (
                              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{subItem.desc}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher className="mr-1" />
            <InstallAppButton variant="ghost" size="sm" label="" aria-label="Install U.Psy app" className="hidden lg:inline-flex" />
            {user && <ViewAsSwitcher compact />}
            {user && <NotificationBell />}
            {user ? (
              <Button variant="primary" size="sm" asChild>
                <Link to={addLocalePrefix('/my-space', locale)}>
                  <User className="mr-2 h-4 w-4" />
                  {t('nav.mySpace')}
                </Link>
              </Button>
            ) : (
              <>
                <Link
                  to={authHref}
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors px-3 py-2"
                >
                  {t('nav.login')}
                </Link>
                <Button variant="primary" size="sm" asChild>
                  <Link to={addLocalePrefix('/psychologists', locale)}>{t('nav.findPsychologist')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:text-muted-foreground transition-colors rounded-lg hover:bg-muted/50"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/30 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {navigation.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => {
                      if (item.dropdown) {
                        setOpenDropdown(openDropdown === item.name ? null : item.name);
                      } else {
                        setIsMobileMenuOpen(false);
                        setOpenDropdown(null);
                      }
                    }}
                    aria-current={!item.dropdown && isActive(item.href) ? "page" : undefined}
                    className={`flex items-center justify-between w-full text-sm font-medium transition-colors rounded-lg px-3 py-2.5 ${
                      isActive(item.href) ? "text-primary bg-primary/8" : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {!item.dropdown ? (
                      <Link
                        to={addLocalePrefix(item.href, locale)}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMobileMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                        className="flex-1 text-left"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span>{item.name}</span>
                    )}
                    {item.dropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {item.dropdown && openDropdown === item.name && (
                    <div className="ml-3 pl-3 border-l-2 border-primary/20 space-y-1 mt-1 mb-2 animate-in slide-in-from-top-1 duration-200">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={addLocalePrefix(subItem.href, locale)}
                          aria-current={isActive(subItem.href) ? "page" : undefined}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setOpenDropdown(null);
                          }}
                          className={`flex items-center gap-2 text-sm py-2 px-3 rounded-lg transition-colors ${
                            subItem.featured
                              ? "text-primary font-semibold bg-primary/5 hover:bg-primary/10"
                              : "text-foreground/60 hover:text-primary hover:bg-primary/5"
                          }`}
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                          {subItem.name}
                          {subItem.featured && (
                            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-3 pt-4 mt-3 border-t border-border/30">
                <div className="flex items-center gap-3 px-3">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
                <div className="px-3">
                  <InstallAppButton variant="outline" size="sm" className="w-full" label="Install U.Psy app" />
                </div>
                {user ? (
                  <Button variant="primary" size="sm" asChild>
                    <Link to={addLocalePrefix('/my-space', locale)} onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.mySpace')}
                    </Link>
                  </Button>
                ) : (
                  <div className="flex gap-2 px-3">
                    <Button variant="secondary" size="sm" asChild className="flex-1">
                      <Link to={authHref} onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.login')}
                      </Link>
                    </Button>
                    <Button variant="primary" size="sm" asChild className="flex-1">
                      <Link to={addLocalePrefix('/psychologists', locale)} onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.findPsychologist')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
