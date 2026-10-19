import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

// Must match the tables admin_break_glass_read() accepts.
const TABLES: { value: string; label: string }[] = [
  { value: "session_notes", label: "Session notes" },
  { value: "sessions", label: "Sessions" },
  { value: "assessment_results", label: "Questionnaire results" },
  { value: "assessment_premium_reports", label: "Questionnaire reports" },
  { value: "client_anamneses", label: "Intake forms" },
  { value: "intake_clinical_briefs", label: "Clinical briefs" },
  { value: "treatment_plans", label: "Treatment plans" },
  { value: "homework_assignments", label: "Homework" },
  { value: "discharge_summaries", label: "Discharge summaries" },
  { value: "mood_entries", label: "Mood entries" },
  { value: "athlete_profiles", label: "Athlete profile" },
  { value: "athlete_training_sessions", label: "Training sessions" },
];

const MIN_REASON = 15;

/**
 * Emergency access to one client's clinical records. Admins have no routine
 * access; this asks for a reason, and the database records every use (with
 * the reason) in the audit log before returning anything.
 */
export default function BreakGlassPanel({ userId }: { userId: string }) {
  const [table, setTable] = useState("");
  const [reason, setReason] = useState("");
  const [rows, setRows] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(false);

  const ready = table !== "" && reason.trim().length >= MIN_REASON;

  const open = async () => {
    setLoading(true);
    setRows(null);
    const { data, error } = await supabase.rpc("admin_break_glass_read", {
      _table: table,
      _subject_id: userId,
      _reason: reason.trim(),
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows(Array.isArray(data) ? data : []);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
        <ShieldAlert className="h-5 w-5 shrink-0 text-destructive" />
        <p>
          Clinical records are visible only to the client and their specialist.
          Open them here only for a client request, a safety concern or a legal
          obligation. Your name, the reason and the time are recorded in the
          audit log.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bg-table">Record type</Label>
        <Select value={table} onValueChange={setTable}>
          <SelectTrigger id="bg-table">
            <SelectValue placeholder="Choose what to open" />
          </SelectTrigger>
          <SelectContent>
            {TABLES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bg-reason">
          Reason (at least {MIN_REASON} characters)
        </Label>
        <Textarea
          id="bg-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Client asked by email for a copy of their notes"
          rows={3}
        />
      </div>

      <Button variant="destructive" disabled={!ready || loading} onClick={open}>
        {loading ? "Opening…" : "Open records (logged)"}
      </Button>

      {rows && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {rows.length} record{rows.length === 1 ? "" : "s"}
          </p>
          {rows.length > 0 && (
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(rows, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
