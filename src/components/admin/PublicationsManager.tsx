import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, Landmark, Loader2, Plus, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { usePublicationsCopy } from "@/lib/shop/publicationsCopy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Pub = Tables<"publications">;
type Order = Tables<"publication_orders"> & {
  publications: Pick<Pub, "title" | "title_fr"> | null;
};

/** Admin: the booklet catalogue, its orders and U.Psy's payment details. */
export default function PublicationsManager() {
  return (
    <div className="space-y-6">
      <Catalogue />
      <OrdersDesk />
      <ShopSettings />
    </div>
  );
}

function Catalogue() {
  const { t } = usePublicationsCopy();
  const [editing, setEditing] = useState<Pub | "new" | null>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-publications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .order("position")
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <section className="space-y-3 rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> {t.manage}
        </h3>
        <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4 me-1" /> {t.newPub}
        </Button>
      </div>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      <ul className="divide-y">
        {data.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 py-2 text-sm"
          >
            <span className="min-w-0">
              <span className="font-medium">{p.title_fr || p.title}</span>{" "}
              <span className="text-xs text-muted-foreground">
                {[
                  p.price_print != null &&
                    `${t.formats.print} ${t.mad(Number(p.price_print))}`,
                  p.price_ebook != null &&
                    `${t.formats.ebook} ${t.mad(Number(p.price_ebook))}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <Badge variant={p.is_published ? "default" : "secondary"}>
                {p.is_published ? t.published : t.draft}
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                {t.edit}
              </Button>
            </span>
          </li>
        ))}
      </ul>
      {editing && (
        <Editor
          key={editing === "new" ? "new" : editing.id}
          pub={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

const PRICE_KEYS = [
  "price_print",
  "price_print_member",
  "price_ebook",
  "price_ebook_member",
] as const;

function Editor({ pub, onClose }: { pub: Pub | null; onClose: () => void }) {
  const { t } = usePublicationsCopy();
  const qc = useQueryClient();
  const [f, setF] = useState<TablesInsert<"publications">>(
    pub ?? { slug: "", title: "", is_published: false, position: 0 },
  );
  const [cover, setCover] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof TablesInsert<"publications">, v: unknown) =>
    setF({ ...f, [k]: v });
  const text = (k: keyof TablesInsert<"publications">) => ({
    value: (f[k] as string | null | undefined) ?? "",
    onChange: (e: { target: { value: string } }) =>
      set(k, e.target.value || null),
  });
  const num = (k: keyof TablesInsert<"publications">) => ({
    type: "number",
    min: 0,
    value: (f[k] as number | null | undefined) ?? "",
    onChange: (e: { target: { value: string } }) =>
      set(k, e.target.value === "" ? null : Number(e.target.value)),
  });

  const save = async () => {
    setBusy(true);
    const row = {
      ...f,
      slug: f.slug.trim().toLowerCase(),
      title: f.title.trim(),
    };
    try {
      if (cover) {
        const path = `${row.slug}/${Date.now()}-cover.${cover.name.split(".").pop() || "jpg"}`;
        const up = await supabase.storage
          .from("publication-covers")
          .upload(path, cover, { contentType: cover.type || undefined });
        if (up.error) throw up.error;
        row.cover_url = supabase.storage
          .from("publication-covers")
          .getPublicUrl(path).data.publicUrl;
      }
      if (pdf) {
        const path = `${row.slug}/${Date.now()}.pdf`;
        const up = await supabase.storage
          .from("publication-files")
          .upload(path, pdf, { contentType: "application/pdf" });
        if (up.error) throw up.error;
        row.ebook_path = path;
      }
      const { error } = pub
        ? await supabase.from("publications").update(row).eq("id", pub.id)
        : await supabase.from("publications").insert(row);
      if (error) throw error;
      toast.success(t.saved);
      qc.invalidateQueries({ queryKey: ["admin-publications"] });
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl bg-muted/30 p-4">
      <div className="grid gap-2 md:grid-cols-2">
        <Input placeholder={t.fSlug} {...text("slug")} value={f.slug} />
        <Input placeholder={t.fAuthor} {...text("author")} />
        <Input placeholder={t.fTitleFr} {...text("title_fr")} />
        <Input placeholder={t.fTitle} {...text("title")} value={f.title} />
        <Input placeholder={t.fTitleAr} dir="rtl" {...text("title_ar")} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder={t.fPages} {...num("pages")} />
          <Input placeholder={t.fIsbn} {...text("isbn")} />
        </div>
      </div>
      <Textarea placeholder={t.fDescFr} {...text("description_fr")} />
      <Textarea placeholder={t.fDesc} {...text("description")} />
      <Textarea placeholder={t.fDescAr} dir="rtl" {...text("description_ar")} />
      <div className="grid gap-2 md:grid-cols-4">
        {PRICE_KEYS.map((k) => (
          <label key={k} className="text-xs text-muted-foreground">
            {
              {
                price_print: t.fPrint,
                price_print_member: t.fPrintMember,
                price_ebook: t.fEbook,
                price_ebook_member: t.fEbookMember,
              }[k]
            }
            <Input className="mt-1" {...num(k)} />
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t.pricesHint}</p>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="text-xs text-muted-foreground">
          {t.fCover}
          <Input
            type="file"
            accept="image/*"
            className="mt-1"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          {t.fFile} {f.ebook_path && !pdf ? `(${t.fileOk})` : ""}
          <Input
            type="file"
            accept="application/pdf"
            className="mt-1"
            onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={!!f.is_published}
            onCheckedChange={(v) => set("is_published", v)}
          />
          {t.published}
        </label>
        <Button size="sm" disabled={busy || !f.slug || !f.title} onClick={save}>
          {t.save}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          {t.close}
        </Button>
      </div>
    </div>
  );
}

function OrdersDesk() {
  const { t } = usePublicationsCopy();
  const [filter, setFilter] = useState<"open" | "all">("open");
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-publication-orders", filter],
    queryFn: async () => {
      let q = supabase
        .from("publication_orders")
        .select("*, publications(title, title_fr)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter === "open")
        q = q.in("status", ["awaiting_payment", "payment_submitted", "paid"]);
      const { data, error } = await q;
      if (error) throw error;
      const orders = ((data ?? []) as Order[]).filter(
        (o) => filter === "all" || o.status !== "paid" || o.format === "print",
      );
      const ids = [...new Set(orders.map((o) => o.user_id))];
      const { data: people } = ids.length
        ? await supabase.from("profiles").select("id, full_name").in("id", ids)
        : { data: [] };
      const names = new Map((people ?? []).map((p) => [p.id, p.full_name]));
      return { orders, names };
    },
  });
  return (
    <section className="space-y-3 rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" /> {t.orders}
        </h3>
        <div className="flex gap-1">
          {(["open", "all"] as const).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={filter === k ? "default" : "outline"}
              onClick={() => setFilter(k)}
            >
              {t.filter[k]}
            </Button>
          ))}
        </div>
      </div>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {data && data.orders.length === 0 && (
        <p className="text-sm text-muted-foreground">{t.ordersNone}</p>
      )}
      {data?.orders.map((o) => (
        <OrderRow
          key={o.id}
          o={o}
          name={data.names.get(o.user_id) ?? null}
          onChange={() => refetch()}
        />
      ))}
    </section>
  );
}

function OrderRow({
  o,
  name,
  onChange,
}: {
  o: Order;
  name: string | null;
  onChange: () => void;
}) {
  const { t } = usePublicationsCopy();
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("cash");
  const [busy, setBusy] = useState(false);
  const act = async (action: string, m: string | null = null) => {
    setBusy(true);
    const { error } = await supabase.rpc("publication_order_admin", {
      _order: o.id,
      _action: action,
      _method: m as string,
      _note: note,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.saved);
    setNote("");
    onChange();
  };
  const receipt = async () => {
    if (!o.proof_path) return;
    const { data, error } = await supabase.storage
      .from("shop-proofs")
      .createSignedUrl(o.proof_path, 300);
    if (error || !data) return toast.error(error?.message ?? "");
    window.open(data.signedUrl, "_blank", "noopener");
  };
  return (
    <div className="rounded-lg border p-3 space-y-2 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">
            {o.publications?.title_fr || o.publications?.title} ·{" "}
            {t.formats[o.format]}
            {o.quantity > 1 ? ` × ${o.quantity}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.buyer} : {name || o.ship_name || o.user_id.slice(0, 8)} ·{" "}
            {new Date(o.created_at).toLocaleDateString("fr-FR")}
            {o.member_price ? ` · ${t.memberShort}` : ""}
          </p>
          {o.format === "print" && (
            <p className="text-xs whitespace-pre-line">
              {[o.ship_name, o.ship_address, o.ship_city, o.ship_phone]
                .filter(Boolean)
                .join("\n")}
            </p>
          )}
          {o.pay_method && (
            <p className="text-xs text-muted-foreground">
              {t.inPerson[o.pay_method] ?? o.pay_method}
              {o.pay_reference ? ` · ${o.pay_reference}` : ""}
            </p>
          )}
          {o.invoice_number && (
            <p className="text-xs font-mono">{o.invoice_number}</p>
          )}
        </div>
        <div className="text-end space-y-1">
          <Badge variant="secondary">{t.status[o.status] ?? o.status}</Badge>
          <p className="font-semibold">{t.mad(Number(o.total_mad))}</p>
        </div>
      </div>
      {o.status !== "cancelled" &&
        o.status !== "shipped" &&
        !(o.status === "paid" && o.format === "ebook") && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-2">
            <Input
              className="flex-1 min-w-[160px]"
              placeholder={t.note}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {o.status === "payment_submitted" && (
              <>
                {o.proof_path && (
                  <Button size="sm" variant="outline" onClick={receipt}>
                    {t.viewReceipt}
                  </Button>
                )}
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => act("confirm")}
                >
                  {t.confirm}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => act("reject")}
                >
                  {t.reject}
                </Button>
              </>
            )}
            {o.status === "awaiting_payment" && (
              <>
                <select
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  {Object.entries(t.inPerson).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => act("confirm", method)}
                >
                  {t.record}
                </Button>
              </>
            )}
            {o.status === "paid" && o.format === "print" && (
              <Button size="sm" disabled={busy} onClick={() => act("ship")}>
                {t.ship}
              </Button>
            )}
            {(o.status === "awaiting_payment" ||
              o.status === "payment_submitted") && (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => act("cancel")}
              >
                {t.cancel}
              </Button>
            )}
          </div>
        )}
    </div>
  );
}

function ShopSettings() {
  const { data, refetch } = useQuery({
    queryKey: ["admin-shop-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shop_settings")
        .select("*")
        .maybeSingle();
      return data;
    },
  });
  if (!data) return null;
  return (
    <SettingsForm key={data.updated_at} s={data} onSaved={() => refetch()} />
  );
}

function SettingsForm({
  s,
  onSaved,
}: {
  s: Tables<"shop_settings">;
  onSaved: () => void;
}) {
  const { t } = usePublicationsCopy();
  const [f, setF] = useState(s);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("shop_settings")
      .update({
        bank_name: f.bank_name || null,
        account_holder: f.account_holder || null,
        rib: f.rib?.replace(/\s+/g, " ").trim() || null,
        instructions_fr: f.instructions_fr || null,
        shipping_fee_mad: Number(f.shipping_fee_mad) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.saved);
    onSaved();
  };
  return (
    <section className="space-y-3 rounded-2xl border border-border p-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Landmark className="h-4 w-4" /> {t.settings}
      </h3>
      <div className="grid gap-2 md:grid-cols-2">
        <Input
          placeholder={t.fBank}
          value={f.bank_name ?? ""}
          onChange={(e) => setF({ ...f, bank_name: e.target.value })}
        />
        <Input
          placeholder={t.fHolder}
          value={f.account_holder ?? ""}
          onChange={(e) => setF({ ...f, account_holder: e.target.value })}
        />
        <Input
          placeholder={t.fRib}
          className="font-mono"
          value={f.rib ?? ""}
          onChange={(e) => setF({ ...f, rib: e.target.value })}
        />
        <label className="text-xs text-muted-foreground">
          {t.fShipping}
          <Input
            type="number"
            min={0}
            className="mt-1"
            value={f.shipping_fee_mad}
            onChange={(e) =>
              setF({ ...f, shipping_fee_mad: Number(e.target.value) })
            }
          />
        </label>
      </div>
      <Textarea
        placeholder={t.payTitle("…")}
        value={f.instructions_fr ?? ""}
        onChange={(e) => setF({ ...f, instructions_fr: e.target.value })}
      />
      <Button size="sm" disabled={busy} onClick={save}>
        {t.save}
      </Button>
    </section>
  );
}
