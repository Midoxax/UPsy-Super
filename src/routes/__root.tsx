import { lazy, Suspense, useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";

// Marketing type system — see src/styles/fonts.ts for the full face list.
import "@/styles/fonts";
import { resolveExperiments } from "@/lib/experiments/experiments.functions";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageTransition from "@/components/PageTransition";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { stripLocalePrefix } from "@/lib/i18n/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkipToContent from "@/components/SkipToContent";
import { BreadcrumbWrapper } from "@/components/BreadcrumbWrapper";
import SEOHead from "@/components/SEOHead";
import { AuroraBackground, SmoothScrollProvider } from "@/lib/motion";
import { reportLovableError } from "@/lib/lovable-error-reporting";

// ported from main.tsx
import { initPostHog } from "@/lib/analytics/posthog";
import { initSentry } from "@/lib/analytics/sentry";
import { assertRequiredEnv } from "@/lib/env-check";

const NotFound = lazy(() => import("@/pages/NotFound"));

// GTM — container ID injected via {{GTM_ID}} slot; guarded when unreplaced.
const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];
if(!i||i.indexOf('{')!==-1){return;}
w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','{{GTM_ID}}');`;

// Theme, applied before first paint — must stay in sync with src/contexts/ThemeContext.tsx.
const THEME_BOOTSTRAP = `(function () {
  try {
    var saved = localStorage.getItem('u-psy-theme-v2');
    var pref = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    var dark =
      pref === 'dark' ||
      (pref === 'system' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();`;

const JSONLD_WEBSITE = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "U.Psy",
  url: "https://www.upsy.ma",
  description:
    "Modern mental health platform helping users find psychologists, take self-assessments, and access personalized support.",
  publisher: { "@type": "Organization", name: "U.Psy", url: "https://www.upsy.ma" },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.upsy.ma/psychologists?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
});

const JSONLD_ORG = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "U.Psy",
  url: "https://www.upsy.ma",
  logo: "https://www.upsy.ma/icon-512.png",
  description:
    "Performance psychology platform. Book accredited psychologists worldwide via video or in-person in select cities.",
  founder: {
    "@type": "Person",
    name: "Mehdi Felji",
    jobTitle: "Founder",
    url: "https://www.upsy.ma/founder",
  },
  sameAs: ["https://www.upsy.ma"],
  areaServed: "Worldwide",
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@upsy.ma",
    contactType: "customer support",
    availableLanguage: ["English", "French", "Arabic", "Spanish", "Portuguese"],
  },
});

const DEFAULT_TITLE = "U.Psy — Performance Psychology Platform for Morocco";
const DEFAULT_DESCRIPTION =
  "Book accredited psychologists worldwide. Video sessions in any timezone, or in-person in select cities. Free rebook if not the right fit.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: DEFAULT_TITLE },
      { name: "description", content: DEFAULT_DESCRIPTION },
      {
        name: "keywords",
        content:
          "Mehdi Felji, UPsy, U.Psy, mental health platform, psychology platform, therapy, find psychologist, online therapy, mental health support, self assessment psychology, therapy matching, digital mental health",
      },
      { name: "author", content: "Mehdi Felji" },
      { name: "google-site-verification", content: "ODHFtEUxPdKxliJLEqr4fI3CJC3ZznJnFB5vBzNpwqE" },
      { name: "theme-color", content: "#6B1F2A" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "U.Psy" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "U.Psy" },
      { property: "og:title", content: DEFAULT_TITLE },
      { property: "og:description", content: DEFAULT_DESCRIPTION },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "fr_FR" },
      { property: "og:locale:alternate", content: "ar_MA" },
      { property: "og:image", content: "https://www.upsy.ma/og-image.jpg" },
      { property: "og:image:alt", content: "U.Psy logo" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1920" },
      { property: "og:image:height", content: "1080" },
      { property: "og:url", content: "https://www.upsy.ma/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@upsy_ma" },
      { name: "twitter:title", content: DEFAULT_TITLE },
      {
        name: "twitter:description",
        content:
          "Book accredited psychologists worldwide. Video sessions in any timezone, or in-person in select cities.",
      },
      { name: "twitter:image", content: "https://www.upsy.ma/og-image.jpg" },
      { name: "twitter:image:alt", content: "U.Psy logo" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48x48.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "mask-icon", href: "/favicon.png", color: "#6B1F2A" },
      { rel: "preconnect", href: "https://vuawmihxcaewzmkuarkr.supabase.co", crossOrigin: "anonymous" },
      { rel: "canonical", href: "https://www.upsy.ma/" },
      { rel: "alternate", hrefLang: "x-default", href: "https://www.upsy.ma/" },
      { rel: "alternate", hrefLang: "en", href: "https://www.upsy.ma/" },
      { rel: "alternate", hrefLang: "fr", href: "https://www.upsy.ma/fr/" },
      { rel: "alternate", hrefLang: "ar", href: "https://www.upsy.ma/ar/" },
    ],
    scripts: [
      { children: GTM_SNIPPET },
      { children: THEME_BOOTSTRAP },
      { type: "application/ld+json", children: JSONLD_WEBSITE },
      { type: "application/ld+json", children: JSONLD_ORG },
    ],
  }),
  // Resolve A/B buckets before the first byte of HTML, so SSR and hydration
  // agree on which variant the visitor sees. staleTime keeps this from
  // re-running (and re-hitting the server) on client-side navigation.
  loader: async () => ({ experiments: await resolveExperiments() }),
  staleTime: Infinity,
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const LazyFallback = () => (
  <div className="flex-1 flex items-center justify-center py-20">
    <div className="h-6 w-6 motion-breathe rounded-full bg-primary/20" />
  </div>
);

// Theme mapper based on route patterns
const getThemeForRoute = (pathname: string): string => {
  const cleanPath = stripLocalePrefix(pathname);
  if (cleanPath === "/services/sport-psychology") return "performance";
  if (cleanPath === "/services/consulting-for-organizations") return "institutions";
  if (cleanPath === "/talent-innovation-hub") return "innovation";
  if (cleanPath === "/skool") return "skool";
  if (["/apply", "/my-space"].includes(cleanPath)) return "accreditation";
  if (["/services", "/psychologists", "/get-matched"].some((route) => cleanPath.startsWith(route)))
    return "clinic";
  return "default";
};

const AppShell = () => {
  const location = useLocation();
  const isOps = location.pathname.startsWith("/ops");

  // Update body data-theme attribute based on current route
  useEffect(() => {
    const theme = getThemeForRoute(location.pathname);
    document.body.setAttribute("data-theme", theme);
  }, [location.pathname]);

  if (isOps) {
    return (
      <div className="min-h-screen bg-background">
        <ScrollToTop />
        <SEOHead path={location.pathname} />
        <Suspense fallback={<LazyFallback />}>
          <Outlet />
        </Suspense>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <SkipToContent />
      <AuroraBackground />
      <Header />
      <ScrollToTop />
      <BreadcrumbWrapper />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-hidden">
        <SEOHead path={location.pathname} />
        <Suspense fallback={<LazyFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // ported from main.tsx — env sanity check + analytics init (both no-op without keys)
  useEffect(() => {
    const envError = assertRequiredEnv();
    if (envError) {
      console.error(envError);
      return;
    }
    initSentry();
    initPostHog();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <LocaleProvider>
              <ErrorBoundary>
                <SmoothScrollProvider>
                  <AppShell />
                </SmoothScrollProvider>
              </ErrorBoundary>
            </LocaleProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function NotFoundComponent() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <PageTransition>
        <NotFound />
      </PageTransition>
    </Suspense>
  );
}

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  console.error(error);

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">This page didn't load</h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong while rendering this page. You can try again or head back home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
