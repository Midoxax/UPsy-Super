import { useRef } from "react";
import { Navigate, useLocation } from "@/lib/router-compat";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useMfaGate } from "@/hooks/useMfaGate";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAdminAuth();
  const location = useLocation();
  const mfa = useMfaGate(isAdmin, !loading);
  // Built once: this guard re-renders with the setup page's location while
  // the redirect loads, and rebuilding the target from it loops (see
  // ProtectedRoute).
  const mfaTarget = useRef<string | null>(null);

  if (loading || (isAdmin && mfa === "checking")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (mfa === "needed") {
    if (mfaTarget.current === null) {
      const back = location.pathname + location.search;
      mfaTarget.current = `/auth/mfa-setup?redirect=${encodeURIComponent(back)}`;
    }
    return <Navigate to={mfaTarget.current} replace />;
  }
  mfaTarget.current = null;

  return <>{children}</>;
};
