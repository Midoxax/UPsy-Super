import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreditCard } from "lucide-react";
import { format } from "date-fns";

const SubscriptionsOverview = () => {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          psychologist:psychologist_profiles(full_name, city)
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
          <CardTitle>Subscriptions Overview</CardTitle>
          <CardDescription>Monitor subscription status and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const planColors: Record<string, "default" | "secondary" | "destructive"> = {
    free: "secondary",
    basic: "secondary",
    premium: "default",
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
    active: "default",
    inactive: "destructive",
    cancelled: "secondary",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriptions Overview</CardTitle>
        <CardDescription>Monitor subscription status and revenue</CardDescription>
      </CardHeader>
      <CardContent>
        {subscriptions?.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Subscriptions"
            description="There are no active subscriptions at this time."
          />
        ) : (
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Psychologist</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Ends</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions?.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">
                  {sub.psychologist?.full_name || "Unknown"}
                </TableCell>
                <TableCell>
                  <Badge variant={planColors[sub.plan_type] || "default"}>
                    {sub.plan_type.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[sub.status] || "default"}>
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {sub.starts_at ? format(new Date(sub.starts_at), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell>
                  {sub.ends_at ? format(new Date(sub.ends_at), "MMM d, yyyy") : "No end date"}
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

export default SubscriptionsOverview;
