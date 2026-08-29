import { Link } from "@/lib/router-compat";
import { useEffect } from "react";

const NotFound = () => {
  const location = { pathname: window.location.pathname };

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

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
