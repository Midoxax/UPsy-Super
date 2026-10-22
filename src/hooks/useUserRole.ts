import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAdminPreview } from "@/components/admin/AdminPreviewProvider";

type AppRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const preview = useAdminPreview();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      const load = () =>
        supabase.from("user_roles").select("role").eq("user_id", user.id);
      try {
        let { data, error } = await load();
        // One retry: a transient failure would otherwise route an admin or
        // a specialist to the client dashboard as if they had no role.
        if (error) {
          await new Promise((r) => setTimeout(r, 800));
          ({ data, error } = await load());
        }

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

  // In the admin "view as" frame the dashboard behaves as the previewed role.
  const previewRole =
    preview.isPreview && preview.previewRole
      ? (preview.previewRole as AppRole)
      : null;
  const effective = useMemo<AppRole[]>(
    () => (previewRole ? [previewRole] : roles),
    [previewRole, roles],
  );

  const primaryRole: AppRole | "user" = effective.includes("admin")
    ? "admin"
    : effective.includes("psychologist")
      ? "psychologist"
      : effective.includes("league")
        ? "league"
        : effective.includes("athlete")
          ? "athlete"
          : effective.includes("coach")
            ? "coach"
            : effective.includes("organization")
              ? "organization"
              : "user";

  return {
    roles: effective,
    primaryRole,
    isAdmin: effective.includes("admin"),
    isPsychologist: effective.includes("psychologist"),
    isAthlete: effective.includes("athlete"),
    isCoach: effective.includes("coach"),
    isOrganization: effective.includes("organization"),
    isLeague: effective.includes("league"),
    loading: preview.isPreview ? false : authLoading || loading,
  };
};
