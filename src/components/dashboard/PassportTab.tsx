import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { withLogo } from "@/components/UpsyLogo";
import { toast } from "sonner";
import {
  BadgeCheck,
  Copy,
  FileCheck2,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { PASSPORT_KINDS, usePassportCopy } from "@/lib/passport/passportCopy";

type Entry = Tables<"passport_entries">;
const MAX_BYTES = 10 * 1024 * 1024;

const STATUS_TONE: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "outline",
  submitted: "secondary",
  validated: "default",
  rejected: "destructive",
  declared: "outline",
};

/** The psychologist's passport: items, proofs, submission, share links. */
export default function PassportTab() {
  const { user } = useAuth();
  const { t } = usePassportCopy();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["passport-entries", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("passport_entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("start_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["passport-entries", user?.id] });

  const setStatus = async (e: Entry, status: "submitted" | "draft") => {
    if (status === "submitted" && !e.proof_path)
      return toast.error(t.proofNeeded);
    const { error } = await supabase
      .from("passport_entries")
      .update({ status })
      .eq("id", e.id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const remove = async (e: Entry) => {
    const { error } = await supabase
      .from("passport_entries")
      .delete()
      .eq("id", e.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{t.title}</h2>
        <p className="text-sm text-muted-foreground max-w-3xl">{t.intro}</p>
      </div>

      {editing ? (
        <EntryForm
          initial={editing === "new" ? null : editing}
          onDone={() => {
            setEditing(null);
            refresh();
          }}
        />
      ) : (
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4 me-1" /> {t.add}
        </Button>
      )}

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        PASSPORT_KINDS.filter((k) => entries.some((e) => e.kind === k)).map(
          (k) => (
            <section key={k} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {t.kinds[k]}
              </h3>
              {entries
                .filter((e) => e.kind === k)
                .map((e) => (
                  <Card key={e.id} className="p-4 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{e.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {[e.organization, e.role, e.location, period(e)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <Badge variant={STATUS_TONE[e.status] ?? "outline"}>
                        {e.status === "validated" && (
                          <BadgeCheck className="h-3 w-3 me-1" />
                        )}
                        {withLogo(t.status[e.status] ?? e.status)}
                      </Badge>
                    </div>
                    {e.status === "rejected" && e.review_note && (
                      <p className="text-xs text-destructive">
                        {e.review_note}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(e)}
                      >
                        <Pencil className="h-3.5 w-3.5 me-1" /> {t.edit}
                      </Button>
                      {(e.status === "draft" || e.status === "rejected") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(e, "submitted")}
                        >
                          <Send className="h-3.5 w-3.5 me-1" /> {t.submit}
                        </Button>
                      )}
                      {e.status === "submitted" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStatus(e, "draft")}
                        >
                          {t.withdraw}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(e)}
                      >
                        <Trash2 className="h-3.5 w-3.5 me-1" /> {t.remove}
                      </Button>
                    </div>
                  </Card>
                ))}
            </section>
          ),
        )
      )}

      <SharesPanel />
    </div>
  );
}

function period(e: Entry) {
  const y = (d: string | null) => (d ? d.slice(0, 4) : "");
  if (!e.start_date && !e.end_date) return "";
  return e.end_date && y(e.end_date) !== y(e.start_date)
    ? `${y(e.start_date)}–${y(e.end_date)}`
    : y(e.start_date || e.end_date);
}

function EntryForm({
  initial,
  onDone,
}: {
  initial: Entry | null;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const { t } = usePassportCopy();
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [f, setF] = useState({
    kind: initial?.kind ?? "degree",
    title: initial?.title ?? "",
    organization: initial?.organization ?? "",
    role: initial?.role ?? "",
    location: initial?.location ?? "",
    start_date: initial?.start_date ?? "",
    end_date: initial?.end_date ?? "",
    description: initial?.description ?? "",
    url: initial?.url ?? "",
    doi: initial?.doi ?? "",
    shareable: initial?.shareable ?? true,
  });
  const set = (k: keyof typeof f, v: string | boolean) =>
    setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!user) return;
    if (file && file.size > MAX_BYTES) return toast.error(t.tooLarge);
    setBusy(true);
    let proof_path = initial?.proof_path ?? null;
    if (file) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
      proof_path = `${user.id}/${Date.now()}-${safe}`;
      const up = await supabase.storage
        .from("passport-proofs")
        .upload(proof_path, file, { contentType: file.type || undefined });
      if (up.error) {
        setBusy(false);
        return toast.error(up.error.message);
      }
    }
    const row: TablesInsert<"passport_entries"> = {
      kind: f.kind,
      title: f.title.trim(),
      organization: f.organization.trim() || null,
      role: f.role.trim() || null,
      location: f.location.trim() || null,
      start_date: f.start_date || null,
      end_date: f.end_date || null,
      description: f.description.trim() || null,
      url: f.url.trim() || null,
      doi: f.doi.trim() || null,
      shareable: f.shareable,
      proof_path,
    };
    const { error } = initial
      ? await supabase.from("passport_entries").update(row).eq("id", initial.id)
      : await supabase.from("passport_entries").insert(row);
    setBusy(false);
    if (error) return toast.error(error.message);
    onDone();
  };

  const isAspiration = f.kind === "aspiration";
  return (
    <Card className="p-4 space-y-3">
      {initial?.status === "validated" && (
        <p className="text-xs text-muted-foreground">{t.editWarns}</p>
      )}
      <select
        aria-label={t.kind}
        className="h-9 w-full rounded-md border bg-background px-2 text-sm"
        value={f.kind}
        onChange={(e) => set("kind", e.target.value)}
      >
        {PASSPORT_KINDS.map((k) => (
          <option key={k} value={k}>
            {t.kinds[k]}
          </option>
        ))}
      </select>
      <Input
        placeholder={t.fTitle}
        value={f.title}
        onChange={(e) => set("title", e.target.value)}
      />
      {!isAspiration && (
        <>
          <div className="grid gap-2 md:grid-cols-3">
            <Input
              placeholder={t.fOrg}
              value={f.organization}
              onChange={(e) => set("organization", e.target.value)}
            />
            <Input
              placeholder={t.fRole}
              value={f.role}
              onChange={(e) => set("role", e.target.value)}
            />
            <Input
              placeholder={t.fLocation}
              value={f.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-xs text-muted-foreground">
              {t.fStart}
              <Input
                type="date"
                value={f.start_date}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </label>
            <label className="text-xs text-muted-foreground">
              {t.fEnd}
              <Input
                type="date"
                value={f.end_date}
                onChange={(e) => set("end_date", e.target.value)}
              />
            </label>
          </div>
        </>
      )}
      <Textarea
        rows={3}
        placeholder={t.fDesc}
        value={f.description}
        onChange={(e) => set("description", e.target.value)}
      />
      {(f.kind === "publication" || f.kind === "research") && (
        <div className="grid gap-2 md:grid-cols-2">
          <Input
            placeholder={t.fUrl}
            value={f.url}
            onChange={(e) => set("url", e.target.value)}
          />
          <Input
            placeholder={t.fDoi}
            value={f.doi}
            onChange={(e) => set("doi", e.target.value)}
          />
        </div>
      )}
      {!isAspiration && (
        <label className="block text-xs text-muted-foreground">
          {t.fProof}
          {initial?.proof_path && !file && (
            <span className="ms-2 inline-flex items-center gap-1 text-foreground">
              <FileCheck2 className="h-3 w-3" /> {t.hasProof}
            </span>
          )}
          <input
            type="file"
            accept="application/pdf,image/*"
            className="mt-1 block w-full text-xs"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={f.shareable}
          onCheckedChange={(c) => set("shareable", c)}
        />
        {t.shareable}
      </label>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={save}
          disabled={busy || f.title.trim().length < 2}
        >
          {busy && <Loader2 className="h-4 w-4 me-1 animate-spin" />}
          {t.save}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>
          {t.cancel}
        </Button>
      </div>
    </Card>
  );
}

function SharesPanel() {
  const { user } = useAuth();
  const { t, locale } = usePassportCopy();
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [days, setDays] = useState("90");
  const { data: shares = [] } = useQuery({
    queryKey: ["passport-shares", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("passport_shares")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["passport-shares", user?.id] });
  const url = (token: string) =>
    `${window.location.origin}${addLocalePrefix(`/passport/${token}`, locale)}`;

  const create = async () => {
    const expires_at =
      days === "0"
        ? null
        : new Date(Date.now() + Number(days) * 86400000).toISOString();
    const { error } = await supabase
      .from("passport_shares")
      .insert({ label: label.trim() || null, expires_at });
    if (error) return toast.error(error.message);
    setLabel("");
    refresh();
  };
  const revoke = async (id: string) => {
    const { error } = await supabase
      .from("passport_shares")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Link2 className="h-4 w-4" /> {t.shares}
      </h3>
      <p className="text-xs text-muted-foreground">{t.sharesIntro}</p>
      <div className="flex flex-wrap gap-2">
        <Input
          className="flex-1 min-w-[200px]"
          placeholder={t.shareLabel}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <select
          aria-label={t.expiresIn}
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        >
          {["30", "90", "365"].map((d) => (
            <option key={d} value={d}>
              {t.days(Number(d))}
            </option>
          ))}
          <option value="0">{t.never}</option>
        </select>
        <Button size="sm" onClick={create}>
          {t.newShare}
        </Button>
      </div>
      <ul className="space-y-2">
        {shares.map((s) => {
          const dead =
            !!s.revoked_at ||
            (!!s.expires_at && new Date(s.expires_at) < new Date());
          return (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm"
            >
              <span className="flex-1 min-w-0 truncate">
                {s.label || s.token.slice(0, 8)}
                <span className="ms-2 text-xs text-muted-foreground">
                  {dead ? t.revoked : t.views(s.views)}
                </span>
              </span>
              {!dead && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(url(s.token));
                      toast.success(t.copied);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 me-1" /> {t.copy}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => revoke(s.id)}
                  >
                    {t.revoke}
                  </Button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
