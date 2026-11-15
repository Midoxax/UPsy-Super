/**
 * Free self-score analytics — the only place its events are shaped.
 *
 * The self-score asks about focus, emotions, recovery and meaning. Its
 * answers and results describe someone's state of mind, so they are treated
 * like the rest of the product treats clinical data: they stay in U.Psy's
 * own database and never travel to a third party.
 *
 * What may leave the page:
 * - to the tag manager (which can feed advertising tools): that the quiz was
 *   started, how far the visitor got, and that it was submitted. No answer,
 *   no score, no pillar.
 * - to product analytics: the same, plus the overall band, so conversion can
 *   be compared between bands without holding anyone's detailed result.
 *
 * Every payload is built here so a test can hold the rule. Adding a field
 * means adding it to ALLOWED_KEYS below and saying why in the pull request.
 */
import { captureEvent } from "./posthog";
import { pushDataLayer } from "./gtm";

const QUIZ_ID = "mental_performance_score";
const PAGE_PATH = "/free-score";

export type FreeScoreBand = "strong" | "balanced" | "strained" | "heavy_load";

/** Same thresholds the results screen uses for its band label. */
export function freeScoreBand(total: number): FreeScoreBand {
  if (total >= 75) return "strong";
  if (total >= 55) return "balanced";
  if (total >= 35) return "strained";
  return "heavy_load";
}

/** The complete set of property names these events may carry. */
export const ALLOWED_KEYS = [
  "event",
  "quiz_id",
  "total_questions",
  "question_index",
  "consent_marketing",
  "locale",
  "page_path",
  "band",
] as const;

export function trackQuizStart(totalQuestions: number, locale: string): void {
  pushDataLayer({
    event: "quiz_start",
    quiz_id: QUIZ_ID,
    total_questions: totalQuestions,
    locale,
    page_path: PAGE_PATH,
  });
}

/** Progress only: which question number was answered, never what was said. */
export function trackQuizAnswer(
  questionIndex: number,
  totalQuestions: number,
  locale: string,
): void {
  pushDataLayer({
    event: "quiz_answer",
    quiz_id: QUIZ_ID,
    question_index: questionIndex,
    total_questions: totalQuestions,
    locale,
    page_path: PAGE_PATH,
  });
}

export function trackQuizSubmit(
  total: number,
  consentMarketing: boolean,
  locale: string,
): void {
  captureEvent("free_score_completed", { band: freeScoreBand(total), locale });
  pushDataLayer({
    event: "quiz_submit",
    quiz_id: QUIZ_ID,
    consent_marketing: consentMarketing,
    locale,
    page_path: PAGE_PATH,
  });
}

/** A click on a pillar row or on the main call to action of the results. */
export function trackResultClick(
  target: "pillar" | "match",
  total: number,
): void {
  captureEvent(
    target === "pillar" ? "free_score_pillar_click" : "free_score_cta_match",
    { band: freeScoreBand(total) },
  );
}
