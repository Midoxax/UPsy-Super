import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";

const MatchingRequestsManager = () => {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-matching-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_matching_requests")
        .select(`
          *,
          specialties:specialty_needed(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matching Requests</CardTitle>
          <CardDescription>Review and manually assign client requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Requests</CardTitle>
        <CardDescription>Review and manually assign client requests</CardDescription>
      </CardHeader>
      <CardContent>
        {requests?.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Matching Requests"
            description="There are no client matching requests at this time."
          />
        ) : (
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.name}</TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {request.specialties?.name || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>{request.budget_max ? `${request.budget_max} MAD` : "No limit"}</TableCell>
                <TableCell>
                  {request.location_city || "N/A"}
                  {request.prefers_online && (
                    <Badge variant="outline" className="ml-2">Online</Badge>
                  )}
                </TableCell>
                <TableCell>{format(new Date(request.created_at ?? 0), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Assign
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchingRequestsManager;
