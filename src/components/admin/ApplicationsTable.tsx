import { useState } from "react";
import { Application } from "@/hooks/useApplications";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FileX } from "lucide-react";
import { format } from "date-fns";
import ApprovalModal from "./ApprovalModal";
import RejectionModal from "./RejectionModal";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface ApplicationsTableProps {
  applications: Application[];
  onApprove: (params: { applicationId: string; adminUserId: string }) => void;
  onReject: (params: { applicationId: string; adminUserId: string; reason?: string }) => void;
}

const ApplicationsTable = ({ applications, onApprove, onReject }: ApplicationsTableProps) => {
  const { user } = useAdminAuth();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const handleApprove = (app: Application) => {
    setSelectedApp(app);
    setShowApprovalModal(true);
  };

  const handleReject = (app: Application) => {
    setSelectedApp(app);
    setShowRejectionModal(true);
  };

  const confirmApproval = () => {
    if (selectedApp && user) {
      onApprove({ applicationId: selectedApp.id, adminUserId: user.id });
      setShowApprovalModal(false);
      setSelectedApp(null);
    }
  };

  const confirmRejection = (reason?: string) => {
    if (selectedApp && user) {
      onReject({ applicationId: selectedApp.id, adminUserId: user.id, reason });
      setShowRejectionModal(false);
      setSelectedApp(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "default",
      approved: "secondary",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Accredited</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState
                    icon={FileX}
                    title="No Applications"
                    description="There are no psychologist applications to review at this time."
                  />
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span>{app.full_name}</span>
                      {app.notes?.startsWith("[Observatoire") && (
                        <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wide">
                          Observatoire — interest only, dossier incomplete
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.phone || "—"}</TableCell>
                  <TableCell>{app.accreditation_number ? "Yes" : "No"}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>{format(new Date(app.submitted_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    {app.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => handleApprove(app)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(app)}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedApp && (
        <>
          <ApprovalModal
            open={showApprovalModal}
            onClose={() => setShowApprovalModal(false)}
            onConfirm={confirmApproval}
            applicantEmail={selectedApp.email}
            applicantName={selectedApp.full_name}
          />
          <RejectionModal
            open={showRejectionModal}
            onClose={() => setShowRejectionModal(false)}
            onConfirm={confirmRejection}
            applicantEmail={selectedApp.email}
            applicantName={selectedApp.full_name}
          />
        </>
      )}
    </>
  );
};

export default ApplicationsTable;
