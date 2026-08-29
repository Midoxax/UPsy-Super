import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download, Trash2, ShieldCheck, Loader2, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ConnectedAccountsCard from "@/components/auth/ConnectedAccountsCard";


const DataPrivacyTab = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      // Gather all user data
      const [anamneses, moods, journals, assessments, bookings, profile] = await Promise.all([
        supabase.from("client_anamneses").select("*").eq("client_id", user.id),
        supabase.from("mood_entries").select("*").eq("user_id", user.id),
        supabase.from("journal_entries").select("*").eq("user_id", user.id),
        supabase.from("assessment_results").select("*").eq("user_id", user.id),
        supabase.from("bookings").select("*").eq("patient_id", user.id),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email,
        profile: profile.data,
        anamneses: anamneses.data || [],
        mood_entries: moods.data || [],
        journal_entries: journals.data || [],
        assessment_results: assessments.data || [],
        bookings: bookings.data || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `upsy-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Export terminé", description: "Ton fichier a été téléchargé." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Create a support ticket for deletion request (ticket + first message,
      // matching the canonical pattern in useSupportTickets)
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: "GDPR - Demande de suppression de données",
          priority: "high",
          category: "account",
        })
        .select()
        .single();
      if (ticketError) throw ticketError;

      const { error: msgError } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: ticket.id,
          author_id: user.id,
          author_role: "user",
          body: `L'utilisateur ${user.email} demande la suppression complète de ses données personnelles conformément à la loi 09-08.`,
        });
      if (msgError) throw msgError;

      toast({
        title: "Demande envoyée",
        description: "Ta demande de suppression a été transmise. Tu recevras une confirmation sous 72h.",
      });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ConnectedAccountsCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Mes données & confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/80 space-y-2">
            <p className="font-medium text-sm text-foreground">Protection de tes données</p>
            <p>Conformément à la loi marocaine 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, tu disposes de droits fondamentaux sur tes données :</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Droit d'accès</strong> — Consulter toutes tes données stockées</li>
              <li><strong>Droit de portabilité</strong> — Exporter tes données dans un format lisible</li>
              <li><strong>Droit de rectification</strong> — Corriger tes informations personnelles</li>
              <li><strong>Droit à l'effacement</strong> — Demander la suppression de tes données</li>
            </ul>
          </div>

          <Separator />

          {/* Export */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Exporter mes données</p>
              <p className="text-xs text-muted-foreground">Télécharge l'ensemble de tes données au format JSON.</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
              Exporter
            </Button>
          </div>

          <Separator />

          {/* Delete */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Supprimer mes données</p>
              <p className="text-xs text-muted-foreground">Demander la suppression définitive de toutes tes données.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={deleting}>
                  {deleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Confirmer la suppression
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes tes données personnelles, anamnèses, résultats d'évaluations, et entrées de journal seront supprimées définitivement. Tu recevras une confirmation par email dans un délai de 72h.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRequest} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Confirmer la suppression
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPrivacyTab;
