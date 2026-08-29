import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Star, MapPin, Globe, Video } from "lucide-react";

const OrgPsychologistsTab = () => {
  const { data: psychologists, isLoading } = useQuery({
    queryKey: ["org-psychologists"],
    queryFn: async () => {
      const { data } = await supabase
        .from("psychologist_profiles")
        .select("id, full_name, photo_url, city, bio, hourly_rate_mad, is_accredited, offers_online, offers_in_person, accreditation_level, slug")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(12);
      return data || [];
    },
  });

  const accreditationColors: Record<string, string> = {
    elite: "bg-accent/10 text-accent border-accent/20",
    premium: "bg-primary/10 text-primary border-primary/20",
    verified: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    provisional: "bg-muted text-muted-foreground border-border",
    basic: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assigned Psychologists</h3>
          <p className="text-sm text-muted-foreground">Mental health professionals available for your employees</p>
        </div>
        <Button className="gap-2">
          <UserCheck className="h-4 w-4" />
          Request Assignment
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="h-4 w-32 bg-muted rounded-sm" />
                <div className="h-3 w-48 bg-muted rounded-sm" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {psychologists?.map((psych) => (
            <Card key={psych.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold text-primary shrink-0 overflow-hidden">
                    {psych.photo_url ? (
                      <img src={psych.photo_url} alt={psych.full_name} className="w-full h-full object-cover" />
                    ) : (
                      psych.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{psych.full_name}</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {psych.is_accredited && (
                        <Badge variant="outline" className={accreditationColors[psych.accreditation_level || "provisional"]}>
                          {psych.accreditation_level || "provisional"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {psych.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {psych.city}
                        </span>
                      )}
                      {psych.offers_online && (
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          Online
                        </span>
                      )}
                    </div>
                    {psych.hourly_rate_mad && (
                      <p className="text-xs text-accent font-medium mt-2">{psych.hourly_rate_mad} MAD/session</p>
                    )}
                  </div>
                </div>
                {psych.bio && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{psych.bio}</p>
                )}
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgPsychologistsTab;
