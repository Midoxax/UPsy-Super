import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ListChecks, Plus, Loader2, CheckCircle2, Clock, Calendar, User,
} from "lucide-react";
import { format, isPast } from "date-fns";

interface Homework {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  category: string;
  due_date: string | null;
  completed_at: string | null;
  client_response: string | null;
  created_at: string;
  client_name?: string;
}

const CATEGORIES = [
  { value: "worksheet", label: "Worksheet" },
  { value: "exercise", label: "Exercise" },
  { value: "reading", label: "Reading" },
  { value: "reflection", label: "Reflection" },
  { value: "other", label: "Other" },
];

interface Props {
  role: "psychologist" | "client";
}

const HomeworkTab = ({ role }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Homework[]>([]);
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [dueDate, setDueDate] = useState("");

  // Client response modal
  const [respondId, setRespondId] = useState<string | null>(null);
  const [response, setResponse] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const col = role === "psychologist" ? "psychologist_id" : "client_id";
    const { data } = await supabase
      .from("homework_assignments")
      .select("*")
      .eq(col, user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const clientIds = [...new Set(data.map((h) => h.client_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", clientIds);
      const nameMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));
      setItems(data.map((h) => ({ ...h, client_name: nameMap.get(h.client_id) || "Client" })));
    }
    setLoading(false);
  }, [user, role]);

  const loadClients = useCallback(async () => {
    if (!user || role !== "psychologist") return;
    const { data } = await supabase.from("sessions").select("client_id").eq("psychologist_id", user.id);
    if (data) {
      const ids = [...new Set(data.map((s) => s.client_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      setClients((profiles || []).map((p) => ({ id: p.id, full_name: p.full_name || "—" })));
    }
  }, [user, role]);

  useEffect(() => { load(); loadClients(); }, [load, loadClients]);

  const handleCreate = async () => {
    if (!user || !clientId || !title) return;
    setSaving(true);
    const { error } = await supabase.from("homework_assignments").insert({
      psychologist_id: user.id,
      client_id: clientId,
      title,
      description: description || null,
      category: category as any,
      due_date: dueDate || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Homework assigned" });
      setOpen(false);
      setTitle(""); setDescription(""); setDueDate(""); setClientId("");
      load();
    }
  };

  const handleComplete = async (id: string) => {
    const { error } = await supabase
      .from("homework_assignments")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      toast({ title: "Marked complete!" });
      load();
    }
  };

  const handleSubmitResponse = async () => {
    if (!respondId) return;
    setSaving(true);
    const { error } = await supabase
      .from("homework_assignments")
      .update({ client_response: response, completed_at: new Date().toISOString() })
      .eq("id", respondId);
    setSaving(false);
    if (!error) {
      toast({ title: "Response submitted!" });
      setRespondId(null);
      setResponse("");
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          {role === "psychologist" ? "Homework Assignments" : "My Homework"}
        </h2>
        {role === "psychologist" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Assign</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Assign Homework</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Client</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Thought Record Sheet" />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-1.5">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <Button onClick={handleCreate} disabled={saving || !clientId || !title} className="w-full">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Assign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <ListChecks className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>{role === "psychologist" ? "No homework assigned yet." : "No homework from your psychologist yet."}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((hw) => (
            <Card key={hw.id} className={hw.completed_at ? "opacity-70" : ""}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="mt-0.5">
                  {hw.completed_at ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{hw.title}</span>
                    <Badge variant="outline" className="text-xs">{hw.category}</Badge>
                    {role === "psychologist" && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> {hw.client_name}
                      </span>
                    )}
                  </div>
                  {hw.description && <p className="text-sm text-muted-foreground">{hw.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {hw.due_date && (
                      <span className={`flex items-center gap-1 ${!hw.completed_at && isPast(new Date(hw.due_date)) ? "text-destructive" : ""}`}>
                        <Calendar className="h-3 w-3" /> Due: {format(new Date(hw.due_date), "MMM d, yyyy")}
                      </span>
                    )}
                    {hw.completed_at && (
                      <span>Completed: {format(new Date(hw.completed_at), "MMM d, yyyy")}</span>
                    )}
                  </div>
                  {hw.client_response && (
                    <div className="mt-2 p-2 rounded-md bg-muted/50 text-sm">
                      <span className="font-medium text-xs text-muted-foreground">Client response:</span>
                      <p className="mt-0.5">{hw.client_response}</p>
                    </div>
                  )}
                </div>
                {role === "client" && !hw.completed_at && (
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => { setRespondId(hw.id); setResponse(""); }}>
                      Respond
                    </Button>
                    <Button size="sm" onClick={() => handleComplete(hw.id)}>Done</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client response dialog */}
      <Dialog open={!!respondId} onOpenChange={(v) => { if (!v) setRespondId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Your Reflection</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={4} placeholder="Share your thoughts, insights, or reflections..." />
            <Button onClick={handleSubmitResponse} disabled={saving} className="w-full">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Submit & Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeworkTab;