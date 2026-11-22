import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useEngagementCopy } from "@/lib/league/engagementCopy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Board = {
  user_id: string;
  full_name: string | null;
  member_number: string | null;
  divisions: string[] | null;
  points: number;
  contributions: number;
  rating: number | null;
  score: number;
  last_activity: string | null;
  open_procedures: number;
};

const LEVELS = [
  "avertissement",
  "blame",
  "reprimande",
  "suspension",
  "revocation_fonction",
  "exclusion",
] as const;

const semester = () => {
  const d = new Date();
  return `${d.getFullYear()}-S${d.getMonth() < 6 ? 1 : 2}`;
};

/**
 * Participation desk. "league": the League's full desk (contributions,
 * ratings, ranking, inactive members, procedures, legalised copies). "lead":
 * a division lead's part (contributions and ratings).
 */
export default function ParticipationDesk({
  mode = "league",
}: {
  mode?: "league" | "lead";
}) {
  const { t } = useEngagementCopy();
  const qc = useQueryClient();
  const year = new Date().getFullYear();
  const key = ["league-participation", mode, year];
  const { data } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const [board, queue, inactive, cases, commitments, desk] =
        await Promise.all([
          supabase.rpc("league_scoreboard", { _year: year }),
          supabase
            .from("league_contributions")
            .select("*")
            .eq("status", "submitted")
            .order("created_at"),
          mode === "league"
            ? supabase.rpc("league_inactive_members")
            : Promise.resolve({ data: [] }),
          mode === "league"
            ? supabase
                .from("league_discipline")
                .select("*")
                .eq("status", "open")
                .order("opened_at")
            : Promise.resolve({ data: [] }),
          mode === "league"
            ? supabase
                .from("league_commitments")
                .select("*")
                .eq("status", "legalized_submitted")
            : Promise.resolve({ data: [] }),
          mode === "league"
            ? supabase.rpc("league_membership_desk")
            : Promise.resolve({ data: [] }),
        ]);
      const names = new Map<string, string>();
      for (const r of (desk.data ?? []) as {
        user_id: string;
        full_name: string | null;
        email: string;
      }[])
        names.set(r.user_id, r.full_name || r.email);
      for (const r of (board.data ?? []) as Board[])
        if (r.full_name) names.set(r.user_id, r.full_name);
      return {
        board: (board.data ?? []) as Board[],
        queue: queue.data ?? [],
        inactive: (inactive.data ?? []) as {
          user_id: string;
          full_name: string | null;
          email: string;
          member_number: string;
          last_activity: string | null;
        }[],
        cases: (cases.data ?? []) as Tables<"league_discipline">[],
        commitments: (commitments.data ?? []) as Tables<"league_commitments">[],
        names,
      };
    },
  });
  if (!data) return null;
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const name = (id: string) => data.names.get(id) ?? "—";
  const bottom = [...data.board].reverse().slice(0, 10);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="font-semibold">
          {t.toValidate} ({data.queue.length})
        </h3>
        {data.queue.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.empty}</p>
        )}
        {data.queue.map((c) => (
          <ContributionReview
            key={c.id}
            c={c}
            who={name(c.user_id)}
            onDone={refresh}
          />
        ))}
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" /> {t.board} {year}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <BoardList
            title={t.top}
            rows={data.board.slice(0, 10)}
            onDone={refresh}
          />
          <BoardList title={t.bottom} rows={bottom} onDone={refresh} />
        </div>
      </section>

      {mode === "league" && (
        <>
          <section className="space-y-2">
            <h3 className="font-semibold">
              {t.inactive} ({data.inactive.length})
            </h3>
            {data.inactive.length === 0 && (
              <p className="text-sm text-muted-foreground">{t.empty}</p>
            )}
            {data.inactive.map((m) => (
              <OpenProcedure
                key={m.user_id}
                userId={m.user_id}
                label={`${m.full_name || m.email} · ${m.member_number}`}
                last={t.lastActivity(m.last_activity)}
                onDone={refresh}
              />
            ))}
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">
              {t.procedures} ({data.cases.length})
            </h3>
            {data.cases.length === 0 && (
              <p className="text-sm text-muted-foreground">{t.empty}</p>
            )}
            {data.cases.map((c) => (
              <Decide key={c.id} c={c} who={name(c.user_id)} onDone={refresh} />
            ))}
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">
              {t.commitmentsToCheck} ({data.commitments.length})
            </h3>
            {data.commitments.length === 0 && (
              <p className="text-sm text-muted-foreground">{t.empty}</p>
            )}
            {data.commitments.map((c) => (
              <CommitmentCheck
                key={c.id}
                c={c}
                who={name(c.user_id)}
                onDone={refresh}
              />
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function ContributionReview({
  c,
  who,
  onDone,
}: {
  c: Tables<"league_contributions">;
  who: string;
  onDone: () => void;
}) {
  const { t } = useEngagementCopy();
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const review = async (ok: boolean) => {
    const { error } = await supabase.rpc("league_review_contribution", {
      _contribution: c.id,
      _ok: ok,
      _points: points === "" ? undefined : Number(points),
      _note: note,
    });
    if (error) return toast.error(error.message);
    onDone();
  };
  return (
    <div className="rounded-lg border p-3 space-y-2 text-sm">
      <p>
        <span className="font-medium">{who}</span> · {t.kinds[c.kind]} ·{" "}
        {c.happened_on}
      </p>
      <p>{c.title}</p>
      {c.details && (
        <p className="text-xs text-muted-foreground whitespace-pre-line">
          {c.details}
        </p>
      )}
      {c.evidence_url && (
        <a
          href={c.evidence_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary inline-flex items-center gap-1"
        >
          {c.evidence_url} <ExternalLink className="h-3 w-3" />
        </a>
      )}
      <div className="flex flex-wrap gap-2">
        <Input
          type="number"
          min={0}
          max={30}
          className="w-24"
          placeholder={t.points}
          value={points}
          onChange={(e) => setPoints(e.target.value)}
        />
        <Input
          className="flex-1 min-w-[160px]"
          placeholder={t.note}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button size="sm" onClick={() => review(true)}>
          {t.validate}
        </Button>
        <Button size="sm" variant="outline" onClick={() => review(false)}>
          {t.reject}
        </Button>
      </div>
    </div>
  );
}

function BoardList({
  title,
  rows,
  onDone,
}: {
  title: string;
  rows: Board[];
  onDone: () => void;
}) {
  const { t } = useEngagementCopy();
  const [rating, setRating] = useState<string | null>(null);
  return (
    <div className="rounded-xl border p-3 space-y-2">
      <p className="text-sm font-medium">{title}</p>
      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground">{t.empty}</p>
      )}
      <ol className="space-y-1">
        {rows.map((r) => (
          <li key={r.user_id} className="space-y-1 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span>
                <span className="font-medium">{r.full_name ?? "—"}</span>{" "}
                <span className="text-muted-foreground">{r.member_number}</span>
              </span>
              <span className="flex items-center gap-1">
                <Badge variant="secondary">{Number(r.score)}</Badge>
                <span className="text-muted-foreground">
                  {r.points} pts · {r.contributions}
                  {r.rating != null && ` · ${t.rating} ${r.rating}`}
                </span>
                {r.open_procedures > 0 && (
                  <Badge variant="destructive">{r.open_procedures}</Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={() =>
                    setRating(rating === r.user_id ? null : r.user_id)
                  }
                >
                  {t.evaluate}
                </Button>
              </span>
            </div>
            {rating === r.user_id && (
              <RatingForm
                userId={r.user_id}
                onDone={() => {
                  setRating(null);
                  onDone();
                }}
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function RatingForm({
  userId,
  onDone,
}: {
  userId: string;
  onDone: () => void;
}) {
  const { t } = useEngagementCopy();
  const [v, setV] = useState({
    engagement: 3,
    quality: 3,
    collaboration: 3,
    reliability: 3,
  });
  const [comment, setComment] = useState("");
  const save = async () => {
    const { error } = await supabase.from("league_evaluations").insert({
      user_id: userId,
      period: semester(),
      ...v,
      comment: comment || null,
    });
    if (error) return toast.error(error.message);
    onDone();
  };
  return (
    <div className="space-y-2 rounded-lg bg-muted/40 p-2">
      <p className="text-muted-foreground">
        {t.period} {semester()}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(v) as (keyof typeof v)[]).map((k) => (
          <label key={k} className="flex items-center justify-between gap-2">
            {t.criteria[k]}
            <select
              className="h-7 rounded border bg-background px-1"
              value={v[k]}
              onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <Input
        placeholder={t.comment}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button size="sm" onClick={save}>
        {t.save}
      </Button>
    </div>
  );
}

function OpenProcedure({
  userId,
  label,
  last,
  onDone,
}: {
  userId: string;
  label: string;
  last: string;
  onDone: () => void;
}) {
  const { t } = useEngagementCopy();
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<string>("avertissement");
  const [facts, setFacts] = useState("");
  const send = async () => {
    const { error } = await supabase.rpc("league_discipline_open", {
      _user: userId,
      _level: level,
      _facts: facts,
    });
    if (error) return toast.error(error.message);
    toast.success(t.opened);
    setOpen(false);
    onDone();
  };
  return (
    <div className="rounded-lg border p-3 space-y-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          {label}{" "}
          <span className="text-xs text-muted-foreground">· {last}</span>
        </span>
        <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
          {t.openProcedure}
        </Button>
      </div>
      {open && (
        <div className="space-y-2">
          <select
            aria-label={t.level}
            className="h-9 rounded-md border bg-background px-2"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {t.levels[l]}
              </option>
            ))}
          </select>
          <Textarea
            rows={3}
            placeholder={t.facts}
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
          />
          <Button size="sm" disabled={facts.trim().length < 10} onClick={send}>
            {t.openProcedure}
          </Button>
        </div>
      )}
    </div>
  );
}

function Decide({
  c,
  who,
  onDone,
}: {
  c: Tables<"league_discipline">;
  who: string;
  onDone: () => void;
}) {
  const { t } = useEngagementCopy();
  const [decision, setDecision] = useState("");
  const act = async (withdraw: boolean) => {
    const { error } = await supabase.rpc("league_discipline_decide", {
      _case: c.id,
      _decision: decision,
      _withdraw: withdraw,
    });
    if (error) return toast.error(error.message);
    onDone();
  };
  return (
    <div className="rounded-lg border p-3 space-y-2 text-sm">
      <p>
        <span className="font-medium">{who}</span> · {t.levels[c.level]} ·{" "}
        {t.defenceDue(c.defence_due)}
      </p>
      <p className="text-xs whitespace-pre-line">{c.facts}</p>
      <p className="text-xs">
        <span className="font-medium">
          {c.defence ? t.defenceReceived : t.noDefence}
        </span>
        {c.defence && (
          <span className="block whitespace-pre-line text-muted-foreground">
            {c.defence}
          </span>
        )}
      </p>
      <Textarea
        rows={2}
        placeholder={t.decision}
        value={decision}
        onChange={(e) => setDecision(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={decision.trim().length < 5}
          onClick={() => act(false)}
        >
          {t.decide}
        </Button>
        <Button size="sm" variant="outline" onClick={() => act(true)}>
          {t.withdraw}
        </Button>
      </div>
    </div>
  );
}

function CommitmentCheck({
  c,
  who,
  onDone,
}: {
  c: Tables<"league_commitments">;
  who: string;
  onDone: () => void;
}) {
  const { t } = useEngagementCopy();
  const [note, setNote] = useState("");
  const view = async () => {
    if (!c.legalized_path) return;
    const { data, error } = await supabase.storage
      .from("league-files")
      .createSignedUrl(c.legalized_path, 300);
    if (error || !data) return toast.error(error?.message ?? "");
    window.open(data.signedUrl, "_blank", "noopener");
  };
  const review = async (ok: boolean) => {
    const { error } = await supabase.rpc("league_review_commitment", {
      _commitment: c.id,
      _ok: ok,
      _note: note,
    });
    if (error) return toast.error(error.message);
    onDone();
  };
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3 text-sm">
      <span className="font-medium">{who}</span>
      <span className="text-muted-foreground">
        {t.docNames[c.doc]} · {c.signer_name}
      </span>
      <Button size="sm" variant="ghost" onClick={view}>
        {t.view}
      </Button>
      <Input
        className="flex-1 min-w-[140px]"
        placeholder={t.note}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button size="sm" onClick={() => review(true)}>
        {t.ok}
      </Button>
      <Button size="sm" variant="outline" onClick={() => review(false)}>
        {t.refuse}
      </Button>
    </div>
  );
}
