// First-touch attribution: what brought this visitor the first time (a
// social post, the newsletter, a campaign link). Captured once on arrival,
// kept in localStorage, and sent with every form, signup and newsletter
// subscription so the CRM can tell which content produces contacts.

const KEY = "upsy_first_touch";
const PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "ref",
] as const;

export type FirstTouch = Partial<Record<(typeof PARAMS)[number], string>> & {
  landing?: string;
  referrer?: string;
  at?: string;
};

/** Records the first visit; later visits never overwrite it. */
export function captureFirstTouch(): void {
  try {
    if (localStorage.getItem(KEY)) return;
    const q = new URLSearchParams(window.location.search);
    const t: FirstTouch = {
      landing: window.location.pathname,
      at: new Date().toISOString(),
    };
    for (const p of PARAMS) {
      const v = q.get(p);
      if (v) t[p] = v.slice(0, 100);
    }
    const ref = document.referrer;
    if (ref && !ref.startsWith(window.location.origin))
      t.referrer = ref.slice(0, 200);
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {
    // Storage blocked (private mode): attribution is best effort.
  }
}

export function getFirstTouch(): FirstTouch {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as FirstTouch;
  } catch {
    return {};
  }
}
