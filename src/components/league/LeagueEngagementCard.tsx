import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useLeagueMembership } from "@/hooks/useLeagueMembership";
import { useEngagementCopy } from "@/lib/league/engagementCopy";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { COMMITMENT_VERSION } from "@/content/lsspm/commitments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DOCS = ["reglement", "honour", "ethics"] as const;
const LEGALIZED = new Set(["reglement", "honour"]);
const KINDS = [
  "meeting",
  "training",
  "event",
  "publication",
  "supervision",
  "committee",
  "outreach",
  "other",
] as const;

/**
 * The member's engagement with the League: commitments (accept, upload the
 * legalised copy), divisions and personal project, contributions and rank,
 * and any disciplinary procedure to answer. Shown once the member applied.
 */
export default function LeagueEngagementCard() {
  const { user } = useAuth();
  const { t, locale } = useEngagementCopy();
  const qc = useQueryClient();
  const { data: membership } = useLeagueMembership();
  const key = ["league-engagement", user?.id];
  const { data } = useQuery({
    queryKey: key,
    enabled: !!user && !!(membership?.active || membership?.pending),
    queryFn: async () => {
      const [divisions, profile, commitments, contributions, standing, cases] =
        await Promise.all([
          supabase.from("league_divisions").select("*").order("position"),
          supabase
            .from("league_member_profiles")
            .select("*")
            .eq("user_id", user!.id)
            .maybeSingle(),
          supabase
            .from("league_commitments")
            .select("*")
            .eq("user_id", user!.id),
          supabase
            .from("league_contributions")
            .select("*")
            .eq("user_id", user!.id)
            .order("happened_on", { ascending: false }),
          supabase.rpc("league_my_standing"),
          supabase
            .from("league_discipline")
            .select("*")
            .eq("user_id", user!.id)
            .eq("status", "open"),
        ]);
      return {
        divisions: divisions.data ?? [],
        profile: profile.data,
        commitments: commitments.data ?? [],
        contributions: contributions.data ?? [],
        standing: (standing.data ?? [])[0] ?? null,
        cases: cases.data ?? [],
      };
    },
  });
  if (!user || !data) return null;
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const date = (d: string) =>
    new Date(d).toLocaleDateString(
      locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR",
    );

  return (
    <Card className="p-5 space-y-5">
      <h3 className="font-semibold">{t.title}</h3>

      {data.cases.map((c) => (
        <DefenceForm key={c.id} c={c} onDone={refresh} date={date} />
      ))}

      <section className="space-y-2">
        <p className="text-sm font-medium">{t.docs}</p>
        {DOCS.map((d) => (
          <CommitmentRow
            key={d}
            doc={d}
            row={data.commitments.find(
              (c) => c.doc === d && c.version === COMMITMENT_VERSION[d],
            )}
            onDone={refresh}
            date={date}
          />
        ))}
      </section>

      <ProfileForm
        divisions={data.divisions}
        profile={data.profile}
        onDone={refresh}
      />

      <section className="space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" /> {t.standing}
        </p>
        {data.standing ? (
          <p className="text-sm">
            {t.score(Number(data.standing.score))} ·{" "}
            {t.rank(data.standing.rank, data.standing.members)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{t.noRank}</p>
        )}
        <ContributionForm divisions={data.divisions} onDone={refresh} />
        <p className="text-xs font-medium pt-2">{t.myContributions}</p>
        {data.contributions.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t.none}</p>
        ) : (
          <ul className="space-y-1">
            {data.contributions.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-xs"
              >
                <span>
                  {date(c.happened_on)} · {t.kinds[c.kind]} · {c.title}
                </span>
                <span className="flex items-center gap-1">
                  {c.points != null && (
                    <Badge variant="secondary">{t.pointsShort(c.points)}</Badge>
                  )}
                  <Badge
                    variant={c.status === "validated" ? "default" : "outline"}
                  >
                    {t.cStatus[c.status]}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Card>
  );
}

function CommitmentRow({
  doc,
  row,
  onDone,
  date,
}: {
  doc: (typeof DOCS)[number];
  row: Tables<"league_commitments"> | undefined;
  onDone: () => void;
  date: (d: string) => string;
}) {
  const { user } = useAuth();
  const { t, locale } = useEngagementCopy();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const accept = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("league_accept", {
      _doc: doc,
      _version: COMMITMENT_VERSION[doc],
      _signer_name: name,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    onDone();
  };
  const upload = async (f: File) => {
    if (!row || !user) return;
    setBusy(true);
    const path = `${user.id}/legal-${doc}-${Date.now()}.${f.name.split(".").pop() || "pdf"}`;
    const up = await supabase.storage
      .from("league-files")
      .upload(path, f, { contentType: f.type || undefined });
    const { error } = up.error
      ? up
      : await supabase.rpc("league_submit_legalized", {
          _commitment: row.id,
          _path: path,
        });
    setBusy(false);
    if (error) return toast.error(error.message);
    onDone();
  };
  return (
    <div className="rounded-lg border p-3 space-y-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{t.docNames[doc]}</span>
        <a
          className="text-xs text-primary inline-flex items-center gap-1"
          href={`${addLocalePrefix("/lsspm", locale)}?doc=${doc}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.read} <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {!row ? (
        <div className="flex flex-wrap gap-2">
          <Input
            className="flex-1 min-w-[180px]"
            placeholder={t.signerName}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            size="sm"
            disabled={name.trim().length < 3 || busy}
            onClick={accept}
          >
            {t.accept}
          </Button>
        </div>
      ) : (
        <div className="space-y-1 text-xs">
          <p className="text-muted-foreground">
            {t.accepted(date(row.accepted_at))}
          </p>
          {LEGALIZED.has(doc) && (
            <>
              <Badge
                variant={row.status === "verified" ? "default" : "outline"}
              >
                {t.legalStatus[row.status]}
              </Badge>
              {row.review_note && (
                <p className="text-destructive">{row.review_note}</p>
              )}
              {(row.status === "accepted" || row.status === "rejected") && (
                <label className="block text-muted-foreground">
                  {t.legalizeHint}
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    disabled={busy}
                    className="mt-1 block w-full text-xs"
                    aria-label={t.uploadLegalized}
                    onChange={(e) =>
                      e.target.files?.[0] && upload(e.target.files[0])
                    }
                  />
                </label>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileForm({
  divisions,
  profile,
  onDone,
}: {
  divisions: Tables<"league_divisions">[];
  profile: Tables<"league_member_profiles"> | null;
  onDone: () => void;
}) {
  const { t, locale } = useEngagementCopy();
  const [ids, setIds] = useState<string[]>(profile?.division_ids ?? []);
  const [project, setProject] = useState(profile?.project ?? "");
  const [offer, setOffer] = useState(profile?.contribution_offer ?? "");
  const [hours, setHours] = useState(String(profile?.hours_per_month ?? ""));
  useEffect(() => {
    setIds(profile?.division_ids ?? []);
  }, [profile]);
  const label = (d: Tables<"league_divisions">) =>
    (locale === "en" && d.label_en) ||
    (locale === "ar" && d.label_ar) ||
    d.label_fr;
  const save = async () => {
    const { error } = await supabase.from("league_member_profiles").upsert({
      division_ids: ids,
      project: project || null,
      contribution_offer: offer || null,
      hours_per_month: hours === "" ? null : Number(hours),
      updated_at: new Date().toISOString(),
    });
    if (error) return toast.error(error.message);
    toast.success(t.saved);
    onDone();
  };
  return (
    <section className="space-y-2">
      <p className="text-sm font-medium">{t.divisions}</p>
      <div className="grid gap-1 sm:grid-cols-2">
        {divisions.map((d) => (
          <label key={d.id} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={ids.includes(d.id)}
              onChange={(e) =>
                setIds(
                  e.target.checked
                    ? [...ids, d.id]
                    : ids.filter((x) => x !== d.id),
                )
              }
            />
            {label(d)}
          </label>
        ))}
      </div>
      <label className="block text-xs text-muted-foreground">
        {t.project}
        <Textarea
          className="mt-1"
          rows={4}
          maxLength={4000}
          placeholder={t.projectHint}
          value={project}
          onChange={(e) => setProject(e.target.value)}
        />
      </label>
      <label className="block text-xs text-muted-foreground">
        {t.offer}
        <Textarea
          className="mt-1"
          rows={2}
          maxLength={2000}
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
        />
      </label>
      <label className="block text-xs text-muted-foreground">
        {t.hours}
        <Input
          type="number"
          min={0}
          max={200}
          className="mt-1 w-28"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
      </label>
      <Button size="sm" onClick={save}>
        {t.save}
      </Button>
    </section>
  );
}

function ContributionForm({
  divisions,
  onDone,
}: {
  divisions: Tables<"league_divisions">[];
  onDone: () => void;
}) {
  const { t } = useEngagementCopy();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    kind: "meeting",
    title: "",
    happened_on: new Date().toISOString().slice(0, 10),
    division_id: "",
    details: "",
    evidence_url: "",
  });
  if (!open)
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {t.log}
      </Button>
    );
  const send = async () => {
    const { error } = await supabase.from("league_contributions").insert({
      kind: f.kind,
      title: f.title.trim(),
      happened_on: f.happened_on,
      division_id: f.division_id || null,
      details: f.details || null,
      evidence_url: f.evidence_url || null,
    });
    if (error) return toast.error(error.message);
    toast.success(t.submitted);
    setOpen(false);
    setF({ ...f, title: "", details: "", evidence_url: "" });
    onDone();
  };
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          aria-label={t.log}
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={f.kind}
          onChange={(e) => setF({ ...f, kind: e.target.value })}
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {t.kinds[k]}
            </option>
          ))}
        </select>
        <Input
          type="date"
          aria-label={t.cDate}
          value={f.happened_on}
          onChange={(e) => setF({ ...f, happened_on: e.target.value })}
        />
      </div>
      <Input
        placeholder={t.cTitle}
        value={f.title}
        maxLength={200}
        onChange={(e) => setF({ ...f, title: e.target.value })}
      />
      <select
        aria-label={t.cDivision}
        className="h-9 w-full rounded-md border bg-background px-2 text-sm"
        value={f.division_id}
        onChange={(e) => setF({ ...f, division_id: e.target.value })}
      >
        <option value="">{t.cDivision}</option>
        {divisions.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label_fr}
          </option>
        ))}
      </select>
      <Textarea
        placeholder={t.cDetails}
        rows={2}
        value={f.details}
        onChange={(e) => setF({ ...f, details: e.target.value })}
      />
      <Input
        placeholder={t.cEvidence}
        value={f.evidence_url}
        onChange={(e) => setF({ ...f, evidence_url: e.target.value })}
      />
      <Button size="sm" disabled={f.title.trim().length < 3} onClick={send}>
        {t.submit}
      </Button>
    </div>
  );
}

function DefenceForm({
  c,
  onDone,
  date,
}: {
  c: Tables<"league_discipline">;
  onDone: () => void;
  date: (d: string) => string;
}) {
  const { t } = useEngagementCopy();
  const [text, setText] = useState(c.defence ?? "");
  const send = async () => {
    const { error } = await supabase.rpc("league_discipline_defend", {
      _case: c.id,
      _defence: text,
    });
    if (error) return toast.error(error.message);
    toast.success(t.defenceSent);
    onDone();
  };
  return (
    <section className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
      <p className="font-medium">
        {t.procedure} — {t.levels[c.level]}
      </p>
      <p className="whitespace-pre-line">{c.facts}</p>
      <p className="text-xs text-muted-foreground">
        {t.defenceDue(date(c.defence_due))}
      </p>
      <Textarea
        rows={4}
        placeholder={t.defence}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button size="sm" disabled={text.trim().length < 10} onClick={send}>
        {t.sendDefence}
      </Button>
    </section>
  );
}
