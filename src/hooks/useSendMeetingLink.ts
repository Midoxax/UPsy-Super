import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SendMeetingLinkInput {
  client_email: string;
  client_name?: string;
  client_phone?: string;
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
}

export interface SendMeetingLinkResult {
  ok: boolean;
  booking_id: string;
  join_url: string;
  video_room_id: string;
  email_sent: boolean;
  whatsapp_deeplink?: string;
  ics_data_url?: string;
  in_app_notified?: boolean;
}

export const useSendMeetingLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SendMeetingLinkInput) => {
      const { data, error } = await supabase.functions.invoke("send-meeting-link", {
        body: input,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as SendMeetingLinkResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upcoming-sessions"] });
      qc.invalidateQueries({ queryKey: ["sessions-list"] });
      qc.invalidateQueries({ queryKey: ["psy-bookings"] });
      qc.invalidateQueries({ queryKey: ["psychologist-bookings"] });
    },
  });
};