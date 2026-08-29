import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface OutstandingBooking {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: string;
  amount_mad: number | null;
  payment_status: string | null;
  status: string;
  psychologist_id: string;
  psychologist?: { full_name: string | null; photo_url: string | null } | null;
  pending_transaction?: { id: string; amount_mad: number; transaction_type: string } | null;
}

export interface PaymentTransaction {
  id: string;
  booking_id: string | null;
  amount_mad: number;
  status: string;
  transaction_type: string;
  created_at: string;
  paid_at: string | null;
  refunded_at: string | null;
  failure_reason: string | null;
  invoice_number: string | null;
  invoice_pdf_url: string | null;
  provider: string | null;
}

export const useOutstandingBookings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["client-outstanding-bookings", user?.id],
    queryFn: async (): Promise<OutstandingBooking[]> => {
      if (!user) return [];
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("id, scheduled_at, duration_minutes, session_type, amount_mad, payment_status, status, psychologist_id")
        .eq("patient_id", user.id)
        .in("payment_status", ["pending", "pending_deposit", "deposit_paid"])
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      if (!bookings?.length) return [];

      const psyIds = Array.from(new Set(bookings.map((b) => b.psychologist_id).filter(Boolean)));
      const bookingIds = bookings.map((b) => b.id);

      const [{ data: psys }, { data: txs }] = await Promise.all([
        supabase.from("psychologist_profiles").select("id, full_name, photo_url").in("id", psyIds),
        supabase
          .from("payment_transactions")
          .select("id, booking_id, amount_mad, transaction_type")
          .eq("status", "pending")
          .in("booking_id", bookingIds),
      ]);

      const psyMap = new Map((psys ?? []).map((p) => [p.id, p]));
      const txMap = new Map((txs ?? []).map((t) => [t.booking_id, t]));

      return bookings.map((b) => ({
        ...b,
        psychologist: psyMap.get(b.psychologist_id) ?? null,
        pending_transaction: txMap.get(b.id) ?? null,
      })) as OutstandingBooking[];
    },
    enabled: !!user,
  });
};

export const useTransactionHistory = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["client-transaction-history", user?.id],
    queryFn: async (): Promise<PaymentTransaction[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("id, booking_id, amount_mad, status, transaction_type, created_at, paid_at, refunded_at, failure_reason, invoice_number, invoice_pdf_url, provider")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as PaymentTransaction[];
    },
    enabled: !!user,
  });
};

export const useSimulatePayment = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { transactionId: string; outcome: "succeeded" | "failed" }) => {
      const { data, error } = await supabase.functions.invoke("simulate-payment-webhook", {
        body: { transactionId: params.transactionId, outcome: params.outcome },
      });
      if (error) throw error;
      return data as { success: boolean; status: string; bookingConfirmed?: boolean };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["client-outstanding-bookings"] });
      qc.invalidateQueries({ queryKey: ["client-transaction-history"] });
      qc.invalidateQueries({ queryKey: ["patient-bookings"] });
      if (data?.status === "succeeded") {
        toast({ title: "Payment successful", description: "Your booking is confirmed and an invoice has been generated." });
      } else {
        toast({ title: "Payment failed", description: "The booking was cancelled.", variant: "destructive" });
      }
    },
    onError: (err: Error) => {
      toast({ title: "Could not process payment", description: err.message, variant: "destructive" });
    },
  });
};

export const useDownloadInvoice = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (path: string) => {
      const { data, error } = await supabase.storage
        .from("user-documents")
        .createSignedUrl(path, 60 * 5);
      if (error) throw error;
      return data.signedUrl;
    },
    onSuccess: (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: () => {
      toast({ title: "Invoice unavailable", description: "Please try again or contact support.", variant: "destructive" });
    },
  });
};