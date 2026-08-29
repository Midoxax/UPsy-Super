import { Check, Sparkles, Building2, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import SEOHead from "@/components/SEOHead";

const Pricing = () => {
  const { t } = useLocale();

  const individualFeatures = [
    "Access to accredited psychologists",
    "Flexible scheduling 7 days a week",
    "Secure encrypted video sessions",
    "Anonymous & confidential",
    "Cancel or reschedule 24h before",
    "Receipts for insurance/tax",
  ];

  const packFeatures = [
    "All individual features included",
    "Lower per-session cost",
    "Valid for 6 months",
    "Track progress with Mental Performance Score",
    "Gift sessions to friends/family",
  ];

  const organizationFeatures = [
    "Employee Assistance Program (EAP)",
    "Dashboard with anonymized metrics",
    "SSO integration",
    "Dedicated account manager",
    "Custom onboarding",
    "Quarterly executive reports",
  ];

  const faqs = [
    {
      question: "How does payment work?",
      answer:
        "You pay a 50% deposit when booking (acompte) and the remaining 50% after your session. We accept Visa, Mastercard, and bank transfer via CMI.",
    },
    {
      question: "Can I get reimbursed by insurance?",
      answer:
        "AMO (Morocco's public health insurance) does not currently reimburse psychology sessions. Some private insurers (RMA, AXA, Sanlam) are starting to cover mental health — check your policy. We provide detailed receipts you can submit.",
    },
    {
      question: "What if I need to cancel?",
      answer:
        "You can cancel or reschedule up to 24 hours before your session at no charge. Cancellations within 24 hours forfeit the 50% deposit.",
    },
    {
      question: "Are sessions really confidential?",
      answer:
        "Yes. All sessions are encrypted end-to-end. Psychologists are bound by professional secrecy (Code Pénal Marocain art. 446). We never share your data without your explicit consent (Law 09-08).",
    },
    {
      question: "How long is each session?",
      answer:
        "Standard sessions are 50 minutes. Some psychologists offer 30-minute or 90-minute sessions at different pricing.",
    },
    {
      question: "Do you offer a free trial or consultation?",
      answer:
        "We offer a free Mental Performance Score self-assessment (5 min). The first session with a psychologist is paid, but many specialists offer a 15-minute discovery call by phone to confirm fit.",
    },
    {
      question: "What's the difference between individual and pack pricing?",
      answer:
        "Individual: pay per session. Packs: buy multiple sessions upfront at a discount (9–20% off). Packs are valid for 6 months and can be gifted.",
    },
    {
      question: "For organizations: how many employees minimum?",
      answer:
        "We work with organizations of any size. Minimum commitment is 10 employees for custom pricing. Smaller teams can use our standard B2C platform.",
    },
  ];

  return (
    <>
      <SEOHead
        path="/pricing"
        title={t("pricing.seoTitle") || "Pricing — U.Psy"}
        description={
          t("pricing.seoDesc") ||
          "Transparent pricing for mental health support in Morocco. Individual sessions, session packs with up to 20% off, and EAP programs for organizations."
        }
      />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-h1 mb-4">{t("pricing.heroTitle") || "Simple, Transparent Pricing"}</h1>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              {t("pricing.heroSubtitle") ||
                "No hidden fees. No subscriptions. Pay only for the sessions you need."}
            </p>
          </div>
        </section>

        {/* Individual */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-h2 mb-3">{t("pricing.individualTitle") || "For Individuals"}</h2>
              <p className="text-muted-foreground">
                {t("pricing.individualSubtitle") ||
                  "Book sessions with accredited psychologists at transparent pricing"}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Single Session
                  </CardTitle>
                  <CardDescription>Perfect to try or for occasional support</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-foreground">250–800 MAD</div>
                    <div className="text-sm text-muted-foreground">per session</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Price set by each psychologist
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {individualFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
                    <Link to="/psychologists">Find Your Psychologist</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/50">
                <CardHeader>
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2 w-fit">
                    9% OFF
                  </div>
                  <CardTitle>5-Session Pack</CardTitle>
                  <CardDescription>For short-term support or specific goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-foreground">2,045 MAD</div>
                    <div className="text-sm text-muted-foreground">≈ 409 MAD/session</div>
                    <div className="text-xs text-muted-foreground mt-1 line-through">
                      Regular: 2,250 MAD
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {packFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/psychologists">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary shadow-lg">
                <CardHeader>
                  <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full mb-2 w-fit">
                    15% OFF — POPULAR
                  </div>
                  <CardTitle>10-Session Pack</CardTitle>
                  <CardDescription>For sustained progress and lasting change</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-foreground">3,825 MAD</div>
                    <div className="text-sm text-muted-foreground">≈ 383 MAD/session</div>
                    <div className="text-xs text-muted-foreground mt-1 line-through">
                      Regular: 4,500 MAD
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {packFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
                    <Link to="/psychologists">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="border-primary/50">
                <CardHeader>
                  <div className="inline-block px-3 py-1 bg-accent/20 text-accent-foreground text-xs font-semibold rounded-full mb-2 w-fit">
                    20% OFF — BEST VALUE
                  </div>
                  <CardTitle>20-Session Pack</CardTitle>
                  <CardDescription>For deep therapeutic work or long-term support</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-3xl font-bold text-foreground">7,200 MAD</div>
                      <div className="text-sm text-muted-foreground">≈ 360 MAD/session</div>
                      <div className="text-xs text-muted-foreground mt-1 line-through">
                        Regular: 9,000 MAD
                      </div>
                    </div>
                    <Button asChild>
                      <Link to="/psychologists">Get Started</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Organizations */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-h2 mb-3">For Organizations</h2>
            <p className="text-muted-foreground">
              Employee mental health programs that improve retention, reduce absenteeism, and boost
              productivity.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  EAP (Employee Assistance Program)
                </CardTitle>
                <CardDescription>Comprehensive mental health benefit for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-foreground mb-1">80–150 MAD</div>
                      <div className="text-sm text-muted-foreground">per employee / per month</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Volume pricing available. Billed annually.
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {organizationFeatures.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="font-semibold text-sm">Proven ROI</div>
                          <div className="text-xs text-muted-foreground">
                            Studies show $3–6 return for every $1 invested in EAP.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="font-semibold text-sm">Flexible Access</div>
                          <div className="text-xs text-muted-foreground">
                            Employees book directly. You only see anonymized metrics.
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button size="lg" asChild className="w-full">
                      <Link to="/services/consulting-for-organizations">Request a Demo</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-h2 text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-h2 mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Find your psychologist and book your first session in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/psychologists">Browse Psychologists</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/get-matched">Get Matched</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Pricing;