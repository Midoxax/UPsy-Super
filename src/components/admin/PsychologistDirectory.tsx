import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

const PsychologistDirectory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: psychologists, isLoading } = useQuery({
    queryKey: ["admin-psychologists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("psychologist_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const togglePublished = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from("psychologist_profiles")
        .update({ is_published: isPublished })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-psychologists"] });
      toast({
        title: "Success",
        description: "Psychologist status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Psychologist Directory</CardTitle>
          <CardDescription>Manage psychologist profiles and visibility</CardDescription>
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
        <CardTitle>Psychologist Directory</CardTitle>
        <CardDescription>Manage psychologist profiles and visibility</CardDescription>
      </CardHeader>
      <CardContent>
        {psychologists?.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Psychologists"
            description="There are no psychologist profiles in the directory yet."
          />
        ) : (
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Rate (MAD/hr)</TableHead>
              <TableHead>Accredited</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {psychologists?.map((psych) => (
              <TableRow key={psych.id}>
                <TableCell className="font-medium">{psych.full_name}</TableCell>
                <TableCell>{psych.city || "N/A"}</TableCell>
                <TableCell>{psych.hourly_rate_mad || "N/A"}</TableCell>
                <TableCell>
                  {psych.is_accredited ? (
                    <Badge variant="secondary">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={psych.is_published ?? false}
                    onCheckedChange={(checked) =>
                      togglePublished.mutate({ id: psych.id, isPublished: checked })
                    }
                  />
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

export default PsychologistDirectory;
