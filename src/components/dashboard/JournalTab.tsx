import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import CrisisModal from "@/components/dashboard/CrisisModal";
import {
  BookOpen, Plus, Pencil, Trash2, Calendar, Smile, Frown, Meh, Heart,
  Loader2, ChevronDown,
} from "lucide-react";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  mood_tag: string | null;
  prompt: string | null;
  tags: string[];
  created_at: string;
}

const MOOD_OPTIONS = [
  { value: "great", label: "Great", icon: Smile, color: "text-primary" },
  { value: "good", label: "Good", icon: Smile, color: "text-accent" },
  { value: "neutral", label: "Neutral", icon: Meh, color: "text-muted-foreground" },
  { value: "low", label: "Low", icon: Frown, color: "text-orange-400" },
  { value: "struggling", label: "Struggling", icon: Frown, color: "text-destructive" },
];

const PROMPTS = [
  "What are three things I'm grateful for today?",
  "What emotion am I feeling right now, and why?",
  "What would I tell my best friend in this situation?",
  "What did I learn about myself this week?",
  "What is one thing I can let go of today?",
];

const JournalTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [moodTag, setMoodTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [crisisOpen, setCrisisOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setEntries(data as JournalEntry[]);
    setLoading(false);
  };

  const saveEntry = async () => {
    if (!user || !content.trim()) return;
    setSaving(true);

    // Trigger crisis modal for distress moods
    if (moodTag === "struggling") {
      setCrisisOpen(true);
    }

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      title: title.trim() || null,
      content: content.trim(),
      mood_tag: moodTag || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save entry", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Journal entry recorded" });
      setShowForm(false);
      setTitle("");
      setContent("");
      setMoodTag("");
      loadEntries();
    }
  };

   const deleteEntry = async (id: string) => {
    await supabase.from("journal_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Deleted", description: "Journal entry removed" });
  };

  const usePrompt = () => {
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setContent(prompt + "\n\n");
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CrisisModal open={crisisOpen} onOpenChange={setCrisisOpen} riskLevel="moderate" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Journal
          </h2>
          <p className="text-sm text-muted-foreground">Reflect, write, and track your mental wellness journey.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={usePrompt}>
            <Heart className="h-4 w-4 mr-1" /> Guided Prompt
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Entry
          </Button>
        </div>
      </div>

      {/* New Entry Form */}
      {showForm && (
        <div className="glass-card p-6 space-y-4">
          <Input
            placeholder="Entry title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-muted/30"
          />
          <div className="flex gap-2 flex-wrap">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMoodTag(m.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  moodTag === m.value
                    ? "ring-2 ring-primary bg-primary/10"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                {m.label}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Write freely..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="bg-muted/30"
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setContent(""); setTitle(""); setMoodTag(""); }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={saveEntry} disabled={!content.trim() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Pencil className="h-4 w-4 mr-1" />}
              Save Entry
            </Button>
          </div>
        </div>
      )}

      {/* Entries List */}
      {entries.length === 0 && !showForm ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No journal entries yet</p>
          <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Write your first entry
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const mood = MOOD_OPTIONS.find((m) => m.value === entry.mood_tag);
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="glass-card p-5">
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {mood && <mood.icon className={`w-4 h-4 ${mood.color}`} />}
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {entry.title || format(new Date(entry.created_at), "EEEE, MMM d")}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(entry.created_at), "PPp")}
                      {mood && <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{mood.label}</Badge>}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{entry.content}</p>
                    <div className="flex justify-end mt-3">
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JournalTab;
