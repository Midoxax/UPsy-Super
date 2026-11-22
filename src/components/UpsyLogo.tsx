import wordmark from "@/assets/upsy-wordmark.webp";
import lsspm from "@/assets/lsspm-logo.webp";
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

/** The LSSPM emblem followed by its name, for inline use in short text. */
export function LsspmMark({ className }: { className?: string }) {
  return (
    <span className="inline-flex items-center gap-[0.25em] whitespace-nowrap align-[-0.2em]">
      <img
        src={lsspm}
        alt=""
        width={256}
        height={256}
        className={cn("inline-block h-[1.35em] w-auto", className)}
        draggable={false}
      />
      LSSPM
    </span>
  );
}

/** Short brand text with every "U.Psy" shown as the wordmark and every
 *  "LSSPM" with the League's emblem, e.g. a badge "LSSPM × U.Psy" or a
 *  heading "Install the U.Psy app". Not for long paragraphs, where the plain
 *  names read better. `className` sizes the U.Psy wordmark. */
export function withLogo(text: string, className?: string) {
  return text
    .split(/(U\.Psy|LSSPM)/)
    .filter(Boolean)
    .map((p, i) =>
      p === "U.Psy" ? (
        <UpsyLogo key={i} className={className} />
      ) : p === "LSSPM" ? (
        <LsspmMark key={i} />
      ) : (
        p
      ),
    );
}
