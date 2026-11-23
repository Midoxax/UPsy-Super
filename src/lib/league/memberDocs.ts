import { LEAGUE_NAME } from "./membershipCopy";
import { membershipYears } from "./membershipYears";

export { membershipYears };

/**
 * The League's member documents, generated in the browser (jsPDF, loaded on
 * click): the digital membership card, the attestation of membership and the
 * payment receipt. The card and the attestation carry a QR code pointing to
 * /card/<token>, a public page saying whether the card is genuine and valid.
 *
 * jsPDF's built-in fonts are Latin only: the documents are in French or
 * English; a name typed in Arabic script would not print.
 */

export const LEAGUE_ADDRESS =
  "BD Sebta, Lotissement Belle Vue, app 4, Étage 2, Mohammedia, Maroc";
export const LEAGUE_CONTACT =
  "contact@lsspm.ma · www.lsspm.ma · +212 679 977 957";

/** Card colours of Art. 2: League blue with the category's accent. */
export const CATEGORY_COLORS: Record<string, { accent: string; ink: string }> =
  {
    founder: { accent: "#1f8a4c", ink: "#ffffff" },
    official: { accent: "#ffffff", ink: "#1d4e89" },
    honorary: { accent: "#f28c28", ink: "#ffffff" },
    supporter: { accent: "#f2c230", ink: "#1d4e89" },
  };
export const LEAGUE_BLUE = "#1d4e89";

type Lang = "fr" | "en";

const T = {
  fr: {
    card: "CARTE DE MEMBRE",
    category: {
      founder: "Membre fondateur",
      official: "Membre adhérent",
      honorary: "Membre honoraire",
      supporter: "Membre sympathisant",
    } as Record<string, string>,
    no: "N°",
    validUntil: "Valable jusqu'au",
    scan: "Vérifier : scannez le QR code",
    attestation: "ATTESTATION D'ADHÉSION",
    attestNo: "Attestation n°",
    attestBody: (
      name: string,
      cat: string,
      no: string,
      years: string[],
      confirmed: string,
    ) =>
      `La ${LEAGUE_NAME} (LSSPM) atteste que ${name}, titulaire de la carte de membre n° ${no}, est ${cat.toLowerCase()} de la Ligue ${years.length > 1 ? `pour les années ${years.join(" et ")}` : `pour l'année ${years[0]}`}, son adhésion ayant été validée le ${confirmed} conformément aux statuts et au règlement intérieur de la Ligue.`,
    attestUse:
      "La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.",
    madeAt: (d: string) => `Fait à Mohammedia, le ${d}`,
    president: "Le Président",
    stamp: "Cachet de la Ligue",
    verify: "Authenticité vérifiable en scannant le QR code.",
    receipt: "REÇU DE PAIEMENT",
    receiptNo: "Reçu n°",
    receivedFrom: "Reçu de",
    amount: "Montant",
    method: "Mode de paiement",
    methods: {
      transfer: "Virement bancaire",
      deposit: "Versement bancaire",
      cash: "Espèces",
      cheque: "Chèque",
      card: "Carte bancaire",
    } as Record<string, string>,
    nature: "Objet",
    natures: {
      cotisation: "Cotisation annuelle",
      formation: "Formation",
      don: "Don",
      booklet: "Publication",
    } as Record<string, string>,
    date: "Date",
    member: "Membre n°",
    treasurer: "Le Trésorier",
    register: "Enregistré au registre des recettes de la Ligue (Art. 9).",
  },
  en: {
    card: "MEMBERSHIP CARD",
    category: {
      founder: "Founding member",
      official: "Member",
      honorary: "Honorary member",
      supporter: "Supporting member",
    } as Record<string, string>,
    no: "No.",
    validUntil: "Valid until",
    scan: "Verify: scan the QR code",
    attestation: "CERTIFICATE OF MEMBERSHIP",
    attestNo: "Certificate no.",
    attestBody: (
      name: string,
      cat: string,
      no: string,
      years: string[],
      confirmed: string,
    ) =>
      `The League of Specialists in Psychological and Mental Health (LSSPM) certifies that ${name}, holder of membership card no. ${no}, is a ${cat.toLowerCase()} of the League ${years.length > 1 ? `for the years ${years.join(" and ")}` : `for the year ${years[0]}`}, the membership having been approved on ${confirmed} under the League's statutes and internal rules.`,
    attestUse: "This certificate is issued to the member at their request.",
    madeAt: (d: string) => `Mohammedia, ${d}`,
    president: "The President",
    stamp: "League stamp",
    verify: "Authenticity can be checked by scanning the QR code.",
    receipt: "PAYMENT RECEIPT",
    receiptNo: "Receipt no.",
    receivedFrom: "Received from",
    amount: "Amount",
    method: "Payment method",
    methods: {
      transfer: "Bank transfer",
      deposit: "Bank deposit",
      cash: "Cash",
      cheque: "Cheque",
      card: "Card",
    } as Record<string, string>,
    nature: "For",
    natures: {
      cotisation: "Annual membership fee",
      formation: "Training",
      don: "Donation",
      booklet: "Publication",
    } as Record<string, string>,
    date: "Date",
    member: "Member no.",
    treasurer: "The Treasurer",
    register: "Recorded in the League's register of receipts (Art. 9).",
  },
};

export type MemberDoc = {
  fullName: string;
  memberNumber: string;
  category: string;
  startsOn: string;
  endsOn: string;
  attestationNumber: string | null;
  confirmedAt: string | null;
  verifyToken: string | null;
  /** Signed URL of the member's photo. */
  photoUrl: string | null;
};

export type ReceiptDoc = {
  receiptNumber: string;
  paidAt: string;
  payer: string;
  memberNumber: string | null;
  amount: number;
  method: string;
  nature: string;
  year: string;
};

export const verifyUrl = (token: string) =>
  `${typeof window !== "undefined" ? window.location.origin : "https://upsy.ma"}/card/${token}`;

const fmt = (d: string | null, lang: Lang) =>
  d
    ? new Date(d).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

/** Any image URL → a JPEG data URL (square-cropped when `square`). */
async function imageData(url: string, square = false, png = false) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await img.decode();
  const s = square ? Math.min(img.naturalWidth, img.naturalHeight) : 0;
  const w = square ? 400 : img.naturalWidth;
  const h = square ? 400 : img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  if (!png) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  if (square)
    ctx.drawImage(
      img,
      (img.naturalWidth - s) / 2,
      (img.naturalHeight - s) / 2,
      s,
      s,
      0,
      0,
      w,
      h,
    );
  else ctx.drawImage(img, 0, 0);
  return c.toDataURL(png ? "image/png" : "image/jpeg", 0.9);
}

async function qr(text: string) {
  const { toDataURL } = await import("qrcode");
  return toDataURL(text, { margin: 1, width: 300, errorCorrectionLevel: "M" });
}

const hex = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

async function pdf(orientation: "p" | "l", format: string | number[]) {
  const { default: jsPDF } = await import("jspdf");
  return new jsPDF({ orientation, unit: "mm", format });
}

const logo = () => imageData("/brand/lsspm-logo.png", false, true);

/** The card at ID-1 size (85.6 × 54 mm), front only. */
export async function downloadCardPdf(d: MemberDoc, lang: Lang) {
  const t = T[lang];
  const c = CATEGORY_COLORS[d.category] ?? CATEGORY_COLORS.official;
  const doc = await pdf("l", [85.6, 54]);
  doc.setFillColor(...hex(LEAGUE_BLUE));
  doc.rect(0, 0, 85.6, 54, "F");
  // Category band along the bottom.
  doc.setFillColor(...hex(c.accent));
  doc.rect(0, 44, 85.6, 10, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(8.5, 8.5, 6.2, "F");
  doc.addImage(await logo(), "PNG", 3, 3, 11, 11);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.text("LIGUE DES SPÉCIALISTES DE LA SANTÉ", 16, 7);
  doc.text("PSYCHIQUE ET MENTALE — LSSPM", 16, 10);
  doc.setFontSize(5);
  doc.setFont("helvetica", "normal");
  doc.text(t.card, 16, 13.2);
  if (d.photoUrl) {
    doc.addImage(await imageData(d.photoUrl, true), "JPEG", 3, 17, 20, 25);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(doc.splitTextToSize(d.fullName, 36), 25, 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text(`${t.no} ${d.memberNumber}`, 25, 31);
  doc.text(`${t.validUntil} ${fmt(d.endsOn, lang)}`, 25, 35);
  if (d.verifyToken)
    doc.addImage(await qr(verifyUrl(d.verifyToken)), "PNG", 63, 18, 20, 20);
  doc.setTextColor(...hex(c.ink));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text((t.category[d.category] ?? d.category).toUpperCase(), 3, 50.2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.5);
  doc.text(t.scan, 82.6, 50.2, { align: "right" });
  doc.save(`carte-lsspm-${d.memberNumber}.pdf`);
}

function letterhead(doc: Awaited<ReturnType<typeof pdf>>, logoData: string) {
  doc.addImage(logoData, "PNG", 15, 12, 22, 22);
  doc.setTextColor(...hex(LEAGUE_BLUE));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("LIGUE DES SPÉCIALISTES DE LA SANTÉ", 42, 20);
  doc.text("PSYCHIQUE ET MENTALE", 42, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(LEAGUE_ADDRESS, 42, 31);
  doc.text(LEAGUE_CONTACT, 42, 35);
  doc.setDrawColor(...hex(LEAGUE_BLUE));
  doc.setLineWidth(0.6);
  doc.line(15, 40, 195, 40);
}

/** A4 attestation of membership, with photo and QR. */
export async function downloadAttestationPdf(d: MemberDoc, lang: Lang) {
  const t = T[lang];
  const doc = await pdf("p", "a4");
  letterhead(doc, await logo());
  if (d.photoUrl)
    doc.addImage(await imageData(d.photoUrl, true), "JPEG", 160, 48, 32, 40);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(t.attestation, 15, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${t.attestNo} ${d.attestationNumber ?? "—"}`, 15, 70);
  const cat = t.category[d.category] ?? d.category;
  const years = membershipYears(d.startsOn, d.endsOn);
  doc.setFontSize(12);
  const body = doc.splitTextToSize(
    t.attestBody(
      d.fullName,
      cat,
      d.memberNumber,
      years,
      fmt(d.confirmedAt ?? d.startsOn, lang),
    ),
    180,
  );
  doc.text(body, 15, 105, { lineHeightFactor: 1.6 });
  const y = 105 + body.length * 7.5 + 8;
  doc.text(`${t.validUntil} ${fmt(d.endsOn, lang)}.`, 15, y);
  doc.text(doc.splitTextToSize(t.attestUse, 180), 15, y + 10);
  doc.text(t.madeAt(fmt(new Date().toISOString(), lang)), 195, y + 32, {
    align: "right",
  });
  doc.setFont("helvetica", "bold");
  doc.text(t.president, 195, y + 42, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(t.stamp, 195, y + 70, { align: "right" });
  if (d.verifyToken) {
    doc.addImage(await qr(verifyUrl(d.verifyToken)), "PNG", 15, 245, 28, 28);
    doc.text(t.verify, 46, 260);
  }
  doc.save(`attestation-lsspm-${d.memberNumber}.pdf`);
}

/** A4 receipt for one payment (Art. 9). */
export async function downloadReceiptPdf(r: ReceiptDoc, lang: Lang) {
  const t = T[lang];
  const doc = await pdf("p", "a4");
  letterhead(doc, await logo());
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(t.receipt, 15, 58);
  doc.setFontSize(11);
  doc.text(`${t.receiptNo} ${r.receiptNumber}`, 15, 66);
  const rows: [string, string][] = [
    [t.date, fmt(r.paidAt, lang)],
    [t.receivedFrom, r.payer],
    ...(r.memberNumber
      ? ([[t.member, r.memberNumber]] as [string, string][])
      : []),
    [t.nature, `${t.natures[r.nature] ?? r.nature} ${r.year}`],
    [t.amount, `${r.amount.toLocaleString("fr-FR")} MAD`],
    [t.method, t.methods[r.method] ?? r.method],
  ];
  let y = 82;
  doc.setFontSize(11);
  for (const [k, v] of rows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(k, 15, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(v, 70, y);
    y += 9;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(t.register, 15, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.text(t.treasurer, 195, y + 26, { align: "right" });
  doc.save(`recu-lsspm-${r.receiptNumber}.pdf`);
}
