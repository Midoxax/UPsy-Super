import { useState } from "react";
import { Copy, Link2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { fmtDay, type PerfCopy } from "@/lib/performance/copy";
import type { CrewLink } from "@/hooks/usePerformance";

const ROLES = ["coach", "physio", "parent", "other"] as const;
const SCOPES = ["readiness", "training", "competitions", "season"] as const;

/** Read-only links for the people around the athlete (athlete_crew_links). */
export default function CrewLinks({
  c,
  links,
  onAdd,
  onRevoke,
}: {
  c: PerfCopy;
  links: CrewLink[];
  onAdd: (l: {
    label: string;
    role: string;
    scopes: string[];
    invite_email?: string | null;
  }) => Promise<{ error: Error | null }>;
  onRevoke: (id: string) => void;
}) {
  const { locale } = useLocale();
  const [label, setLabel] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("coach");
  const [scopes, setScopes] = useState<string[]>([
    "readiness",
    "training",
    "competitions",
  ]);
  const [busy, setBusy] = useState(false);
  const url = (token: string) =>
    `${window.location.origin}${addLocalePrefix(`/crew/${token}`, locale)}`;

  const create = async () => {
    if (!label.trim() || !scopes.length) return;
    setBusy(true);
    const invite = email.trim().toLowerCase();
    const { error } = await onAdd({
      label: label.trim(),
      role,
      scopes,
      invite_email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite) ? invite : null,
    });
    setBusy(false);
    if (error) return toast.error(c.saveFailed, { description: error.message });
    setLabel("");
    setEmail("");
    toast.success(c.saved);
  };
  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(url(token));
      toast.success(c.crewCopied);
    } catch {
      window.prompt(c.crewCopy, url(token));
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          <Link2 className="h-4 w-4 text-primary" />
          {c.crewLinksTitle}
        </h3>
        <p className="mt-1 flex gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {c.crewLinksIntro}
        </p>
      </div>

      {links.length > 0 && (
        <ul className="divide-y divide-border">
          {links.map((l) => (
            <li
              key={l.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {l.label}{" "}
                  <span className="text-xs text-muted-foreground">
                    · {c.crewRoles[l.role] ?? l.role}
                    {l.invite_email && ` · ${l.invite_email}`}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {l.scopes.map((s) => c.crewScopes[s] ?? s).join(" · ")} ·{" "}
                  {l.last_viewed_at
                    ? c.crewViewed(fmtDay(c, l.last_viewed_at))
                    : c.crewNotViewed}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copy(l.token)}
                >
                  <Copy className="h-4 w-4" />
                  {c.crewCopy}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRevoke(l.id)}
                >
                  {c.crewRevoke}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-3 rounded-xl border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>{c.crewLabel}</span>
            <Input
              value={label}
              maxLength={80}
              placeholder={c.crewLabelPh}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <div className="space-y-1 text-sm">
            <span>&nbsp;</span>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <Button
                  key={r}
                  type="button"
                  size="sm"
                  variant={role === r ? "default" : "outline"}
                  onClick={() => setRole(r)}
                >
                  {c.crewRoles[r]}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <label className="block space-y-1 text-sm">
          <span>{c.crewEmail}</span>
          <Input
            type="email"
            value={email}
            maxLength={254}
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className="block text-xs text-muted-foreground">
            {c.crewEmailHint}
          </span>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {SCOPES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={scopes.includes(s)}
                onCheckedChange={(on) =>
                  setScopes((xs) =>
                    on ? [...xs, s] : xs.filter((x) => x !== s),
                  )
                }
              />
              {c.crewScopes[s]}
            </label>
          ))}
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={create}
          disabled={busy || !label.trim() || !scopes.length}
        >
          {c.crewCreate}
        </Button>
      </div>
    </section>
  );
}
