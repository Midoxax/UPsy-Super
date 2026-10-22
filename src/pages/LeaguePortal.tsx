import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  FileText,
  Copy,
  Users,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useUserRole } from "@/hooks/useUserRole";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";

type FileRow =
  Database["public"]["Functions"]["league_applications"]["Returns"][number];

type Review = {
  score_training: number;
  score_experience: number;
  score_documents: number;
  score_specialisation: number;
  score_ethics: number;
  recommendation: string;
  member_status: string;
  notes: string | null;
};

// The League works in French; English for non-French-speaking reviewers.
const COPY = {
  fr: {
    title: "Portail de la Ligue",
    subtitle:
      "Ligue des Spécialistes de la Santé Psychologique et Mentale (LSSPM). Dossiers des psychologues qui ont choisi de les partager avec la Ligue via U.Psy.",
    consent:
      "Seuls les dossiers dont le psychologue a donné son accord apparaissent. Le retrait de l'accord retire l'accès immédiatement. CIN, RIB, date de naissance et téléphone ne sont jamais partagés (loi 09-08).",
    reserved: "Accès réservé aux évaluateurs de la Ligue.",
    shared: "Dossiers partagés",
    campaign: "Campagne Ligue",
    started: "Candidatures commencées",
    submitted: "Soumises",
    approved: "Accréditées",
    link: "Lien de recrutement",
    copy: "Copier",
    copied: "Lien copié",
    search: "Nom, ville, spécialité",
    sort: "Trier",
    sortRecent: "Plus récents",
    sortUpsy: "Score U.Psy",
    sortLeague: "Score Ligue",
    toReview: "À évaluer",
    all: "Tous",
    upsy: "Score U.Psy",
    league: "Score Ligue",
    reviews: (n: number) => `${n} évaluation${n > 1 ? "s" : ""}`,
    years: (n: number) => `${n} ans d'expérience`,
    empty: "Aucun dossier partagé pour le moment.",
    open: "Ouvrir le dossier",
    docs: "Documents professionnels",
    noDocs: "Aucun document professionnel déposé.",
    checks: "Pré-vérification U.Psy",
    level: "Niveau",
    suggested: "suggéré",
    rubric: "Grille de la Ligue (0 à 5)",
    criteria: {
      score_training: "Formation et diplômes",
      score_experience: "Expérience clinique",
      score_documents: "Complétude du dossier",
      score_specialisation: "Spécialisation",
      score_ethics: "Déontologie",
    } as Record<string, string>,
    recommendation: "Avis",
    recs: {
      recommended: "Recommandé",
      more_info: "Compléments demandés",
      not_recommended: "Non recommandé",
    } as Record<string, string>,
    member: "Statut Ligue",
    members: {
      member: "Membre",
      candidate: "Candidat",
      non_member: "Non membre",
    } as Record<string, string>,
    notes: "Notes de l'évaluateur",
    save: "Enregistrer l'évaluation",
    saved: "Évaluation enregistrée",
    bio: "Présentation",
    qualifications: "Qualifications",
    accNumber: "N° d'inscription",
  },
  en: {
    title: "League portal",
    subtitle:
      "League of Specialists in Psychological and Mental Health (LSSPM). Files of psychologists who chose to share them with the League through U.Psy.",
    consent:
      "Only files whose psychologist consented appear. Withdrawing consent removes access at once. ID card, bank details, date of birth and phone are never shared (Law 09-08).",
    reserved: "Reserved for League reviewers.",
    shared: "Shared files",
    campaign: "League campaign",
    started: "Applications started",
    submitted: "Submitted",
    approved: "Accredited",
    link: "Recruitment link",
    copy: "Copy",
    copied: "Link copied",
    search: "Name, city, specialty",
    sort: "Sort",
    sortRecent: "Most recent",
    sortUpsy: "U.Psy score",
    sortLeague: "League score",
    toReview: "To review",
    all: "All",
    upsy: "U.Psy score",
    league: "League score",
    reviews: (n: number) => `${n} review${n === 1 ? "" : "s"}`,
    years: (n: number) => `${n} years' experience`,
    empty: "No shared file yet.",
    open: "Open file",
    docs: "Professional documents",
    noDocs: "No professional document uploaded.",
    checks: "U.Psy pre-check",
    level: "Level",
    suggested: "suggested",
    rubric: "League rubric (0 to 5)",
    criteria: {
      score_training: "Training and degrees",
      score_experience: "Clinical experience",
      score_documents: "File completeness",
      score_specialisation: "Specialisation",
      score_ethics: "Ethics",
    } as Record<string, string>,
    recommendation: "Recommendation",
    recs: {
      recommended: "Recommended",
      more_info: "More information needed",
      not_recommended: "Not recommended",
    } as Record<string, string>,
    member: "League status",
    members: {
      member: "Member",
      candidate: "Candidate",
      non_member: "Not a member",
    } as Record<string, string>,
    notes: "Reviewer notes",
    save: "Save review",
    saved: "Review saved",
    bio: "About",
    qualifications: "Qualifications",
    accNumber: "Registration no.",
  },
};

const CRITERIA = [
  "score_training",
  "score_experience",
  "score_documents",
  "score_specialisation",
  "score_ethics",
] as const;

const DOCS: Array<[keyof FileRow, string, string]> = [
  ["doc_diploma_url", "Diplôme", "Degree"],
  ["doc_license_morocco_url", "Autorisation d'exercice", "Licence to practise"],
  [
    "doc_order_registration_url",
    "Inscription Ordre / Ligue",
    "Order / League registration",
  ],
  ["doc_cv_url", "CV", "CV"],
  ["doc_insurance_url", "Assurance RC pro", "Professional insurance"],
];

const CAMPAIGN_URL = "https://www.upsy.ma/fr/campaigns/lsspm";

function scoreTone(n: number | null) {
  if (n == null) return "text-muted-foreground";
  return n >= 75
    ? "text-emerald-600"
    : n >= 50
      ? "text-amber-600"
      : "text-destructive";
}

export default function LeaguePortal() {
  const { locale } = useLocale();
  const c = locale === "en" ? COPY.en : COPY.fr;
  const { isLeague, isAdmin, loading: roleLoading } = useUserRole();
  const [rows, setRows] = useState<FileRow[] | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"recent" | "upsy" | "league">("recent");
  const [onlyTodo, setOnlyTodo] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const allowed = isLeague || isAdmin;

  const load = async () => {
    const [a, s] = await Promise.all([
      supabase.rpc("league_applications"),
      supabase.rpc("league_recruitment_stats", { p_source: "lsspm" }),
    ]);
    if (a.error) toast.error(a.error.message);
    setRows(a.data ?? []);
    setStats((s.data as Record<string, number>) ?? null);
  };

  useEffect(() => {
    if (allowed) load();
  }, [allowed]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = (rows ?? []).filter(
      (r) =>
        !needle ||
        [r.full_name, r.city, ...(r.specialties ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(needle),
    );
    if (onlyTodo) list = list.filter((r) => !r.my_review);
    const by = {
      recent: (r: FileRow) => -new Date(r.consented_at ?? 0).getTime(),
      upsy: (r: FileRow) => -r.upsy_score,
      league: (r: FileRow) => -(r.league_avg ?? -1),
    }[sort];
    return [...list].sort((x, y) => by(x) - by(y));
  }, [rows, q, sort, onlyTodo]);

  if (roleLoading) return null;
  if (!allowed)
    return (
      <div className="container-custom py-24 text-center">
        <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-muted-foreground">{c.reserved}</p>
      </div>
    );

  const open = rows?.find((r) => r.id === openId) ?? null;

  return (
    <div className="container-custom py-8 sm:py-12 space-y-6">
      <header className="space-y-2">
        <Badge className="bg-primary/10 text-primary border-primary/20">
          LSSPM × U.Psy
        </Badge>
        <h1 className="text-h1">{c.title}</h1>
        <p className="text-muted-foreground max-w-3xl">{c.subtitle}</p>
        <p className="text-xs text-muted-foreground flex gap-2 max-w-3xl">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          {c.consent}
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [c.shared, stats?.all_shared_with_league],
          [c.started, stats?.started],
          [c.submitted, stats?.submitted],
          [c.approved, stats?.approved],
        ].map(([label, v], i) => (
          <div key={i} className="glass-card p-4">
            <p className="text-2xl font-bold tabular-nums">{v ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {label}
              {i > 0 && ` · ${c.campaign}`}
            </p>
          </div>
        ))}
      </section>

      <section className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{c.link}</p>
          <p className="font-mono text-sm break-all">{CAMPAIGN_URL}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(CAMPAIGN_URL);
            toast.success(c.copied);
          }}
        >
          <Copy className="w-4 h-4" />
          {c.copy}
        </Button>
      </section>

      <section className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={c.search}
            aria-label={c.search}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Button
            size="sm"
            variant={onlyTodo ? "default" : "outline"}
            onClick={() => setOnlyTodo(!onlyTodo)}
          >
            {onlyTodo ? c.toReview : c.all}
          </Button>
          {(["recent", "upsy", "league"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={sort === s ? "default" : "outline"}
              onClick={() => setSort(s)}
              className="shrink-0"
            >
              {s === "recent"
                ? c.sortRecent
                : s === "upsy"
                  ? c.sortUpsy
                  : c.sortLeague}
            </Button>
          ))}
          <ExportCsvButton
            filename="lsspm-dossiers.csv"
            rows={shown.map((r) => ({
              nom: r.full_name,
              email: r.email,
              ville: r.city,
              experience: r.years_experience,
              specialites: (r.specialties ?? []).join("; "),
              niveau: r.accreditation_level,
              statut_upsy: r.status,
              score_upsy: r.upsy_score,
              score_ligue: r.league_avg,
              evaluations: r.league_reviews,
              source: r.source,
            }))}
          />
        </div>
      </section>

      {rows === null ? (
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
      ) : shown.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{c.empty}</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => setOpenId(r.id)}
                className="glass-card w-full p-4 text-start space-y-3 hover:shadow-glass-hover transition-all"
              >
                <div className="flex items-start gap-3">
                  {r.photo_url ? (
                    <img
                      src={r.photo_url}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {r.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[
                        r.city,
                        r.years_experience != null
                          ? c.years(r.years_experience)
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {r.accreditation_level}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {r.status}
                      </Badge>
                      {r.source === "lsspm" && (
                        <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          LSSPM
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      {c.upsy}
                    </p>
                    <p
                      className={`font-bold tabular-nums ${scoreTone(r.upsy_score)}`}
                    >
                      {r.upsy_score}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      {c.league}
                    </p>
                    <p
                      className={`font-bold tabular-nums ${scoreTone(r.league_avg)}`}
                    >
                      {r.league_avg == null ? "—" : `${r.league_avg}/100`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {c.reviews(r.league_reviews)}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {open && <FileDetail key={open.id} row={open} c={c} onSaved={load} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FileDetail({
  row,
  c,
  onSaved,
}: {
  row: FileRow;
  c: typeof COPY.fr;
  onSaved: () => void;
}) {
  const { locale } = useLocale();
  const mine = (row.my_review as Review | null) ?? null;
  const [review, setReview] = useState<Review>(
    mine ?? {
      score_training: 3,
      score_experience: 3,
      score_documents: 3,
      score_specialisation: 3,
      score_ethics: 3,
      recommendation: "more_info",
      member_status: "candidate",
      notes: "",
    },
  );
  const [links, setLinks] = useState<Array<{ label: string; url: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const paths: Array<{ label: string; path: string }> = [];
    for (const [key, fr, en] of DOCS) {
      const p = row[key] as string | null;
      if (p) paths.push({ label: locale === "en" ? en : fr, path: p });
    }
    (row.doc_specialty_certs_urls ?? []).forEach((p, i) =>
      paths.push({
        label: `${locale === "en" ? "Certificate" : "Certificat"} ${i + 1}`,
        path: p,
      }),
    );
    Promise.all(
      paths.map(async ({ label, path }) => {
        const { data } = await supabase.storage
          .from("accreditation-docs")
          .createSignedUrl(path, 600);
        return data?.signedUrl ? { label, url: data.signedUrl } : null;
      }),
    ).then((xs) =>
      setLinks(xs.filter(Boolean) as Array<{ label: string; url: string }>),
    );
  }, [row, locale]);

  const total = CRITERIA.reduce((s, k) => s + review[k], 0) * 4;
  const flags =
    (row.auto_check_flags as Array<{
      severity: string;
      message: string;
    }> | null) ?? [];

  const save = async () => {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("league_reviews").upsert(
      {
        application_id: row.id,
        reviewer_id: u.user!.id,
        // Only the editable fields: my_review also carries id, total (a
        // generated column) and timestamps, which must not be written back.
        score_training: review.score_training,
        score_experience: review.score_experience,
        score_documents: review.score_documents,
        score_specialisation: review.score_specialisation,
        score_ethics: review.score_ethics,
        recommendation: review.recommendation,
        member_status: review.member_status,
        notes: review.notes?.trim() || null,
      },
      { onConflict: "application_id,reviewer_id" },
    );
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(c.saved);
    onSaved();
  };

  return (
    <div className="space-y-6">
      <SheetHeader className="text-start">
        <SheetTitle>{row.full_name}</SheetTitle>
        <SheetDescription>
          {[row.email, row.city].filter(Boolean).join(" · ")}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline">
          {c.level}: {row.accreditation_level}
        </Badge>
        {row.suggested_level && (
          <Badge variant="outline">
            {row.suggested_level} ({c.suggested})
          </Badge>
        )}
        {row.accreditation_number && (
          <Badge variant="outline">
            {c.accNumber}: {row.accreditation_number}
          </Badge>
        )}
        {(row.specialties ?? []).map((s) => (
          <Badge key={s} variant="secondary">
            {s}
          </Badge>
        ))}
      </div>

      {row.bio_short && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            {c.bio}
          </p>
          <p className="text-sm">{row.bio_short}</p>
        </div>
      )}
      {row.qualifications && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            {c.qualifications}
          </p>
          <p className="text-sm whitespace-pre-wrap">{row.qualifications}</p>
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {c.docs}
        </p>
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">{c.noDocs}</p>
        ) : (
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {c.checks} · {row.upsy_score}/100
        </p>
        <Progress value={row.upsy_score} className="h-2 mb-2" />
        {flags.length === 0 ? (
          <p className="text-sm flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" /> OK
          </p>
        ) : (
          <ul className="space-y-1">
            {flags.map((f, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${f.severity === "block" ? "text-destructive" : "text-amber-500"}`}
                />
                {f.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 border-t border-border/40 pt-4">
        <p className="font-semibold">
          {c.rubric} · <span className={scoreTone(total)}>{total}/100</span>
        </p>
        {CRITERIA.map((k) => (
          <div key={k}>
            <p className="text-sm mb-1.5">{c.criteria[k]}</p>
            <div
              className="grid grid-cols-6 gap-1.5"
              role="radiogroup"
              aria-label={c.criteria[k]}
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={review[k] === n}
                  onClick={() => setReview({ ...review, [k]: n })}
                  className={`h-10 rounded-lg border text-sm ${review[k] === n ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}

        {(
          [
            ["recommendation", c.recommendation, c.recs],
            ["member_status", c.member, c.members],
          ] as const
        ).map(([field, label, opts]) => (
          <div key={field}>
            <p className="text-sm mb-1.5">{label}</p>
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label={label}
            >
              {Object.entries(opts).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={review[field] === v}
                  onClick={() => setReview({ ...review, [field]: v })}
                  className={`min-h-10 rounded-full border px-3 text-sm ${review[field] === v ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        ))}

        <Textarea
          value={review.notes ?? ""}
          onChange={(e) => setReview({ ...review, notes: e.target.value })}
          placeholder={c.notes}
          aria-label={c.notes}
          rows={4}
          maxLength={4000}
        />
        <Button
          variant="primary"
          onClick={save}
          disabled={saving}
          className="w-full"
        >
          <Send className="w-4 h-4" />
          {saving ? "…" : c.save}
        </Button>
      </div>
    </div>
  );
}
