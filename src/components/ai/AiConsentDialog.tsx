import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useAiConsent } from "@/hooks/useAiConsent";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { AI_CONSENT_COPY } from "@/components/ai/aiConsentCopy";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once consent is saved. */
  onAgreed?: () => void;
}

export default function AiConsentDialog({
  open,
  onOpenChange,
  onAgreed,
}: Props) {
  const { locale } = useLocale();
  const c =
    AI_CONSENT_COPY[locale as keyof typeof AI_CONSENT_COPY] ??
    AI_CONSENT_COPY.en;
  const { grant } = useAiConsent();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const agree = async () => {
    setSaving(true);
    setFailed(false);
    const { error } = await grant();
    setSaving(false);
    if (error) {
      setFailed(true);
      return;
    }
    onOpenChange(false);
    onAgreed?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.intro}</DialogDescription>
        </DialogHeader>
        <ul className="list-disc ps-5 space-y-1.5 text-sm text-muted-foreground">
          {c.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <a
          href={addLocalePrefix("/privacy", locale)}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary underline underline-offset-2"
        >
          {c.privacy}
        </a>
        <div className="flex items-start gap-2 rounded-md border p-3">
          <Checkbox
            id="ai-consent"
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            className="mt-0.5"
          />
          <Label htmlFor="ai-consent" className="text-sm leading-snug">
            {c.checkbox}
          </Label>
        </div>
        {failed && (
          <p role="alert" className="text-sm text-destructive">
            {c.failed}
          </p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button onClick={agree} disabled={!checked || saving}>
            {saving && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {c.agree}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
