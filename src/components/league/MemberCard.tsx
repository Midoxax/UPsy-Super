import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, FileText, Loader2, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import LsspmLogo from "@/components/league/LsspmLogo";
import type { Membership } from "@/hooks/useLeagueMembership";
import { useMembershipCopy } from "@/lib/league/membershipCopy";
import {
  CATEGORY_COLORS,
  LEAGUE_BLUE,
  type MemberDoc,
  downloadAttestationPdf,
  downloadCardPdf,
  downloadReceiptPdf,
  verifyUrl,
} from "@/lib/league/memberDocs";

/**
 * The member's digital card (photo, number, validity, QR to the public
 * check), with the card, the attestation and every receipt as PDFs.
 */
export default function MemberCard({ m }: { m: Membership }) {
  const { user } = useAuth();
  const { t, locale } = useMembershipCopy();
  const lang = locale === "en" ? "en" : "fr";
  const [busy, setBusy] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const category =
    m.category ?? m.league_membership_plans?.category ?? "official";
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.official;

  const { data } = useQuery({
    queryKey: ["league-card", m.id],
    enabled: !!user,
    queryFn: async () => {
      const [profile, photo, payments] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user!.id)
          .maybeSingle(),
        m.photo_path
          ? supabase.storage
              .from("league-files")
              .createSignedUrl(m.photo_path, 3600)
          : Promise.resolve({ data: null }),
        supabase
          .from("league_payments")
          .select("*")
          .eq("user_id", user!.id)
          .eq("status", "verified")
          .order("verified_at", { ascending: false }),
      ]);
      return {
        name: profile.data?.full_name || user!.email || "",
        photoUrl: photo.data?.signedUrl ?? null,
        payments: payments.data ?? [],
      };
    },
  });

  useEffect(() => {
    if (!m.verify_token) return;
    import("qrcode").then(({ toDataURL }) =>
      toDataURL(verifyUrl(m.verify_token!), { margin: 1, width: 240 }).then(
        setQr,
      ),
    );
  }, [m.verify_token]);

  const doc = (): MemberDoc => ({
    fullName: data?.name ?? "",
    memberNumber: m.member_number ?? "",
    category,
    startsOn: m.starts_on ?? "",
    endsOn: m.ends_on ?? "",
    attestationNumber: m.attestation_number,
    confirmedAt: m.confirmed_at,
    verifyToken: m.verify_token,
    photoUrl: data?.photoUrl ?? null,
  });
  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  const date = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString(
          locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR",
        )
      : "";

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium">{t.cardTitle}</p>
      <div
        className="relative aspect-[85.6/54] w-full max-w-sm overflow-hidden rounded-2xl text-white shadow-lg"
        style={{ background: LEAGUE_BLUE }}
        dir="ltr"
      >
        <div className="flex items-center gap-2 p-3">
          <LsspmLogo className="h-9 w-9 shrink-0 rounded-full bg-white/90 p-0.5" />
          <p className="text-[9px] font-bold leading-tight sm:text-[10px]">
            LIGUE DES SPÉCIALISTES DE LA SANTÉ
            <br />
            PSYCHIQUE ET MENTALE — LSSPM
          </p>
        </div>
        <div className="flex items-start gap-3 px-3">
          {data?.photoUrl ? (
            <img
              src={data.photoUrl}
              alt=""
              className="aspect-[4/5] w-[22%] shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="aspect-[4/5] w-[22%] shrink-0 rounded-md bg-white/20" />
          )}
          <div className="min-w-0 flex-1 space-y-0.5 text-[10px] sm:text-xs">
            <p className="truncate text-sm font-semibold">{data?.name}</p>
            <p className="font-mono">{m.member_number}</p>
            <p className="opacity-90">{t.validUntil(date(m.ends_on))}</p>
          </div>
          {qr && (
            <img
              src={qr}
              alt=""
              className="w-[22%] shrink-0 rounded bg-white p-0.5"
            />
          )}
        </div>
        <div
          className="absolute inset-x-0 bottom-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs"
          style={{ background: colors.accent, color: colors.ink }}
        >
          {t.categories[category] ?? category}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!data || !!busy}
          onClick={() => run("card", () => downloadCardPdf(doc(), lang))}
        >
          {busy === "card" ? (
            <Loader2 className="me-1 h-4 w-4 animate-spin" />
          ) : (
            <Download className="me-1 h-4 w-4" />
          )}
          {t.downloadCard}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!data || !!busy}
          onClick={() => run("att", () => downloadAttestationPdf(doc(), lang))}
        >
          {busy === "att" ? (
            <Loader2 className="me-1 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="me-1 h-4 w-4" />
          )}
          {t.downloadAttestation}
        </Button>
      </div>
      {!!data?.payments.length && (
        <div className="space-y-1">
          <p className="text-xs font-medium">{t.receipts}</p>
          {data.payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-lg border bg-background/60 p-2 text-xs"
            >
              <span className="flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5" />
                <span className="font-mono">{p.receipt_number}</span>
                <span className="text-muted-foreground">
                  · {Number(p.amount_mad)} MAD · {date(p.verified_at)}
                </span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={!!busy}
                onClick={() =>
                  run(p.id, () =>
                    downloadReceiptPdf(
                      {
                        receiptNumber: p.receipt_number ?? "",
                        paidAt: p.verified_at ?? p.created_at,
                        payer: data.name,
                        memberNumber: m.member_number,
                        amount: Number(p.amount_mad),
                        method: p.method,
                        nature: p.nature,
                        year: (m.ends_on ?? "").slice(0, 4),
                      },
                      lang,
                    ),
                  )
                }
              >
                {t.downloadReceipt}
              </Button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{t.receiptWhen}</p>
    </div>
  );
}
