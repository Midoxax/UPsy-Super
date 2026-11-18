import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeriesCopy } from "@/lib/live/seriesCopy";

/** Plays the live-class recording a course module carries (signed, 1 hour). */
export default function ModuleRecording({ moduleId }: { moduleId: string }) {
  const { user } = useAuth();
  const { t } = useSeriesCopy();
  const { data: url, isLoading } = useQuery({
    queryKey: ["module-recording", moduleId],
    enabled: !!user,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.functions.invoke<{ url?: string }>(
        "live-class",
        { body: { action: "module_recording_url", module_id: moduleId } },
      );
      return data?.url ?? null;
    },
  });

  if (!user) return <p className="text-sm text-muted-foreground">{t.signIn}</p>;
  if (isLoading)
    return (
      <div className="aspect-video rounded-xl bg-black/80 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  if (!url)
    return <p className="text-sm text-muted-foreground">{t.noReplay}</p>;
  return (
    <video
      key={moduleId}
      src={url}
      controls
      className="w-full rounded-xl bg-black aspect-video"
    />
  );
}
