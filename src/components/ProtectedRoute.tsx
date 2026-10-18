import { useRef } from "react";
import { Navigate, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional role gate. Admins always pass. */
  role?: AppRole | AppRole[];
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, isAdmin, loading: roleLoading } = useUserRole();
  const location = useLocation();
  // The login target computed on the first unauthenticated render. While the
  // /auth chunk loads, this guard keeps rendering with the new location
  // (/auth?redirect=...); recomputing then would replace the target with a
  // bare /auth and lose where the user was going.
  const loginTarget = useRef<string | null>(null);

  const loading = authLoading || (role ? roleLoading : false);

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

  if (role) {
    const required = Array.isArray(role) ? role : [role];
    const hasAccess = isAdmin || required.some((r) => roles.includes(r));
    if (!hasAccess) return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
