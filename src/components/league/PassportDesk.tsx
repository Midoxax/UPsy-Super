import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, FileText, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePassportCopy } from "@/lib/passport/passportCopy";

type Item = {
  id: string;
  full_name: string | null;
  kind: string;
  title: string;
  organization: string | null;
  role: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  url: string | null;
  doi: string | null;
  proof_path: string | null;
};

/** League portal: validate passport items against their proofs. */
export default function PassportDesk() {
  const { t } = usePassportCopy();
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["passport-queue"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("passport_review_queue");
      if (error) throw error;
      return (data ?? []) as Item[];
    },
  });
  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">{t.deskEmpty}</p>;
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <DeskItem
          key={i.id}
          i={i}
          onDone={() => qc.invalidateQueries({ queryKey: ["passport-queue"] })}
        />
      ))}
    </div>
  );
}

function DeskItem({ i, onDone }: { i: Item; onDone: () => void }) {
  const { t } = usePassportCopy();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const proof = async () => {
    if (!i.proof_path) return;
    const { data, error } = await supabase.storage
      .from("passport-proofs")
      .createSignedUrl(i.proof_path, 300);
    if (error || !data) return toast.error(error?.message ?? "Error");
    window.open(data.signedUrl, "_blank", "noopener");
  };
  const review = async (approve: boolean) => {
    setBusy(true);
    const { error } = await supabase.rpc("passport_review", {
      _entry: i.id,
      _approve: approve,
      _note: note,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.done);
    onDone();
  };
  return (
    <div className="rounded-xl border border-border p-4 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{i.full_name}</p>
          <p className="font-medium">{i.title}</p>
          <p className="text-xs text-muted-foreground">
            {[i.organization, i.role, i.start_date, i.end_date]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <Badge variant="outline">{t.kinds[i.kind] ?? i.kind}</Badge>
      </div>
      {i.description && <p className="text-sm">{i.description}</p>}
      {(i.url || i.doi) && (
        <p className="text-xs break-all">
          {i.url && (
            <a
              href={i.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {i.url}
            </a>
          )}
          {i.doi && ` · DOI ${i.doi}`}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {i.proof_path && (
          <Button size="sm" variant="outline" onClick={proof}>
            <FileText className="h-4 w-4 me-1" /> {t.viewProof}
          </Button>
        )}
        <Input
          className="flex-1 min-w-[200px]"
          placeholder={t.note}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button size="sm" disabled={busy} onClick={() => review(true)}>
          <Check className="h-4 w-4 me-1" /> {t.validate}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => review(false)}
        >
          <X className="h-4 w-4 me-1" /> {t.reject}
        </Button>
      </div>
    </div>
  );
}
