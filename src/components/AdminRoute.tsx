import { Navigate } from "@/lib/router-compat";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
