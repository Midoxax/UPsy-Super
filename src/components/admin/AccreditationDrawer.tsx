import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { FileText, Files, History, ScrollText } from "lucide-react";
import { AccreditationDocsPanel } from "./AccreditationDocsPanel";
import ProvisioningAuditTab from "./ProvisioningAuditTab";
import ProvisioningResultBanner from "./ProvisioningResultBanner";
import { useProvisioningAttempts } from "@/hooks/useProvisioningAttempts";

interface Props {
  application: any | null;
  onClose: () => void;
}

export const AccreditationDrawer = ({ application, onClose }: Props) => {
  const open = !!application;

  const { data: attempts = [] } = useProvisioningAttempts(application?.id);
  const lastAttempt = attempts[0];

  const { data: decisions = [] } = useQuery({
    queryKey: ["accreditation-decisions", application?.id],
    enabled: !!application?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accreditation_decisions")
        .select("*")
        .eq("application_id", application.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        {application && (
          <>
            <SheetHeader className="px-6 pt-6 pb-4 border-b">
              <SheetTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {application.full_name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{application.full_name}</p>
                  <p className="text-xs font-normal text-muted-foreground truncate">{application.email}</p>
                </div>
              </SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">{application.status}</Badge>
                <Badge variant="secondary" className="capitalize">{application.accreditation_level || "provisional"}</Badge>
                {application.preferred_locale && (
                  <Badge variant="outline" className="uppercase">{application.preferred_locale}</Badge>
                )}
              </SheetDescription>
              {lastAttempt && (
                <div className="pt-2">
                  <ProvisioningResultBanner applicationId={application.id} lastAttempt={lastAttempt} />
                </div>
              )}
            </SheetHeader>

            <Tabs defaultValue="application" className="flex-1 flex flex-col min-h-0">
              <TabsList className="mx-6 mt-3 grid grid-cols-4">
                <TabsTrigger value="application" className="gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" /> Application
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-1.5 text-xs">
                  <Files className="h-3.5 w-3.5" /> Documents
                </TabsTrigger>
                <TabsTrigger value="audit" className="gap-1.5 text-xs">
                  <History className="h-3.5 w-3.5" /> Audit
                </TabsTrigger>
                <TabsTrigger value="decisions" className="gap-1.5 text-xs">
                  <ScrollText className="h-3.5 w-3.5" /> Decisions
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-6 py-4">
                <TabsContent value="application" className="mt-0 space-y-4">
                  <Field label="Phone" value={application.phone} />
                  <Field label="Date of birth" value={application.date_of_birth} />
                  <Field label="City / Country" value={[application.city, application.country].filter(Boolean).join(", ")} />
                  <Field label="Accreditation #" value={application.accreditation_number} />
                  <Field label="Years experience" value={application.years_experience} />
                  <Field label="Desired hourly rate (MAD)" value={application.desired_hourly_rate_mad} />
                  <Separator />
                  <Field label="Bio (short)" value={application.bio_short} multiline />
                  <Field label="Bio (long)" value={application.bio_long} multiline />
                  <Field label="Qualifications" value={application.qualifications} multiline />
                  <Field label="Notes" value={application.notes} multiline />
                  <Field label="Revision notes" value={application.revision_notes} multiline />
                  <Separator />
                  <Field label="Languages" value={(application.languages ?? []).join(", ")} />
                  <Field label="Specialties requested" value={(application.specialties_requested ?? []).join(", ")} />
                  <Field label="Therapy approaches" value={(application.therapy_approaches_requested ?? []).join(", ")} />
                  <Field label="Populations served" value={(application.populations_served ?? []).join(", ")} />
                  <Separator />
                  <Field label="Submitted at" value={application.submitted_at ? format(new Date(application.submitted_at), "PPpp") : null} />
                  <Field label="Reviewed at" value={application.reviewed_at ? format(new Date(application.reviewed_at), "PPpp") : null} />
                </TabsContent>

                <TabsContent value="documents" className="mt-0">
                  <AccreditationDocsPanel application={application} />
                </TabsContent>

                <TabsContent value="audit" className="mt-0">
                  <ProvisioningAuditTab applicationId={application.id} />
                </TabsContent>

                <TabsContent value="decisions" className="mt-0">
                  {decisions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No decisions logged yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {decisions.map((d: any) => (
                        <div key={d.id} className="p-3 rounded-md border border-border bg-surface">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="capitalize">{d.decision}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(d.created_at), "PPp")}
                            </span>
                          </div>
                          {d.level_assigned && (
                            <p className="text-xs"><span className="text-muted-foreground">Level:</span> {d.level_assigned}</p>
                          )}
                          {d.reason && (
                            <p className="text-xs text-muted-foreground mt-1">{d.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <div className="border-t px-6 py-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Field = ({ label, value, multiline }: { label: string; value: any; multiline?: boolean }) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
    <p className={`text-sm ${multiline ? "whitespace-pre-wrap" : "truncate"} ${!value ? "text-muted-foreground italic" : ""}`}>
      {value || "—"}
    </p>
  </div>
);

export default AccreditationDrawer;