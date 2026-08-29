import CampaignLanding, { CampaignConfig } from "./CampaignLanding";

const config: CampaignConfig = {
  slug: "join-specialist",
  source: "campaign_specialist_recruitment",
  audience: "specialist",
  seoTitle: "Join U.Psy — 3 months, 0% commission",
  seoDescription:
    "Psychologist? Join Morocco's leading performance-psychology network. First 3 months at 0% commission, premium profile, curated clientele.",
  eyebrow: "For psychologists · Founding cohort",
  headline: "Join U.Psy —",
  headlineAccent: "0% commission, 3 months.",
  subheadline:
    "A curated network for accredited psychologists across Morocco and EMEA. Bring your practice. Keep your fees. We handle the platform, the leads, and the compliance.",
  offerLabel: "First 3 months · 0% platform commission",
  bullets: [
    "Zero commission on your first 3 months of sessions",
    "Premium profile + featured directory placement",
    "We handle booking, video, invoicing, reminders",
    "Warm leads from B2C acquisition + org contracts",
    "5-tier accreditation review (protects your brand)",
  ],
  proof: [
    { number: "0%", label: "Platform fee for 90 days" },
    { number: "48h", label: "Application review time" },
    { number: "3", label: "Steps to go live" },
  ],
  primaryCta: { label: "Apply to the network", href: "#" },
  formTitle: "Start your application",
  formSubtitle:
    "We reply within 48h with a link to the accreditation dossier.",
  successTitle: "We've got your details 🤝",
  successBody:
    "Our accreditation team reviews within 48h. In the meantime, start the full application — it takes about 12 minutes.",
  successCta: { label: "Continue application", href: "/apply" },
  askPhone: true,
  askOrg: true,
};

export default function CampaignJoinSpecialist() {
  return <CampaignLanding config={config} />;
}