/** Lesson Markdown: formatting renders and site links keep the locale. */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import LessonMarkdown from "@/components/academy/LessonMarkdown";

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ locale: "fr" }),
}));
vi.mock("@/lib/router-compat", () => ({
  Link: ({ to, children, ...p }: { to: string; children: ReactNode }) => (
    <a href={to} {...p}>
      {children}
    </a>
  ),
}));

describe("LessonMarkdown", () => {
  it("renders lists and bold, and prefixes internal links with the locale", () => {
    render(
      <LessonMarkdown>
        {
          "**Exercice.** Voir la [fiche](/resources/box-breathing).\n\n- un\n- deux\n\n[Ext](https://who.int)"
        }
      </LessonMarkdown>,
    );
    expect(screen.getByText("Exercice.").tagName).toBe("STRONG");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("fiche").getAttribute("href")).toBe(
      "/fr/resources/box-breathing",
    );
    const ext = screen.getByText("Ext");
    expect(ext.getAttribute("target")).toBe("_blank");
    expect(ext.getAttribute("rel")).toContain("noopener");
  });
});
