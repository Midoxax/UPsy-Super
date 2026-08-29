import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { pushDataLayer } from "@/lib/analytics/gtm";

export type CampaignConfig = {
  slug: string;
  source: string; // written to growth_leads.source
  audience: "b2c" | "specialist";
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  offerLabel: string; // e.g. "WELCOME20 · -20% on first session"
  bullets: string[];
  proof: { number: string; label: string }[];
  primaryCta: { label: string; href: string };
  formTitle: string;
  formSubtitle: string;
  successTitle: string;
  successBody: string;
  successCta: { label: string; href: string };
  askPhone?: boolean;
  askOrg?: boolean;
};

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const nameSchema = z.string().trim().min(1, "Your name helps us personalize").max(120);
const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+\d\s\-().]{6,20}$/i, "Enter a valid phone number");

// UTM & referral capture — persisted with the lead for attribution.
function readAttribution() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source") || undefined,
    utm_medium: p.get("utm_medium") || undefined,
    utm_campaign: p.get("utm_campaign") || undefined,
    utm_content: p.get("utm_content") || undefined,
    utm_term: p.get("utm_term") || undefined,
    referrer: document.referrer || undefined,
    landing_path: window.location.pathname,
  };
}

const CampaignLanding = ({ config }: { config: CampaignConfig }) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [org, setOrg] = useState("");
  const [consent, setConsent] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const attribution = useMemo(readAttribution, []);

  useEffect(() => {
    pushDataLayer({
      event: "campaign_view",
      campaign_slug: config.slug,
      campaign_audience: config.audience,
      ...attribution,
    });
  }, [config.slug, config.audience, attribution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fieldErrors: Record<string, string> = {};
    const nameCheck = nameSchema.safeParse(name);
    const emailCheck = emailSchema.safeParse(email);
    if (!nameCheck.success) fieldErrors.name = nameCheck.error.issues[0].message;
    if (!emailCheck.success) fieldErrors.email = emailCheck.error.issues[0].message;
    if (config.askPhone || whatsapp) {
      const phoneCheck = phoneSchema.safeParse(phone);
      if (!phoneCheck.success) fieldErrors.phone = phoneCheck.error.issues[0].message;
    }
    if (!consent) fieldErrors.consent = "Required to continue (Law 09-08)";
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("growth_leads").insert({
        email: emailCheck.data!,
        full_name: nameCheck.data!,
        phone: phone.trim() || null,
        source: config.source,
        consent_marketing: consent,
        locale: (navigator.language || "fr").split("-")[0],
        nurture_stage: "d0",
        score_breakdown: {
          audience: config.audience,
          organization: org.trim() || undefined,
          whatsapp_opt_in: whatsapp,
          ...attribution,
        },
      });
      if (error) throw error;

      await supabase.rpc("crm_upsert_contact", {
        _email: emailCheck.data!,
        _full_name: nameCheck.data!,
        _phone: phone.trim() || undefined,
        _locale: (navigator.language || "fr").split("-")[0],
        _contact_type: config.audience === "specialist" ? "specialist" : "client",
        _source: config.source,
        _first_touch: attribution as never,
        _activity_kind: "form_submitted",
        _activity_subject: `Campaign — ${config.slug}`,
        _activity_metadata: { organization: org.trim() || null, whatsapp_opt_in: whatsapp } as never,
        _consent_purpose: "newsletter",
        _consent_granted: consent,
        _consent_evidence: {
          form: `campaign:${config.slug}`,
          url: typeof window !== "undefined" ? window.location.pathname : null,
          ts: new Date().toISOString(),
          wording_version: "campaign-v1",
        } as never,
      });

      pushDataLayer({
        event: "campaign_lead",
        campaign_slug: config.slug,
        campaign_audience: config.audience,
        whatsapp_opt_in: whatsapp,
      });

      setSuccess(true);
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 marketing-night min-h-screen">
      <SEOHead
        path={`/campaigns/${config.slug}`}
        title={config.seoTitle}
        description={config.seoDescription}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="container-custom pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-12 items-start">
          {/* Left: pitch */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {config.eyebrow}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 font-display text-4xl md:text-6xl leading-[1.05] tracking-tight"
            >
              {config.headline}{" "}
              <span className="italic accent-italic text-primary">
                {config.headlineAccent}
              </span>
            </motion.h1>

            <p className="mt-6 text-lg text-foreground/70 max-w-xl leading-relaxed">
              {config.subheadline}
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border-2 border-primary/40 bg-primary/8 px-5 py-3">
              <div className="h-2 w-2 rounded-full bg-primary motion-breathe" />
              <span className="font-mono text-sm tracking-tight text-foreground">
                {config.offerLabel}
              </span>
            </div>

            <ul className="mt-10 space-y-3">
              {config.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-foreground/80">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {config.proof.map((p) => (
                <div key={p.label}>
                  <div className="font-display text-3xl text-primary tabular-nums">
                    {p.number}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 leading-tight">
                    {p.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form or success */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-3xl border border-border/60 bg-background/80 backdrop-blur-xl p-7 shadow-2xl"
            >
              {success ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
                    <Check className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="mt-5 font-display text-2xl">{config.successTitle}</h2>
                  <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                    {config.successBody}
                  </p>
                  <Button asChild className="mt-6 w-full" size="lg">
                    <Link to={config.successCta.href}>
                      {config.successCta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <h2 className="font-display text-2xl">{config.formTitle}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.formSubtitle}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={120}
                      autoComplete="name"
                      required
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={255}
                      autoComplete="email"
                      required
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>

                  {(config.askPhone || whatsapp) && (
                    <div>
                      <Label htmlFor="phone">Phone / WhatsApp</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+212 6..."
                        autoComplete="tel"
                        maxLength={20}
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                      )}
                    </div>
                  )}

                  {config.askOrg && (
                    <div>
                      <Label htmlFor="org">Practice / clinic (optional)</Label>
                      <Input
                        id="org"
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        maxLength={120}
                      />
                    </div>
                  )}

                  <label className="flex items-start gap-3 rounded-lg border border-border/60 p-3 text-xs cursor-pointer hover:bg-muted/40 transition-colors">
                    <Checkbox
                      checked={whatsapp}
                      onCheckedChange={(v) => setWhatsapp(v === true)}
                      className="mt-0.5"
                    />
                    <span className="text-foreground/80 leading-relaxed">
                      Send updates on WhatsApp too (optional, unsubscribe anytime).
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-xs cursor-pointer">
                    <Checkbox
                      checked={consent}
                      onCheckedChange={(v) => setConsent(v === true)}
                      className="mt-0.5"
                      required
                    />
                    <span className="text-muted-foreground leading-relaxed">
                      I agree to receive personalized messages from U.Psy and I've read the{" "}
                      <Link to="/privacy" className="underline hover:text-foreground">
                        privacy notice
                      </Link>
                      . Data protected under Moroccan Law 09-08 — CNDP compliant.
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-xs text-destructive">{errors.consent}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {config.primaryCta.label}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-[11px] text-center text-muted-foreground">
                    No spam. One-click unsubscribe in every message.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CampaignLanding;