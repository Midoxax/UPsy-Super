import { useEffect, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { Check, Loader2, MapPin, User, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";
import { publishProfileCopy } from "@/lib/publishProfileCopy";

/**
 * /publish-profile?t=…: an approved psychologist checks the profile prepared
 * from their application and publishes it, without logging in first
 * (profile-publication function). Nothing is public before they confirm.
 */

interface Preview {
  full_name: string;
  bio: string | null;
  city: string | null;
  photo: string | null;
  hourly_rate_mad: number | null;
  offers_online: boolean | null;
  offers_in_person: boolean | null;
  specialties: string[];
  languages: string[];
  approaches: string[];
  accredited: boolean;
  /** What a booking needs and the profile lacks (psychologist_publish_guard). */
  needs: { bio: boolean; rate: boolean; hours: boolean };
}

type State = "loading" | "ready" | "invalid" | "publishing" | "done" | "error";

const call = (body: Record<string, unknown>) =>
  supabase.functions.invoke("profile-publication", { body });

export default function PublishProfile() {
  const { locale } = useLocale();
  const t =
    publishProfileCopy[locale as keyof typeof publishProfileCopy] ??
    publishProfileCopy.fr;
  const [params] = useSearchParams();
  const token = params.get("t") ?? "";
  const [state, setState] = useState<State>("loading");
  const [p, setP] = useState<Preview | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [rate, setRate] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  useEffect(() => {
    if (!/^[0-9a-f]{64}$/.test(token)) {
      setState("invalid");
      return;
    }
    call({ action: "preview", token }).then(({ data, error }) => {
      if (error || !data?.full_name) setState("invalid");
      else {
        setP(data as Preview);
        setBio((data as Preview).bio ?? "");
        setState("ready");
      }
    });
  }, [token]);

  const needs = p?.needs ?? { bio: false, rate: false, hours: false };
  const filled =
    (!needs.bio || bio.trim().length >= 80) &&
    (!needs.rate || Number(rate) >= 100) &&
    (!needs.hours || (days.length > 0 && start < end));

  const publish = async () => {
    setState("publishing");
    const { data, error } = await call({
      action: "publish",
      token,
      ...(needs.bio ? { bio: bio.trim() } : {}),
      ...(needs.rate ? { rate: Number(rate) } : {}),
      ...(needs.hours ? { hours: { days, start, end } } : {}),
    });
    if (error || !data?.published) setState("error");
    else {
      setSlug(data.slug ?? null);
      setState("done");
    }
  };

  const Section = ({ label, items }: { label: string; items: string[] }) =>
    items.length ? (
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {items.map((x) => (
            <span
              key={x}
              className="rounded-full border border-border px-2.5 py-0.5 text-sm"
            >
              {x}
            </span>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <main className="min-h-[70vh] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        {state === "loading" && (
          <p className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t.loading}
          </p>
        )}

        {state === "invalid" && (
          <div className="space-y-4 text-center">
            <h1 className="font-display text-3xl">{t.invalidTitle}</h1>
            <p className="text-muted-foreground">{t.invalidText}</p>
            <Button asChild>
              <Link to="/auth">{t.login}</Link>
            </Button>
          </div>
        )}

        {state === "done" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl">{t.doneTitle}</h1>
            <p className="text-muted-foreground">{t.doneText}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {slug && (
                <Button asChild variant="outline">
                  <Link to={`/psychologists/${slug}`}>{t.view}</Link>
                </Button>
              )}
              <Button asChild>
                <Link to="/auth">{t.dashboard}</Link>
              </Button>
            </div>
          </div>
        )}

        {p &&
          (state === "ready" ||
            state === "publishing" ||
            state === "error") && (
            <>
              <header className="space-y-2">
                <h1 className="font-display text-3xl">{t.title}</h1>
                <p className="text-muted-foreground">{t.lead}</p>
              </header>

              <article className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex flex-col gap-5 p-5 sm:flex-row">
                  <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {p.photo ? (
                      <img
                        src={p.photo}
                        alt={p.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
                        <User className="h-8 w-8" />
                        {t.noPhoto}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <h2 className="font-display text-2xl">{p.full_name}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {p.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {p.city}
                        </span>
                      )}
                      {p.offers_online && (
                        <span className="inline-flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" /> {t.online}
                        </span>
                      )}
                      {p.offers_in_person && <span>{t.inPerson}</span>}
                      {p.hourly_rate_mad != null && (
                        <span className="font-medium text-foreground">
                          {Number(p.hourly_rate_mad)} {t.perSession}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {p.bio || t.noBio}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 border-t border-border p-5">
                  <Section label={t.specialties} items={p.specialties} />
                  <Section label={t.approaches} items={p.approaches} />
                  <Section label={t.languages} items={p.languages} />
                </div>
              </article>

              {p.accredited ? (
                <div className="space-y-4">
                  {(needs.bio || needs.rate || needs.hours) && (
                    <section className="space-y-4 rounded-2xl border border-border p-5">
                      <h2 className="font-display text-xl">{t.needsTitle}</h2>
                      {needs.bio && (
                        <div className="space-y-1.5">
                          <Label htmlFor="publish-bio">{t.bioLabel}</Label>
                          <Textarea
                            id="publish-bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={5}
                            maxLength={4000}
                          />
                          <p className="text-xs text-muted-foreground">
                            {t.bioHint} ({bio.trim().length}/80)
                          </p>
                        </div>
                      )}
                      {needs.rate && (
                        <div className="space-y-1.5">
                          <Label htmlFor="publish-rate">{t.rateLabel}</Label>
                          <Input
                            id="publish-rate"
                            type="number"
                            inputMode="numeric"
                            min={100}
                            max={5000}
                            step={50}
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="max-w-[10rem]"
                          />
                        </div>
                      )}
                      {needs.hours && (
                        <fieldset className="space-y-2">
                          <legend className="text-sm font-medium">
                            {t.hoursLabel}
                          </legend>
                          <div className="flex flex-wrap gap-1.5">
                            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                              const on = days.includes(d);
                              return (
                                <button
                                  key={d}
                                  type="button"
                                  aria-pressed={on}
                                  onClick={() =>
                                    setDays(
                                      on
                                        ? days.filter((x) => x !== d)
                                        : [...days, d],
                                    )
                                  }
                                  className={`rounded-full border px-3 py-1 text-sm ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                                >
                                  {t.days[d]}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <Label htmlFor="publish-start">{t.from}</Label>
                            <Input
                              id="publish-start"
                              type="time"
                              value={start}
                              onChange={(e) => setStart(e.target.value)}
                              className="w-auto"
                            />
                            <Label htmlFor="publish-end">{t.to}</Label>
                            <Input
                              id="publish-end"
                              type="time"
                              value={end}
                              onChange={(e) => setEnd(e.target.value)}
                              className="w-auto"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t.hoursHint}
                          </p>
                        </fieldset>
                      )}
                    </section>
                  )}
                  <label
                    htmlFor="publish-consent"
                    className="flex cursor-pointer items-start gap-3 text-sm"
                  >
                    <Checkbox
                      id="publish-consent"
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(v === true)}
                      className="mt-0.5"
                    />
                    <span>{t.consent}</span>
                  </label>
                  {state === "error" && (
                    <p className="text-sm text-destructive">{t.error}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={publish}
                      disabled={!agreed || !filled || state === "publishing"}
                    >
                      {state === "publishing" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          {t.publishing}
                        </>
                      ) : (
                        t.publish
                      )}
                    </Button>
                    <Button asChild variant="ghost">
                      <Link to="/auth">{t.editFirst}</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm">{t.incomplete}</p>
                  <Button asChild>
                    <Link to="/auth">{t.login}</Link>
                  </Button>
                </div>
              )}
            </>
          )}
      </div>
    </main>
  );
}
