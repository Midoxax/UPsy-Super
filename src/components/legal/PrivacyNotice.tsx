import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { cn } from "@/lib/utils";

/**
 * The line every form that collects personal data carries (Law 09-08 art. 5:
 * people are told, when their data is collected, what it is for and where
 * their rights are explained).
 */
const COPY = {
  en: {
    before: "We use what you send only to answer you. ",
    link: "Privacy policy",
    after: "",
  },
  fr: {
    before:
      "Nous utilisons ce que vous envoyez uniquement pour vous répondre. ",
    link: "Politique de confidentialité",
    after: "",
  },
  ar: {
    before: "نستعمل ما ترسله فقط للرد عليك. ",
    link: "سياسة الخصوصية",
    after: "",
  },
};

export function PrivacyNotice({
  purpose,
  className,
}: {
  /** Overrides the default "to answer you" purpose sentence. */
  purpose?: Partial<Record<"en" | "fr" | "ar", string>>;
  className?: string;
}) {
  const { locale } = useLocale();
  const key = (locale in COPY ? locale : "en") as keyof typeof COPY;
  const c = COPY[key];
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      {purpose?.[key] ?? c.before}
      <Link
        to={addLocalePrefix("/privacy", locale)}
        className="underline underline-offset-2 hover:text-foreground"
      >
        {c.link}
      </Link>
      {c.after}
    </p>
  );
}

export default PrivacyNotice;
