import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, FileText, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useMembershipCopy } from "@/lib/league/membershipCopy";
import {
  type MemberDoc,
  downloadAttestationPdf,
  downloadCardPdf,
} from "@/lib/league/memberDocs";

type DeskRow = {
  membership_id: string;
  full_name: string | null;
  email: string;
  plan_label: string;
  plan_amount: number | null;
  plan_code: string;
  category: string;
  status: string;
  member_number: string | null;
  starts_on: string | null;
  ends_on: string | null;
  attestation_number: string | null;
  birth_date: string | null;
  photo_path: string | null;
  enrolment_path: string | null;
  verify_token: string | null;
  created_at: string;
  confirmed_at: string | null;
  payment_id: string | null;
  payment_status: string | null;
  payment_method: string | null;
  payment_amount: number | null;
  payer_reference: string | null;
  proof_path: string | null;
  receipt_number: string | null;
  paid_at: string | null;
};

const ageOf = (d: string) =>
  Math.floor(
    (Date.now() - new Date(d).getTime()) / (365.25 * 24 * 3600 * 1000),
  );

/** League portal: check payments, record cash/cheque, set fees and bank details. */
export default function MembershipDesk() {
  const { t } = useMembershipCopy();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"todo" | "members" | "all">("todo");
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["league-desk"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("league_membership_desk");
      if (error) throw error;
      return (data ?? []) as DeskRow[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["league-desk"] });

  const shown = rows.filter((r) =>
    filter === "todo"
      ? r.payment_status === "submitted"
      : filter === "members"
        ? r.status === "active"
        : true,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["todo", t.toReview],
            ["members", t.members],
            ["all", t.allRequests],
          ] as const
        ).map(([k, l]) => (
          <Button
            key={k}
            size="sm"
            variant={filter === k ? "default" : "outline"}
            onClick={() => setFilter(k)}
          >
            {l}
            {k === "todo" &&
              ` (${rows.filter((r) => r.payment_status === "submitted").length})`}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => (
            <DeskItem key={r.membership_id} r={r} onChange={refresh} />
          ))}
        </div>
      )}

      <GrantForm onDone={refresh} />
      <PlansEditor />
      <BankEditor />
    </div>
  );
}

function DeskItem({ r, onChange }: { r: DeskRow; onChange: () => void }) {
  const { t, locale } = useMembershipCopy();
  const lang = locale === "en" ? "en" : "fr";
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [recMethod, setRecMethod] = useState("cash");
  const [recRef, setRecRef] = useState("");

  const open = async (bucket: string, path: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 300);
    if (error || !data) return toast.error(error?.message ?? "Error");
    window.open(data.signedUrl, "_blank", "noopener");
  };
  const proof = () => open("league-proofs", r.proof_path);
  const memberDoc = async (): Promise<MemberDoc> => ({
    fullName: r.full_name || r.email,
    memberNumber: r.member_number ?? "",
    category: r.category,
    startsOn: r.starts_on ?? "",
    endsOn: r.ends_on ?? "",
    attestationNumber: r.attestation_number,
    confirmedAt: r.confirmed_at,
    verifyToken: r.verify_token,
    photoUrl: r.photo_path
      ? ((
          await supabase.storage
            .from("league-files")
            .createSignedUrl(r.photo_path, 600)
        ).data?.signedUrl ?? null)
      : null,
  });
  const download = async (kind: "card" | "att") => {
    setBusy(true);
    try {
      const d = await memberDoc();
      await (kind === "card" ? downloadCardPdf : downloadAttestationPdf)(
        d,
        lang,
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const setCategory = async (category: string) => {
    const { error } = await supabase.rpc("league_set_category", {
      _membership: r.membership_id,
      _category: category,
    });
    if (error) return toast.error(error.message);
    toast.success(t.saved);
    onChange();
  };
  const review = async (approve: boolean) => {
    if (!r.payment_id) return;
    setBusy(true);
    const { error } = await supabase.rpc("league_review_payment", {
      _payment: r.payment_id,
      _approve: approve,
      _note: note,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(approve ? t.approved : t.refused);
    onChange();
  };
  const record = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("league_record_payment", {
      _membership: r.membership_id,
      _method: recMethod,
      _amount: Number(r.plan_amount ?? 0),
      _reference: recRef,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.recorded);
    onChange();
  };
  const methodLabel = (m: string | null) =>
    m ? ((t as unknown as Record<string, string>)[m] ?? m) : "";

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{r.full_name || r.email}</p>
          <p className="text-xs text-muted-foreground">
            {r.email} · {r.plan_label} · {Number(r.plan_amount ?? 0)} MAD
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant={r.status === "active" ? "default" : "secondary"}>
            {t.status[r.status] ?? r.status}
          </Badge>
          {r.payment_status && (
            <Badge variant="outline">
              {t.status[r.payment_status] ?? r.payment_status}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {r.birth_date && (
          <span className="text-muted-foreground">
            {t.birthDate} : {r.birth_date} ({t.age(ageOf(r.birth_date))})
          </span>
        )}
        {r.photo_path && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => open("league-files", r.photo_path)}
          >
            {t.viewPhoto}
          </Button>
        )}
        {r.enrolment_path && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => open("league-files", r.enrolment_path)}
          >
            {t.viewEnrolment}
          </Button>
        )}
        <select
          aria-label={t.category}
          className="h-8 rounded-md border bg-background px-2"
          value={r.category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {Object.entries(t.categories).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        {r.status === "active" && (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => download("card")}
            >
              {t.downloadCard}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => download("att")}
            >
              {t.downloadAttestation}
            </Button>
          </>
        )}
      </div>

      {r.payment_id && (
        <p className="text-xs text-muted-foreground">
          {methodLabel(r.payment_method)} · {Number(r.payment_amount)} MAD
          {r.payer_reference && ` · ${r.payer_reference}`}
          {r.receipt_number && ` · ${t.receipt} ${r.receipt_number}`}
          {r.member_number && ` · ${r.member_number}`}
        </p>
      )}

      {r.payment_status === "submitted" && (
        <div className="space-y-2">
          {r.proof_path && (
            <Button size="sm" variant="outline" onClick={proof}>
              <FileText className="h-4 w-4 me-1" /> {t.viewProof}
            </Button>
          )}
          <Input
            placeholder={t.note}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" disabled={busy} onClick={() => review(true)}>
              <Check className="h-4 w-4 me-1" /> {t.approve}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => review(false)}
            >
              <X className="h-4 w-4 me-1" /> {t.reject}
            </Button>
          </div>
        </div>
      )}

      {r.status === "pending" && r.payment_status !== "submitted" && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={t.method}
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={recMethod}
            onChange={(e) => setRecMethod(e.target.value)}
          >
            {(["cash", "cheque", "transfer", "deposit"] as const).map((m) => (
              <option key={m} value={m}>
                {t[m]}
              </option>
            ))}
          </select>
          <Input
            className="max-w-[220px]"
            placeholder={t.reference}
            value={recRef}
            onChange={(e) => setRecRef(e.target.value)}
          />
          <Button size="sm" variant="outline" disabled={busy} onClick={record}>
            {t.record}
          </Button>
        </div>
      )}
    </div>
  );
}

function PlansEditor() {
  const { t } = useMembershipCopy();
  const qc = useQueryClient();
  const { data: plans = [] } = useQuery({
    queryKey: ["league-plans-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_membership_plans")
        .select("*")
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <section className="space-y-3 rounded-xl border border-border p-4">
      <h3 className="font-semibold">{t.plans}</h3>
      {plans.map((p) => (
        <PlanRow
          key={p.id}
          p={p}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["league-plans-all"] });
            qc.invalidateQueries({ queryKey: ["league-offer"] });
          }}
        />
      ))}
    </section>
  );
}

function PlanRow({
  p,
  onSaved,
}: {
  p: Tables<"league_membership_plans">;
  onSaved: () => void;
}) {
  const { t } = useMembershipCopy();
  const [label, setLabel] = useState(p.label_fr);
  const [amount, setAmount] = useState(
    p.amount_mad == null ? "" : String(p.amount_mad),
  );
  const [active, setActive] = useState(p.is_active);
  const save = async () => {
    const { error } = await supabase
      .from("league_membership_plans")
      .update({
        label_fr: label,
        amount_mad: amount === "" ? null : Number(amount),
        is_active: active,
      })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(t.saved);
    onSaved();
  };
  return (
    <div className="grid gap-2 md:grid-cols-[1fr_120px_auto_auto] items-center">
      <Input
        aria-label={t.planLabel}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <Input
        aria-label={t.planAmount}
        placeholder={t.planAmount}
        type="number"
        min={0}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={active}
          onCheckedChange={setActive}
          disabled={amount === ""}
        />
        {t.planActive}
      </label>
      <Button size="sm" variant="outline" onClick={save}>
        {t.save}
      </Button>
    </div>
  );
}

function BankEditor() {
  const { t } = useMembershipCopy();
  const qc = useQueryClient();
  const { data: s } = useQuery({
    queryKey: ["league-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("league_settings")
        .select("*")
        .maybeSingle();
      return data;
    },
  });
  if (!s) return null;
  return (
    <BankForm
      key={s.updated_at}
      s={s}
      onSaved={() => {
        qc.invalidateQueries({ queryKey: ["league-settings"] });
        qc.invalidateQueries({ queryKey: ["league-offer"] });
      }}
    />
  );
}

function BankForm({
  s,
  onSaved,
}: {
  s: Tables<"league_settings">;
  onSaved: () => void;
}) {
  const { t } = useMembershipCopy();
  const [f, setF] = useState({
    bank_name: s.bank_name ?? "",
    account_holder: s.account_holder ?? "",
    rib: s.rib ?? "",
    instructions_fr: s.instructions_fr ?? "",
  });
  const save = async () => {
    const { error } = await supabase
      .from("league_settings")
      .update({
        bank_name: f.bank_name || null,
        account_holder: f.account_holder || null,
        rib: f.rib.trim() || null,
        instructions_fr: f.instructions_fr || null,
      })
      .eq("id", true);
    if (error) return toast.error(error.message);
    toast.success(t.saved);
    onSaved();
  };
  return (
    <section className="space-y-2 rounded-xl border border-border p-4">
      <h3 className="font-semibold">{t.bankDetails}</h3>
      <div className="grid gap-2 md:grid-cols-2">
        <Input
          placeholder={t.bank}
          value={f.bank_name}
          onChange={(e) => setF({ ...f, bank_name: e.target.value })}
        />
        <Input
          placeholder={t.holder}
          value={f.account_holder}
          onChange={(e) => setF({ ...f, account_holder: e.target.value })}
        />
      </div>
      <Input
        placeholder={t.rib}
        dir="ltr"
        value={f.rib}
        onChange={(e) => setF({ ...f, rib: e.target.value })}
      />
      <Input
        placeholder={t.instructions}
        value={f.instructions_fr}
        onChange={(e) => setF({ ...f, instructions_fr: e.target.value })}
      />
      <Button size="sm" onClick={save}>
        {t.save}
      </Button>
    </section>
  );
}

function GrantForm({ onDone }: { onDone: () => void }) {
  const { t } = useMembershipCopy();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const grant = async (code: "honoraire" | "bureau") => {
    setBusy(true);
    const { error } = await supabase.rpc("league_grant", {
      _email: email,
      _plan_code: code,
    });
    setBusy(false);
    if (error)
      return toast.error(
        error.message.includes("no account") ? t.noAccount : error.message,
      );
    toast.success(t.granted);
    setEmail("");
    onDone();
  };
  return (
    <section className="space-y-2 rounded-xl border border-border p-4">
      <h3 className="font-semibold">{t.grantTitle}</h3>
      <p className="text-xs text-muted-foreground">{t.grantHint}</p>
      <div className="flex flex-wrap gap-2">
        <Input
          type="email"
          className="max-w-xs"
          placeholder={t.grantEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={!email || busy}
          onClick={() => grant("honoraire")}
        >
          {t.grantHonorary}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!email || busy}
          onClick={() => grant("bureau")}
        >
          {t.grantBureau}
        </Button>
      </div>
    </section>
  );
}
