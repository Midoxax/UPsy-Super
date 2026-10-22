import { useState } from "react";
import { ShieldCheck, UserRound } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import type { Share } from "@/hooks/useAthleteHub";
import { useHubCopy } from "@/components/athlete/copy";

const SCOPES = [
  "readiness",
  "goals",
  "competitions",
  "protocols",
  "assessments",
  "journal",
] as const;
const DEFAULT_SCOPES = ["readiness", "goals", "competitions", "protocols"];

interface Props {
  shares: Share[];
  candidates: { psychologist_id: string; full_name: string }[];
  onSet: (
    psychologistId: string,
    scopes: string[] | null,
  ) => Promise<{ error: Error | null }>;
}

export default function SharePanel({ shares, candidates, onSet }: Props) {
  const c = useHubCopy();
  const { locale } = useLocale();

  if (candidates.length === 0) {
    return (
      <div className="glass-card p-5 sm:p-6 space-y-4">
        <p className="text-sm text-muted-foreground">{c.shareIntro}</p>
        <p className="text-sm text-foreground">{c.shareNone}</p>
        <Button asChild variant="primary" className="w-full sm:w-auto">
          <Link to={addLocalePrefix("/psychologists", locale)}>
            {c.findPsych}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-6 space-y-5">
      <p className="text-sm text-muted-foreground flex gap-2">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        {c.shareIntro}
      </p>
      {candidates.map((p) => (
        <PsychologistShare
          key={p.psychologist_id}
          name={p.full_name}
          share={shares.find(
            (s) => s.psychologist_id === p.psychologist_id && !s.revoked_at,
          )}
          onSet={(scopes) => onSet(p.psychologist_id, scopes)}
        />
      ))}
    </div>
  );
}

function PsychologistShare({
  name,
  share,
  onSet,
}: {
  name: string;
  share?: Share;
  onSet: (scopes: string[] | null) => Promise<{ error: Error | null }>;
}) {
  const c = useHubCopy();
  const [scopes, setScopes] = useState<string[]>(
    share?.scopes ?? DEFAULT_SCOPES,
  );
  const [busy, setBusy] = useState(false);
  const active = !!share;

  const run = async (next: string[] | null) => {
    setBusy(true);
    const r = await onSet(next);
    setBusy(false);
    toast(
      r.error
        ? {
            title: c.saveFailed,
            description: r.error.message,
            variant: "destructive",
          }
        : { title: c.shareSaved },
    );
  };

  const toggle = (s: string, on: boolean) => {
    const next = on ? [...scopes, s] : scopes.filter((x) => x !== s);
    setScopes(next);
    if (active && next.length > 0) run(next);
  };

  return (
    <div className="rounded-xl border border-border/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-foreground flex items-center gap-2 min-w-0">
          <UserRound className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">{name}</span>
        </p>
        <Badge variant={active ? "default" : "outline"} className="shrink-0">
          {active ? c.shareOn : c.shareOff}
        </Badge>
      </div>
      <div className="space-y-1">
        {SCOPES.map((s) => (
          <label
            key={s}
            className="flex items-start gap-3 min-h-10 py-1.5 cursor-pointer text-sm"
          >
            <Checkbox
              className="mt-0.5"
              checked={scopes.includes(s)}
              disabled={busy}
              onCheckedChange={(v) => toggle(s, v === true)}
            />
            <span className="text-foreground">{c.scopes[s]}</span>
          </label>
        ))}
      </div>
      {active ? (
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => run(null)}
          className="w-full sm:w-auto"
        >
          {c.stopSharing}
        </Button>
      ) : (
        <Button
          variant="primary"
          disabled={busy || scopes.length === 0}
          onClick={() => run(scopes)}
          className="w-full sm:w-auto"
        >
          {c.startSharing}
        </Button>
      )}
    </div>
  );
}
