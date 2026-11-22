import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRecruitmentCopy } from "@/lib/recruitment/recruitmentCopy";
import SlotPicker from "@/components/recruitment/SlotPicker";

/** League: invite the candidate behind a shared file to an interview. */
export default function InterviewInviteForm({
  applicationId,
  onSent,
}: {
  applicationId: string;
  onSent?: () => void;
}) {
  const { t } = useRecruitmentCopy();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    title: t.defaultTitle,
    message: "",
    mode: "video",
    location: "",
    meeting_url: "",
    duration: "30",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const send = async (slots: string[]) => {
    setBusy(true);
    const { error } = await supabase.rpc("recruitment_invite", {
      _application: applicationId,
      _title: f.title,
      _message: f.message,
      _mode: f.mode,
      _location: f.location,
      _meeting_url: f.meeting_url,
      _duration: Number(f.duration) || 30,
      _slots: slots,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.sent);
    onSent?.();
  };
  return (
    <div className="space-y-2 rounded-xl border border-dashed p-3">
      <p className="text-sm font-semibold">{t.invite}</p>
      <Input
        aria-label={t.fTitle}
        value={f.title}
        onChange={(e) => set("title", e.target.value)}
      />
      <Textarea
        rows={2}
        placeholder={t.fMessage}
        value={f.message}
        onChange={(e) => set("message", e.target.value)}
      />
      <div className="grid gap-2 sm:grid-cols-[1fr_110px]">
        <select
          aria-label={t.fMode}
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={f.mode}
          onChange={(e) => set("mode", e.target.value)}
        >
          {Object.entries(t.modes).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <Input
          type="number"
          min={10}
          max={240}
          aria-label={t.fDuration}
          value={f.duration}
          onChange={(e) => set("duration", e.target.value)}
        />
      </div>
      {f.mode === "video" && (
        <Input
          placeholder={t.fUrl}
          value={f.meeting_url}
          onChange={(e) => set("meeting_url", e.target.value)}
        />
      )}
      {f.mode === "in_person" && (
        <Input
          placeholder={t.fLocation}
          value={f.location}
          onChange={(e) => set("location", e.target.value)}
        />
      )}
      <SlotPicker submitLabel={t.send} busy={busy} onSubmit={send} />
    </div>
  );
}
