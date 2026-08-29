import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Locale } from '@/lib/i18n/utils';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

/**
 * The three options were previously copy-pasted blocks styled with absolute
 * palette colours (text-u-white on an assumed dark surface). In light mode that
 * rendered white on #faf8f4 — a 1.06:1 contrast ratio, effectively invisible.
 * Semantic tokens flip with the theme, so one set of classes is correct in both.
 */
const LANGUAGES: ReadonlyArray<{ code: Locale; short: string; name: string }> = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'fr', short: 'FR', name: 'Français' },
  { code: 'ar', short: 'AR', name: 'العربية' },
];

const OPTION_CLASSES =
  // px-2 py-1 keeps the hit area at the 24px WCAG 2.2 minimum; the labels
  // themselves are only ~20px tall.
  'rounded-sm px-2 py-1 transition-colors focus:outline-hidden focus-visible:ring-2 ' +
  'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const LanguageSwitcher = ({ compact = false, className }: LanguageSwitcherProps) => {
  const { locale, setLocale, t } = useLocale();

  const handleSwitch = (newLocale: Locale) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
      toast.success(t('notification.languageUpdated'));
    }
  };

  return (
    <div
      className={cn('flex items-center gap-1', compact ? 'text-xs' : 'text-sm', className)}
      role="group"
      aria-label={t('nav.language') || 'Language'}
    >
      {LANGUAGES.map(({ code, short, name }, index) => (
        <span key={code} className="flex items-center gap-1">
          {index > 0 && (
            <span className="text-muted-foreground/40" aria-hidden="true">
              |
            </span>
          )}
          <button
            type="button"
            onClick={() => handleSwitch(code)}
            className={cn(
              OPTION_CLASSES,
              locale === code
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:text-primary'
            )}
            aria-pressed={locale === code}
            // Named in the target language so a screen reader in any locale
            // announces something the user can act on.
            aria-label={name}
            lang={code}
          >
            {short}
          </button>
        </span>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
