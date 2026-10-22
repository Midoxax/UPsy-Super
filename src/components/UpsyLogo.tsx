import wordmark from "@/assets/upsy-wordmark.webp";
import { cn } from "@/lib/utils";

/**
 * The U.Psy wordmark, used wherever the brand name stands on its own
 * (header, footer, headings, badges). Sized by height: `h-[1em]` follows the
 * surrounding text, so it can sit inside a heading in place of the name.
 * Screen readers and search engines read "U.Psy".
 */
export default function UpsyLogo({
  className,
  decorative = false,
}: {
  className?: string;
  /** True when the brand name is already spoken nearby (e.g. a link label). */
  decorative?: boolean;
}) {
  return (
    <img
      src={wordmark}
      alt={decorative ? "" : "U.Psy"}
      width={360}
      height={177}
      className={cn("inline-block h-[1em] w-auto align-[-0.12em]", className)}
      draggable={false}
    />
  );
}

/** Short brand text with every "U.Psy" shown as the wordmark, e.g. a badge
 *  "LSSPM × U.Psy" or a heading "Install the U.Psy app". Not for long
 *  paragraphs, where the plain name reads better. */
export function withLogo(text: string, className?: string) {
  const parts = text.split("U.Psy");
  return parts.flatMap((p, i) =>
    i === 0 ? [p] : [<UpsyLogo key={i} className={className} />, p],
  );
}
