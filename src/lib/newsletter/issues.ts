import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** A sent issue, as newsletter_archive returns it. */
export type Issue = {
  period: string;
  intro_fr: string | null;
  intro_en: string | null;
  items: unknown;
  sent_at: string | null;
};

export type IssueArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readMinutes: number;
  /** Site path, e.g. /fr/blog/slug. */
  path: string;
  image: string | null;
};

type L2 = { en?: string; fr?: string };
type FeedItem = {
  slug: string;
  title: L2;
  description: L2;
  category: L2;
  url: L2;
  readMinutes?: number;
  image?: string | null;
};

const pathOf = (u: string) => {
  try {
    return new URL(u).pathname;
  } catch {
    return u;
  }
};

/** The issue's articles in the reader's language (Arabic reads French, as in the email). */
export function issueArticles(issue: Issue, locale: string): IssueArticle[] {
  const k = locale === "en" ? "en" : "fr";
  const items = Array.isArray(issue.items) ? (issue.items as FeedItem[]) : [];
  return items.map((it) => ({
    slug: it.slug,
    title: it.title?.[k] ?? it.title?.fr ?? "",
    description: it.description?.[k] ?? it.description?.fr ?? "",
    category: it.category?.[k] ?? it.category?.fr ?? "",
    readMinutes: it.readMinutes ?? 5,
    path: pathOf(it.url?.[k] ?? it.url?.fr ?? "/blog"),
    image: it.image ?? null,
  }));
}

export const issueIntro = (issue: Issue, locale: string) =>
  (locale === "en" ? issue.intro_en : issue.intro_fr) ?? null;

export function useNewsletterArchive() {
  return useQuery({
    queryKey: ["newsletter-archive"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("newsletter_archive", {
        _limit: 36,
      });
      if (error) throw error;
      return (data ?? []) as Issue[];
    },
    staleTime: 10 * 60_000,
  });
}
