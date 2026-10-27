import { lazy, Suspense, useEffect } from "react";
import { COMPANY, SOCIAL_LINKS } from "@/content/legal/company";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
  useRouter,
  useRouterState,
  type ErrorComponentProps,
} from "@tanstack/react-router";
// Imported for its side effect, not as a URL.
//
// `../styles.css?url` made the SSR pass emit its own copy of the stylesheet and
// link that filename. The SSR copy is written to node_modules/.nitro and never
// published, and its content hash differs from the client copy's (the SSR pass
// generates ~8 kB more utilities), so every server-rendered document linked a
// stylesheet that 404s while the 200 kB client stylesheet went unreferenced.
// A plain import puts the file in the module graph, and the router manifest
// injects the client asset that is actually served — the same mechanism that
// already resolves the other stylesheet on this page correctly.
import "../styles.css";

// Marketing type system — see src/styles/fonts.ts for the full face list.
import "@/styles/fonts";
import { resolveExperiments } from "@/lib/experiments/experiments.functions";
import { controlAssignments } from "@/lib/experiments/config";

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
import { dynamicSeo, seoForPath } from "@/lib/seo/meta";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkipToContent from "@/components/SkipToContent";
import { BreadcrumbWrapper } from "@/components/BreadcrumbWrapper";
import SEOHead from "@/components/SEOHead";
import { AuroraBackground, SmoothScrollProvider } from "@/lib/motion";
import { reportLovableError } from "@/lib/lovable-error-reporting";

// ported from main.tsx
import { applyConsent } from "@/lib/consent";
import { ConsentBanner } from "@/components/ConsentBanner";
import { initSentry } from "@/lib/analytics/sentry";
import { assertRequiredEnv } from "@/lib/env-check";

const NotFound = lazy(() => import("@/pages/NotFound"));

// GTM container ID — not a secret (it's visible in every page's source), so
// it's a plain constant rather than a build-time substitution.
const GTM_ID = "GTM-MQKRPFT9";

// Consent-gated GTM. dataLayer and gtag exist from the start (Consent Mode
// defaults: everything denied), but gtm.js is only fetched once the visitor
// accepts analytics: now, if they already did (key below must match
// CONSENT_KEY in src/lib/consent.ts), or later via window.__upsyLoadGTM.
const CONSENT_BOOTSTRAP = `(function(w,d){
w.dataLayer=w.dataLayer||[];w.gtag=function(){w.dataLayer.push(arguments);};
w.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
w.__upsyLoadGTM=function(){if(w.__upsyGTM)return;w.__upsyGTM=1;
w.gtag('consent','update',{analytics_storage:'granted'});
w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var j=d.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';
d.head.appendChild(j);};
try{if(localStorage.getItem('upsy-consent-v1')==='granted')w.__upsyLoadGTM();}catch(e){}
})(window,document);`;

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
  url: "https://upsy.ma",
  description:
    "Modern mental health platform helping users find psychologists, take self-assessments, and access personalized support.",
  publisher: {
    "@type": "Organization",
    name: "U.Psy",
    url: "https://upsy.ma",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://upsy.ma/psychologists?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
});

const JSONLD_ORG = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "U.Psy",
  url: "https://upsy.ma",
  logo: "https://upsy.ma/icon-512.png",
  description:
    "Performance psychology platform. Book accredited psychologists worldwide via video or in-person in select cities.",
  founder: {
    "@type": "Person",
    name: "Mehdi Felji",
    jobTitle: "Founder",
    url: "https://upsy.ma/founder",
  },
  sameAs: Object.values(SOCIAL_LINKS),
  areaServed: "Worldwide",
  contactPoint: {
    "@type": "ContactPoint",
    email: COMPANY.email,
    telephone: COMPANY.phoneHref.replace("tel:", ""),
    contactType: "customer support",
    availableLanguage: ["English", "French", "Arabic", "Spanish", "Portuguese"],
  },
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: ({ matches }) => {
      const seo = seoForPath(
        matches[matches.length - 1]?.pathname ?? "/",
        dynamicSeo(matches),
      );
      return {
        meta: [
          { charSet: "utf-8" },
          {
            name: "viewport",
            content: "width=device-width, initial-scale=1.0",
          },
          { title: seo.title },
          { name: "description", content: seo.description },
          ...(seo.noindex
            ? [{ name: "robots", content: "noindex, follow" }]
            : []),
          {
            name: "keywords",
            content:
              "Mehdi Felji, UPsy, U.Psy, mental health platform, psychology platform, therapy, find psychologist, online therapy, mental health support, self assessment psychology, therapy matching, digital mental health",
          },
          { name: "author", content: "Mehdi Felji" },
          {
            name: "google-site-verification",
            content: "ODHFtEUxPdKxliJLEqr4fI3CJC3ZznJnFB5vBzNpwqE",
          },
          { name: "theme-color", content: "#6B1F2A" },
          { name: "apple-mobile-web-app-capable", content: "yes" },
          {
            name: "apple-mobile-web-app-status-bar-style",
            content: "black-translucent",
          },
          { name: "apple-mobile-web-app-title", content: "U.Psy" },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: "U.Psy" },
          { property: "og:title", content: seo.title },
          { property: "og:description", content: seo.description },
          { property: "og:locale", content: seo.ogLocale },
          { property: "og:image", content: "https://upsy.ma/og-image.jpg" },
          { property: "og:image:alt", content: "U.Psy logo" },
          { property: "og:image:type", content: "image/jpeg" },
          { property: "og:image:width", content: "1920" },
          { property: "og:image:height", content: "1080" },
          { property: "og:url", content: seo.canonical },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:site", content: "@upsy_ma" },
          { name: "twitter:title", content: seo.title },
          { name: "twitter:description", content: seo.description },
          {
            name: "twitter:image",
            content: "https://upsy.ma/og-image.jpg",
          },
          { name: "twitter:image:alt", content: "U.Psy logo" },
        ],
        links: [
          { rel: "manifest", href: "/manifest.webmanifest" },
          { rel: "icon", href: "/favicon.ico", sizes: "any" },
          {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            href: "/favicon-16x16.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            href: "/favicon-32x32.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "48x48",
            href: "/favicon-48x48.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "192x192",
            href: "/icon-192.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "512x512",
            href: "/icon-512.png",
          },
          {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: "/apple-touch-icon.png",
          },
          { rel: "mask-icon", href: "/favicon.png", color: "#6B1F2A" },
          {
            rel: "preconnect",
            href: "https://skxxvgjjdshcopybokdt.supabase.co",
            crossOrigin: "anonymous",
          },
          { rel: "canonical", href: seo.canonical },
          ...seo.alternates.map((a) => ({
            rel: "alternate",
            hrefLang: a.hrefLang,
            href: a.href,
          })),
        ],
        scripts: [
          { children: CONSENT_BOOTSTRAP },
          { children: THEME_BOOTSTRAP },
          { type: "application/ld+json", children: JSONLD_WEBSITE },
          { type: "application/ld+json", children: JSONLD_ORG },
        ],
      };
    },
    // Resolve A/B buckets before the first byte of HTML, so SSR and hydration
    // agree on which variant the visitor sees. staleTime keeps this from
    // re-running (and re-hitting the server) on client-side navigation.
    // A failed RPC (offline, cold worker, blocked request) must never blank the
    // whole app — fall back to the control bucket.
    loader: async () => {
      try {
        return { experiments: await resolveExperiments() };
      } catch (error) {
        console.error("[experiments] resolveExperiments failed:", error);
        return { experiments: controlAssignments() };
      }
    },
    staleTime: Infinity,
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: RootErrorComponent,
  },
);

function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lang, dir } = seoForPath(pathname);
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
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
  if (cleanPath === "/services/consulting-for-organizations")
    return "institutions";
  if (cleanPath === "/talent-innovation-hub") return "innovation";
  if (cleanPath === "/skool") return "skool";
  if (["/apply", "/my-space"].includes(cleanPath)) return "accreditation";
  if (
    ["/services", "/psychologists", "/get-matched"].some((route) =>
      cleanPath.startsWith(route),
    )
  )
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
      <ConsentBanner />
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
    // PostHog and GTM start only after the visitor accepts analytics.
    applyConsent();
  }, []);

  // Every deploy replaces the content-hashed JS chunk files; a browser tab
  // still open on the previous deploy (or route-preloading in the
  // background, off the React render path where ErrorBoundary can't see it)
  // then requests a chunk that no longer exists and silently gets stuck —
  // no error UI, the click just does nothing. Vite fires "vite:preloadError"
  // for exactly this case; the fix is the same one users already reach for
  // manually (a full reload), done automatically, once, per session.
  useEffect(() => {
    const RELOAD_GUARD_KEY = "upsy:stale-chunk-reload";
    const handlePreloadError = () => {
      if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return;
      sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
      window.location.reload();
    };
    window.addEventListener("vite:preloadError", handlePreloadError);
    return () =>
      window.removeEventListener("vite:preloadError", handlePreloadError);
  }, []);

  // Belt-and-suspenders for the same class of failure as above, but without
  // a clean "vite:preloadError" signal — e.g. a chunk request that hangs or
  // gets silently dropped (an interfering proxy, an edge bot-challenge, a
  // stalled prefetch) rather than cleanly 404ing. The URL bar updates (that's
  // just history.pushState) but the page never swaps in, and nothing ever
  // throws for an ErrorBoundary to catch. If the router reports a navigation
  // still in flight this long after it started, the page is stuck; reload.
  const router = useRouter();
  useEffect(() => {
    const STUCK_RELOAD_GUARD_KEY = "upsy:stuck-nav-reload";
    const STUCK_THRESHOLD_MS = 8000;
    let pendingSince: number | null = null;
    const id = window.setInterval(() => {
      const isLoading = router.state.isLoading;
      if (!isLoading) {
        pendingSince = null;
        return;
      }
      if (pendingSince === null) {
        pendingSince = Date.now();
        return;
      }
      if (Date.now() - pendingSince < STUCK_THRESHOLD_MS) return;
      if (sessionStorage.getItem(STUCK_RELOAD_GUARD_KEY)) return;
      sessionStorage.setItem(STUCK_RELOAD_GUARD_KEY, "1");
      window.location.reload();
    }, 500);
    return () => window.clearInterval(id);
  }, [router]);

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
        <h1 className="text-2xl font-semibold text-foreground">
          This page didn't load
        </h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong while rendering this page. You can try again or
          head back home.
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
