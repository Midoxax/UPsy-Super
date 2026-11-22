import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { usePublicationsCopy } from "@/lib/shop/publicationsCopy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MAX_BYTES = 5 * 1024 * 1024;

export type Order = Tables<"publication_orders"> & {
  publications: Tables<"publications"> | null;
};

export const myOrdersKey = (uid?: string) => ["publication-orders", uid];

/** The signed-in buyer's orders: pay, follow, download paid ebooks. */
export default function MyOrders({
  publicationId,
}: {
  publicationId?: string;
}) {
  const { user } = useAuth();
  const { t } = usePublicationsCopy();
  const { data, isLoading } = useQuery({
    queryKey: myOrdersKey(user?.id),
    enabled: !!user,
    queryFn: async () => {
      const [orders, settings] = await Promise.all([
        supabase
          .from("publication_orders")
          .select("*, publications(*)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase.from("shop_settings").select("*").maybeSingle(),
      ]);
      if (orders.error) throw orders.error;
      return {
        orders: (orders.data ?? []) as Order[],
        settings: settings.data,
      };
    },
  });
  if (!user) return null;
  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
  const orders = (data?.orders ?? []).filter(
    (o) => !publicationId || o.publication_id === publicationId,
  );
  if (orders.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{t.myOrders}</h2>
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} settings={data?.settings ?? null} />
      ))}
    </section>
  );
}

function OrderCard({
  order: o,
  settings: s,
}: {
  order: Order;
  settings: Tables<"shop_settings"> | null;
}) {
  const { user } = useAuth();
  const { t, locale } = usePublicationsCopy();
  const loc = useLocalizedField();
  const qc = useQueryClient();
  const [method, setMethod] = useState<"transfer" | "deposit">("transfer");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () =>
    qc.invalidateQueries({ queryKey: myOrdersKey(user?.id) });
  const date = new Date(o.created_at).toLocaleDateString(
    locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR",
  );

  const send = async () => {
    if (!user || !file) return;
    if (file.size > MAX_BYTES) return toast.error(t.tooLarge);
    setBusy(true);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const path = `${user.id}/${o.id}-${Date.now()}-${safe}`;
    const up = await supabase.storage
      .from("shop-proofs")
      .upload(path, file, { contentType: file.type || undefined });
    if (up.error) {
      setBusy(false);
      return toast.error(up.error.message);
    }
    const { error } = await supabase.rpc("publication_order_pay", {
      _order: o.id,
      _method: method,
      _reference: reference,
      _proof_path: path,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.sent);
    refresh();
  };

  const download = async () => {
    const path = o.publications?.ebook_path;
    if (!path) return;
    setBusy(true);
    const { data, error } = await supabase.storage
      .from("publication-files")
      .createSignedUrl(path, 300, { download: true });
    setBusy(false);
    if (error || !data) return toast.error(error?.message ?? "");
    window.location.href = data.signedUrl;
  };

  const cancel = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("publication_order_cancel", {
      _order: o.id,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.cancelled);
    refresh();
  };

  return (
    <Card className="p-4 space-y-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{loc(o.publications, "title")}</p>
          <p className="text-xs text-muted-foreground">
            {t.formats[o.format]} · {o.quantity > 1 ? `${o.quantity} × ` : ""}
            {t.mad(Number(o.unit_price_mad))}
            {o.member_price ? ` (${t.memberShort})` : ""} · {date}
          </p>
        </div>
        <div className="text-end space-y-1">
          <Badge
            variant={
              o.status === "paid" || o.status === "shipped"
                ? "default"
                : "secondary"
            }
          >
            {t.status[o.status] ?? o.status}
          </Badge>
          <p className="font-semibold">{t.mad(Number(o.total_mad))}</p>
        </div>
      </div>

      {o.invoice_number && (
        <p className="text-xs">
          {t.invoice} <span className="font-mono">{o.invoice_number}</span>
        </p>
      )}
      {o.review_note && o.status !== "cancelled" && (
        <p
          className={
            o.status === "awaiting_payment"
              ? "text-destructive"
              : "text-muted-foreground"
          }
        >
          {o.status === "awaiting_payment" ? `${t.refused} ` : ""}
          {o.review_note}
        </p>
      )}

      {o.status === "paid" && o.format === "ebook" && (
        <Button size="sm" onClick={download} disabled={busy}>
          <Download className="h-4 w-4 me-1" /> {t.download}
        </Button>
      )}

      {o.status === "awaiting_payment" && (
        <div className="space-y-2 border-t pt-3">
          <p>{t.payTitle(String(Number(o.total_mad)))}</p>
          {s?.rib ? (
            <dl className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
              {s.bank_name && (
                <div>
                  <dt className="inline text-muted-foreground">{t.bank} : </dt>
                  <dd className="inline">{s.bank_name}</dd>
                </div>
              )}
              {s.account_holder && (
                <div>
                  <dt className="inline text-muted-foreground">
                    {t.holder} :{" "}
                  </dt>
                  <dd className="inline">{s.account_holder}</dd>
                </div>
              )}
              <div>
                <dt className="inline text-muted-foreground">{t.rib} : </dt>
                <dd className="inline font-mono">{s.rib}</dd>
              </div>
              {s.instructions_fr && (
                <p className="pt-1 whitespace-pre-line">{s.instructions_fr}</p>
              )}
            </dl>
          ) : (
            <p className="text-xs text-muted-foreground">{t.noBank}</p>
          )}
          {s?.rib && (
            <>
              <div className="flex gap-2">
                {(["transfer", "deposit"] as const).map((m) => (
                  <Button
                    key={m}
                    size="sm"
                    type="button"
                    variant={method === m ? "default" : "outline"}
                    onClick={() => setMethod(m)}
                  >
                    {t.method[m]}
                  </Button>
                ))}
              </div>
              <Input
                placeholder={t.reference}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
              <label className="block text-xs text-muted-foreground">
                {t.receipt}
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  className="mt-1"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <Button size="sm" disabled={!file || busy} onClick={send}>
                {t.send}
              </Button>
            </>
          )}
        </div>
      )}

      {(o.status === "awaiting_payment" ||
        o.status === "payment_submitted") && (
        <Button size="sm" variant="ghost" disabled={busy} onClick={cancel}>
          {t.cancel}
        </Button>
      )}
    </Card>
  );
}
