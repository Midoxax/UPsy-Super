import SEOHead from "@/components/SEOHead";

const Privacy = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        path="/privacy"
        title="Privacy Policy — UPSY"
        description="UPSY privacy policy. How we collect, use, store and protect your personal and health data under Moroccan Law 09-08 and GDPR principles."
      />
      <div className="container-custom section-spacing max-w-4xl mx-auto">
        <h1 className="text-h1 text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 21 May 2026</p>

        <div className="space-y-8 text-body text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-h3 mb-3">1. Who we are</h2>
            <p>
              UPSY ("we", "us", "our") is a Performance Psychology System operated by Mehdi Felji,
              registered as Autoentrepreneur in Morocco. Website: <a className="text-primary underline" href="https://upsy.ma">https://upsy.ma</a>.
              Contact: <a className="text-primary underline" href="mailto:contact@upsy.ma">contact@upsy.ma</a>.
            </p>
          </section>

          <section>
            <h2 className="text-h3 mb-3">2. Data we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account data:</strong> name, email, phone, password hash, profile photo.</li>
              <li><strong>OAuth data:</strong> when you sign in with Google or Apple, we receive your email, name and profile picture only.</li>
              <li><strong>Clinical data:</strong> assessments (GAD-7, PHQ-9, etc.), session notes, journaling entries — stored encrypted and access-restricted.</li>
              <li><strong>Booking & billing data:</strong> appointments, invoices, payment confirmations.</li>
              <li><strong>Technical data:</strong> IP address, browser type, device, cookies strictly necessary for the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h3 mb-3">3. How we use your data</h2>
            <p>We process your data to: provide the platform and match you with specialists, manage bookings and video sessions, deliver clinical tools, comply with legal obligations, and secure the service. We do not sell your data.</p>
          </section>

          <section>
            <h2 className="text-h3 mb-3">4. Legal basis (Moroccan Law 09-08 & GDPR)</h2>
            <p>Processing is based on your explicit consent, performance of the service contract, and our legitimate interest in operating a secure platform. Sensitive health data is processed only with your explicit consent and protected by row-level security.</p>
          </section>

          <section>
            <h2 className="text-h3 mb-3">5. Sharing</h2>
            <p>Your data is shared only with: the specialist you book, sub-processors strictly required to run the service (hosting, email, video, payment), and Moroccan authorities upon valid legal request. All sub-processors are bound by confidentiality and security obligations.</p>
          </section>

          <section>
            <h2 className="text-h3 mb-3">6. Retention</h2>
            <p>Account data is kept while your account is active. Clinical records are retained for the period required by applicable health regulations, then deleted or anonymised.</p>
          </section>

          <section>
            <h2 className="text-h3 mb-3">7. Your rights</h2>
            <p>You may access, rectify, delete, port or restrict your data, and withdraw consent at any time by emailing <a className="text-primary underline" href="mailto:privacy@upsy.ma">privacy@upsy.ma</a>. You may also lodge a complaint with the CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel) — <a className="text-primary underline" href="https://www.cndp.ma">cndp.ma</a>. CNDP declaration is in progress in accordance with Law 09-08.</p>
          </section>

          <section>
            <h2 className="text-h3 mb-3">8. Security</h2>
            <p>Data is encrypted in transit (TLS) and at rest. Access is governed by strict row-level security, leaked-password checks, mandatory email verification and role-based access control.</p>
          </section>

          <section>
            <h2 className="text-h3 mb-3">9. Contact</h2>
            <p>UPSY — Mehdi Felji, Founder. Email: <a className="text-primary underline" href="mailto:privacy@upsy.ma">privacy@upsy.ma</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Privacy;