// Recovery from a deploy that replaced the JS files an open tab still needs.
//
// Each deploy swaps the content-hashed chunks, so a tab opened before it asks
// for files that are gone. A full reload fixes it. The guard used to be "once
// per session", which left a tab stuck from the second deploy onwards (there
// can be several a day); now it only refuses a second reload within a minute,
// which still stops a loop if the reload itself does not help.

const WINDOW_MS = 60_000;

export function reloadOnce(key: string, now = Date.now()): boolean {
  const k = `upsy:reload:${key}`;
  try {
    const last = Number(sessionStorage.getItem(k) ?? 0);
    if (now - last < WINDOW_MS) return false;
    sessionStorage.setItem(k, String(now));
  } catch {
    // Storage blocked: reloading is still the right fix, and without storage
    // a loop cannot be ruled out, so do it only for the first failure.
    if ((window as { __upsyReloaded?: boolean }).__upsyReloaded) return false;
    (window as { __upsyReloaded?: boolean }).__upsyReloaded = true;
  }
  window.location.reload();
  return true;
}

/** Errors browsers raise when a lazily imported chunk is missing. */
export function isChunkLoadError(error: unknown): boolean {
  const msg = String((error as { message?: string })?.message ?? error ?? "");
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading (CSS )?chunk [\w-]+ failed|ChunkLoadError|Unable to preload CSS/i.test(
    msg,
  );
}
