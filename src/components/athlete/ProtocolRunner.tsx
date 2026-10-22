import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Protocol } from "@/hooks/useAthleteHub";

import { useHubCopy, protocolText } from "@/components/athlete/copy";

interface Props {
  protocol: Protocol | null;
  onOpenChange: (o: boolean) => void;
  onComplete: (
    protocolId: string,
    durationMinutes: number,
    rating?: number,
  ) => Promise<{ error: any }>;
}

export default function ProtocolRunner({
  protocol,
  onOpenChange,
  onComplete,
}: Props) {
  const c = useHubCopy();
  const [done, setDone] = useState<Set<number>>(new Set());
  const [rating, setRating] = useState<number | null>(null);
  const open = !!protocol;
  const text = protocol ? protocolText(c, protocol) : null;

  const toggle = (i: number) => {
    setDone((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleComplete = async () => {
    if (!protocol) return;
    const res = await onComplete(
      protocol.id,
      protocol.duration_minutes,
      rating ?? undefined,
    );
    if (res.error) {
      toast({
        title: c.saveFailed,
        description: res.error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: c.logged,
      description: `+${protocol.duration_minutes} ${c.minutes} · ${text?.title}`,
    });
    setDone(new Set());
    setRating(null);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setDone(new Set());
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg">
        {protocol && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">
                  {c.categories[protocol.category] ?? protocol.category}
                </Badge>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {protocol.duration_minutes} {c.minutes}
                </Badge>
              </div>
              <DialogTitle>{text?.title}</DialogTitle>
              <DialogDescription>{text?.description}</DialogDescription>
            </DialogHeader>

            <ol className="space-y-2 py-2">
              {(text?.steps ?? []).map((label, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-muted/40 border border-border/40"
                  >
                    {done.has(i) ? (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span
                      className={
                        done.has(i)
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }
                    >
                      {label}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            {done.size > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{c.rateIt}</p>
                <div className="flex gap-2" role="radiogroup">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      onClick={() => setRating(n)}
                      className={`h-10 w-10 rounded-full border text-sm font-medium ${rating === n ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {c.close}
              </Button>
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={done.size === 0}
              >
                {c.logCompletion}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
