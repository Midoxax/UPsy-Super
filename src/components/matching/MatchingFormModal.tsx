import { useState } from "react";
import DataPrivacyNotice from "@/components/DataPrivacyNotice";
import { useScrollResetOnOpen } from "@/hooks/useScrollResetOnOpen";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { PsychologistProfile } from "@/types/psychologist";
import MatchResults from "./MatchResults";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  specialty_needed: z.string().min(1, "Please select a specialty"),
  languages_preferred: z.array(z.string()).min(1, "Please select at least one language"),
  budget_max: z.string().optional(),
  location_city: z.string().optional(),
  prefers_online: z.boolean(),
  notes: z.string().optional(),
});

interface Specialty {
  id: string;
  name: string;
}

interface Language {
  id: string;
  name: string;
}

interface MatchingFormModalProps {
  open: boolean;
  onClose: () => void;
  specialties: Specialty[];
  languages: Language[];
}

const MatchingFormModal = ({ open, onClose, specialties, languages }: MatchingFormModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<PsychologistProfile[]>([]);
  const [showResults, setShowResults] = useState(false);
  const scrollRef = useScrollResetOnOpen<HTMLDivElement>(open, [showResults]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialty_needed: "",
      languages_preferred: [],
      budget_max: "",
      location_city: "",
      prefers_online: false,
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      // Insert matching request
      const { error: insertError } = await supabase.from("client_matching_requests").insert({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        specialty_needed: values.specialty_needed,
        languages_preferred: values.languages_preferred,
        budget_max: values.budget_max ? parseFloat(values.budget_max) : null,
        location_city: values.location_city || null,
        prefers_online: values.prefers_online,
        notes: values.notes || null,
      });

      if (insertError) throw insertError;

      // Find matches
      const { data, error: matchError } = await supabase.functions.invoke("find-matches", {
        body: {
          specialtyNeeded: values.specialty_needed,
          languagesPreferred: values.languages_preferred,
          budgetMax: values.budget_max ? parseFloat(values.budget_max) : undefined,
          locationCity: values.location_city || undefined,
          prefersOnline: values.prefers_online,
        },
      });

      if (matchError) throw matchError;

      if (data?.success) {
        setMatches(data.matches);
        setShowResults(true);
      } else {
        throw new Error(data?.error || "Failed to find matches");
      }
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setShowResults(false);
    setMatches([]);
    onClose();
  };

  if (showResults) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent ref={scrollRef} className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Top Matches</DialogTitle>
            <DialogDescription>Based on your preferences, here are your best matches</DialogDescription>
          </DialogHeader>
          <MatchResults matches={matches} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent ref={scrollRef} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find Your Perfect Match</DialogTitle>
          <DialogDescription>Tell us what you're looking for and we'll match you with the best psychologists</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+212 6XX XXX XXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty_needed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    What type of support do you need? <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a specialty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="languages_preferred"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Preferred Languages <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {languages.map((language) => (
                      <FormField
                        key={language.id}
                        control={form.control}
                        name="languages_preferred"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(language.id)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...(field.value || []), language.id]
                                    : field.value?.filter((val) => val !== language.id) || [];
                                  field.onChange(updatedValue);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">{language.name}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Budget (MAD/hour)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} />
                    </FormControl>
                    <FormDescription>Leave empty for no budget limit</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Casablanca" {...field} />
                    </FormControl>
                    <FormDescription>For in-person sessions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="prefers_online"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Online Sessions</FormLabel>
                    <FormDescription>I prefer online video sessions</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any specific requirements or questions..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DataPrivacyNotice />

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Finding Matches..." : "Find My Match"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MatchingFormModal;
