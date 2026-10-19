// Publisher facts, from the auto-entrepreneur registration certificate
// (ref. AE-260514-218504). One place, so every legal page agrees.
export const COMPANY = {
  name: "Mehdi Felji",
  email: "contact@upsy.ma",
  // Phone and WhatsApp, the same everywhere on the site.
  phone: "+212 668-594699",
  phoneHref: "tel:+212668594699",
  whatsappHref: "https://wa.me/212668594699",
  autoEntrepreneurId: "001874601000082",
  taxId: "20730050",
  professionalTaxNo: "30354610",
  address: [
    "Angle Avenue Chefchaouni et Allée des Jasmins",
    "Résidence des Champs, Imm. 1, Appt. 9",
    "20000 Aïn Sebaâ, Casablanca, Maroc",
  ],
} as const;

// Official accounts: the footer, the contact page and the structured data
// (schema.org sameAs) all read from here.
export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/company/upsy-ma/",
  instagram: "https://www.instagram.com/upsy.ma/",
  tiktok: "https://www.tiktok.com/@upsy.ma0",
  youtube: "https://www.youtube.com/@mehdifelji",
} as const;
