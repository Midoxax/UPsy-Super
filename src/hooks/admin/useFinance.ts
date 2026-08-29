// Finance data access for /admin/finance (Phase 3 — payments & legal).
// Every read is admin-gated by RLS; issuing invoices and recording payments
// goes through SECURITY DEFINER RPCs that re-check the admin role server-side,
// so the number sequence stays gapless and amounts stay auditable.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// The generated types are regenerated on the next schema sync; these tables are
// new in this phase, so the client is widened locally rather than hand-editing
// the generated file.
const db = supabase as unknown as {
  from: (t: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }>;
};

export type Invoice = {
  id: string;
  number: string;
  issued_at: string;
  due_at: string | null;
  contact_id: string | null;
  booking_id: string | null;
  kind: string;
  currency: string;
  subtotal_mad: number;
  vat_mad: number;
  total_mad: number;
  status: "issued" | "paid" | "partially_paid" | "void";
  payment_ref: string;
  legal_mentions: string;
  notes: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  invoice_id: string;
  amount_mad: number;
  received_at: string;
  method: string;
  bank_ref: string | null;
};

// Auto-entrepreneur turnover ceiling for services (MAD). Confirm annually with
// the accountant — the warning band is deliberately conservative.
export const AE_CEILING_MAD = 200_000;

export function useInvoices(status?: string) {
  return useQuery({
    queryKey: ["admin", "invoices", status ?? "all"],
    queryFn: async (): Promise<Invoice[]> => {
      let q = db.from("invoices").select("*").order("issued_at", { ascending: false }).limit(300);
      if (status && status !== "all") q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Invoice[];
    },
  });
}

export function usePayments() {
  return useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await db
        .from("payments")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as Payment[];
    },
  });
}

export function useRevenueYtd() {
  return useQuery({
    queryKey: ["admin", "revenue-ytd"],
    queryFn: async () => {
      const { data, error } = await db.rpc("revenue_ytd_mad");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return {
        year: Number(row?.year ?? new Date().getFullYear()),
        collected: Number(row?.collected_mad ?? 0),
        issued: Number(row?.issued_mad ?? 0),
      };
    },
  });
}

export function useContactOptions() {
  return useQuery({
    queryKey: ["admin", "contact-options"],
    queryFn: async () => {
      const { data, error } = await db
        .from("crm_contacts")
        .select("id, full_name, email")
        .order("last_activity_at", { ascending: false, nullsFirst: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as { id: string; full_name: string | null; email: string }[];
    },
  });
}

export function useFinanceMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "invoices"] });
    qc.invalidateQueries({ queryKey: ["admin", "payments"] });
    qc.invalidateQueries({ queryKey: ["admin", "revenue-ytd"] });
  };

  const issueInvoice = useMutation({
    mutationFn: async (input: {
      contactId: string;
      subtotal: number;
      kind: string;
      dueDays: number;
      notes?: string;
    }) => {
      const { data, error } = await db.rpc("issue_invoice", {
        _contact_id: input.contactId,
        _subtotal_mad: input.subtotal,
        _kind: input.kind,
        _due_days: input.dueDays,
        _notes: input.notes ?? null,
      });
      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: invalidate,
  });

  const recordPayment = useMutation({
    mutationFn: async (input: {
      invoiceId: string;
      amount: number;
      receivedAt: string;
      bankRef?: string;
    }) => {
      const { data, error } = await db.rpc("record_payment", {
        _invoice_id: input.invoiceId,
        _amount_mad: input.amount,
        _received_at: input.receivedAt,
        _bank_ref: input.bankRef ?? null,
      });
      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: invalidate,
  });

  const voidInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("invoices").update({ status: "void" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { issueInvoice, recordPayment, voidInvoice };
}
