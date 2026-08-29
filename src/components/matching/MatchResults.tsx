import { Link } from "@/lib/router-compat";
import { PsychologistProfile } from "@/types/psychologist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Award, Globe, Calendar } from "lucide-react";

interface MatchResultsProps {
  matches: PsychologistProfile[];
  onClose: () => void;
}

const MatchResults = ({ matches, onClose }: MatchResultsProps) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No psychologists match your exact criteria at the moment. Please try adjusting your preferences or contact us
          for personalized recommendations.
        </p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        We found {matches.length} {matches.length === 1 ? "psychologist" : "psychologists"} that match your needs.
      </p>

      <div className="space-y-4">
        {matches.map((psychologist) => (
          <Card key={psychologist.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={psychologist.photo_url || undefined} alt={psychologist.full_name} />
                  <AvatarFallback>{psychologist.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{psychologist.full_name}</CardTitle>
                    {psychologist.is_accredited && (
                      <Badge variant="secondary" className="gap-1">
                        <Award className="h-3 w-3" />
                        U.Psy Accredited
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{psychologist.bio || "Professional psychologist"}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {psychologist.specialties?.map((specialty) => (
                  <Badge key={specialty.id} variant="outline">
                    {specialty.name}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {psychologist.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {psychologist.city}
                  </div>
                )}
                {psychologist.offers_online && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Online
                  </div>
                )}
                {psychologist.hourly_rate_mad && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{psychologist.hourly_rate_mad} MAD/hour</span>
                  </div>
                )}
              </div>

              {psychologist.languages && psychologist.languages.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Languages: </span>
                  {psychologist.languages.map((lang) => lang.name).join(", ")}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button variant="outline" asChild className="flex-1">
                <Link to={`/psychologists/${psychologist.id}`}>View Profile</Link>
              </Button>
              {psychologist.calendly_url && (
                <Button asChild className="flex-1">
                  <a href={psychologist.calendly_url} target="_blank" rel="noopener noreferrer">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default MatchResults;
