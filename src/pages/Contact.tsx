import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Calendar, Loader2 } from "lucide-react";
import { Link } from "@/lib/router-compat";
import ScrollReveal from "@/components/ScrollReveal";
import NeuralConnector from "@/components/ui/neural-connector";
import { useLocale } from "@/contexts/LocaleContext";
import { translations } from "@/lib/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataPrivacyNotice from "@/components/DataPrivacyNotice";
import { z } from "zod";
import SEOHead from "@/components/SEOHead";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const Contact = () => {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const faqQuestions = (translations[locale] as any).contact?.faq?.questions ?? (translations.en as any).contact.faq.questions;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = contactSchema.parse(formData);
      const { error } = await supabase.from("contact_submissions").insert({
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        message: validated.message,
      });

      if (error) throw error;

      toast({ title: t('contact.form.successTitle') || "Message Sent!", description: t('contact.form.successMessage') || "We'll get back to you within 24 hours." });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation Error", description: err.errors[0].message, variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        path="/contact"
        title="Contact U.Psy — Talk to Our Team"
        description="Reach the U.Psy team in Morocco for support, partnerships, or questions about psychologists, assessments, and mental health programs."
      />
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-custom text-center">
          <ScrollReveal>
            <h1 className="text-h1 text-foreground mb-6">{t('contact.hero.title')}</h1>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              {t('contact.hero.subtitle')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <NeuralConnector variant="synapse" />

      {/* Main Content */}
      <section className="section-spacing">
        <div className="container-custom">
          {/*
            [&>*]:min-w-0 — a grid track is min-width:auto by default, so it
            refuses to shrink below its content's min-content width. On a 390px
            phone that pushed this card to 424px and gave the whole page 58px of
            horizontal scroll. Letting the items shrink lets the w-full fields
            size to the column instead of forcing it open.
          */}
          <div className="grid lg:grid-cols-2 gap-12 [&>*]:min-w-0">
            {/* Contact Form */}
            <ScrollReveal direction="left">
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>{t('contact.form.title')}</CardTitle>
                  <CardDescription>
                    {t('contact.form.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contact.form.nameLabel')} {t('contact.form.required')}</Label>
                      <Input id="name" placeholder={t('contact.form.namePlaceholder')} required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact.form.emailLabel')} {t('contact.form.required')}</Label>
                      <Input id="email" type="email" placeholder={t('contact.form.emailPlaceholder')} required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('contact.form.phoneLabel')}</Label>
                      <Input id="phone" type="tel" placeholder={t('contact.form.phonePlaceholder')} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact.form.messageLabel')} {t('contact.form.required')}</Label>
                      <Textarea 
                        id="message" 
                        placeholder={t('contact.form.messagePlaceholder')}
                        className="min-h-[150px]"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    
                    <DataPrivacyNotice />

                    <Button type="submit" size="lg" className="w-full hover-glow" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('contact.form.submitButton')}
                        </>
                      ) : (
                        t('contact.form.submitButton')
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Contact Info & Quick Actions */}
            <div className="space-y-6">
              <ScrollReveal direction="right" delay={0.2}>
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle>{t('contact.info.title')}</CardTitle>
                    <CardDescription>
                      {t('contact.info.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{t('contact.info.email')}</p>
                        <a href="mailto:mypersonalpsychologist212@gmail.com" className="text-muted-foreground hover:text-primary transition-colors link-underline">
                          mypersonalpsychologist212@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-semibold">{t('contact.info.phone')}</p>
                        <a href="tel:+212668594699" className="text-muted-foreground hover:text-secondary transition-colors link-underline">
                          +212 668-594699
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold">{t('contact.info.location')}</p>
                        <p className="text-muted-foreground">
                          {t('contact.info.locationValue')}<br />
                          <span className="text-sm">{t('contact.info.locationExtra')}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.4}>
                <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 hover-lift">
                  <CardHeader>
                    <Calendar className="w-10 h-10 text-primary mb-2" />
                    <CardTitle>{t('contact.booking.title')}</CardTitle>
                    <CardDescription>
                      {t('contact.booking.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild size="lg" className="w-full hover-glow">
                      <a href="https://calendly.com/dr-mehdi-felji" target="_blank" rel="noopener noreferrer">
                        {t('contact.booking.button')}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.6}>
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle>{t('contact.matching.title')}</CardTitle>
                    <CardDescription>
                      {t('contact.matching.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="secondary" size="lg" className="w-full">
                      <Link to="/get-matched">
                        {t('contact.matching.button')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <NeuralConnector variant="wave" />

      {/* FAQ Section */}
      <section className="section-spacing bg-muted/30">
        <div className="container-custom">
          <ScrollReveal>
            <h2 className="text-h2 text-center mb-12">{t('contact.faq.title')}</h2>
          </ScrollReveal>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqQuestions.map((faq: any, index: number) => (
              <ScrollReveal key={index} delay={0.1 * (index + 1)}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-h3">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
