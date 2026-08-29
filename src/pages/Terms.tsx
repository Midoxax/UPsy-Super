import SEOHead from "@/components/SEOHead";

const Terms = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        path="/terms"
        title="Terms of Service — UPSY"
        description="Terms of service governing the use of the UPSY Performance Psychology platform."
      />
      <div className="container-custom section-spacing max-w-4xl mx-auto">
        <h1 className="text-h1 text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 21 May 2026</p>

        <div className="space-y-8 text-body text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-h3 mb-3">1. Service</h2>
            <p>UPSY is a Performance Psychology System connecting users with accredited specialists and clinical tools. UPSY is not an emergency service. In case of crisis, contact SOS Amitié Maroc or local emergency services.</p>
          </section>
          <section>
            <h2 className="text-h3 mb-3">2. Account</h2>
            <p>You must provide accurate information, verify your email, and keep your credentials confidential. You must be 18+ or have parental authorisation.</p>
          </section>
          <section>
            <h2 className="text-h3 mb-3">3. Specialists</h2>
            <p>Specialists listed on UPSY are independent practitioners. UPSY verifies accreditation but is not party to the therapeutic relationship.</p>
          </section>
          <section>
            <h2 className="text-h3 mb-3">4. Payments</h2>
            <p>Sessions and subscriptions are billed in MAD. Refund and cancellation rules are displayed at booking time.</p>
          </section>
          <section>
            <h2 className="text-h3 mb-3">5. Acceptable use</h2>
            <p>No abuse, scraping, reverse engineering, or unlawful use. We may suspend accounts that violate these terms.</p>
          </section>
          <section>
            <h2 className="text-h3 mb-3">6. Liability</h2>
            <p>UPSY provides the platform "as is" within applicable law. Clinical outcomes depend on the specialist and the user.</p>
          </section>
          <section>
            <h2 className="text-h3 mb-3">7. Governing law</h2>
            <p>These terms are governed by Moroccan law. Disputes are subject to the courts of Casablanca.</p>
          </section>
          <section>
            <h2 className="text-h3 mb-3">8. Contact</h2>
            <p>UPSY — Mehdi Felji, Founder. Email: <a className="text-primary underline" href="mailto:contact@upsy.ma">contact@upsy.ma</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Terms;