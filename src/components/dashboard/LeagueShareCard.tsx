import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** The psychologist's consent to let the League (LSSPM) review their file. */
export default function LeagueShareCard() {
  const { user } = useAuth();
  const [on, setOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("psychologist_applications")
      .select("league_share_consent")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setOn(data ? !!data.league_share_consent : null));
  }, [user]);

  // No application on file (e.g. a profile created by an admin): nothing to share.
  if (on === null) return null;

  const change = async (v: boolean) => {
    setBusy(true);
    const { error } = await supabase.rpc("set_league_share", { p_consent: v });
    setBusy(false);
    if (error) return toast.error(error.message);
    setOn(v);
    toast.success(
      v ? "Dossier partagé avec la LSSPM" : "Partage avec la LSSPM retiré",
    );
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Ligue (LSSPM)
        </h3>
        <Switch
          checked={on}
          disabled={busy}
          onCheckedChange={change}
          aria-label="Partager mon dossier avec la LSSPM"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {on
          ? "La Ligue peut évaluer vos documents professionnels et votre pré-vérification. Jamais votre CIN, RIB, date de naissance ni téléphone."
          : "Autorisez la Ligue des Spécialistes de la Santé Psychologique et Mentale à évaluer votre dossier professionnel. Révocable à tout moment."}
      </p>
    </Card>
  );
}
