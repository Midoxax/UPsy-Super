// Admin research view for L'Observatoire.
// Reads AGGREGATES ONLY, through security-definer RPCs. There is deliberately
// no raw-row read and no export: individual survey responses must never be
// visible, so they can never be correlated with a person.

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Dict = Record<string, number>;

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-u-card border border-border/60 bg-muted/20 p-4">
    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    <p className="font-mono tabular-nums text-2xl mt-1">{value}</p>
  </div>
);

const Distribution = ({ title, data }: { title: string; data: Dict }) => {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, n]) => n));
  if (!entries.length) return null;
  return (
    <div className="space-y-2">
      {title && <h4 className="text-sm font-medium">{title}</h4>}
      {entries.map(([k, n]) => (
        <div key={k} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-mono tabular-nums">{n}</span>
          </div>
          <Progress value={(n / max) * 100} className="h-1.5" />
        </div>
      ))}
    </div>
  );
};

const AnswerStats = ({ track }: { track: "patient" | "psychologist" }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["observatoire-answers", track],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("observatoire_answer_stats", { _track: track });
      if (error) throw error;
      return (data ?? {}) as unknown as Record<string, { n: number; distribution: Dict }>;
    },
  });

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  const entries = Object.entries(data ?? {});
  if (!entries.length) return <p className="text-sm text-muted-foreground">No completed responses yet.</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {entries.map(([key, stat]) => (
        <Distribution key={key} title={`${key} (n=${stat.n})`} data={stat.distribution} />
      ))}
    </div>
  );
};

interface Summary {
  totals: {
    started: number;
    completed: number;
    patient: number;
    psychologist: number;
    median_duration_seconds: number | null;
  };
  by_language: Dict;
  by_device: Dict;
  by_day: Dict;
  vw_coherent: { coherent: number; incoherent: number };
  dropoff: Dict;
}

const ObservatoireManager = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["observatoire-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("observatoire_summary");
      if (error) throw error;
      return data as unknown as Summary;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (error) {
    return <p className="text-sm text-destructive">Unable to load research aggregates.</p>;
  }

  const t = data?.totals;
  const completionRate = t?.started ? Math.round((t.completed / t.started) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-u-card border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <span>
          Aggregates only. Individual survey responses are unreadable by design and carry no link to any
          person or account. Timestamps are rounded to the hour to prevent correlation with CRM contacts.
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Started" value={t?.started ?? 0} />
        <Stat label="Completed" value={t?.completed ?? 0} />
        <Stat label="Completion" value={`${completionRate}%`} />
        <Stat label="Patients" value={t?.patient ?? 0} />
        <Stat label="Psychologists" value={t?.psychologist ?? 0} />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Language</CardTitle>
          </CardHeader>
          <CardContent>
            <Distribution title="" data={data?.by_language ?? {}} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Device</CardTitle>
          </CardHeader>
          <CardContent>
            <Distribution title="" data={data?.by_device ?? {}} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drop-off by section</CardTitle>
          </CardHeader>
          <CardContent>
            <Distribution title="" data={data?.dropoff ?? {}} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Answer distributions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="patient">
            <TabsList>
              <TabsTrigger value="patient">Patient track</TabsTrigger>
              <TabsTrigger value="psychologist">Psychologist track</TabsTrigger>
            </TabsList>
            <TabsContent value="patient" className="pt-4">
              <AnswerStats track="patient" />
            </TabsContent>
            <TabsContent value="psychologist" className="pt-4">
              <AnswerStats track="psychologist" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ObservatoireManager;