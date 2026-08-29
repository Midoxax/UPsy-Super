import { Link, useLocation } from "@/lib/router-compat";
import { useEffect, useRef } from "react";
import { 
  Users, Sparkles, Briefcase, Building, Award, 
  Lightbulb, MessageCircle, BookOpen, ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";

const megaMenuItems = [
  {
    title: "Find a Psychologist",
    href: "/psychologists",
    icon: Users,
    value: "Browse 50+ verified specialists",
    cta: "Search now",
    color: "text-u-gold"
  },
  {
    title: "Get Matched",
    href: "/get-matched",
    icon: Sparkles,
    value: "AI finds your perfect fit in 3 min",
    cta: "Take quiz",
    color: "text-u-teal"
  },
  {
    title: "Services",
    href: "/services",
    icon: Briefcase,
    value: "Individual + sport + clinical packages",
    cta: "View pricing",
    color: "text-u-gold"
  },
  {
    title: "For Organizations",
    href: "/services/consulting-for-organizations",
    icon: Building,
    value: "Team workshops & institutional support",
    cta: "Learn more",
    color: "text-u-maroon"
  },
  {
    title: "Accreditation",
    href: "/apply",
    icon: Award,
    value: "Join our network of excellence",
    cta: "Apply now",
    color: "text-u-teal"
  },
  {
    title: "Innovation Hub",
    href: "/talent-innovation-hub",
    icon: Lightbulb,
    value: "R&D, tech, & performance insights",
    cta: "Explore",
    color: "text-u-maroon"
  },
  {
    title: "Skool",
    href: "/skool",
    icon: MessageCircle,
    value: "Free community & mental health resources",
    cta: "Join free",
    color: "text-u-teal"
  },
  {
    title: "Resources",
    href: "/resources",
    icon: BookOpen,
    value: "Articles, tools & guides",
    cta: "Browse",
    color: "text-u-gold"
  }
];

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const menuRef = useRef<HTMLDivElement>(null);
  const { locale, t } = useLocale();

  const localizedMenuItems = megaMenuItems.map(item => ({
    ...item,
    title: t(`nav.${item.href.split('/').pop()?.replace(/-/g, '') || item.title.toLowerCase().replace(/\s+/g, '')}`),
    value: t(`nav.${item.href.split('/').pop()?.replace(/-/g, '') || item.title.toLowerCase().replace(/\s+/g, '')}Value`),
    cta: t(`cta.${item.cta.toLowerCase().replace(/\s+/g, '')}`),
  }));

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <div 
        ref={menuRef}
        className="absolute top-full left-0 right-0 bg-u-surface/98 backdrop-blur-2xl border-t border-u-gray-700/50 shadow-[0_12px_48px_rgba(0,0,0,0.6)] z-50 max-h-[80vh] overflow-y-auto"
        role="menu"
        aria-label="Mobile navigation menu"
      >
        <div className="container-custom py-6 space-y-2">
          {localizedMenuItems.map((item, idx) => {
            const Icon = megaMenuItems[idx].icon;
            const originalHref = megaMenuItems[idx].href;
            return (
              <Link
                key={originalHref}
                to={addLocalePrefix(originalHref, locale)}
                className="flex items-start gap-4 p-4 rounded-lg bg-u-gray-700/20 hover:bg-u-gray-700/40 transition-colors"
                onClick={onClose}
              >
                <Icon className={cn("w-6 h-6 flex-shrink-0 mt-0.5", megaMenuItems[idx].color)} strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <div className="text-u-gray-100 font-semibold mb-1">{item.title}</div>
                  <div className="text-u-gray-400 text-sm mb-3">{item.value}</div>
                  <div className="text-u-teal text-sm font-medium inline-flex items-center gap-1">
                    {item.cta} <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={menuRef}
      className="absolute top-full left-0 right-0 bg-u-surface/98 backdrop-blur-2xl border-t border-u-gray-700/50 shadow-[0_12px_48px_rgba(0,0,0,0.6)] z-50 mega-menu max-h-[80vh] overflow-y-auto"
      role="menu"
      aria-label="Main navigation mega menu"
    >
      <div className="container-custom">
        <div className="grid grid-cols-4 divide-x divide-u-gray-700/30">
          {localizedMenuItems.map((item, index) => {
            const Icon = megaMenuItems[index].icon;
            const originalHref = megaMenuItems[index].href;
            return (
              <Link
                key={originalHref}
                to={addLocalePrefix(originalHref, locale)}
                className={cn(
                  "mega-menu-column px-6 py-8 transition-all duration-200",
                  "hover:bg-u-gray-700/20",
                  index === megaMenuItems.length - 1 && "border-r-0"
                )}
                onClick={onClose}
              >
                <Icon className={cn("w-6 h-6 mb-4", megaMenuItems[index].color)} strokeWidth={2} />
                <div className="text-u-gray-100 font-semibold text-base mb-2">
                  {item.title}
                </div>
                <div className="text-u-gray-400 text-sm mb-4 leading-relaxed">
                  {item.value}
                </div>
                <div className="mega-menu-cta text-u-teal hover:text-u-gold text-sm font-medium inline-flex items-center gap-1 transition-colors">
                  {item.cta} <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
