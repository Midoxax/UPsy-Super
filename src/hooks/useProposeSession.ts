import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProposeSessionInput {
  client_email: string;
  client_name?: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: "video" | "in_person" | "phone";
  notes?: string;
}

export const useProposeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProposeSessionInput) => {
      const { data, error } = await supabase.functions.invoke("propose-session", {
        body: input,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psy-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["psychologist-bookings"] });
    },
  });
};

/** Patient-side: list bookings proposed to me (status='proposed') */
export const usePendingInvitations = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pending-invitations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("id, scheduled_at, duration_minutes, session_type, patient_notes, psychologist_id, proposal_expires_at, amount_mad")
        .eq("patient_id", user.id)
        .eq("status", "proposed")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      const ids = [...new Set((data ?? []).map((b) => b.psychologist_id))];
      if (ids.length === 0) return data ?? [];
      const { data: psy } = await supabase
        .from("psychologist_profiles")
        .select("id, full_name, photo_url")
        .in("id", ids);
      const map = new Map((psy ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((b) => ({
        ...b,
        psychologist: map.get(b.psychologist_id) ?? null,
      }));
    },
    enabled: !!user,
  });
};

/** Respond to a proposal as a logged-in client (in-app accept/decline) */
export const useRespondToInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      action,
      reason,
    }: {
      bookingId: string;
      action: "accept" | "decline";
      reason?: string;
    }) => {
      const updates: {
        status: string;
        updated_at: string;
        decline_reason?: string;
      } = {
        status: action === "accept" ? "confirmed" : "cancelled",
        updated_at: new Date().toISOString(),
      };
      if (action === "decline" && reason) updates.decline_reason = reason;
      const { error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", bookingId)
        .eq("status", "proposed");
      if (error) throw error;

      // Fire-and-forget email notification to both parties.
      // Failures here must never break the in-app response.
      try {
        await supabase.functions.invoke("notify-proposal-response", {
          body: { booking_id: bookingId, action, reason: reason ?? null },
        });
      } catch (e) {
        console.warn("notify-proposal-response failed", e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["psy-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["psychologist-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });
};

/** Public token-based response (used by /booking/respond/:token) */
export const respondToProposalByToken = async (
  token: string,
  action: "accept" | "decline",
  reason?: string,
) => {
  const { data, error } = await supabase.rpc("respond_to_proposal", {
    _token: token,
    _action: action,
    _reason: reason ?? undefined,
  });
  if (error) throw error;
  return data as { ok: boolean; error?: string; status?: string; booking_id?: string };
};

export const fetchProposalByToken = async (token: string) => {
  // Use the secure RPC instead of direct table read — the public RLS policy was
  // removed because it leaked every active proposal. The RPC returns only the
  // row matching this token (and only if not expired).
  const { data: rows, error } = await supabase.rpc("get_booking_by_token" as any, { _token: token });
  if (error) throw error;
  const data = Array.isArray(rows) ? (rows[0] as any) : null;
  if (!data) return null;
  const { data: psy } = await supabase
    .from("psychologist_profiles")
    .select("id, full_name, photo_url")
    .eq("id", data.psychologist_id)
    .maybeSingle();
  return { ...data, psychologist: psy };
};
