import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

/**
 * /apply/organization
 * B2B "Apply as Organization" — simple form → admin review.
 * No login required (but if logged in, we link the user_id).
 */
const ApplyOrganization = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    contact_email: user?.email ?? "",
    contact_phone: "",
    industry: "",
    size_range: "11-50",
    city: "",
    website: "",
    ice: "",
    rc_number: "",
    if_number: "",
    desired_seats: 10,
    use_case: "",
    message: "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization_name.trim() || !form.contact_email.trim() || !form.contact_name.trim()) {
      toast({ title: "Champs requis", description: "Nom de l'organisation, contact et email sont obligatoires.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("organization_applications").insert({
      ...form,
      user_id: user?.id ?? null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur d'envoi", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="container mx-auto px-4 py-20 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Demande reçue</CardTitle>
            <CardDescription>
              Notre équipe revient vers vous sous 48h ouvrées avec une proposition adaptée à votre organisation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <ShieldCheck className="h-3.5 w-3.5" /> Programme B2B U.Psy
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Postuler comme organisation</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Activez l'écosystème mental-health U.Psy pour vos collaborateurs : sessions, pulse anonyme, rapports agrégés.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Votre organisation</CardTitle>
          <CardDescription>Un dossier complet accélère la revue. Tous les champs * sont obligatoires.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="org">Nom de l'organisation *</Label>
                <Input id="org" required value={form.organization_name} onChange={(e) => set("organization_name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry">Secteur</Label>
                <Input id="industry" value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Tech, Banque, Sport…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="size">Taille</Label>
                <Select value={form.size_range} onValueChange={(v) => set("size_range", v)}>
                  <SelectTrigger id="size"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="500+">500+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="web">Site web</Label>
                <Input id="web" type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ice">ICE</Label>
                <Input id="ice" value={form.ice} onChange={(e) => set("ice", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rc">RC</Label>
                <Input id="rc" value={form.rc_number} onChange={(e) => set("rc_number", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="if">IF</Label>
                <Input id="if" value={form.if_number} onChange={(e) => set("if_number", e.target.value)} />
              </div>
            </div>

            <div className="border-t pt-5 grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cn">Nom du contact *</Label>
                <Input id="cn" required value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ce">Email *</Label>
                <Input id="ce" type="email" required value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp">Téléphone</Label>
                <Input id="cp" type="tel" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seats">Sièges souhaités</Label>
                <Input id="seats" type="number" min={1} value={form.desired_seats} onChange={(e) => set("desired_seats", parseInt(e.target.value || "10", 10))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="uc">Cas d'usage principal</Label>
              <Input id="uc" value={form.use_case} onChange={(e) => set("use_case", e.target.value)} placeholder="Burnout, accompagnement managers, athlètes haut niveau…" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Contexte, objectifs, échéance…" />
            </div>

            <p className="text-xs text-muted-foreground">
              Conformément à la loi 09-08 sur la protection des données personnelles, vos informations sont traitées de manière confidentielle.
            </p>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi…</> : "Envoyer ma demande"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default ApplyOrganization;