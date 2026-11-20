import { useRef } from "react";
import { Navigate, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useMfaGate } from "@/hooks/useMfaGate";
import { needsMfa } from "@/lib/auth/mfa";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional role gate. Admins always pass. */
  role?: AppRole | AppRole[];
  /** Only for the MFA setup page itself, which must not redirect to itself. */
  allowWithoutMfa?: boolean;
}

export const ProtectedRoute = ({
  children,
  role,
  allowWithoutMfa,
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, realRoles, isAdmin, loading: roleLoading } = useUserRole();
  const location = useLocation();
  // The login target computed on the first unauthenticated render. While the
  // /auth chunk loads, this guard keeps rendering with the new location
  // (/auth?redirect=...); recomputing then would replace the target with a
  // bare /auth and lose where the user was going.
  const loginTarget = useRef<string | null>(null);
  // Same for the two-step setup target: while that redirect loads, this
  // guard re-renders with the new location; building the target from it
  // again (".../mfa-setup?redirect=.../mfa-setup?redirect=...") made a new
  // redirect each render, without end.
  const mfaTarget = useRef<string | null>(null);

  const mfa = useMfaGate(
    !allowWithoutMfa && !!user && needsMfa(realRoles),
    !authLoading && !roleLoading,
  );
  const loading = authLoading || (user && (roleLoading || mfa === "checking"));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    if (loginTarget.current === null) {
      const back = location.pathname + location.search;
      const safe = back && !back.startsWith("/auth") ? back : "";
      loginTarget.current = safe
        ? `/auth?redirect=${encodeURIComponent(safe)}`
        : "/auth";
    }
    return <Navigate to={loginTarget.current} replace />;
  }
  loginTarget.current = null;

  if (mfa === "needed") {
    if (mfaTarget.current === null) {
      const back = location.pathname + location.search;
      mfaTarget.current = `/auth/mfa-setup?redirect=${encodeURIComponent(back)}`;
    }
    return <Navigate to={mfaTarget.current} replace />;
  }
  mfaTarget.current = null;

  if (role) {
    const required = Array.isArray(role) ? role : [role];
    const hasAccess = isAdmin || required.some((r) => roles.includes(r));
    if (!hasAccess) return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
