import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

/**
 * Theme system.
 *
 * Three preferences, two outcomes: the user may pin "light" or "dark", or
 * choose "system" (the default) and follow the OS. `theme` is what the user
 * asked for; `resolvedTheme` is what is actually painted — consumers that need
 * to render differently per theme (toasts, charts, canvas) want the latter.
 *
 * The class is applied to <html> by a blocking snippet in index.html so the
 * very first paint is already correct. Doing it only here would flash the
 * light palette at every dark-mode visitor on every cold load, which is
 * exactly the jolt this product should not produce. That snippet and the
 * constants below must stay in sync.
 */
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "u-psy-theme-v2";
const DARK_QUERY = "(prefers-color-scheme: dark)";

interface ThemeContextType {
  /** What the user chose. "system" means "follow the OS". */
  theme: ThemePreference;
  /** What is actually applied right now. Never "system". */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  /** Flips between explicit light and dark, leaving "system" behind. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // Private mode / storage disabled — fall through to the OS preference.
  }
  return "system";
}

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function resolve(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? systemTheme() : preference;
}

/** Applies the theme to the document. Mirrors the pre-paint snippet. */
function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  // Lets native UI — form controls, scrollbars, autofill — match the theme.
  root.style.colorScheme = resolved;
  // Keeps the mobile browser chrome in step with the page.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "dark" ? "#1A1A1A" : "#6B1F2A");
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemePreference>(readStoredPreference);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolve(readStoredPreference())
  );

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Preference will not persist; the current session still honours it.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // A toggle is a deliberate override, so it always lands on an explicit
    // value rather than cycling back through "system".
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  // Keep the document in step with the preference.
  useEffect(() => {
    const next = resolve(theme);
    setResolvedTheme(next);
    applyTheme(next);
  }, [theme]);

  // While following the system, react to the OS flipping mid-session.
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      const next = systemTheme();
      setResolvedTheme(next);
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
