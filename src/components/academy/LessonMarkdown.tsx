import ReactMarkdown, { type Components } from "react-markdown";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";

/** Renders a lesson written in Markdown; site links keep the reader's locale. */
export default function LessonMarkdown({ children }: { children: string }) {
  const { locale } = useLocale();
  const components: Components = {
    p: ({ children }) => (
      <p className="leading-relaxed text-foreground/90">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc ps-6 space-y-1.5">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal ps-6 space-y-1.5">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    a: ({ href = "", children }) =>
      href.startsWith("/") ? (
        <Link
          to={addLocalePrefix(href, locale)}
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          {children}
        </Link>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2"
        >
          {children}
        </a>
      ),
  };
  return (
    <div className="space-y-4 text-[15px]">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
