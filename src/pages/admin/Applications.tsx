import { Navigate } from "@/lib/router-compat";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApplications } from "@/hooks/useApplications";
import ApplicationsTable from "@/components/admin/ApplicationsTable";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Applications = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { applications, isLoading, approveApplication, rejectApplication } = useApplications();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Psychologist Applications</CardTitle>
            <CardDescription>Review and manage psychologist applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ApplicationsTable
                applications={applications}
                onApprove={approveApplication.mutate}
                onReject={rejectApplication.mutate}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Applications;
