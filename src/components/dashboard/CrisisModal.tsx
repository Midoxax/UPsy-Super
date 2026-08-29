import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Heart, AlertTriangle } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  riskLevel?: "low" | "moderate" | "high";
}

const RESOURCES = [
  { name: "SOS Amitié Maroc", phone: "0801 000 180", available: "24/7" },
  { name: "Stop Silence", phone: "0801 002 002", available: "24/7" },
  { name: "SAMU", phone: "141", available: "24/7 emergency" },
];

export default function CrisisModal({ open, onOpenChange, riskLevel = "moderate" }: Props) {
  const { t } = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
            <Heart className="w-6 h-6 text-destructive" />
          </div>
          <DialogTitle className="text-xl">
            {t("crisis.title") || "You're not alone"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed pt-2">
            {t("crisis.message") ||
              "What you're feeling matters. Talking to someone right now can help. These free, confidential lines are staffed by trained professionals."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 py-2">
          {RESOURCES.map((r) => (
            <a
              key={r.phone}
              href={`tel:${r.phone.replace(/\s/g, "")}`}
              className="flex items-center justify-between p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.available}</p>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Phone className="w-4 h-4" />
                {r.phone}
              </div>
            </a>
          ))}
        </div>

        <div className="rounded-xl bg-muted/30 p-3 flex gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            {t("crisis.disclaimer") ||
              "U.Psy does not replace urgent professional care. If you're in immediate danger, call SAMU 141."}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button variant="primary" asChild>
            <Link to="/get-matched?intent=crisis" onClick={() => onOpenChange(false)}>
              {t("crisis.findSpecialist") || "Find a specialist now"}
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("crisis.close") || "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
