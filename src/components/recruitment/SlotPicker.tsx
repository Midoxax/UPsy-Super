import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecruitmentCopy } from "@/lib/recruitment/recruitmentCopy";

const MAX = 5;

/** Up to five date-times in the viewer's time zone; returns ISO strings. */
export default function SlotPicker({
  submitLabel,
  busy,
  onSubmit,
}: {
  submitLabel: string;
  busy?: boolean;
  onSubmit: (iso: string[]) => void;
}) {
  const { t } = useRecruitmentCopy();
  const [slots, setSlots] = useState<string[]>([""]);
  const valid = slots.filter((v) => v && !Number.isNaN(new Date(v).getTime()));
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">{t.fSlots}</p>
      {slots.map((v, i) => (
        <div key={i} className="flex gap-2">
          <Input
            type="datetime-local"
            aria-label={`${t.fSlots} ${i + 1}`}
            value={v}
            onChange={(e) =>
              setSlots((xs) => xs.map((x, k) => (k === i ? e.target.value : x)))
            }
          />
          {slots.length > 1 && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="✕"
              onClick={() => setSlots((xs) => xs.filter((_, k) => k !== i))}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <div className="flex gap-2">
        {slots.length < MAX && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSlots((xs) => [...xs, ""])}
          >
            <Plus className="h-4 w-4 me-1" /> {t.addSlot}
          </Button>
        )}
        <Button
          size="sm"
          disabled={busy || valid.length === 0}
          // datetime-local is local wall time; toISOString converts to UTC.
          onClick={() => onSubmit(valid.map((v) => new Date(v).toISOString()))}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
