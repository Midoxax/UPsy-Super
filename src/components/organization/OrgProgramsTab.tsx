import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Plus, Users, Clock, CheckCircle2 } from "lucide-react";

const OrgProgramsTab = () => {
  const { data: courses } = useQuery({
    queryKey: ["org-courses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Mock assigned programs
  const assignedPrograms = [
    { id: "1", title: "Stress Management Workshop", category: "wellbeing", enrolledCount: 24, completionRate: 68, status: "active" },
    { id: "2", title: "Leadership & Emotional Intelligence", category: "performance", enrolledCount: 12, completionRate: 45, status: "active" },
    { id: "3", title: "Burnout Prevention Protocol", category: "clinical", enrolledCount: 8, completionRate: 90, status: "completed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Program Management</h3>
          <p className="text-sm text-muted-foreground">Assign and track mental health programs for your organization</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Assign Program
        </Button>
      </div>

      {/* Active Programs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignedPrograms.map((program) => (
          <Card key={program.id} className="hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className={
                  program.status === "completed" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" :
                  "bg-primary/10 text-primary border-primary/20"
                }>
                  {program.status === "completed" ? "Completed" : "Active"}
                </Badge>
                <Badge variant="secondary" className="text-xs">{program.category}</Badge>
              </div>
              <CardTitle className="text-base mt-2">{program.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {program.enrolledCount} enrolled
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {program.completionRate}%
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{program.completionRate}%</span>
                </div>
                <Progress value={program.completionRate} className="h-2" />
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Courses Catalog */}
      {courses && courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Available Programs Catalog
            </CardTitle>
            <CardDescription>Browse and assign programs from the U.Psy library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.slice(0, 6).map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{course.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                      {course.duration_hours && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {course.duration_hours}h
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Assign</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrgProgramsTab;
