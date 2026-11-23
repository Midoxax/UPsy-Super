import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLeagueMembership } from "@/hooks/useLeagueMembership";
import { LEAGUE_NAME, useMembershipCopy } from "@/lib/league/membershipCopy";
import LsspmLogo from "@/components/league/LsspmLogo";
import MemberCard from "@/components/league/MemberCard";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * LSSPM membership on the psychologist's dashboard: apply, pay the League
 * (bank details + proof upload), then the badge once the League confirms.
 */
export default function LeagueMembershipCard() {
  const { user } = useAuth();
  const { t, locale } = useMembershipCopy();
  const qc = useQueryClient();
  const { data: state, isLoading } = useLeagueMembership();
  const { data: offer } = useQuery({
    queryKey: ["league-offer"],
    queryFn: async () => {
      const [plans, settings] = await Promise.all([
        supabase
          .from("league_membership_plans")
          .select("*")
          .eq("is_active", true)
          .order("position"),
        supabase.from("league_settings").select("*").maybeSingle(),
      ]);
      return { plans: plans.data ?? [], settings: settings.data };
    },
  });
  const [planId, setPlanId] = useState("");
  const [method, setMethod] = useState<"transfer" | "deposit">("transfer");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [birth, setBirth] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [enrolment, setEnrolment] = useState<File | null>(null);

  if (isLoading || !user) return null;
  const date = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString(
          locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR",
          { day: "numeric", month: "long", year: "numeric" },
        )
      : "";
  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["league-membership", user.id] });

  const label = (p: {
    label_fr: string;
    label_en: string | null;
    label_ar: string | null;
  }) =>
    (locale === "en" && p.label_en) ||
    (locale === "ar" && p.label_ar) ||
    p.label_fr;

  const upload = async (f: File, kind: string) => {
    if (f.size > MAX_BYTES) throw new Error(t.tooLarge);
    const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);
    const path = `${user.id}/${kind}-${Date.now()}-${safe}`;
    const { error } = await supabase.storage
      .from("league-files")
      .upload(path, f, { contentType: f.type || undefined });
    if (error) throw error;
    return path;
  };

  const active = state?.active;
  const pending = state?.pending;
  const payment = state?.payment;
  const s = offer?.settings;
  // Renewal opens 61 days before the membership ends (as league_join checks).
  const renewalOpen =
    !!active?.ends_on &&
    active.ends_on <=
      new Date(Date.now() + 61 * 86_400_000).toISOString().slice(0, 10);
  const renewing = !!active && renewalOpen;
  // A renewal starts from the current category, birth date and photo.
  const chosenId = planId || (renewing ? active.plan_id : "");
  const birthDate = birth || (renewing ? (active.birth_date ?? "") : "");
  const keptPhoto = renewing ? active.photo_path : null;

  const chosen = offer?.plans.find((p) => p.id === chosenId);
  const ready =
    !!chosen &&
    (!!photo || !!keptPhoto) &&
    (!chosen.max_age || !!birthDate) &&
    (!chosen.requires_enrolment || !!enrolment);

  const apply = async () => {
    if (!chosen || (!photo && !keptPhoto)) return;
    setBusy(true);
    try {
      const { error } = await supabase.rpc("league_join", {
        _plan: chosen.id,
        _birth_date: birthDate || undefined,
        _photo_path: photo ? await upload(photo, "photo") : (keptPhoto ?? ""),
        // Only for the student categories that ask for it.
        _enrolment_path:
          chosen.requires_enrolment && enrolment
            ? await upload(enrolment, "enrolment")
            : undefined,
      });
      if (error) throw error;
      refresh();
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg.includes("age limit") ? t.ageLimit : msg);
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!state?.pending || !file) return;
    if (file.size > MAX_BYTES) return toast.error(t.tooLarge);
    setBusy(true);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const path = `${user.id}/${Date.now()}-${safe}`;
    const up = await supabase.storage
      .from("league-proofs")
      .upload(path, file, { contentType: file.type || undefined });
    if (up.error) {
      setBusy(false);
      return toast.error(up.error.message);
    }
    const amount = Number(
      state.pending.league_membership_plans?.amount_mad ?? 0,
    );
    const { error } = await supabase.rpc("league_submit_payment", {
      _membership: state.pending.id,
      _method: method,
      _amount: amount,
      _reference: reference,
      _proof_path: path,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.sent);
    setFile(null);
    setReference("");
    refresh();
  };

  return (
    <Card className="p-5 space-y-3 border-primary/20 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/30">
      <div className="flex items-center gap-4">
        <LsspmLogo className="h-14 w-14 shrink-0" />
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">
            {active ? t.member : t.title}
          </h3>
          <p className="text-xs text-muted-foreground">{LEAGUE_NAME}</p>
        </div>
      </div>

      {active && (
        <div className="space-y-1 text-sm">
          <MemberCard m={active} />
          {active.commission_free_until &&
            active.commission_free_until >=
              new Date().toISOString().slice(0, 10) && (
              <p className="text-primary">
                {t.commissionFree(date(active.commission_free_until))}
              </p>
            )}
        </div>
      )}

      {(!active || renewing) && !pending && (
        <>
          {renewing ? (
            <div className="space-y-1 border-t pt-3">
              <p className="text-sm font-medium">
                {t.renewTitle(
                  String(Number((active.ends_on ?? "").slice(0, 4)) + 1),
                )}
              </p>
              <p className="text-xs text-muted-foreground">{t.renewHint}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.intro}</p>
          )}
          {offer && offer.plans.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t.notOpen}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium">{t.choose}</p>
              {offer?.plans
                .filter((p) => p.self_service)
                .map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-lg border p-2 text-sm cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="league-plan"
                        checked={chosenId === p.id}
                        onChange={() => setPlanId(p.id)}
                      />
                      {label(p)}
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      {Number(p.amount_mad)} MAD {t.perCalendar}
                    </span>
                  </label>
                ))}
              <p className="text-xs text-muted-foreground">{t.rulesNote}</p>
              <p className="text-xs text-muted-foreground">{t.grantedNote}</p>
              {chosen && (
                <div className="space-y-2 rounded-lg border bg-background/60 p-3">
                  <label className="block text-xs text-muted-foreground">
                    {t.photo}
                    {keptPhoto && <span className="block">{t.keepPhoto}</span>}
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1 block w-full text-xs"
                      onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {!!chosen.max_age && (
                    <label className="block text-xs text-muted-foreground">
                      {t.birthDate}
                      <Input
                        type="date"
                        className="mt-1"
                        value={birthDate}
                        onChange={(e) => setBirth(e.target.value)}
                      />
                    </label>
                  )}
                  {chosen.requires_enrolment && (
                    <label className="block text-xs text-muted-foreground">
                      {t.enrolment}
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="mt-1 block w-full text-xs"
                        onChange={(e) =>
                          setEnrolment(e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                  )}
                </div>
              )}
              <Button
                size="sm"
                className="w-full"
                disabled={!ready || busy}
                onClick={apply}
              >
                {busy && <Loader2 className="h-4 w-4 me-1 animate-spin" />}
                {renewing ? t.renew : t.apply}
              </Button>
            </div>
          )}
        </>
      )}

      {pending && (
        <div className="space-y-3 text-sm">
          <p className="font-medium">{t.pendingTitle}</p>
          {payment?.status === "submitted" ? (
            <p className="text-muted-foreground">{t.underReview}</p>
          ) : (
            <>
              {payment?.status === "rejected" && (
                <p className="text-destructive">
                  {t.rejected} {payment.review_note ?? ""} {t.resend}
                </p>
              )}
              <p>
                {t.pay(
                  String(
                    Number(pending.league_membership_plans?.amount_mad ?? 0),
                  ),
                )}
              </p>
              {s?.rib ? (
                <dl className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                  {s.bank_name && (
                    <div>
                      <dt className="inline text-muted-foreground">
                        {t.bank} :{" "}
                      </dt>
                      <dd className="inline">{s.bank_name}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline text-muted-foreground">
                      {t.holder} :{" "}
                    </dt>
                    <dd className="inline">{s.account_holder}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">{t.rib} : </dt>
                    <dd className="inline font-mono" dir="ltr">
                      {s.rib}
                    </dd>
                  </div>
                  {(locale === "en"
                    ? s.instructions_en
                    : s.instructions_fr) && (
                    <p className="pt-1">
                      {locale === "en" ? s.instructions_en : s.instructions_fr}
                    </p>
                  )}
                </dl>
              ) : (
                <p className="text-xs text-muted-foreground">{t.noBank}</p>
              )}
              <select
                aria-label={t.method}
                className="h-9 w-full rounded-md border bg-background px-2"
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value as "transfer" | "deposit")
                }
              >
                <option value="transfer">{t.transfer}</option>
                <option value="deposit">{t.deposit}</option>
              </select>
              <Input
                placeholder={t.reference}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
              <label className="block text-xs text-muted-foreground">
                {t.proof}
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="mt-1 block w-full text-xs"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <Button
                size="sm"
                className="w-full"
                disabled={!file || busy}
                onClick={send}
              >
                {busy && <Loader2 className="h-4 w-4 me-1 animate-spin" />}
                {t.send}
              </Button>
              <p className="text-xs text-muted-foreground">{t.cashNote}</p>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
