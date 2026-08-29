import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Check, X, Eye, Mail, Phone, Globe } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  reviewing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const OrgApplicationsManager = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const { data: apps, isLoading } = useQuery({
    queryKey: ["org-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, review_notes }: { id: string; status: string; review_notes?: string }) => {
      const { error } = await supabase
        .from("organization_applications")
        .update({ status, review_notes, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-applications"] });
      toast({ title: "Demande mise à jour" });
      setOpenId(null);
      setNotes("");
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const list = apps ?? [];
  const counts = {
    pending: list.filter((a) => a.status === "pending").length,
    approved: list.filter((a) => a.status === "approved").length,
    rejected: list.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="En attente" value={counts.pending} tone="amber" />
        <StatCard label="Approuvées" value={counts.approved} tone="emerald" />
        <StatCard label="Rejetées" value={counts.rejected} tone="rose" />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Demandes B2B</CardTitle></CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucune demande pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {list.map((a) => (
                <div key={a.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{a.organization_name}</h3>
                        <Badge variant="outline" className={STATUS_COLORS[a.status] ?? ""}>{a.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {a.contact_name} · {a.industry || "—"} · {a.size_range || "—"}{a.city ? ` · ${a.city}` : ""}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{a.contact_email}</span>
                        {a.contact_phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{a.contact_phone}</span>}
                        {a.website && <a href={a.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary"><Globe className="h-3 w-3" />Site</a>}
                        <span>· {format(new Date(a.created_at), "dd MMM yyyy")}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setOpenId(openId === a.id ? null : a.id); setNotes(a.review_notes ?? ""); }}>
                      <Eye className="h-4 w-4 mr-1" /> Détails
                    </Button>
                  </div>

                  {openId === a.id && (
                    <div className="border-t pt-3 space-y-3 text-sm">
                      <div className="grid md:grid-cols-3 gap-3 text-xs">
                        <Field label="ICE" value={a.ice} />
                        <Field label="RC" value={a.rc_number} />
                        <Field label="IF" value={a.if_number} />
                        <Field label="Sièges souhaités" value={String(a.desired_seats ?? "—")} />
                        <Field label="Cas d'usage" value={a.use_case} />
                      </div>
                      {a.message && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Message</p>
                          <p className="text-sm bg-muted/40 rounded-sm p-2">{a.message}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Notes de revue</p>
                        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note interne…" />
                      </div>
                      {a.status === "pending" && (
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: a.id, status: "rejected", review_notes: notes })}>
                            <X className="h-4 w-4 mr-1" /> Rejeter
                          </Button>
                          <Button size="sm" onClick={() => updateStatus.mutate({ id: a.id, status: "approved", review_notes: notes })}>
                            <Check className="h-4 w-4 mr-1" /> Approuver
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ label, value, tone }: { label: string; value: number; tone: "amber" | "emerald" | "rose" }) => {
  const tones = {
    amber: "from-amber-500/10 to-transparent text-amber-700 dark:text-amber-400",
    emerald: "from-emerald-500/10 to-transparent text-emerald-700 dark:text-emerald-400",
    rose: "from-rose-500/10 to-transparent text-rose-700 dark:text-rose-400",
  };
  return (
    <Card className={`bg-gradient-to-br ${tones[tone]} border`}><CardContent className="pt-6">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </CardContent></Card>
  );
};

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="font-medium mt-0.5">{value || "—"}</p>
  </div>
);

export default OrgApplicationsManager;