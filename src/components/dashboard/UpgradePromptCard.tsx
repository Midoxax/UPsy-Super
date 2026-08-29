import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { Link } from "@/lib/router-compat";

interface Props {
  title: string;
  description: string;
  requiredPlan: "Pro" | "Elite";
  compact?: boolean;
}

export const UpgradePromptCard = ({ title, description, requiredPlan, compact }: Props) => {
  return (
    <Card
      className={`relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3 w-3" />
          {requiredPlan}
        </span>
      </div>
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          <Button asChild size="sm" className="mt-1">
            <Link to="/my-space?tab=plans">Upgrade to {requiredPlan}</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
