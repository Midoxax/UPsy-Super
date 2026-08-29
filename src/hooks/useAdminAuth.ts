import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminAuth = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();

  return { isAdmin, loading, user };
};
