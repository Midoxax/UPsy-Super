import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

/* -------------- Roles -------------- */
export const useAssignRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data, error } = await supabase.rpc("admin_assign_role" as any, {
        _user_id: userId,
        _role: role,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-users-rich"] });
      toast.success("Role assigned");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useRevokeRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data, error } = await supabase.rpc("admin_revoke_role" as any, {
        _user_id: userId,
        _role: role,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-users-rich"] });
      toast.success("Role revoked");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

/* -------------- Suspend -------------- */
export const useSuspendUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, suspended, reason }: { userId: string; suspended: boolean; reason?: string }) => {
      const { data, error } = await supabase.rpc("admin_set_user_suspended" as any, {
        _user_id: userId,
        _suspended: suspended,
        _reason: reason ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-users-rich"] });
      toast.success(vars.suspended ? "User suspended" : "User reactivated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

/* -------------- Bookings -------------- */
export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      const { data, error } = await supabase.rpc("admin_cancel_booking" as any, {
        _booking_id: bookingId,
        _reason: reason ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking cancelled");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useRefundBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      const { data, error } = await supabase.rpc("admin_refund_booking" as any, {
        _booking_id: bookingId,
        _reason: reason ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-transactions"] });
      toast.success("Booking refunded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useRescheduleBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, scheduledAt }: { bookingId: string; scheduledAt: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ scheduled_at: scheduledAt, updated_at: new Date().toISOString() })
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking rescheduled");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

/* -------------- Provisioning -------------- */
export const useRetryProvisioning = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId }: { applicationId: string; adminUserId?: string }) => {
      const { data, error } = await supabase.functions.invoke("provision-psychologist", {
        body: { applicationId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accreditation-applications"] });
      qc.invalidateQueries({ queryKey: ["provisioning-attempts"] });
      toast.success("Provisioning retried successfully");
    },
    onError: (e: Error) => toast.error(`Retry failed: ${e.message}`),
  });
};

/* -------------- Psychologists quick actions -------------- */
export const useTogglePsychologistPublish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from("psychologist_profiles")
        .update({ is_published: published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-psychologists"] });
      toast.success(vars.published ? "Profile published" : "Profile hidden");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useSetAccreditationLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, level }: { id: string; level: string }) => {
      const { error } = await supabase
        .from("psychologist_profiles")
        .update({
          accreditation_level: level,
          is_accredited: level === "accredited",
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-psychologists"] });
      qc.invalidateQueries({ queryKey: ["accreditation-applications"] });
      toast.success("Accreditation level updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};