import { useState, useEffect } from "react";
import { logSensitiveAccess } from "@/lib/compliance/auditAccess";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FileText, Plus, Loader2, Calendar, User, Pencil, Trash2,
} from "lucide-react";
import { format } from "date-fns";
import AISummaryButton from "@/components/dashboard/AISummaryButton";

interface SessionNote {
  id: string;
  session_id: string;
  content: string;
  note_type: string;
  is_private: boolean;
  created_at: string;
  session?: {
    date_time: string;
    client_id: string;
    client_profile?: { full_name: string | null } | null;
  };
}

interface SessionOption {
  id: string;
  date_time: string;
  client_id: string;
  client_name: string;
}

const NOTE_TYPES = [
  { value: "progress", label: "Progress Note" },
  { value: "intake", label: "Intake Assessment" },
  { value: "treatment_plan", label: "Treatment Plan" },
  { value: "discharge", label: "Discharge Summary" },
];

const SessionNotesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("progress");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    // Load notes
    const { data: notesData } = await supabase
      .from("session_notes")
      .select("*")
      .eq("psychologist_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);

    // Clinical read — Postgres has no SELECT trigger, so log it here (C1).
    if (notesData && notesData.length > 0) {
      void logSensitiveAccess({
        resourceType: "session_notes",
        dataClass: "C1",
        context: { view: "specialist_notes_tab", count: notesData.length },
      });
    }

    // Load sessions for the dropdown
    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("id, date_time, client_id")
      .eq("psychologist_id", user!.id)
      .order("date_time", { ascending: false })
      .limit(50);

    if (sessionsData) {
      const clientIds = [...new Set(sessionsData.map((s) => s.client_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", clientIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name || "Client"]) || []);

      setSessions(sessionsData.map((s) => ({
        ...s,
        client_name: profileMap.get(s.client_id) || "Client",
      })));

      // Enrich notes with session info
      if (notesData) {
        const sessionMap = new Map(sessionsData.map((s) => [s.id, s]));
        setNotes(notesData.map((n: any) => {
          const session = sessionMap.get(n.session_id);
          return {
            ...n,
            session: session ? {
              date_time: session.date_time,
              client_id: session.client_id,
              client_profile: { full_name: profileMap.get(session.client_id) || null },
            } : undefined,
          };
        }));
      }
    }
    setLoading(false);
  };

  const saveNote = async () => {
    if (!user || !noteContent.trim() || !selectedSession) return;
    setSaving(true);
    const { error } = await supabase.from("session_notes").insert({
      session_id: selectedSession,
      psychologist_id: user.id,
      content: noteContent.trim(),
      note_type: noteType,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save note", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Session note recorded" });
      setShowForm(false);
      setNoteContent("");
      setSelectedSession("");
      loadData();
    }
  };

  const deleteNote = async (id: string) => {
    await supabase.from("session_notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Deleted" });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Session Notes
          </h2>
          <p className="text-sm text-muted-foreground">Clinical notes linked to your sessions.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)} disabled={sessions.length === 0}>
          <Plus className="h-4 w-4 mr-1" /> Add Note
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-6 space-y-4">
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="bg-muted/30">
              <SelectValue placeholder="Select session..." />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.client_name} — {format(new Date(s.date_time), "MMM d, yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={noteType} onValueChange={setNoteType}>
            <SelectTrigger className="bg-muted/30 w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea placeholder="Write clinical notes..." value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={6} className="bg-muted/30" />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={saveNote} disabled={!noteContent.trim() || !selectedSession || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Pencil className="h-4 w-4 mr-1" />}
              Save Note
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 && !showForm ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No session notes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">
                      {NOTE_TYPES.find((t) => t.value === note.note_type)?.label || note.note_type}
                    </Badge>
                    {note.session?.client_profile?.full_name && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {note.session.client_profile.full_name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {note.session?.date_time ? format(new Date(note.session.date_time), "MMM d, yyyy") : format(new Date(note.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <AISummaryButton notes={note.content} />
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteNote(note.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionNotesTab;
