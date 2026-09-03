import { Link } from "@/lib/router-compat";
import { useEffect } from "react";

const NotFound = () => {
  useEffect(() => {
    // Read the path here rather than during render. This component renders on
    // the server too — it is the router's notFoundComponent, so every unmatched
    // request reaches it, including stale asset URLs and bot probes — and the
    // Worker has no `window`. Touching it in the render body threw
    // `ReferenceError: window is not defined` inside renderToReadableStream,
    // turning every 404 into a failed server render. An effect only ever runs in
    // the browser, which is also the only place this log was ever visible.
    console.error("404 Error: User attempted to access non-existent route:", window.location.pathname);
  }, []);

  return (
    <main className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-h1 text-foreground mb-4">404</h1>
        <p className="text-body text-muted-foreground mb-6">
          Oops! This page doesn't exist.
        </p>
        <Link 
          to="/" 
          className="text-u-orange hover:text-u-orange/80 underline font-medium transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
