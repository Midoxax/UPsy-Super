import CampaignLanding, { CampaignConfig } from "./CampaignLanding";

// Co-branded recruitment for the League of Specialists in Psychological and
// Mental Health (LSSPM). Applications started from here carry source=lsspm,
// which the League's portal counts as its campaign funnel.
const config: CampaignConfig = {
  slug: "lsspm",
  source: "campaign_lsspm",
  audience: "specialist",
  seoTitle: "LSSPM × U.Psy — Rejoignez le réseau des spécialistes accrédités",
  seoDescription:
    "Psychologues membres ou candidats de la Ligue des Spécialistes de la Santé Psychologique et Mentale : déposez votre dossier sur U.Psy, faites-le évaluer par la Ligue et recevez des patients.",
  eyebrow: "LSSPM × U.Psy · Partenariat",
  headline: "Un seul dossier,",
  headlineAccent: "reconnu par la Ligue et par U.Psy.",
  subheadline:
    "Déposez votre dossier professionnel une fois. U.Psy le vérifie, la Ligue l'évalue si vous l'y autorisez, et votre profil accrédité reçoit des demandes de patients partout au Maroc.",
  offerLabel: "Membres et candidats LSSPM · 3 mois sans commission",
  bullets: [
    "Un seul dépôt : diplômes, autorisation d'exercice, inscription, CV",
    "Évaluation par la Ligue, uniquement avec votre accord (révocable)",
    "Profil accrédité visible par les patients, en ligne et au cabinet",
    "Réservations, visio, rappels et paiements gérés par U.Psy",
    "Aucune commission pendant vos 3 premiers mois",
  ],
  proof: [
    { number: "1", label: "Dossier pour deux validations" },
    { number: "48 h", label: "Délai de pré-vérification" },
    { number: "0 %", label: "Commission pendant 3 mois" },
  ],
  primaryCta: { label: "Commencer mon dossier", href: "#" },
  formTitle: "Commencez votre candidature",
  formSubtitle:
    "Laissez vos coordonnées, puis complétez votre dossier en 12 minutes environ.",
  successTitle: "C'est noté 🤝",
  successBody:
    "Continuez maintenant votre dossier. À la dernière étape, cochez le partage avec le comité d'évaluation externe.",
  successCta: {
    label: "Compléter mon dossier",
    href: "/apply/wizard?source=lsspm",
  },
  askPhone: true,
  askOrg: true,
  labels: {
    name: "Nom complet",
    email: "Email",
    phone: "Téléphone / WhatsApp",
    org: "Cabinet / structure (facultatif)",
    whatsapp:
      "Recevoir aussi les nouvelles sur WhatsApp (facultatif, désinscription à tout moment).",
    consentBefore: "J'accepte de recevoir des messages de U.Psy et j'ai lu la",
    privacy: "politique de confidentialité",
    consentAfter: ". Données protégées par la loi 09-08 (CNDP).",
    noSpam: "Pas de spam. Désinscription en un clic dans chaque message.",
  },
};

export default function CampaignLeague() {
  return <CampaignLanding config={config} />;
}
