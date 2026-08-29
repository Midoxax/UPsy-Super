import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  last_message_at: string;
  created_at: string;
  resolution: string | null;
  closed_at: string | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  author_role: "user" | "admin" | "system";
  body: string;
  attachments: any[];
  created_at: string;
}

export const useMyTickets = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-tickets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("support_tickets" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SupportTicket[];
    },
    enabled: !!user,
  });
};

export const useAllTickets = () =>
  useQuery({
    queryKey: ["all-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets" as any)
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as SupportTicket[];
    },
  });

export const useTicketMessages = (ticketId: string | null) => {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["ticket-messages", ticketId],
    queryFn: async () => {
      if (!ticketId) return [];
      const { data, error } = await supabase
        .from("support_ticket_messages" as any)
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as unknown as TicketMessage[];
    },
    enabled: !!ticketId,
  });

  useEffect(() => {
    if (!ticketId) return;
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_ticket_messages", filter: `ticket_id=eq.${ticketId}` },
        () => qc.invalidateQueries({ queryKey: ["ticket-messages", ticketId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, qc]);

  return query;
};

export const useCreateTicket = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subject: string; category: string; body: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data: ticket, error } = await supabase
        .from("support_tickets" as any)
        .insert({
          user_id: user.id,
          subject: input.subject,
          category: input.category,
        } as any)
        .select()
        .single();
      if (error) throw error;
      const t = ticket as any;
      const { error: msgErr } = await supabase
        .from("support_ticket_messages" as any)
        .insert({
          ticket_id: t.id,
          author_id: user.id,
          author_role: "user",
          body: input.body,
        } as any);
      if (msgErr) throw msgErr;
      return t as SupportTicket;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
      qc.invalidateQueries({ queryKey: ["all-tickets"] });
    },
  });
};

export const usePostTicketMessage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { ticketId: string; body: string; isAdmin?: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("support_ticket_messages" as any)
        .insert({
          ticket_id: input.ticketId,
          author_id: user.id,
          author_role: input.isAdmin ? "admin" : "user",
          body: input.body,
        } as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["ticket-messages", vars.ticketId] });
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
      qc.invalidateQueries({ queryKey: ["all-tickets"] });
    },
  });
};

export const useUpdateTicketStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, status, resolution }: { ticketId: string; status: string; resolution?: string }) => {
      const updates: any = { status };
      if (status === "resolved" || status === "closed") {
        updates.closed_at = new Date().toISOString();
        if (resolution) updates.resolution = resolution;
      }
      const { error } = await supabase
        .from("support_tickets" as any)
        .update(updates)
        .eq("id", ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
      qc.invalidateQueries({ queryKey: ["all-tickets"] });
    },
  });
};
