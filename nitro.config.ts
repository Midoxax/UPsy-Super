// Nitro stamps the Cloudflare worker with today's date when none is set, so a
// build made after midnight UTC can ask for a date the pinned wrangler/workerd
// does not know yet ("This Worker requires compatibility date …") and the CI
// browser audit cannot start the server. Pin it; move it forward on purpose,
// together with a wrangler upgrade.
export default {
  compatibilityDate: "2026-10-30",
};
