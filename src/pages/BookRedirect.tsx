import { useEffect } from "react";
import { Navigate, useParams, useSearchParams } from "@/lib/router-compat";

/**
 * /b/:slug → /psychologists/:slug?book=1&src=share
 * Short shareable booking link for WhatsApp/SMS.
 */
const BookRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();

  useEffect(() => {
    // Fire a basic tracking event if PostHog is wired up globally.
    try {
      const w: any = window;
      if (w.posthog?.capture) {
        w.posthog.capture("booking_link_clicked", {
          slug,
          src: params.get("src") || "share",
        });
      }
    } catch {
      /* ignore */
    }
  }, [slug, params]);

  if (!slug) return <Navigate to="/psychologists" replace />;
  const src = params.get("src") || "share";
  return <Navigate to={`/psychologists/${slug}?book=1&src=${encodeURIComponent(src)}`} replace />;
};

export default BookRedirect;
