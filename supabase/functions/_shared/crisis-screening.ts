export type RiskLevel = "low" | "moderate" | "high";

// Matching ignores case and diacritics (accents, Arabic harakat and hamza
// seats), so "désespéré", "desespere" and "أنتحر"/"انتحر" all match.
// Keywords are the only screen, so they lean towards recall: a false alarm
// shows emergency resources once per session; a miss shows nothing.
export const HIGH_RISK_KEYWORDS = [
  // English
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "take my life",
  "want to die",
  "better off dead",
  "self harm",
  "self-harm",
  "hurt myself",
  "cut myself",
  // French
  "me suicider",
  "me tuer",
  "en finir",
  "mourir",
  "me faire du mal",
  "me scarifier",
  "automutilation",
  "plus envie de vivre",
  // Arabic
  "أنتحر",
  "انتحار",
  "أقتل نفسي",
  "أريد أن أموت",
  // Darija (Arabic script and Latin)
  "بغيت نموت",
  "نقتل راسي",
  "bghit nmout",
  "nqtel rasi",
];

export const MODERATE_KEYWORDS = [
  "hopeless",
  "worthless",
  "no reason to live",
  "burden",
  "sans espoir",
  "fardeau",
  "désespéré",
  "ma vie n'a pas de sens",
  "disparaître",
  "لا أمل",
  "يائس",
];

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

const HIGH = HIGH_RISK_KEYWORDS.map(fold);
const MODERATE = MODERATE_KEYWORDS.map(fold);

export function keywordScreen(text: string): RiskLevel {
  const t = fold(text);
  if (HIGH.some((k) => t.includes(k))) return "high";
  if (MODERATE.some((k) => t.includes(k))) return "moderate";
  return "low";
}
