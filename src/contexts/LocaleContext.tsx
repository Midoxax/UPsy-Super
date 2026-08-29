import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from '@/lib/router-compat';
import { translations } from '@/lib/i18n/translations';
import { getCookie, setCookie, getLocaleFromPath, stripLocalePrefix, addLocalePrefix, type Locale } from '@/lib/i18n/utils';
import { supabase } from '@/integrations/supabase/client';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // SSR-deterministic initial locale: derive from the URL only, so the server
  // and client render the same markup. The cookie preference is applied after
  // hydration in the effect below.
  const [locale, setLocaleState] = useState<Locale>(() => getLocaleFromPath(location.pathname));
  const [overrides, setOverrides] = useState<Record<string, Record<string, string>>>({});

  // Apply the cookie-stored language preference after hydration
  useEffect(() => {
    const cookieLocale = getCookie('lng');
    if (cookieLocale === 'fr' || cookieLocale === 'en' || cookieLocale === 'ar' || cookieLocale === 'ber') {
      setLocaleState(cookieLocale);
    }
  }, []);

  // Load translation overrides once
  useEffect(() => {
    const loadOverrides = async () => {
      const { data } = await supabase
        .from('translation_overrides')
        .select('locale, translation_key, translation_value');
      if (data && data.length > 0) {
        const map: Record<string, Record<string, string>> = {};
        for (const row of data) {
          if (!map[row.locale]) map[row.locale] = {};
          map[row.locale][row.translation_key] = row.translation_value;
        }
        setOverrides(map);
      }
    };
    loadOverrides();
  }, []);

  // First-visit auto-redirect
  useEffect(() => {
    const hasVisited = getCookie('lng');
    const currentPath = location.pathname;
    
    if (!hasVisited && !currentPath.startsWith('/fr') && !currentPath.startsWith('/ar') && !currentPath.startsWith('/ber')) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes('fr')) {
        setCookie('lng', 'fr', 180);
        const newPath = '/fr' + currentPath + location.search + location.hash;
        navigate(newPath, { replace: true });
        setLocaleState('fr');
      } else if (browserLang.includes('ar')) {
        setCookie('lng', 'ar', 180);
        const newPath = '/ar' + currentPath + location.search + location.hash;
        navigate(newPath, { replace: true });
        setLocaleState('ar');
      } else {
        setCookie('lng', 'en', 180);
        setLocaleState('en');
      }
    }
  }, []);

  // Sync locale with URL changes — but never silently downgrade to 'en'
  // when the user has explicitly chosen 'fr' or 'ar'. If a non-prefixed URL
  // is visited and the cookie says fr/ar, redirect to the prefixed equivalent.
  useEffect(() => {
    const urlLocale = getLocaleFromPath(location.pathname);
    const cookieLocale = getCookie('lng');
    const preferred = (cookieLocale === 'fr' || cookieLocale === 'ar' || cookieLocale === 'en' || cookieLocale === 'ber')
      ? cookieLocale
      : null;

    if (urlLocale === 'en' && (preferred === 'fr' || preferred === 'ar' || preferred === 'ber')) {
      const newPath = addLocalePrefix(location.pathname, preferred);
      navigate(newPath + location.search + location.hash, { replace: true });
      return;
    }

    if (urlLocale !== locale) {
      setLocaleState(urlLocale);
    }
  }, [location.pathname]);

  // Set text direction for RTL languages
  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    if (locale === 'ber') {
      document.documentElement.lang = 'ber';
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setCookie('lng', newLocale, 180);
    setLocaleState(newLocale);
    
    const currentPath = stripLocalePrefix(location.pathname);
    const newPath = addLocalePrefix(currentPath, newLocale);
    navigate(newPath + location.search + location.hash);
  };

  const t = (key: string): string => {
    // Check DB overrides first
    const override = overrides[locale]?.[key];
    if (override !== undefined) return override;

    const lookup = (loc: Locale): string | undefined => {
      let value: unknown = translations[loc];
      for (const k of key.split('.')) {
        value = (value as Record<string, unknown> | undefined)?.[k];
      }
      return typeof value === 'string' ? value : undefined;
    };

    // Requested locale, then English as the fallback locale — a missing
    // Arabic or French string should show the English copy, not a raw key.
    const resolved = lookup(locale) ?? (locale === 'en' ? undefined : lookup('en'));
    if (resolved !== undefined) return resolved;

    // Genuinely missing everywhere. Return an empty string rather than the key
    // so the widespread `t("some.key") || "Inline default"` call sites resolve
    // to their inline default — returning the key made those `||` branches
    // dead code, which is how raw identifiers like "pricing.heroTitle" ended up
    // rendering as page headings.
    if (import.meta.env.DEV) {
      console.warn(`[i18n] missing translation for "${key}" (locale: ${locale})`);
    }
    return '';
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
};
