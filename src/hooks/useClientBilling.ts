import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface PaymentProof {
  id: string;
  status: "submitted" | "accepted" | "rejected";
  method: string;
  review_note: string | null;
  created_at: string;
}

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
  /** Latest receipt the client uploaded for this booking, if any. */
  proof?: PaymentProof | null;
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

/** Upcoming requested or confirmed sessions that are not paid yet. */
export const useOutstandingBookings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["client-outstanding-bookings", user?.id],
    queryFn: async (): Promise<OutstandingBooking[]> => {
      if (!user) return [];
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(
          "id, scheduled_at, duration_minutes, session_type, amount_mad, payment_status, status, psychologist_id",
        )
        .eq("patient_id", user.id)
        .in("status", ["pending", "confirmed"])
        .eq("payment_status", "unpaid")
        .gt("amount_mad", 0)
        .gte("scheduled_at", new Date(Date.now() - 86_400_000).toISOString())
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      if (!bookings?.length) return [];

      const psyIds = Array.from(
        new Set(bookings.map((b) => b.psychologist_id).filter(Boolean)),
      );
      const [{ data: psys }, { data: proofs }] = await Promise.all([
        supabase
          .from("psychologist_profiles")
          .select("id, full_name, photo_url")
          .in("id", psyIds),
        supabase
          .from("payment_proofs")
          .select("id, booking_id, status, method, review_note, created_at")
          .in(
            "booking_id",
            bookings.map((b) => b.id),
          )
          .order("created_at", { ascending: true }),
      ]);

      const psyMap = new Map((psys ?? []).map((p) => [p.id, p]));
      // Ascending order: the last write per booking is the latest receipt.
      const proofMap = new Map((proofs ?? []).map((p) => [p.booking_id, p]));

      return bookings.map((b) => ({
        ...b,
        psychologist: psyMap.get(b.psychologist_id) ?? null,
        proof: (proofMap.get(b.id) as PaymentProof | undefined) ?? null,
      })) as OutstandingBooking[];
    },
    enabled: !!user,
  });
};

/** Reference the client writes on the transfer so we can match it. */
export const paymentReference = (bookingId: string) =>
  `UPSY-${bookingId.slice(0, 8).toUpperCase()}`;

export const usePaymentSettings = () =>
  useQuery({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

/** Upload a transfer receipt into the client's own folder, then record it. */
export const useSubmitPaymentProof = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: {
      bookingId: string;
      method: "bank_transfer" | "cashplus" | "wafacash";
      reference: string;
      amountMad: number;
      file: File;
    }) => {
      if (!user) throw new Error("Not signed in");
      const ext = params.file.name.split(".").pop()?.toLowerCase() || "pdf";
      const path = `${user.id}/payments/${params.bookingId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("user-documents")
        .upload(path, params.file, { contentType: params.file.type });
      if (upErr) throw upErr;
      const { error } = await supabase.from("payment_proofs").insert({
        booking_id: params.bookingId,
        method: params.method,
        reference: params.reference || null,
        amount_mad: params.amountMad,
        file_path: path,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["client-outstanding-bookings"] });
      toast({
        title: "Receipt sent",
        description:
          "We will check it against our bank statement, usually within one working day.",
      });
    },
    onError: (err: Error) =>
      toast({
        title: "Could not send the receipt",
        description: err.message,
        variant: "destructive",
      }),
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
        .select(
          "id, booking_id, amount_mad, status, transaction_type, created_at, paid_at, refunded_at, failure_reason, invoice_number, invoice_pdf_url, provider",
        )
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
    mutationFn: async (params: {
      transactionId: string;
      outcome: "succeeded" | "failed";
    }) => {
      const { data, error } = await supabase.functions.invoke(
        "simulate-payment-webhook",
        {
          body: {
            transactionId: params.transactionId,
            outcome: params.outcome,
          },
        },
      );
      if (error) throw error;
      return data as {
        success: boolean;
        status: string;
        bookingConfirmed?: boolean;
      };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["client-outstanding-bookings"] });
      qc.invalidateQueries({ queryKey: ["client-transaction-history"] });
      qc.invalidateQueries({ queryKey: ["patient-bookings"] });
      if (data?.status === "succeeded") {
        toast({
          title: "Payment successful",
          description:
            "Your booking is confirmed and an invoice has been generated.",
        });
      } else {
        toast({
          title: "Payment failed",
          description: "The booking was cancelled.",
          variant: "destructive",
        });
      }
    },
    onError: (err: Error) => {
      toast({
        title: "Could not process payment",
        description: err.message,
        variant: "destructive",
      });
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
      toast({
        title: "Invoice unavailable",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });
};
