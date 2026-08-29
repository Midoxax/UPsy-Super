import { useState, useCallback, useEffect, useMemo, type ReactElement } from "react";
import { useParams, useNavigate } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft, ChevronRight, Check, Save, Loader2, ShieldCheck,
  SkipForward, Clock, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAnamnesis } from "@/hooks/useAnamnesis";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PsychometricScale, { computeScaleScore, getSeverity } from "@/components/intake/PsychometricScale";
import { PHQ9_CONFIG, GAD7_CONFIG, PSS10_CONFIG } from "@/components/intake/scaleConfigs";
import CrisisModal from "@/components/intake/CrisisModal";
import SEOHead from "@/components/SEOHead";

const SECTION_KEYS = [
  "identity",
  "presenting_complaint",
  "history_personal",
  "history_family",
  "medical",
  "lifestyle",
  "risk_screening",  // now = psychometric scales
  "relationships",
  "objectives_consent",
] as const;

type SectionKey = typeof SECTION_KEYS[number];

const SECTION_LABELS: Record<SectionKey, string> = {
  identity: "Identification & contact d'urgence",
  presenting_complaint: "Motif de consultation",
  history_personal: "Histoire de vie",
  history_family: "Antécédents médicaux & psychologiques",
  medical: "État actuel — Échelles validées",
  lifestyle: "Mode de vie",
  risk_screening: "Relations & soutien social",
  relationships: "Module spécialisé",
  objectives_consent: "Objectifs, attentes & consentement",
};

const SECTION_INTROS: Record<SectionKey, string> = {
  identity: "Quelques informations de base pour permettre à ton psy de bien préparer ta séance. Ces informations sont strictement confidentielles.",
  presenting_complaint: "La question la plus précieuse pour ton psy. Pas de bonne ou mauvaise façon de répondre — tes mots, ton rythme.",
  history_personal: "Quelques jalons de ton parcours. Réponds à ce qui te semble pertinent — ton psy explorera le reste avec toi.",
  history_family: "Ces informations permettent à ton psy de t'accompagner en sécurité. Toutes ces données sont strictement confidentielles et chiffrées.",
  medical: "Trois questionnaires courts utilisés en recherche internationale. Réponds spontanément, c'est pour aujourd'hui — pas pour te définir.",
  lifestyle: "Le quotidien influe énormément sur l'état mental. Ton psy a besoin de ces informations pour te proposer des leviers concrets.",
  risk_screening: "Le réseau autour de toi est une ressource thérapeutique majeure.",
  relationships: "Quelques questions ciblées sur ton expérience, si applicable.",
  objectives_consent: "Dernière étape — ce que tu attends de ce travail thérapeutique.",
};

const SKIPPABLE: SectionKey[] = [
  "history_personal", "history_family", "lifestyle", "risk_screening", "relationships",
];

const IntakeForm = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, loading, saving, save, autoSave, complete, giveConsent, progress } =
    useAnamnesis(user?.id);

  const [step, setStep] = useState(0);
  const [local, setLocal] = useState<Record<string, any>>({});
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const sectionKey = SECTION_KEYS[step];

  // Load section data when step changes
  useEffect(() => {
    if (data) {
      setLocal({ ...((data as any)[sectionKey] || {}) });
      setConsentGiven(!!data.consent_given);
    }
  }, [step, data, sectionKey]);

  const updateField = useCallback((field: string, value: any) => {
    setLocal((prev) => {
      const next = { ...prev, [field]: value };
      autoSave({ [sectionKey]: next } as any);
      return next;
    });
  }, [sectionKey, autoSave]);

  const updateMultiSelect = useCallback((field: string, option: string, checked: boolean) => {
    setLocal((prev) => {
      const arr: string[] = prev[field] || [];
      const next = checked ? [...arr, option] : arr.filter((v: string) => v !== option);
      const updated = { ...prev, [field]: next };
      autoSave({ [sectionKey]: updated } as any);
      return updated;
    });
  }, [sectionKey, autoSave]);

  const handleSkip = () => {
    updateField("__skipped", true);
    if (step < SECTION_KEYS.length - 1) setStep(step + 1);
  };

  const handleSaveLater = async () => {
    await save({ [sectionKey]: local, current_section: step + 1, completion_pct: progress } as any);
    toast({ title: "Sauvegardé", description: "Tu peux reprendre à tout moment depuis ton espace." });
    navigate("/my-space");
  };

  const handleComplete = async () => {
    if (!consentGiven) {
      toast({ title: "Consentement requis", description: "Coche le consentement éclairé pour finaliser.", variant: "destructive" });
      return;
    }
    // Compute and save scores
    const scales = (data as any)?.medical || {};
    const phq9Vals = scales.phq9 || {};
    const gad7Vals = scales.gad7 || {};
    const pss10Vals = scales.pss10 || {};

    const phq9Score = computeScaleScore(PHQ9_CONFIG.items, phq9Vals, 3);
    const gad7Score = computeScaleScore(GAD7_CONFIG.items, gad7Vals, 3);
    const pss10Score = computeScaleScore(PSS10_CONFIG.items, pss10Vals, 4);

    const flags: string[] = [];
    if (phq9Vals[9] >= 1) flags.push("crisis_suicide_ideation");
    if (phq9Score >= 20) flags.push("severe_depression");
    else if (phq9Score >= 15) flags.push("moderately_severe_depression");
    if (gad7Score >= 15) flags.push("severe_anxiety");
    if (pss10Score >= 27) flags.push("high_perceived_stress");

    const relationships = (data as any)?.risk_screening || {};
    if (relationships.violence === "oui_actuellement") flags.push("current_violence");

    await save({
      objectives_consent: { ...local, consent_confirmed: true },
      phq9_score: phq9Score,
      phq9_severity: getSeverity(phq9Score, PHQ9_CONFIG.scoringBands).label,
      gad7_score: gad7Score,
      gad7_severity: getSeverity(gad7Score, GAD7_CONFIG.scoringBands).label,
      pss10_score: pss10Score,
      pss10_severity: getSeverity(pss10Score, PSS10_CONFIG.scoringBands).label,
      clinical_flags: flags,
      completion_pct: 100,
      shared_with_psy_at: new Date().toISOString(),
    } as any);

    await complete();

    // Insert crisis alert if needed
    if (flags.includes("crisis_suicide_ideation") && user) {
      await supabase.from("crisis_alerts").insert({
        client_id: user.id,
        intake_form_id: data?.id,
        alert_type: "crisis_suicide_ideation",
        severity: phq9Vals[9] >= 3 ? "critical" : "moderate",
        source_section: "phq9_item_9",
        source_value: String(phq9Vals[9]),
      } as any);
    }

    toast({ title: "Anamnèse complétée", description: "Merci. Ton psy la consultera avant ta séance." });
    navigate("/my-space");
  };

  const handleCrisis = useCallback((itemId: number, value: number) => {
    setCrisisOpen(true);
  }, []);

  // Section renderers
  const renderIdentity = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><Label>Prénom *</Label><Input value={local.first_name || ""} onChange={(e) => updateField("first_name", e.target.value)} /></div>
        <div><Label>Nom *</Label><Input value={local.last_name || ""} onChange={(e) => updateField("last_name", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><Label>Date de naissance *</Label><Input type="date" value={local.date_of_birth || ""} onChange={(e) => updateField("date_of_birth", e.target.value)} /></div>
        <div>
          <Label>Genre *</Label>
          <RadioGroup value={local.gender || ""} onValueChange={(v) => updateField("gender", v)} className="flex flex-wrap gap-2 mt-1">
            {["Femme", "Homme", "Non-binaire", "Préfère ne pas dire"].map((g) => (
              <label key={g} className="flex items-center gap-1 text-xs cursor-pointer">
                <RadioGroupItem value={g} />{g}
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><Label>Ville de résidence *</Label><Input value={local.city || ""} onChange={(e) => updateField("city", e.target.value)} /></div>
        <div><Label>Profession</Label><Input value={local.profession || ""} onChange={(e) => updateField("profession", e.target.value)} /></div>
      </div>
      <div>
        <Label>Statut conjugal</Label>
        <RadioGroup value={local.marital_status || ""} onValueChange={(v) => updateField("marital_status", v)} className="flex flex-wrap gap-2 mt-1">
          {["Célibataire", "En couple", "Marié·e", "Divorcé·e", "Veuf·ve"].map((s) => (
            <label key={s} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={s} />{s}</label>
          ))}
        </RadioGroup>
      </div>
      <div><Label>Téléphone *</Label><Input type="tel" placeholder="+212..." value={local.phone || ""} onChange={(e) => updateField("phone", e.target.value)} /></div>
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">Contact d'urgence</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><Label>Nom de la personne *</Label><Input value={local.emergency_name || ""} onChange={(e) => updateField("emergency_name", e.target.value)} /></div>
        <div><Label>Téléphone *</Label><Input type="tel" value={local.emergency_phone || ""} onChange={(e) => updateField("emergency_phone", e.target.value)} /></div>
      </div>
      <div>
        <Label>Lien</Label>
        <RadioGroup value={local.emergency_relationship || ""} onValueChange={(v) => updateField("emergency_relationship", v)} className="flex flex-wrap gap-2 mt-1">
          {["Conjoint·e", "Parent", "Frère-sœur", "Ami·e", "Collègue", "Autre"].map((r) => (
            <label key={r} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={r} />{r}</label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderMotif = () => (
    <div className="space-y-4">
      <div>
        <Label>Qu'est-ce qui t'amène aujourd'hui ? *</Label>
        <Textarea rows={4} maxLength={1500} placeholder="Décris ce qui se passe pour toi en ce moment, sans formuler. C'est ton espace." value={local.main_reason || ""} onChange={(e) => updateField("main_reason", e.target.value)} />
        <div className="text-[10px] text-muted-foreground text-right mt-0.5">{(local.main_reason || "").length}/1500</div>
      </div>
      <div>
        <Label>Depuis combien de temps ? *</Label>
        <RadioGroup value={local.duration || ""} onValueChange={(v) => updateField("duration", v)} className="flex flex-wrap gap-2 mt-1">
          {["< 1 mois", "1-3 mois", "3-6 mois", "6-12 mois", "1-2 ans", "2-5 ans", "> 5 ans", "Toute ma vie", "Je ne sais pas"].map((d) => (
            <label key={d} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={d} />{d}</label>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label>Comment ces difficultés affectent-elles ta vie ?</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {["Travail", "Études", "Couple", "Famille", "Amitiés", "Sommeil", "Alimentation", "Concentration", "Plaisir", "Énergie", "Estime de soi"].map((a) => (
            <label key={a} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <Checkbox checked={(local.impact_areas || []).includes(a)} onCheckedChange={(c) => updateMultiSelect("impact_areas", a, !!c)} />{a}
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Niveau de retentissement fonctionnel : {local.functional_impact || 5}/10</Label>
        <Slider value={[local.functional_impact || 5]} min={1} max={10} step={1} onValueChange={([v]) => updateField("functional_impact", v)} />
      </div>
      <div>
        <Label>Première démarche de soutien psychologique ?</Label>
        <RadioGroup value={local.first_time || ""} onValueChange={(v) => updateField("first_time", v)} className="flex gap-3 mt-1">
          <label className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value="yes" />Oui, première fois</label>
          <label className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value="no" />Non, j'ai déjà consulté</label>
        </RadioGroup>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground">Famille d'origine</p>
      <div><Label>Composition familiale pendant l'enfance</Label><Textarea rows={2} value={local.family_composition || ""} onChange={(e) => updateField("family_composition", e.target.value)} /></div>
      <div>
        <Label>Rang dans la fratrie</Label>
        <RadioGroup value={local.birth_order || ""} onValueChange={(v) => updateField("birth_order", v)} className="flex flex-wrap gap-2 mt-1">
          {["Aîné·e", "Cadet·te", "Benjamin·e", "Enfant unique"].map((r) => (
            <label key={r} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={r} />{r}</label>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label>Climat émotionnel enfance/adolescence : {local.childhood_climate || 5}/10</Label>
        <Slider value={[local.childhood_climate || 5]} min={1} max={10} step={1} onValueChange={([v]) => updateField("childhood_climate", v)} />
      </div>
      <div>
        <Label>Événements marquants</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {["Décès d'un proche", "Maladie grave", "Séparation parentale", "Déménagement majeur", "Difficultés financières", "Harcèlement scolaire", "Je préfère en parler en séance", "Aucun"].map((e) => (
            <label key={e} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <Checkbox checked={(local.childhood_events || []).includes(e)} onCheckedChange={(c) => updateMultiSelect("childhood_events", e, !!c)} />{e}
            </label>
          ))}
        </div>
      </div>
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">Parcours professionnel</p>
      <div>
        <Label>Vie professionnelle actuelle</Label>
        <RadioGroup value={local.work_life || ""} onValueChange={(v) => updateField("work_life", v)} className="flex flex-wrap gap-2 mt-1">
          {["Épanouissante", "Satisfaisante", "Neutre", "Difficile", "Très difficile", "Sans emploi"].map((w) => (
            <label key={w} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={w} />{w}</label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderMedicalHistory = () => (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground">Antécédents psychologiques</p>
      <div>
        <Label>Suivi psychologique antérieur ?</Label>
        <RadioGroup value={local.prior_therapy || ""} onValueChange={(v) => updateField("prior_therapy", v)} className="flex flex-wrap gap-2 mt-1">
          {["Jamais", "Une fois", "Plusieurs fois", "Suivi en cours"].map((o) => (
            <label key={o} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={o} />{o}</label>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label>Diagnostic psychologique ou psychiatrique connu ?</Label>
        <RadioGroup value={local.diagnosis || ""} onValueChange={(v) => updateField("diagnosis", v)} className="flex flex-wrap gap-2 mt-1">
          {["Oui", "Non", "Je préfère en parler en séance"].map((o) => (
            <label key={o} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={o} />{o}</label>
          ))}
        </RadioGroup>
      </div>
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">Médicaments en cours</p>
      <div>
        <Label>Médicaments psychotropes actuels ?</Label>
        <RadioGroup value={local.psychotropics || ""} onValueChange={(v) => updateField("psychotropics", v)} className="flex flex-wrap gap-2 mt-1">
          {["Oui", "Non", "Je préfère en parler en séance"].map((o) => (
            <label key={o} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={o} />{o}</label>
          ))}
        </RadioGroup>
      </div>
      {local.psychotropics === "Oui" && (
        <div><Label>Lesquels ?</Label><Textarea rows={2} value={local.medications_detail || ""} onChange={(e) => updateField("medications_detail", e.target.value)} /></div>
      )}
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">Antécédents médicaux</p>
      <div>
        <Label>Condition médicale chronique ?</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {["Diabète", "Hypertension", "Thyroïde", "Douleur chronique", "Migraine", "Trouble du sommeil", "Aucune", "Je préfère en parler en séance"].map((c) => (
            <label key={c} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <Checkbox checked={(local.chronic_conditions || []).includes(c)} onCheckedChange={(ch) => updateMultiSelect("chronic_conditions", c, !!ch)} />{c}
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Hospitalisation pour raison psychologique ?</Label>
        <RadioGroup value={local.psych_hospitalization || ""} onValueChange={(v) => updateField("psych_hospitalization", v)} className="flex flex-wrap gap-2 mt-1">
          {["Non", "Oui, il y a longtemps", "Oui, récemment (< 12 mois)", "Je préfère en parler en séance"].map((o) => (
            <label key={o} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={o} />{o}</label>
          ))}
        </RadioGroup>
      </div>
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">Antécédents familiaux psychiatriques</p>
      <div>
        <Label>Antécédents psy dans la famille proche ?</Label>
        <RadioGroup value={local.family_psych_history || ""} onValueChange={(v) => updateField("family_psych_history", v)} className="flex flex-wrap gap-2 mt-1">
          {["Non", "Oui", "Je ne sais pas", "Je préfère en parler en séance"].map((o) => (
            <label key={o} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={o} />{o}</label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  // Section 5: Psychometric scales
  const renderScales = () => {
    const phq9Vals = local.phq9 || {};
    const gad7Vals = local.gad7 || {};
    const pss10Vals = local.pss10 || {};

    return (
      <div className="space-y-6">
        <PsychometricScale
          config={{ ...PHQ9_CONFIG, onCrisisItem: handleCrisis }}
          values={phq9Vals}
          onChange={(id, v) => updateField("phq9", { ...phq9Vals, [id]: v })}
        />
        <Separator />
        <PsychometricScale
          config={GAD7_CONFIG}
          values={gad7Vals}
          onChange={(id, v) => updateField("gad7", { ...gad7Vals, [id]: v })}
        />
        <Separator />
        <PsychometricScale
          config={PSS10_CONFIG}
          values={pss10Vals}
          onChange={(id, v) => updateField("pss10", { ...pss10Vals, [id]: v })}
        />
      </div>
    );
  };

  const renderLifestyle = () => (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground">Sommeil</p>
      <div>
        <Label>Heures de sommeil par nuit</Label>
        <RadioGroup value={local.sleep_hours || ""} onValueChange={(v) => updateField("sleep_hours", v)} className="flex flex-wrap gap-2 mt-1">
          {["< 4h", "4-5h", "5-6h", "6-7h", "7-8h", "8-9h", "> 9h", "Variable"].map((h) => (
            <label key={h} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={h} />{h}</label>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label>Qualité du sommeil : {local.sleep_quality || 5}/10</Label>
        <Slider value={[local.sleep_quality || 5]} min={1} max={10} step={1} onValueChange={([v]) => updateField("sleep_quality", v)} />
      </div>
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">Activité physique</p>
      <div>
        <Label>Fréquence d'activité physique</Label>
        <RadioGroup value={local.exercise_freq || ""} onValueChange={(v) => updateField("exercise_freq", v)} className="flex flex-wrap gap-2 mt-1">
          {["Jamais", "1-2×/mois", "1×/sem", "2-3×/sem", "4-5×/sem", "Quotidien"].map((f) => (
            <label key={f} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={f} />{f}</label>
          ))}
        </RadioGroup>
      </div>
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">Alimentation</p>
      <div>
        <Label>Qualité de l'alimentation</Label>
        <RadioGroup value={local.diet || ""} onValueChange={(v) => updateField("diet", v)} className="flex flex-wrap gap-2 mt-1">
          {["Très équilibrée", "Plutôt équilibrée", "Variable", "Plutôt déséquilibrée", "Très déséquilibrée"].map((d) => (
            <label key={d} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={d} />{d}</label>
          ))}
        </RadioGroup>
      </div>
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">Substances</p>
      <div>
        <Label>Tabac</Label>
        <RadioGroup value={local.tobacco || ""} onValueChange={(v) => updateField("tobacco", v)} className="flex flex-wrap gap-2 mt-1">
          {["Jamais", "Ancien fumeur", "Occasionnel", "Régulier", "Quotidien"].map((t) => (
            <label key={t} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={t} />{t}</label>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label>Alcool</Label>
        <RadioGroup value={local.alcohol || ""} onValueChange={(v) => updateField("alcohol", v)} className="flex flex-wrap gap-2 mt-1">
          {["Jamais", "Rarement", "Hebdomadaire", "Quotidien", "Je préfère ne pas répondre"].map((a) => (
            <label key={a} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={a} />{a}</label>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label>Usage problématique des écrans ?</Label>
        <RadioGroup value={local.screen_use || ""} onValueChange={(v) => updateField("screen_use", v)} className="flex flex-wrap gap-2 mt-1">
          {["Pas du tout", "Un peu", "Modérément", "Beaucoup", "Significativement"].map((s) => (
            <label key={s} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={s} />{s}</label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderRelationships = () => (
    <div className="space-y-4">
      <div>
        <Label>Te sens-tu entouré·e ? {local.support_level || 5}/10</Label>
        <Slider value={[local.support_level || 5]} min={1} max={10} step={1} onValueChange={([v]) => updateField("support_level", v)} />
      </div>
      <div>
        <Label>Avec qui peux-tu parler de ce qui te préoccupe ?</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {["Conjoint·e", "Parent", "Frère/sœur", "Ami·e proche", "Collègue", "Personne", "Autre"].map((p) => (
            <label key={p} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <Checkbox checked={(local.support_network || []).includes(p)} onCheckedChange={(c) => updateMultiSelect("support_network", p, !!c)} />{p}
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Conflit ou tension significative avec un·e proche ?</Label>
        <RadioGroup value={local.conflicts || ""} onValueChange={(v) => updateField("conflicts", v)} className="flex flex-wrap gap-2 mt-1">
          {["Non", "Oui, conjugal", "Oui, parental", "Oui, professionnel", "Plusieurs", "Je préfère en parler en séance"].map((c) => (
            <label key={c} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={c} />{c}</label>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label>Victime de violence (physique, psychologique, sexuelle) ?</Label>
        <RadioGroup value={local.violence || ""} onValueChange={(v) => updateField("violence", v)} className="flex flex-wrap gap-2 mt-1">
          {["Non", "Oui par le passé", "Oui actuellement", "Je préfère en parler en séance"].map((v) => (
            <label key={v} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={v} />{v}</label>
          ))}
        </RadioGroup>
        {local.violence === "Oui actuellement" && (
          <Card className="mt-2 border-destructive/40 bg-destructive/5">
            <CardContent className="p-3 text-xs space-y-1">
              <p className="font-medium text-destructive">⚠️ Si tu es en danger, contacte :</p>
              <p>• Réseau ANARUZ : <strong>8350</strong></p>
              <p>• SAMU : <strong>141</strong></p>
              <p>Ton/ta psy sera informé·e en priorité.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderSpecializedModule = () => (
    <div className="space-y-4">
      <Card className="border-muted">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          <p>Ce module sera activé dynamiquement en fonction de la spécialité de ton psy.</p>
          <p className="text-xs mt-2">Si ton psy est spécialisé en sport, couple, parentalité, addictions ou traumatologie, des questions ciblées apparaîtront ici.</p>
        </CardContent>
      </Card>
      <div>
        <Label>Souhaites-tu ajouter des informations complémentaires ?</Label>
        <Textarea rows={3} value={local.additional_info || ""} onChange={(e) => updateField("additional_info", e.target.value)} placeholder="Optionnel — tout ce que tu souhaites partager avec ton psy." />
      </div>
    </div>
  );

  const renderObjectives = () => (
    <div className="space-y-4">
      <div>
        <Label>Quels sont tes objectifs pour ce suivi ? *</Label>
        <Textarea rows={4} maxLength={1000} value={local.therapy_goals || ""} onChange={(e) => updateField("therapy_goals", e.target.value)} placeholder="Sois aussi général·e ou précis·e que tu veux." />
      </div>
      <div>
        <Label>Approche préférée</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {["Comprendre mes émotions", "Outils concrets pour gérer", "Travailler sur mon passé", "Améliorer mes relations", "Performance et accomplissement", "Sortir d'une crise", "Je ne sais pas"].map((a) => (
            <label key={a} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <Checkbox checked={(local.preferred_approach || []).includes(a)} onCheckedChange={(c) => updateMultiSelect("preferred_approach", a, !!c)} />{a}
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Fréquence souhaitée</Label>
        <RadioGroup value={local.desired_frequency || ""} onValueChange={(v) => updateField("desired_frequency", v)} className="flex flex-wrap gap-2 mt-1">
          {["1×/sem", "1×/2 sem", "1×/mois", "Selon besoin", "À discuter"].map((f) => (
            <label key={f} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={f} />{f}</label>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label>Sujets à éviter au début ?</Label>
        <Textarea rows={2} value={local.topics_to_avoid || ""} onChange={(e) => updateField("topics_to_avoid", e.target.value)} placeholder="Optionnel" />
      </div>
      <div>
        <Label>Contact entre séances via UPSY ?</Label>
        <RadioGroup value={local.inter_session_contact || ""} onValueChange={(v) => updateField("inter_session_contact", v)} className="flex flex-wrap gap-2 mt-1">
          {["Oui", "Plutôt non", "Pas du tout", "À discuter"].map((c) => (
            <label key={c} className="flex items-center gap-1 text-xs cursor-pointer"><RadioGroupItem value={c} />{c}</label>
          ))}
        </RadioGroup>
      </div>
      <Separator />
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Consentement éclairé</h4>
          <div className="text-xs text-foreground/80 space-y-2">
            <p>Je confirme que :</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Les informations partagées dans cette anamnèse sont exactes à ma connaissance.</li>
              <li>J'ai compris que ces données sont strictement confidentielles entre moi et mon/ma psychologue, conformément à la loi marocaine 09-08 et au secret professionnel.</li>
              <li>J'ai compris que mon/ma psychologue est tenu·e au secret professionnel, sauf en cas de risque imminent pour ma vie ou celle d'autrui (article 446 du Code pénal marocain).</li>
              <li>J'ai compris qu'UPSY n'est pas un service d'urgence et qu'en cas de crise, je peux contacter le SAMU (141), Stop Silence (0801 000 180), ou me rendre aux urgences.</li>
            </ul>
          </div>
          <label className="flex items-start gap-2 cursor-pointer mt-2">
            <Checkbox
              checked={consentGiven}
              onCheckedChange={(v) => {
                setConsentGiven(!!v);
                if (v) giveConsent();
              }}
            />
            <span className="text-xs font-medium">J'ai lu et j'accepte ces conditions *</span>
          </label>
        </CardContent>
      </Card>
    </div>
  );

  const sectionRenderers: Record<SectionKey, () => ReactElement> = {
    identity: renderIdentity,
    presenting_complaint: renderMotif,
    history_personal: renderHistory,
    history_family: renderMedicalHistory,
    medical: renderScales,
    lifestyle: renderLifestyle,
    risk_screening: renderRelationships,
    relationships: renderSpecializedModule,
    objectives_consent: renderObjectives,
  };

  if (!user) {
    navigate("/auth?redirect=/intake" + (bookingId ? `/${bookingId}` : ""));
    return null;
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead path="/intake" title="Anamnèse — U.Psy" description="Formulaire d'intake confidentiel pour préparer ta première séance." />
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6 space-y-3">
            <h1 className="text-xl font-bold font-heading">Prépare ta séance</h1>
            <p className="text-sm text-muted-foreground">
              Section {step + 1} sur {SECTION_KEYS.length} — {SECTION_LABELS[sectionKey]}
            </p>
            <Progress value={(step + 1) / SECTION_KEYS.length * 100} className="h-2" />
          </div>

          {/* Section intro */}
          <Card className="mb-6 border-primary/10 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs text-foreground/80 italic">{SECTION_INTROS[sectionKey]}</p>
            </CardContent>
          </Card>

          {/* Section content */}
          <div className="mb-6">{sectionRenderers[sectionKey]()}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-border pt-4 sticky bottom-0 bg-background pb-4">
            <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Retour
            </Button>

            <div className="flex items-center gap-2">
              {saving && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Save className="h-3 w-3 animate-pulse" /> Sauvegarde…</span>}

              {SKIPPABLE.includes(sectionKey) && (
                <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                  <SkipForward className="h-3 w-3 mr-1" /> Passer
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={handleSaveLater}>
                <Clock className="h-3 w-3 mr-1" /> Plus tard
              </Button>

              {step < SECTION_KEYS.length - 1 ? (
                <Button size="sm" onClick={() => setStep(step + 1)}>
                  Suivant <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleComplete} disabled={!consentGiven}>
                  <Check className="h-4 w-4 mr-1" /> Terminer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <CrisisModal open={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </>
  );
};

export default IntakeForm;