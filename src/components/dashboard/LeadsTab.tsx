import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLeads, useUpdateLead } from "@/hooks/usePsychologistDashboard";
import { Loader2, Users, Mail, Phone, CalendarPlus, Video } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import ProposeSessionModal from "@/components/dashboard/ProposeSessionModal";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  contacted: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  converted: "bg-green-500/20 text-green-500 border-green-500/30",
  declined: "bg-red-500/20 text-red-500 border-red-500/30",
};

export const LeadsTab = () => {
  const { toast } = useToast();
  const { data: leads = [], isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const [proposeFor, setProposeFor] = useState<{ email: string; name: string } | null>(null);
  const [linkFor, setLinkFor] = useState<{ email: string; name: string } | null>(null);

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      await updateLead.mutateAsync({ id: leadId, status: newStatus });
      toast({
        title: "Lead Updated",
        description: `Lead status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-surface border-border">
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Client Leads
        </CardTitle>
        <CardDescription>Manage incoming client requests and follow-ups</CardDescription>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No leads yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Client inquiries will appear here when they request to work with you
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 bg-background rounded-lg border border-border space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{lead.client_name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {lead.client_email}
                    </div>
                    {lead.client_phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {lead.client_phone}
                      </div>
                    )}
                  </div>
                  <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                    {lead.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Concerns:</span> {lead.concerns}
                  </p>
                  {lead.preferences && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Preferences:</span> {lead.preferences}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Received: {format(new Date(lead.created_at ?? 0), "PPp")}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Select
                    value={lead.status}
                    onValueChange={(value) => handleStatusUpdate(lead.id, value)}
                  >
                    <SelectTrigger className="w-[180px] bg-surface">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setProposeFor({ email: lead.client_email, name: lead.client_name })
                    }
                  >
                    <CalendarPlus className="h-4 w-4 mr-1" />
                    Propose session
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      setLinkFor({ email: lead.client_email, name: lead.client_name })
                    }
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Send meeting link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <ProposeSessionModal
        open={!!proposeFor}
        onOpenChange={(o) => !o && setProposeFor(null)}
        defaultEmail={proposeFor?.email ?? ""}
        defaultName={proposeFor?.name ?? ""}
      />
      <ProposeSessionModal
        open={!!linkFor}
        onOpenChange={(o) => !o && setLinkFor(null)}
        defaultEmail={linkFor?.email ?? ""}
        defaultName={linkFor?.name ?? ""}
        defaultMode="link"
      />
    </Card>
  );
};
