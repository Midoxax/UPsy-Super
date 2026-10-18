export type RiskLevel = "low" | "moderate" | "high";
export type ScreeningResult = RiskLevel | "unavailable";

export const HIGH_RISK_KEYWORDS = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "self harm",
  "self-harm",
  "me suicider",
  "me tuer",
  "en finir",
  "mourir",
  "automutilation",
  "أنتحر",
  "أقتل نفسي",
];

export const MODERATE_KEYWORDS = [
  "hopeless",
  "worthless",
  "no reason to live",
  "burden",
  "sans espoir",
  "fardeau",
  "désespéré",
];

export function keywordScreen(text: string): RiskLevel {
  const lower = text.toLowerCase();
  if (HIGH_RISK_KEYWORDS.some((k) => lower.includes(k))) return "high";
  if (MODERATE_KEYWORDS.some((k) => lower.includes(k))) return "moderate";
  return "low";
}

export function mergeRisk(ai: RiskLevel, keyword: RiskLevel): RiskLevel {
  const order: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2 };
  return order[ai] >= order[keyword] ? ai : keyword;
}

/**
 * Final screening result from the keyword screen and the AI classifier.
 *
 * `ai` is null when the classifier could not answer (no key, HTTP error,
 * network failure, unrecognised output). Never report "low" on that basis:
 * a keyword hit still stands, and otherwise the result is "unavailable".
 */
export function resolveRisk(
  ai: RiskLevel | null,
  keyword: RiskLevel,
): ScreeningResult {
  if (ai === null) return keyword === "low" ? "unavailable" : keyword;
  return mergeRisk(ai, keyword);
}
