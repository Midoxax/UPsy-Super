import { useEffect } from "react";
import { useLocation } from "@/lib/router-compat";

/**
 * Scrolls window to top whenever the route pathname changes.
 * Skips when the URL contains a hash (in-page anchor).
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    // Use instant to avoid jarring smooth scroll on transitions
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;