/**
 * UPSY.ma — RoleRouter
 *
 * Composant central de routage par rôle utilisateur.
 * Redirige /dashboard vers le sous-dashboard adapté.
 *
 * Comportement :
 *   - Pendant loading → état "calme" (skeleton + message rassurant)
 *   - Pas connecté → /auth (en préservant l'URL cible)
 *   - admin → /admin
 *   - organization → /dashboard/organization
 *   - psychologist → /dashboard/specialist
 *   - athlete | coach → /athlete-hub
 *   - sinon → /dashboard/client
 */

import { useEffect } from "react";
import { Navigate, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useActiveView } from "@/hooks/useActiveView";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const CalmLoadingState = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-4">
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="text-lg font-medium text-foreground">
          On prépare ton espace…
        </h1>
        <p className="text-sm text-muted-foreground">
          Quelques secondes, c'est presque prêt.
        </p>
      </div>
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>
    </div>
  </div>
);

const RoleRouter = () => {
  const { user, loading: authLoading } = useAuth();
  const { primaryRole, loading: roleLoading, isAdmin, roles } = useUserRole();
  const { activeView } = useActiveView();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !roleLoading && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[RoleRouter] user:", user?.id, "role:", primaryRole);
    }
  }, [authLoading, roleLoading, user?.id, primaryRole]);

  if (authLoading || roleLoading) {
    return <CalmLoadingState />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // View-as override (admins or multi-role users only)
  const canOverride = isAdmin || roles.length >= 2;
  if (canOverride && activeView !== "auto") {
    switch (activeView) {
      case "admin": return <Navigate to="/admin" replace />;
      case "specialist": return <Navigate to="/dashboard/specialist" replace />;
      case "client": return <Navigate to="/dashboard/client" replace />;
      case "organization": return <Navigate to="/dashboard/organization" replace />;
    }
  }

  switch (primaryRole) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "psychologist":
      return <Navigate to="/dashboard/specialist" replace />;
    case "organization":
      return <Navigate to="/dashboard/organization" replace />;
    case "athlete":
    case "coach":
      return <Navigate to="/athlete-hub" replace />;
    case "user":
    default:
      return <Navigate to="/dashboard/client" replace />;
  }
};

export default RoleRouter;
