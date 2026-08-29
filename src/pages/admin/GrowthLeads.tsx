import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Navigate } from "@/lib/router-compat";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { downloadCsv } from "@/lib/admin/csv";
import { Download, Loader2, Search } from "lucide-react";
import SEOHead from "@/components/SEOHead";

type Lead = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  source: string;
  score_total: number | null;
  score_breakdown: Record<string, number> | null;
  locale: string | null;
  consent_marketing: boolean;
  nurture_stage: string | null;
  converted_user_id: string | null;
  created_at: string;
};

const PILLARS = ["focus", "regulation", "recovery", "meaning"] as const;
type Pillar = (typeof PILLARS)[number];

export default function GrowthLeads() {
  const { isAdmin, loading } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [pillar, setPillar] = useState<Pillar | "all">("all");
  const [maxScore, setMaxScore] = useState<string>("");
  const [stage, setStage] = useState<string>("all");
  const [source, setSource] = useState<string>("all");

  const { data: leads = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-growth-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("growth_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data as Lead[];
    },
    enabled: isAdmin,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cap = maxScore ? Number(maxScore) : null;
    return leads.filter((l) => {
      if (q && !`${l.email} ${l.full_name ?? ""} ${l.phone ?? ""}`.toLowerCase().includes(q)) return false;
      if (stage !== "all" && l.nurture_stage !== stage) return false;
      if (source !== "all" && l.source !== source) return false;
      if (pillar !== "all") {
        const score = Number(l.score_breakdown?.[pillar] ?? NaN);
        if (!Number.isFinite(score)) return false;
        if (cap != null && score > cap) return false;
      } else if (cap != null && (l.score_total ?? Infinity) > cap) {
        return false;
      }
      return true;
    });
  }, [leads, search, pillar, maxScore, stage, source]);

  const sources = useMemo(
    () => Array.from(new Set(leads.map((l) => l.source).filter(Boolean))).sort(),
    [leads]
  );

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const exportCsv = () => {
    const rows = filtered.map((l) => ({
      created_at: l.created_at,
      email: l.email,
      full_name: l.full_name ?? "",
      phone: l.phone ?? "",
      source: l.source,
      locale: l.locale ?? "",
      nurture_stage: l.nurture_stage ?? "",
      consent_marketing: l.consent_marketing,
      score_total: l.score_total ?? "",
      focus: l.score_breakdown?.focus ?? "",
      regulation: l.score_breakdown?.regulation ?? "",
      recovery: l.score_breakdown?.recovery ?? "",
      meaning: l.score_breakdown?.meaning ?? "",
      converted: l.converted_user_id ? "yes" : "no",
    }));
    downloadCsv(`growth-leads-${format(new Date(), "yyyy-MM-dd")}.csv`, rows);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SEOHead path="/admin/growth-leads" title="Growth Leads — Admin" description="Review and export growth leads" />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Growth Leads</h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} of {leads.length} leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
            Refresh
          </Button>
          <Button onClick={exportCsv} disabled={!filtered.length}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="p-4 mb-4 grid gap-3 md:grid-cols-4">
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search email, name, phone"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={pillar} onValueChange={(v) => setPillar(v as any)}>
          <SelectTrigger><SelectValue placeholder="Pillar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pillars</SelectItem>
            {PILLARS.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder={pillar === "all" ? "Max total score" : `Max ${pillar} score`}
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
        />
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            <SelectItem value="d0">d0</SelectItem>
            <SelectItem value="d1">d1</SelectItem>
            <SelectItem value="d3">d3</SelectItem>
            <SelectItem value="d7">d7</SelectItem>
            <SelectItem value="converted">converted</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">Created</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Source</th>
                <th className="p-3 font-mono">Total</th>
                <th className="p-3 font-mono">Focus</th>
                <th className="p-3 font-mono">Regul.</th>
                <th className="p-3 font-mono">Recov.</th>
                <th className="p-3 font-mono">Mean.</th>
                <th className="p-3">Stage</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={9} className="p-8 text-center"><Loader2 className="animate-spin inline" /></td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No leads match your filters.</td></tr>
              )}
              {filtered.map((l) => (
                <tr key={l.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {format(new Date(l.created_at), "MMM d, HH:mm")}
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{l.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{l.email}</div>
                    {l.phone && <div className="text-xs text-muted-foreground">{l.phone}</div>}
                  </td>
                  <td className="p-3"><Badge variant="outline">{l.source}</Badge></td>
                  <td className="p-3 font-mono tabular-nums">{l.score_total ?? "—"}</td>
                  {PILLARS.map((p) => (
                    <td key={p} className="p-3 font-mono tabular-nums">
                      {l.score_breakdown?.[p] ?? "—"}
                    </td>
                  ))}
                  <td className="p-3">
                    <Badge variant={l.converted_user_id ? "default" : "secondary"}>
                      {l.converted_user_id ? "converted" : l.nurture_stage ?? "d0"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}