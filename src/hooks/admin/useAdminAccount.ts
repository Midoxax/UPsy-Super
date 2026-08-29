import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdminUsersRich = (search?: string) =>
  useQuery({
    queryKey: ["admin-users-rich", search ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users_rich" as any, {
        _search: search || null,
        _limit: 200,
      });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
        city: string | null;
        phone: string | null;
        created_at: string;
        last_sign_in_at: string | null;
        email_confirmed_at: string | null;
        is_suspended: boolean;
        suspended_reason: string | null;
        roles: string[];
      }>;
    },
  });

export const useAdminUserActivity = (userId: string | null) =>
  useQuery({
    queryKey: ["admin-user-activity", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_user_activity" as any, {
        _user_id: userId,
      });
      if (error) throw error;
      return data as {
        recent_bookings: any[];
        recent_assessments: any[];
        audit_tail: any[];
        journals_30d: number;
        moods_30d: number;
      };
    },
  });

export const useForceSignout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("admin_force_signout" as any, { _user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User signed out from all sessions");
      qc.invalidateQueries({ queryKey: ["admin-users-rich"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useSendPasswordReset = () => {
  return useMutation({
    mutationFn: async ({ userId, email }: { userId: string; email: string }) => {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      await supabase.rpc("admin_log_password_reset" as any, { _user_id: userId, _email: email });
    },
    onSuccess: () => toast.success("Password reset email sent"),
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("admin_delete_profile" as any, { _user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Account deleted");
      qc.invalidateQueries({ queryKey: ["admin-users-rich"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { error } = await supabase.rpc("admin_update_booking_status" as any, {
        _booking_id: bookingId,
        _new_status: status,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success(`Booking marked ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};