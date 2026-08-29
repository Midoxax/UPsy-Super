// Behavioral nudge engine — purely client-side, never guilt-inducing.
// All dismissal flags live in localStorage. No PHI is stored.

export type NudgeType = "low_mood" | "missing_checkin" | "streak_milestone";

export interface Nudge {
  id: string;
  type: NudgeType;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  tone: "supportive" | "celebratory" | "gentle";
}

interface MoodSample {
  mood_score: number;
  recorded_at: string;
}

const DISMISS_PREFIX = "upsy:nudge:dismiss:";

export function isDismissed(id: string): boolean {
  try {
    const v = localStorage.getItem(DISMISS_PREFIX + id);
    if (!v) return false;
    const ts = parseInt(v, 10);
    // dismissals expire after 7 days
    return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function dismiss(id: string) {
  try {
    localStorage.setItem(DISMISS_PREFIX + id, Date.now().toString());
  } catch {
    /* noop */
  }
}

function daysBetween(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));
}

export function evaluateNudges(moodEntries: MoodSample[]): Nudge[] {
  const nudges: Nudge[] = [];
  const now = new Date();

  // Sort newest first defensively
  const sorted = [...moodEntries].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );

  // 1. Low mood — last 3 entries all <= 2
  const last3 = sorted.slice(0, 3);
  if (last3.length === 3 && last3.every((e) => e.mood_score <= 2)) {
    nudges.push({
      id: "low_mood_3",
      type: "low_mood",
      title: "We notice things have been heavy",
      body: "If you'd like, a brief conversation with a specialist could help.",
      cta: { label: "Find support", href: "/get-matched" },
      tone: "supportive",
    });
  }

  // 2. Missing check-in — no entry in 4+ days
  if (sorted.length === 0 || daysBetween(now, new Date(sorted[0].recorded_at)) >= 4) {
    nudges.push({
      id: "missing_checkin_4d",
      type: "missing_checkin",
      title: "A quick check-in?",
      body: "It only takes 5 seconds and helps you notice patterns.",
      tone: "gentle",
    });
  }

  // 3. Streak milestone — 7 unique consecutive days
  const days = new Set(
    sorted.map((e) => new Date(e.recorded_at).toDateString())
  );
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else if (i > 0) break;
  }
  if (streak >= 7 && streak % 7 === 0) {
    nudges.push({
      id: `streak_${streak}`,
      type: "streak_milestone",
      title: `${streak}-day streak 🎉`,
      body: "Consistency is the practice. Well done.",
      tone: "celebratory",
    });
  }

  return nudges.filter((n) => !isDismissed(n.id));
}
