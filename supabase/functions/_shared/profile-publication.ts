// Publish on approval (20261126150000_publish_on_approval.sql): prepares an
// approved psychologist's profile from their application and returns the
// one-click link they publish it with. Used at approval
// (provision-psychologist) and by the admin resend (send-publish-link).
import { SITE_URL } from "./site.ts";

const token = () => {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
};

/** The publication link for a psychologist, or null when their profile is
 *  already published or does not exist. */
/** The two client methods used, typed loosely so both client builds
 *  (npm: and esm.sh, whose classes TypeScript sees as distinct) fit. */
interface Db {
  rpc(fn: string, args: Record<string, unknown>): PromiseLike<unknown>;
  // deno-lint-ignore no-explicit-any
  from(table: string): any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function preparePublication(
  db: Db,
  userId: string,
  locale: string | null | undefined,
): Promise<string | null> {
  await db.rpc("psychologist_prefill_from_application", { _psy: userId });

  const { data: p } = await db
    .from("psychologist_profiles")
    .select("is_published, publish_token")
    .eq("id", userId)
    .maybeSingle();
  if (!p || p.is_published) return null;

  let t = p.publish_token as string | null;
  if (!t) {
    t = token();
    const { error } = await db
      .from("psychologist_profiles")
      .update({ publish_token: t })
      .eq("id", userId)
      .is("publish_token", null);
    if (error) return null;
    const { data: again } = await db
      .from("psychologist_profiles")
      .select("publish_token")
      .eq("id", userId)
      .maybeSingle();
    t = (again?.publish_token as string | null) ?? null;
    if (!t) return null;
  }
  const l = locale === "ar" || locale === "en" ? locale : "fr";
  return `${SITE_URL}/${l}/publish-profile?t=${t}`;
}
