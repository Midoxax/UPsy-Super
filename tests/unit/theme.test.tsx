/**
 * Theme resolution.
 *
 * Locks down three things that were broken or absent before: the OS
 * preference was ignored entirely (hardcoded "light"), "system" was not a
 * choice a user could hold, and consumers received the raw preference rather
 * than a concrete palette — so a component asking "am I dark?" while the
 * preference was "system" got the string "system" and rendered against the
 * wrong background.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from "@/contexts/ThemeContext";
import { mockMatchMedia } from "./setup";

function Probe() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="pref">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={toggleTheme}>toggle</button>
      <button onClick={() => setTheme("system")}>system</button>
    </div>
  );
}

const pref = () => screen.getByTestId("pref").textContent;
const resolved = () => screen.getByTestId("resolved").textContent;
const htmlIsDark = () => document.documentElement.classList.contains("dark");

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("system preference", () => {
  it("defaults to following the OS rather than assuming light", () => {
    mockMatchMedia(true);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(pref()).toBe("system");
    expect(resolved()).toBe("dark");
  });

  it("resolves to light when the OS prefers light", () => {
    mockMatchMedia(false);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(resolved()).toBe("light");
  });

  it("applies the dark class to <html>, which is what the CSS keys off", () => {
    mockMatchMedia(true);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(htmlIsDark()).toBe(true);
  });

  it("follows the OS flipping mid-session while on system", () => {
    const mm = mockMatchMedia(false);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(resolved()).toBe("light");
    act(() => mm.flip(true));
    expect(resolved()).toBe("dark");
    expect(htmlIsDark()).toBe(true);
  });

  it("ignores the OS once the user has pinned a preference", () => {
    const mm = mockMatchMedia(false);
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    act(() => mm.flip(true));
    // An explicit choice must win; otherwise the toggle appears to do nothing
    // for anyone whose OS disagrees with it.
    expect(resolved()).toBe("light");
  });
});

describe("resolvedTheme contract", () => {
  it("is never the string 'system'", () => {
    mockMatchMedia(true);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(pref()).toBe("system");
    expect(["light", "dark"]).toContain(resolved());
  });
});

describe("persistence", () => {
  it("restores a stored preference over the OS", () => {
    mockMatchMedia(false);
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(pref()).toBe("dark");
    expect(resolved()).toBe("dark");
  });

  it("persists a toggle so it survives a reload", async () => {
    mockMatchMedia(false);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByText("toggle"));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("treats a corrupt stored value as 'system' rather than crashing", () => {
    mockMatchMedia(true);
    localStorage.setItem(THEME_STORAGE_KEY, "chartreuse");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(pref()).toBe("system");
    expect(resolved()).toBe("dark");
  });
});

describe("toggle", () => {
  it("lands on an explicit value from system, not back on system", async () => {
    mockMatchMedia(true);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(resolved()).toBe("dark");
    await userEvent.click(screen.getByText("toggle"));
    expect(pref()).toBe("light");
    expect(htmlIsDark()).toBe(false);
  });

  it("round-trips", async () => {
    mockMatchMedia(false);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByText("toggle"));
    expect(resolved()).toBe("dark");
    await userEvent.click(screen.getByText("toggle"));
    expect(resolved()).toBe("light");
  });
});
