import CampaignLanding, { CampaignConfig } from "./CampaignLanding";

// U.Psy Academy go-to-market: the four hybrid training tracks. Every visual,
// brochure QR code and message links here with utm_* tags, which the lead
// form stores, so the admin CRM shows which post or channel brought each
// application. Campaign sources live in marketing/academy/.
const config: CampaignConfig = {
  slug: "academy",
  source: "campaign_academy",
  audience: "specialist",
  seoTitle:
    "U.Psy Academy — Formations hybrides en psychologie du sport, clinique et leadership",
  seoDescription:
    "Quatre parcours certifiants, en présentiel et en ligne : psychologie du sport et de la performance, préparation mentale, résilience et leadership, pratique clinique avancée.",
  eyebrow: "U.Psy Academy · Programme hybride 2026-2027",
  headline: "Former l'excellence.",
  headlineAccent: "Ouvrir l'accès.",
  subheadline:
    "Quatre parcours pour les psychologues, les sportifs, les entraîneurs et les organisations : des journées en présentiel, des modules en ligne et une pratique supervisée sur la plateforme U.Psy.",
  offerLabel: "Première promotion · places limitées",
  bullets: [
    "01 · Certification en psychologie du sport et de la performance",
    "02 · Préparation mentale à la compétition",
    "03 · Résilience et leadership pour les organisations",
    "04 · Pratique clinique avancée, en lien avec la LSSPM",
    "Programme Ambassadeurs pour les psychologues certifiés",
  ],
  proof: [
    { number: "4", label: "Parcours certifiants" },
    { number: "3", label: "Formats : présentiel, en ligne, supervision" },
    { number: "4", label: "Langues de pratique" },
  ],
  primaryCta: { label: "Je candidate", href: "#" },
  formTitle: "Candidater à la première promotion",
  formSubtitle:
    "Laissez vos coordonnées et le parcours qui vous intéresse ; nous vous rappelons pour un court entretien.",
  successTitle: "Candidature reçue",
  successBody:
    "Nous vous contactons pour un court entretien. En attendant, téléchargez la brochure complète des quatre parcours.",
  successCta: {
    label: "Télécharger la brochure",
    href: "/campaign/academy/U.Psy-Academy-Brochure-FR.pdf",
  },
  askPhone: true,
  askOrg: true,
  labels: {
    name: "Nom complet",
    email: "Email",
    phone: "Téléphone / WhatsApp",
    org: "Parcours souhaité ou structure (facultatif)",
    whatsapp:
      "Recevoir aussi les nouvelles sur WhatsApp (facultatif, désinscription à tout moment).",
    consentBefore: "J'accepte de recevoir des messages de U.Psy et j'ai lu la",
    privacy: "politique de confidentialité",
    consentAfter: ". Données protégées par la loi 09-08 (CNDP).",
    noSpam: "Pas de spam. Désinscription en un clic dans chaque message.",
  },
};

export default function CampaignAcademy() {
  return <CampaignLanding config={config} />;
}
