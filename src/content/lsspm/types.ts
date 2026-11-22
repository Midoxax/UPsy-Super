/** A legal text: titled parts, chapters, numbered articles. */
export type Article = { n: number; title: string; body: string[] };
export type Chapter = { title: string; articles: Article[] };
export type Part = { title: string; chapters: Chapter[] };
export type LegalText = {
  title: string;
  subtitle: string;
  notice: string;
  meta: string[];
  preamble: string[];
  parts: Part[];
  closing: string[];
};

/** A numbered commitment (honour declaration, confidentiality, charter). */
export type Commitment = {
  title: string;
  intro: string;
  fields?: string[];
  items: string[];
  closing: string[];
  notice?: string;
};
