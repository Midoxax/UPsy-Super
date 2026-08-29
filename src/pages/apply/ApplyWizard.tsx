import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronLeft, ChevronRight, Send, ShieldCheck, AlertCircle } from "lucide-react";
import { DocUploader } from "@/components/apply/DocUploader";
import DataPrivacyNotice from "@/components/DataPrivacyNotice";

type App = any;

const SPECIALTY_OPTIONS = [
  "Anxiété", "Dépression", "Trauma / EMDR", "Couple / Famille", "Addictologie",
  "Burnout", "Adolescents", "Performance sportive", "Post-catastrophe", "TCC", "Psychanalyse",
];
const APPROACH_OPTIONS = [
  "TCC", "EMDR", "MSPE / Pleine conscience", "Psychanalyse", "Systémique", "Humaniste", "Hypnose", "ACT",
];
const POPULATION_OPTIONS = [
  "Adultes", "Adolescents", "Enfants", "Couples", "Familles", "Athlètes", "Cadres / Dirigeants",
];
const LANGUAGE_OPTIONS = ["Français", "Arabe", "Darija", "Anglais", "Espagnol", "Italien", "Berbère"];

const STEPS = [
  { key: "identity", label: "Identité" },
  { key: "credentials", label: "Diplômes" },
  { key: "license", label: "Licence" },
  { key: "specialties", label: "Spécialisations" },
  { key: "approaches", label: "Approches" },
  { key: "pricing", label: "Tarifs" },
  { key: "media", label: "Présentation" },
] as const;

const ApplyWizard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/apply/wizard");
  }, [authLoading, user, navigate]);

  const { data: app, isLoading } = useQuery({
    queryKey: ["my-application", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<App | null> => {
      const { data } = await supabase
        .from("psychologist_applications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .maybeSingle();
      return data;
    },
  });

  const [draft, setDraft] = useState<Partial<App>>({});

  useEffect(() => {
    if (app) setDraft(app);
    else if (user)
      setDraft({
        full_name: user.user_metadata?.full_name ?? "",
        email: user.email ?? "",
        country: "MA",
        offers_online: true,
        offers_in_person: false,
        languages: ["Français", "Arabe"],
        specialties_requested: [],
        therapy_approaches_requested: [],
        populations_served: [],
      });
  }, [app, user]);

  const upsertMut = useMutation({
    mutationFn: async (patch: Partial<App>) => {
      if (!user) throw new Error("No user");
      const payload = {
        ...draft,
        ...patch,
        user_id: user.id,
        email: draft.email ?? user.email ?? "",
        full_name: draft.full_name ?? user.user_metadata?.full_name ?? user.email ?? "",
        status: "pending",
      } as any;
      if (app?.id) {
        const { error } = await supabase
          .from("psychologist_applications")
          .update(payload)
          .eq("id", app.id);
        if (error) throw error;
        return app.id;
      } else {
        const { data, error } = await supabase
          .from("psychologist_applications")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-application"] }),
  });

  const update = (patch: Partial<App>) => setDraft((d) => ({ ...d, ...patch }));
  const toggle = (field: keyof App, value: string) => {
    const arr: string[] = (draft as any)[field] ?? [];
    update({ [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] } as any);
  };

  const saveAndNext = async () => {
    try {
      await upsertMut.mutateAsync({});
      if (step < STEPS.length - 1) setStep(step + 1);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      const id = await upsertMut.mutateAsync({});
      const { data, error } = await supabase.functions.invoke("verify-application", {
        body: { applicationId: id },
      });
      if (error) throw error;
      const blockers = (data?.flags ?? []).filter((f: any) => f.severity === "block");
      if (blockers.length > 0) {
        toast({
          title: "Pré-vérification : éléments manquants",
          description: `${blockers.length} élément(s) bloquant(s). Complétez votre dossier avant soumission.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Dossier soumis",
          description: `Niveau suggéré : ${data?.suggestedLevel}. Un admin va finaliser votre validation.`,
        });
        navigate("/dashboard");
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const completeness = useMemo(() => {
    const fields = [
      draft.full_name, draft.email, draft.phone, draft.city, draft.date_of_birth,
      draft.bio_short, draft.desired_hourly_rate_mad,
      draft.doc_diploma_url, draft.doc_cin_url, draft.doc_license_morocco_url,
      draft.doc_rib_url, draft.doc_order_registration_url, draft.doc_auto_entrepreneur_url,
      draft.photo_url, draft.intro_video_url,
      (draft.specialties_requested?.length ?? 0) > 0,
      (draft.therapy_approaches_requested?.length ?? 0) > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [draft]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Dossier d'accréditation U.Psy</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Devenir psychologue partenaire</h1>
        <p className="text-muted-foreground">
          Complétez les 7 étapes ci-dessous. Votre progression est enregistrée automatiquement à chaque étape.
        </p>
        <div className="flex items-center gap-3">
          <Progress value={completeness} className="h-2 flex-1" />
          <span className="text-sm font-medium text-foreground tabular-nums">{completeness}%</span>
        </div>
      </div>

      {/* Step nav */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setStep(i)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              i === step
                ? "bg-primary text-primary-foreground border-primary"
                : i < step
                ? "bg-muted text-foreground border-border"
                : "bg-background text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{step + 1}. {STEPS[step].label}</CardTitle>
          <CardDescription>
            {step === 0 && "Vos coordonnées et informations professionnelles de base."}
            {step === 1 && "Diplômes universitaires et CV."}
            {step === 2 && "Pièce d'identité, autorisation d'exercer, et statut professionnel."}
            {step === 3 && "Domaines cliniques et populations que vous accompagnez."}
            {step === 4 && "Approches thérapeutiques et certifications spécialisées."}
            {step === 5 && "Tarifs et modalités de consultation."}
            {step === 6 && "Photo professionnelle et vidéo de présentation pour votre profil public."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Nom complet *</Label><Input value={draft.full_name ?? ""} onChange={(e) => update({ full_name: e.target.value })} /></div>
              <div><Label>Email *</Label><Input type="email" value={draft.email ?? ""} onChange={(e) => update({ email: e.target.value })} /></div>
              <div><Label>Téléphone</Label><Input type="tel" placeholder="+212 6XX XXX XXX" value={draft.phone ?? ""} onChange={(e) => update({ phone: e.target.value })} /></div>
              <div><Label>Date de naissance</Label><Input type="date" value={draft.date_of_birth ?? ""} onChange={(e) => update({ date_of_birth: e.target.value })} /></div>
              <div><Label>Ville</Label><Input value={draft.city ?? ""} onChange={(e) => update({ city: e.target.value })} /></div>
              <div><Label>Genre</Label>
                <select className="w-full h-11 px-3 rounded-md bg-background border border-input text-foreground" value={draft.gender ?? ""} onChange={(e) => update({ gender: e.target.value })}>
                  <option value="">—</option><option value="female">Femme</option><option value="male">Homme</option><option value="other">Autre</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Langues parlées</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LANGUAGE_OPTIONS.map((l) => {
                    const active = (draft.languages ?? []).includes(l);
                    return (
                      <button key={l} type="button" onClick={() => toggle("languages", l)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div><Label>Années d'expérience</Label><Input type="number" min="0" value={draft.years_experience ?? ""} onChange={(e) => update({ years_experience: Number(e.target.value) || null })} /></div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <DocUploader label="Diplôme principal" required slot="diploma" kind="doc"
                description="Master / Doctorat en psychologie. PDF ou photo, max 10 MB."
                value={draft.doc_diploma_url} onChange={(p) => update({ doc_diploma_url: p })} />
              <DocUploader label="CV professionnel" slot="cv" kind="doc"
                description="Parcours académique et professionnel."
                value={draft.doc_cv_url} onChange={(p) => update({ doc_cv_url: p })} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <DocUploader label="Pièce d'identité (CIN/Passeport)" required slot="cin" kind="doc"
                value={draft.doc_cin_url} onChange={(p) => update({ doc_cin_url: p })} />
              <DocUploader label="Autorisation d'exercer (Maroc)" required slot="license" kind="doc"
                description="Autorisation du Ministère de la Santé."
                value={draft.doc_license_morocco_url} onChange={(p) => update({ doc_license_morocco_url: p })} />
              <DocUploader label="Inscription Ordre / Ligue spécialistes santé psychique" slot="order" kind="doc"
                description="Carte ou attestation d'inscription professionnelle."
                value={draft.doc_order_registration_url} onChange={(p) => update({ doc_order_registration_url: p })} />
              <DocUploader label="Attestation auto-entrepreneur" slot="auto" kind="doc"
                description="Pour la facturation conforme DGI."
                value={draft.doc_auto_entrepreneur_url} onChange={(p) => update({ doc_auto_entrepreneur_url: p })} />
              <DocUploader label="RIB bancaire" slot="rib" kind="doc"
                description="Pour recevoir vos paiements."
                value={draft.doc_rib_url} onChange={(p) => update({ doc_rib_url: p })} />
              <DocUploader label="Assurance responsabilité civile professionnelle" slot="insurance" kind="doc"
                description="Recommandé pour passer au niveau Verified ou Accredited."
                value={draft.doc_insurance_url} onChange={(p) => update({ doc_insurance_url: p })} />
              <div>
                <Label>Numéro d'accréditation (si applicable)</Label>
                <Input value={draft.accreditation_number ?? ""} onChange={(e) => update({ accreditation_number: e.target.value })} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <Label>Spécialités cliniques *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SPECIALTY_OPTIONS.map((s) => {
                    const active = (draft.specialties_requested ?? []).includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggle("specialties_requested", s)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Populations accompagnées</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {POPULATION_OPTIONS.map((p) => {
                    const active = (draft.populations_served ?? []).includes(p);
                    return (
                      <button key={p} type="button" onClick={() => toggle("populations_served", p)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Bio courte (250 caractères max)</Label>
                <Textarea maxLength={250} rows={3} value={draft.bio_short ?? ""} onChange={(e) => update({ bio_short: e.target.value })}
                  placeholder="Une phrase qui décrit votre approche et ce qui vous distingue." />
                <p className="text-xs text-muted-foreground mt-1">{(draft.bio_short ?? "").length}/250</p>
              </div>
              <div>
                <Label>Bio longue</Label>
                <Textarea rows={6} value={draft.bio_long ?? ""} onChange={(e) => update({ bio_long: e.target.value })}
                  placeholder="Parcours, philosophie clinique, pour quels patients vous travaillez le mieux." />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <Label>Approches thérapeutiques</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {APPROACH_OPTIONS.map((a) => {
                    const active = (draft.therapy_approaches_requested ?? []).includes(a);
                    return (
                      <button key={a} type="button" onClick={() => toggle("therapy_approaches_requested", a)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Certifications de spécialité (EMDR, MSPE, etc.)</Label>
                <p className="text-xs text-muted-foreground">Téléversez chaque certification séparément. Recommandé pour atteindre les niveaux Verified et Accredited.</p>
                <DocUploader label="Certification 1" slot="specialty-cert-1" kind="doc"
                  value={draft.doc_specialty_certs_urls?.[0]}
                  onChange={(p) => {
                    const arr = [...(draft.doc_specialty_certs_urls ?? [])];
                    if (p) arr[0] = p; else arr.splice(0, 1);
                    update({ doc_specialty_certs_urls: arr });
                  }} />
                {draft.doc_specialty_certs_urls?.[0] && (
                  <DocUploader label="Certification 2" slot="specialty-cert-2" kind="doc"
                    value={draft.doc_specialty_certs_urls?.[1]}
                    onChange={(p) => {
                      const arr = [...(draft.doc_specialty_certs_urls ?? [])];
                      if (p) arr[1] = p; else arr.splice(1, 1);
                      update({ doc_specialty_certs_urls: arr });
                    }} />
                )}
                {draft.doc_specialty_certs_urls?.[1] && (
                  <DocUploader label="Certification 3" slot="specialty-cert-3" kind="doc"
                    value={draft.doc_specialty_certs_urls?.[2]}
                    onChange={(p) => {
                      const arr = [...(draft.doc_specialty_certs_urls ?? [])];
                      if (p) arr[2] = p; else arr.splice(2, 1);
                      update({ doc_specialty_certs_urls: arr });
                    }} />
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div>
                <Label>Tarif horaire souhaité (MAD)</Label>
                <Input type="number" min="0" value={draft.desired_hourly_rate_mad ?? ""} onChange={(e) => update({ desired_hourly_rate_mad: Number(e.target.value) || null })} />
                <p className="text-xs text-muted-foreground mt-1">U.Psy retient une commission selon la grille tarifaire en vigueur.</p>
              </div>
              <div className="space-y-2">
                <Label>Modalités proposées</Label>
                <div className="flex items-center gap-2">
                  <Checkbox id="online" checked={!!draft.offers_online} onCheckedChange={(c) => update({ offers_online: !!c })} />
                  <label htmlFor="online" className="text-sm text-foreground cursor-pointer">Consultations en ligne (vidéo)</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="inperson" checked={!!draft.offers_in_person} onCheckedChange={(c) => update({ offers_in_person: !!c })} />
                  <label htmlFor="inperson" className="text-sm text-foreground cursor-pointer">Consultations en cabinet</label>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <DocUploader label="Photo professionnelle" required slot="photo" kind="photo"
                description="Photo HD, format carré recommandé. Visible sur votre profil public."
                value={draft.photo_url} onChange={(p) => update({ photo_url: p })} />
              <DocUploader label="Vidéo d'introduction (60s recommandés)" slot="intro-video" kind="video"
                description="MP4/WebM max 50 MB. Présentez-vous, votre approche, et invitez à prendre RDV."
                value={draft.intro_video_url} onChange={(p) => update({ intro_video_url: p })} />
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-amber-700 dark:text-amber-400">Avant de soumettre</p>
                  <p className="text-muted-foreground">Une pré-vérification automatique sera lancée. Si des éléments bloquants manquent, votre dossier ne sera pas envoyé à l'admin.</p>
                </div>
              </div>
              <DataPrivacyNotice />
            </div>
          )}

          {/* Status badge */}
          {app && (
            <div className="pt-4 border-t border-border flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Statut actuel :</span>
              <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "outline"}>
                {app.status}
              </Badge>
              {app.suggested_level && (
                <Badge variant="secondary">Niveau suggéré : {app.suggested_level}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={saveAndNext} disabled={upsertMut.isPending}>
            {upsertMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
            Enregistrer et continuer <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={submitApplication} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
            Soumettre le dossier
          </Button>
        )}
      </div>
    </main>
  );
};

export default ApplyWizard;