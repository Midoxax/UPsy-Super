import CampaignLanding, { CampaignConfig } from "./CampaignLanding";

const config: CampaignConfig = {
  slug: "first-session",
  source: "campaign_b2c_first_session",
  audience: "b2c",
  seoTitle: "Your first session at -20% — U.Psy",
  seoDescription:
    "Book your first session with an accredited psychologist and get 20% off with code WELCOME20. Video or in-person, in French, English, Arabic, Darija.",
  eyebrow: "Launch offer · WELCOME20",
  headline: "Your first session,",
  headlineAccent: "20% off.",
  subheadline:
    "Match with an accredited psychologist in under 48 hours. Video anywhere, in-person in select cities. If the first session isn't the right fit, we rebook you — free.",
  offerLabel: "Code WELCOME20 · -20% on your first booking",
  bullets: [
    "Accredited, verified psychologists — 5-tier clinical review",
    "Sessions in French, English, Arabic, Darija",
    "Video or in-person — you pick the format",
    "Free rebook guarantee if the fit is off",
    "Encrypted end-to-end — Law 09-08 compliant",
  ],
  proof: [
    { number: "<48h", label: "Average time to first session" },
    { number: "94%", label: "Rebook rate after session 1" },
    { number: "40+", label: "Verified psychologists" },
  ],
  primaryCta: { label: "Get my WELCOME20 code", href: "#" },
  formTitle: "Claim your -20% code",
  formSubtitle: "We send WELCOME20 to your inbox in under a minute.",
  successTitle: "Check your inbox 📬",
  successBody:
    "Your WELCOME20 code is on its way. Open it, then pick a psychologist — the discount applies at checkout.",
  successCta: { label: "Browse psychologists", href: "/psychologists" },
};

export default function CampaignFirstSession() {
  return <CampaignLanding config={config} />;
}