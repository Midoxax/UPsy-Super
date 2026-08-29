import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Protocol } from "@/hooks/useAthleteHub";

interface Props {
  protocol: Protocol | null;
  onOpenChange: (o: boolean) => void;
  onComplete: (protocolId: string, durationMinutes: number) => Promise<{ error: any }>;
}

export default function ProtocolRunner({ protocol, onOpenChange, onComplete }: Props) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const open = !!protocol;

  const toggle = (i: number) => {
    setDone((s) => {
      const next = new Set(s);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleComplete = async () => {
    if (!protocol) return;
    const res = await onComplete(protocol.id, protocol.duration_minutes);
    if (res.error) {
      toast({ title: "Could not log session", description: res.error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Protocol logged", description: `+${protocol.duration_minutes} min · ${protocol.title}` });
    setDone(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setDone(new Set()); onOpenChange(o); }}>
      <DialogContent className="max-w-lg">
        {protocol && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="capitalize">{protocol.category}</Badge>
                <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{protocol.duration_minutes} min</Badge>
              </div>
              <DialogTitle>{protocol.title}</DialogTitle>
              <DialogDescription>{protocol.description}</DialogDescription>
            </DialogHeader>

            <ol className="space-y-2 py-2">
              {protocol.steps.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-muted/40 border border-border/40"
                  >
                    {done.has(i)
                      ? <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
                    <span className={done.has(i) ? "line-through text-muted-foreground" : "text-foreground"}>{s.label}</span>
                  </button>
                </li>
              ))}
            </ol>

            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
              <Button variant="primary" onClick={handleComplete} disabled={done.size === 0}>
                Log completion
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}