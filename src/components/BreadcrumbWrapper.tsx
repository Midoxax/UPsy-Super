import { Fragment } from "react";
import { useLocation, Link } from "@/lib/router-compat";
import { 
  Home, Info, Briefcase, Building, Users, User, Sparkles, 
  Award, Mail, MessageCircle, Lightbulb, BookOpen, FileText, 
  LogIn, LayoutDashboard, ChevronLeft 
} from "lucide-react";
import { 
  Breadcrumb, BreadcrumbList, BreadcrumbItem, 
  BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";
import { stripLocalePrefix, addLocalePrefix } from "@/lib/i18n/utils";

const breadcrumbConfig: Record<string, { key: string; icon: any; color: string }> = {
  '/': { key: 'home', icon: Home, color: 'text-u-gray-400' },
  '/about': { key: 'about', icon: Info, color: 'text-u-gold' },
  '/services': { key: 'services', icon: Briefcase, color: 'text-u-teal' },
  '/services/consulting-for-organizations': { key: 'forOrganizations', icon: Building, color: 'text-u-maroon' },
  '/psychologists': { key: 'findPsychologist', icon: Users, color: 'text-u-gold' },
  '/get-matched': { key: 'getMatched', icon: Sparkles, color: 'text-u-gold' },
  '/apply': { key: 'accreditation', icon: Award, color: 'text-u-teal' },
  '/contact': { key: 'contact', icon: Mail, color: 'text-u-gold' },
  '/skool': { key: 'skool', icon: MessageCircle, color: 'text-u-teal' },
  '/talent-innovation-hub': { key: 'innovationHub', icon: Lightbulb, color: 'text-u-maroon' },
  '/resources': { key: 'resources', icon: BookOpen, color: 'text-u-gold' },
  '/legal': { key: 'legal', icon: FileText, color: 'text-u-gray-400' },
  '/auth': { key: 'login', icon: LogIn, color: 'text-u-gray-400' },
  '/my-space': { key: 'mySpace', icon: LayoutDashboard, color: 'text-u-gold' },
};

export function BreadcrumbWrapper() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { locale, t } = useLocale();
  
  const cleanPath = stripLocalePrefix(location.pathname);
  
  // Don't show breadcrumbs on home page or 404
  if (cleanPath === '/' || cleanPath === '/404') {
    return null;
  }

  const getBreadcrumbs = () => {
    const segments = cleanPath.split('/').filter(Boolean);
    const crumbs = [{ label: t('nav.home'), href: addLocalePrefix('/', locale), icon: Home, color: 'text-u-gray-400' }];
    
    segments.forEach((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const config = breadcrumbConfig[path];
      
      if (config) {
        crumbs.push({ 
          label: t(`nav.${config.key}`),
          href: addLocalePrefix(path, locale),
          icon: config.icon,
          color: config.color
        });
      } else {
        crumbs.push({ 
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '), 
          href: addLocalePrefix(path, locale),
          icon: FileText,
          color: 'text-u-gray-400'
        });
      }
    });
    
    return crumbs;
  };

  const crumbs = getBreadcrumbs();
  const visibleCrumbs = isMobile && crumbs.length > 2 ? crumbs.slice(-2) : crumbs;
  const showBackButton = isMobile && crumbs.length > 1;
  const backLink = crumbs.length > 1 ? crumbs[crumbs.length - 2].href : '/';

  return (
    <div className="bg-background/60 backdrop-blur-sm">
      <div className="container-custom py-2">
        <Breadcrumb>
          <BreadcrumbList>
            {showBackButton && (
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  {/* Icon-only, so it needs an explicit name — a screen reader
                      otherwise announces this link as nothing at all. */}
                  <Link
                    to={backLink}
                    aria-label={t('nav.back') || 'Go back'}
                    className="flex items-center gap-1 p-1 -m-1 rounded-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            
            {visibleCrumbs.map((crumb, index) => {
              const Icon = crumb.icon;
              const isLast = index === visibleCrumbs.length - 1;
              
              return (
                /*
                  Fragment, not a <div>: BreadcrumbList renders an <ol>, which
                  may only contain <li> children. Wrapping each crumb in a div
                  detached every <li> from its list, breaking the semantics
                  screen readers rely on to announce "item 2 of 3".
                  BreadcrumbItem and BreadcrumbSeparator are both <li>, so they
                  belong directly in the list.
                */
                <Fragment key={crumb.href}>
                  {index > 0 && !showBackButton && (
                    <BreadcrumbSeparator className="text-muted-foreground/40" />
                  )}

                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="flex items-center gap-1.5 py-1 text-foreground font-semibold">
                        <Icon className="w-4 h-4" strokeWidth={2} />
                        <span className={cn("w-1.5 h-1.5 rounded-full", crumb.color.replace('text-', 'bg-'))} />
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href} className="flex items-center gap-1.5 py-1 text-muted-foreground hover:text-primary transition-colors">
                          <Icon className="w-4 h-4" strokeWidth={2} />
                          <span className={cn("w-1.5 h-1.5 rounded-full", crumb.color.replace('text-', 'bg-'))} />
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
