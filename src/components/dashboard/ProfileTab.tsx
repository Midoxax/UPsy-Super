import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { usePsychologistProfile, useUpdateProfile } from "@/hooks/usePsychologistDashboard";
import { useSpecialties, useLanguages } from "@/hooks/usePsychologists";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShareBookingLinkCard } from "@/components/dashboard/ShareBookingLinkCard";
import { PhotoUploader } from "@/components/dashboard/PhotoUploader";

export const ProfileTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile, isLoading } = usePsychologistProfile();
  const { data: allSpecialties = [] } = useSpecialties();
  const { data: allLanguages = [] } = useLanguages();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    city: "",
    photo_url: "",
    offers_online: false,
    offers_in_person: false,
    is_published: false,
  });

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  // Sync form data with profile when it loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        city: profile.city || "",
        photo_url: profile.photo_url || "",
        offers_online: profile.offers_online || false,
        offers_in_person: profile.offers_in_person || false,
        is_published: profile.is_published || false,
      });
      setSelectedSpecialties(profile.specialties?.map((s: any) => s.id) || []);
      setSelectedLanguages(profile.languages?.map((l: any) => l.id) || []);
    }
  }, [profile]);

  // Sync form data with profile when it loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        city: profile.city || "",
        photo_url: profile.photo_url || "",
        offers_online: profile.offers_online || false,
        offers_in_person: profile.offers_in_person || false,
        is_published: profile.is_published || false,
      });
      setSelectedSpecialties(profile.specialties?.map((s: any) => s.id) || []);
      setSelectedLanguages(profile.languages?.map((l: any) => l.id) || []);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update profile
      await updateProfile.mutateAsync(formData);

      // Update specialties
      if (user) {
        // Delete existing specialties
        await supabase
          .from("psychologist_specialties")
          .delete()
          .eq("psychologist_id", user.id);

        // Insert new specialties
        if (selectedSpecialties.length > 0) {
          await supabase.from("psychologist_specialties").insert(
            selectedSpecialties.map((specialtyId) => ({
              psychologist_id: user.id,
              specialty_id: specialtyId,
            }))
          );
        }

        // Delete existing languages
        await supabase
          .from("psychologist_languages")
          .delete()
          .eq("psychologist_id", user.id);

        // Insert new languages
        if (selectedLanguages.length > 0) {
          await supabase.from("psychologist_languages").insert(
            selectedLanguages.map((languageId) => ({
              psychologist_id: user.id,
              language_id: languageId,
            }))
          );
        }
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
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
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your professional profile details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ShareBookingLinkCard
            slug={(profile as any)?.slug}
            isPublished={(profile as any)?.is_published}
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., Casablanca"
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profile photo</Label>
            <PhotoUploader
              value={formData.photo_url}
              onChange={(url) => setFormData({ ...formData, photo_url: url ?? "" })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell clients about your experience, approach, and expertise..."
              className="bg-background min-h-[150px]"
            />
          </div>

          <div className="space-y-3">
            <Label>Specialties</Label>
            <div className="grid md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 bg-background rounded-lg">
              {allSpecialties.map((specialty) => (
                <div key={specialty.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`specialty-${specialty.id}`}
                    checked={selectedSpecialties.includes(specialty.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSpecialties([...selectedSpecialties, specialty.id]);
                      } else {
                        setSelectedSpecialties(selectedSpecialties.filter((id) => id !== specialty.id));
                      }
                    }}
                  />
                  <label htmlFor={`specialty-${specialty.id}`} className="text-sm cursor-pointer">
                    {specialty.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Languages</Label>
            <div className="grid md:grid-cols-3 gap-3 p-3 bg-background rounded-lg">
              {allLanguages.map((language) => (
                <div key={language.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`language-${language.id}`}
                    checked={selectedLanguages.includes(language.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedLanguages([...selectedLanguages, language.id]);
                      } else {
                        setSelectedLanguages(selectedLanguages.filter((id) => id !== language.id));
                      }
                    }}
                  />
                  <label htmlFor={`language-${language.id}`} className="text-sm cursor-pointer">
                    {language.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Session Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="offers_online"
                  checked={formData.offers_online}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, offers_online: checked as boolean })
                  }
                />
                <label htmlFor="offers_online" className="text-sm cursor-pointer">
                  Offer online sessions
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="offers_in_person"
                  checked={formData.offers_in_person}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, offers_in_person: checked as boolean })
                  }
                />
                <label htmlFor="offers_in_person" className="text-sm cursor-pointer">
                  Offer in-person sessions
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-primary/10 rounded-lg">
            <Checkbox
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_published: checked as boolean })
              }
            />
            <label htmlFor="is_published" className="text-sm cursor-pointer font-medium">
              Publish profile (make visible in directory)
            </label>
          </div>

          <Button type="submit" variant="primary" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
