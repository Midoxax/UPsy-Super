import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  // The icon and label describe what is on screen, which under the "system"
  // preference is the OS's choice rather than a stored one.
  const { resolvedTheme, toggleTheme } = useTheme();
  // The resolved theme is only known in the browser; keep the first paint
  // identical to the server render to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative p-2 rounded-lg transition-colors",
        "text-muted-foreground hover:text-primary",
        "focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
};

export default ThemeToggle;
