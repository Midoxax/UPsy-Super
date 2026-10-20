/**
 * A booking choice made before sign-up, kept across the email-confirmation
 * round trip. The confirmation link usually opens in a NEW tab, which has its
 * own sessionStorage, so this lives in localStorage instead — with a TTL so a
 * choice abandoned days ago doesn't resurface out of nowhere.
 */
export const PENDING_BOOKING_TTL_MS = 24 * 60 * 60 * 1000;

type Stored<T> = { savedAt: number; data: T };

export const savePendingBooking = <T>(key: string, data: T): void => {
  try {
    const payload: Stored<T> = { savedAt: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    /* private mode / quota — the user just re-picks their slot */
  }
};

export const clearPendingBooking = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export const loadPendingBooking = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored<T>>;
    if (
      typeof parsed.savedAt !== "number" ||
      Date.now() - parsed.savedAt > PENDING_BOOKING_TTL_MS ||
      parsed.data === undefined
    ) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    clearPendingBooking(key);
    return null;
  }
};
