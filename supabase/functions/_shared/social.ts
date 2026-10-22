// Posting to the U.Psy company accounts. Each network is configured by
// function secrets; a missing secret means "not set up yet", not an error.
//
//   LinkedIn  LINKEDIN_ORG_ID (numeric company id), LINKEDIN_TOKEN
//             (member token with w_organization_social, from an app approved
//             for the Community Management API), LINKEDIN_API_VERSION (YYYYMM)
//   Facebook  META_PAGE_ID, META_PAGE_TOKEN (long-lived Page token)
//   Instagram META_IG_USER_ID (Instagram business account linked to the Page);
//             uses META_PAGE_TOKEN
const GRAPH = "https://graph.facebook.com/v21.0";

export type Network = "linkedin" | "facebook" | "instagram";

export function configured(n: Network): boolean {
  const has = (k: string) => !!Deno.env.get(k);
  if (n === "linkedin") return has("LINKEDIN_ORG_ID") && has("LINKEDIN_TOKEN");
  if (n === "facebook") return has("META_PAGE_ID") && has("META_PAGE_TOKEN");
  return has("META_IG_USER_ID") && has("META_PAGE_TOKEN");
}

export interface PostInput {
  caption: string;
  link: string;
  image_url: string | null;
  title?: string;
  description?: string;
}

async function json(res: Response) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      body?.error?.message ??
      body?.message ??
      JSON.stringify(body).slice(0, 300);
    throw new Error(`${res.status} ${msg}`);
  }
  return body;
}

export async function publish(n: Network, p: PostInput): Promise<string> {
  if (n === "facebook") {
    const body = await json(
      await fetch(`${GRAPH}/${Deno.env.get("META_PAGE_ID")}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: p.caption,
          link: p.link,
          access_token: Deno.env.get("META_PAGE_TOKEN"),
        }),
      }),
    );
    return body.id;
  }

  if (n === "instagram") {
    if (!p.image_url) throw new Error("Instagram needs an image");
    const ig = Deno.env.get("META_IG_USER_ID");
    const token = Deno.env.get("META_PAGE_TOKEN");
    const container = await json(
      await fetch(`${GRAPH}/${ig}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: p.image_url,
          caption: p.caption,
          access_token: token,
        }),
      }),
    );
    // The container is processed asynchronously; publishing too early fails.
    for (let i = 0; i < 10; i++) {
      const s = await json(
        await fetch(
          `${GRAPH}/${container.id}?fields=status_code&access_token=${token}`,
        ),
      );
      if (s.status_code === "FINISHED") break;
      if (s.status_code === "ERROR")
        throw new Error("Instagram could not process the image");
      await new Promise((r) => setTimeout(r, 2000));
    }
    const done = await json(
      await fetch(`${GRAPH}/${ig}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: token,
        }),
      }),
    );
    return done.id;
  }

  // LinkedIn: an article share on the company page.
  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("LINKEDIN_TOKEN")}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": Deno.env.get("LINKEDIN_API_VERSION") ?? "202509",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:organization:${Deno.env.get("LINKEDIN_ORG_ID")}`,
      commentary: p.caption,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        article: {
          source: p.link,
          title: p.title ?? "",
          description: p.description ?? "",
        },
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${body.slice(0, 300)}`);
  }
  // The post URN comes back in a header, not the body.
  return (
    res.headers.get("x-restli-id") ?? res.headers.get("x-linkedin-id") ?? "ok"
  );
}

/** Caption for a blog post, in French (the accounts' language). */
export function caption(
  n: Network,
  it: { title: string; description: string; category: string; url: string },
): string {
  const tags = ["#SantéMentale", "#Psychologie", "#Maroc", "#UPsy"];
  if (/sport/i.test(it.category))
    tags.unshift("#PsychologieDuSport", "#PerformanceMentale");
  if (n === "instagram") {
    return `${it.title}\n\n${it.description}\n\n🔗 Article complet : lien en bio (upsy.ma/blog)\n\n${tags.join(" ")}`;
  }
  return `${it.title}\n\n${it.description}\n\n👉 ${it.url}\n\n${tags.join(" ")}`;
}
