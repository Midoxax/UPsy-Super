import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles, Loader2, Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { JournalEntry } from "@/hooks/useAthleteHub";

interface Props {
  entries: JournalEntry[];
  onAdd: (e: { title?: string; content: string; mood_tag?: string }) => Promise<{ error: any }>;
  onSynthesize?: (entryId: string) => Promise<{ error: any }>;
}

const MOODS = ["focused", "calm", "drained", "anxious", "confident", "frustrated"] as const;

export default function JournalPanel({ entries, onAdd, onSynthesize }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);

  const synthesize = async (id: string) => {
    if (!onSynthesize) return;
    setSynthesizingId(id);
    const res = await onSynthesize(id);
    setSynthesizingId(null);
    if (res.error) {
      toast({ title: "Synthesis failed", description: res.error.message ?? "Try again later.", variant: "destructive" });
    } else {
      toast({ title: "Reflection ready" });
    }
  };

  const save = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const res = await onAdd({ title: title.trim() || undefined, content: content.trim(), mood_tag: mood || undefined });
    setSaving(false);
    if (res.error) { toast({ title: "Could not save", description: res.error.message, variant: "destructive" }); return; }
    setTitle(""); setContent(""); setMood(null);
    toast({ title: "Journal entry saved" });
  };

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-h3">Journal</h3>
      </div>

      <div className="space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" maxLength={120} />
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="What's on your mind?" maxLength={4000} />
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(mood === m ? null : m)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${mood === m ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:text-foreground"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="primary" onClick={save} disabled={!content.trim() || saving}>
            <Sparkles className="w-4 h-4 mr-1" />
            {saving ? "Saving…" : "Save entry"}
          </Button>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/40">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Recent entries</p>
          {entries.slice(0, 5).map((e) => (
            <div key={e.id} className="p-3 rounded-xl border border-border/40">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground">{e.title || "Untitled"}</p>
                {e.mood_tag && <Badge variant="outline" className="text-[10px]">{e.mood_tag}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{e.content}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(e.created_at).toLocaleString()}</p>
              {e.ai_summary ? (
                <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-[10px] uppercase tracking-widest text-primary/80 mb-1 flex items-center gap-1">
                    <Wand2 className="w-3 h-3" /> Nour reflection
                  </p>
                  <p className="text-xs text-foreground/90 whitespace-pre-wrap">{e.ai_summary}</p>
                  {e.themes && e.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {e.themes.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : onSynthesize ? (
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => synthesize(e.id)}
                    disabled={synthesizingId === e.id}
                  >
                    {synthesizingId === e.id ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Reflecting…</>
                    ) : (
                      <><Wand2 className="w-3 h-3 mr-1" /> Reflect with Nour</>
                    )}
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}