/**
 * Transfer receipts uploaded by clients, and the account details clients
 * are told to pay into. Accepting a receipt marks the booking paid and
 * records the transaction (review_payment_proof).
 */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { paymentReference } from "@/hooks/useClientBilling";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const METHOD_LABEL: Record<string, string> = {
  bank_transfer: "Bank transfer",
  cashplus: "CashPlus",
  wafacash: "Wafacash",
};

export const ReceiptsQueue = () => {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: proofs = [], isLoading } = useQuery({
    queryKey: ["admin-payment-proofs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_proofs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const bookingIds = [...new Set((data ?? []).map((p) => p.booking_id))];
      const { data: bookings } = bookingIds.length
        ? await supabase
            .from("bookings_with_details")
            .select("id, scheduled_at, patient_name, psychologist_name")
            .in("id", bookingIds)
        : { data: [] };
      const byId = new Map((bookings ?? []).map((b) => [b.id, b]));
      return (data ?? []).map((p) => ({
        ...p,
        booking: byId.get(p.booking_id),
      }));
    },
  });

  const review = useMutation({
    mutationFn: async (v: { id: string; accept: boolean }) => {
      const { error } = await supabase.rpc("review_payment_proof", {
        p_proof_id: v.id,
        p_accept: v.accept,
        p_note: notes[v.id]?.trim() || undefined,
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["admin-payment-proofs"] });
      qc.invalidateQueries({ queryKey: ["admin-transactions"] });
      toast.success(v.accept ? "Marked as paid" : "Receipt rejected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const open = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("user-documents")
      .createSignedUrl(path, 300);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading)
    return <Loader2 className="mx-auto my-8 h-6 w-6 animate-spin" />;
  if (!proofs.length)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No receipts yet.
      </p>
    );

  return (
    <div className="space-y-3">
      {proofs.map((p) => (
        <Card key={p.id}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-0.5 text-sm">
                <p className="font-medium">
                  {p.booking?.patient_name ?? "Client"} →{" "}
                  {p.booking?.psychologist_name ?? "Specialist"}
                </p>
                <p className="text-muted-foreground">
                  {METHOD_LABEL[p.method] ?? p.method} ·{" "}
                  {Number(p.amount_mad ?? 0).toFixed(2)} MAD · expected
                  reference <strong>{paymentReference(p.booking_id)}</strong>
                  {p.reference ? ` · client ref ${p.reference}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sent {format(new Date(p.created_at), "PPp")}
                  {p.booking?.scheduled_at &&
                    ` · session ${format(new Date(p.booking.scheduled_at), "PPp")}`}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">
                {p.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => open(p.file_path)}
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View receipt
              </Button>
              {p.status === "submitted" && (
                <>
                  <Input
                    className="h-9 min-w-0 flex-1"
                    placeholder="Note to the client (optional)"
                    value={notes[p.id] ?? ""}
                    onChange={(e) =>
                      setNotes((n) => ({ ...n, [p.id]: e.target.value }))
                    }
                  />
                  <Button
                    size="sm"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ id: p.id, accept: true })}
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Paid
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ id: p.id, accept: false })}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Reject
                  </Button>
                </>
              )}
              {p.review_note && (
                <span className="text-xs text-muted-foreground">
                  Note: {p.review_note}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const FIELDS = [
  ["account_holder", "Account holder"],
  ["bank_name", "Bank"],
  ["rib", "RIB (24 digits)"],
  ["iban", "IBAN"],
  ["swift", "SWIFT / BIC"],
  ["cash_recipient", "CashPlus / Wafacash recipient name"],
  ["cash_phone", "CashPlus / Wafacash phone"],
] as const;

type Settings = Partial<
  Record<(typeof FIELDS)[number][0] | "instructions", string | null>
>;

export const PaymentSettingsForm = () => {
  const qc = useQueryClient();
  const { data } = useQuery({
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
  const [form, setForm] = useState<Settings>({});
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const clean = Object.fromEntries(
        [...FIELDS.map(([k]) => k), "instructions" as const].map((k) => [
          k,
          form[k]?.trim() || null,
        ]),
      );
      const { error } = await supabase
        .from("payment_settings")
        .update({ ...clean, updated_at: new Date().toISOString() })
        .eq("id", true);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-settings"] });
      toast.success("Payment details saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Where clients send money</CardTitle>
        <p className="text-sm text-muted-foreground">
          Clients see these in their billing tab. Transfer is offered once a RIB
          or a cash recipient is set.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map(([k, label]) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={`ps-${k}`}>{label}</Label>
              <Input
                id={`ps-${k}`}
                value={form[k] ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [k]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ps-instructions">Extra instructions (optional)</Label>
          <Textarea
            id="ps-instructions"
            rows={2}
            value={form.instructions ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, instructions: e.target.value }))
            }
          />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </CardContent>
    </Card>
  );
};
