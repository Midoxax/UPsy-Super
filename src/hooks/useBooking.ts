import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

// ── Psychologist: own availability slots ──────────────────────────────────────

export const usePsychologistSlots = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["psy-slots", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("psychologist_id", user.id)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};

export const useUpsertSlot = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slot: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      session_duration_minutes?: number;
      is_active?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("availability_slots").insert({
        psychologist_id: user.id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psy-slots"] });
    },
  });
};

export const useDeleteSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("availability_slots")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psy-slots"] });
    },
  });
};

// ── Psychologist: own bookings ────────────────────────────────────────────────

export const usePsychologistBookings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["psy-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("psychologist_id", user.id)
        .order("scheduled_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      // Enrich with patient names
      const patientIds = [...new Set((data ?? []).map((b) => b.patient_id))];
      if (patientIds.length === 0) return data ?? [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", patientIds);
      const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
      return (data ?? []).map((b) => ({
        ...b,
        patient_name: nameMap.get(b.patient_id) ?? null,
      }));
    },
    enabled: !!user,
  });
};

// ── Patient: available slots for a psychologist on a date ─────────────────────

export const useAvailableSlots = (psychologistId: string, date: Date | null) => {
  return useQuery({
    queryKey: ["available-slots", psychologistId, date?.toISOString()],
    queryFn: async () => {
      if (!date) return [];
      const dateStr = format(date, "yyyy-MM-dd");
      const { data, error } = await supabase.rpc("get_available_slots", {
        p_psychologist_id: psychologistId,
        p_date: dateStr,
      });
      if (error) throw error;
      return (data ?? []) as { slot_start: string; is_available: boolean }[];
    },
    enabled: !!psychologistId && !!date,
  });
};

// ── Patient: create booking ───────────────────────────────────────────────────

export const useCreateBooking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: {
      psychologist_id: string;
      scheduled_at: string;
      session_type: string;
      duration_minutes: number;
      patient_notes?: string;
      amount_mad?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // The bookings INSERT policy requires amount_mad to equal the psychologist's
      // hourly rate prorated to the session duration. Always compute it from the
      // authoritative rate instead of trusting a passed-in hourly figure.
      const { data: psy, error: psyError } = await supabase
        .from("psychologist_profiles")
        .select("hourly_rate_mad")
        .eq("id", booking.psychologist_id)
        .maybeSingle();
      if (psyError) throw psyError;
      const rate = psy?.hourly_rate_mad ?? 0;
      const amount = Math.round((rate * booking.duration_minutes / 60) * 100) / 100;

      const { error } = await supabase.from("bookings").insert({
        psychologist_id: booking.psychologist_id,
        patient_id: user.id,
        scheduled_at: booking.scheduled_at,
        session_type: booking.session_type,
        duration_minutes: booking.duration_minutes,
        patient_notes: booking.patient_notes ?? null,
        amount_mad: amount,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      queryClient.invalidateQueries({ queryKey: ["psy-bookings"] });
    },
  });
};
