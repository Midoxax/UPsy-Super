import { useState } from "react";
import DataPrivacyNotice from "@/components/DataPrivacyNotice";
import { useScrollResetOnOpen } from "@/hooks/useScrollResetOnOpen";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";

const formSchema = z.object({
  organizationName: z.string().trim().min(2, "Organization name is required").max(100),
  contactName: z.string().trim().min(2, "Contact name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().max(20).optional(),
  organizationSize: z.string().optional(),
  serviceInterest: z.string().min(1, "Please select a service"),
  message: z.string().trim().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProposalRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProposalRequestModal({ open, onOpenChange }: ProposalRequestModalProps) {
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useScrollResetOnOpen<HTMLDivElement>(open);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      contactName: "",
      email: "",
      phone: "",
      organizationSize: "",
      serviceInterest: "",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Insert into database
      const { error: dbError } = await supabase
        .from("proposal_requests")
        .insert({
          organization_name: values.organizationName,
          contact_name: values.contactName,
          email: values.email,
          phone: values.phone || null,
          organization_size: values.organizationSize || null,
          service_interest: values.serviceInterest,
          message: values.message || null,
        });

      if (dbError) throw dbError;

      // Send notification emails
      const { error: emailError } = await supabase.functions.invoke("send-proposal-notification", {
        body: {
          organizationName: values.organizationName,
          contactName: values.contactName,
          email: values.email,
          phone: values.phone,
          organizationSize: values.organizationSize,
          serviceInterest: values.serviceInterest,
          message: values.message,
        },
      });

      if (emailError) {
        console.error("Email notification error:", emailError);
        // Don't fail the submission if email fails
      }

      toast({
        title: t("proposalRequest.successTitle"),
        description: t("proposalRequest.successMessage"),
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting proposal request:", error);
      toast({
        title: t("proposalRequest.errorTitle"),
        description: t("proposalRequest.errorMessage"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={scrollRef} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("proposalRequest.title")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("proposalRequest.organizationName")} *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("proposalRequest.organizationSize")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("proposalRequest.selectSize")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 {t("proposalRequest.employees")}</SelectItem>
                        <SelectItem value="11-50">11-50 {t("proposalRequest.employees")}</SelectItem>
                        <SelectItem value="51-200">51-200 {t("proposalRequest.employees")}</SelectItem>
                        <SelectItem value="201-500">201-500 {t("proposalRequest.employees")}</SelectItem>
                        <SelectItem value="500+">500+ {t("proposalRequest.employees")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("proposalRequest.contactName")} *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>{t("proposalRequest.email")} *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
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
                  <FormLabel>{t("proposalRequest.phone")}</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceInterest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("proposalRequest.serviceInterest")} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("proposalRequest.selectService")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="wellbeing-programs">{t("proposalRequest.wellbeingPrograms")}</SelectItem>
                      <SelectItem value="stress-management">{t("proposalRequest.stressManagement")}</SelectItem>
                      <SelectItem value="leadership-coaching">{t("proposalRequest.leadershipCoaching")}</SelectItem>
                      <SelectItem value="team-building">{t("proposalRequest.teamBuilding")}</SelectItem>
                      <SelectItem value="crisis-support">{t("proposalRequest.crisisSupport")}</SelectItem>
                      <SelectItem value="custom-solution">{t("proposalRequest.customSolution")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("proposalRequest.message")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DataPrivacyNotice />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("proposalRequest.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("proposalRequest.submitting") : t("proposalRequest.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
