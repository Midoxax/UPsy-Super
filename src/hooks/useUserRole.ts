import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user roles:", error);
          setRoles([]);
        } else {
          setRoles(data?.map((r) => r.role) ?? []);
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchRoles();
    }
  }, [user, authLoading]);

  const primaryRole: AppRole | "user" = roles.includes("admin")
    ? "admin"
    : roles.includes("psychologist")
    ? "psychologist"
    : roles.includes("athlete")
    ? "athlete"
    : roles.includes("coach")
    ? "coach"
    : roles.includes("organization")
    ? "organization"
    : "user";

  return {
    roles,
    primaryRole,
    isAdmin: roles.includes("admin"),
    isPsychologist: roles.includes("psychologist"),
    isAthlete: roles.includes("athlete"),
    isCoach: roles.includes("coach"),
    isOrganization: roles.includes("organization"),
    loading: authLoading || loading,
  };
};
