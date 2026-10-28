// Media agent ↔ CRM: which content and channels produced contacts and
// clients (first-touch utm_* tags), next to what the content pipeline posted.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { downloadCsv } from "@/lib/admin/csv";
import { Button } from "@/components/ui/button";

type Row = {
  campaign: string;
  source: string;
  medium: string;
  contacts: number;
  accounts: number;
  clients: number;
  last_contact_at: string;
};
type Post = { slug: string; network: string; status: string };

const DAYS = [30, 90, 365];

export default function CrmContentPanel() {
  const [days, setDays] = useState(90);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    setRows(null);
    supabase
      .rpc("crm_content_attribution", { p_days: days })
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, [days]);

  useEffect(() => {
    supabase
      .from("social_posts")
      .select("slug, network, status")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setPosts((data ?? []) as Post[]));
  }, []);

  const bySlug = new Map<string, Post[]>();
  for (const p of posts) bySlug.set(p.slug, [...(bySlug.get(p.slug) ?? []), p]);
  const total = (rows ?? []).reduce((s, r) => s + Number(r.contacts), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Contacts by what first brought them. Social posts and the newsletter
          tag links with the article slug as campaign.
        </p>
        <div className="flex gap-2">
          {DAYS.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={d === days ? "primary" : "outline"}
              onClick={() => setDays(d)}
            >
              {d} d
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            disabled={!rows?.length}
            onClick={() =>
              downloadCsv(`crm-content-attribution-${days}d`, rows ?? [])
            }
          >
            CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Campaign / content</th>
              <th className="p-3">Source</th>
              <th className="p-3">Medium</th>
              <th className="p-3 text-right">Contacts</th>
              <th className="p-3 text-right">Accounts</th>
              <th className="p-3 text-right">Booked</th>
              <th className="p-3">Posted on</th>
            </tr>
          </thead>
          <tbody>
            {rows === null ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-muted-foreground"
                >
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-muted-foreground"
                >
                  No contacts in this period.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={`${r.campaign}|${r.source}|${r.medium}`}
                  className="border-t border-border/60"
                >
                  <td className="p-3 font-medium">{r.campaign}</td>
                  <td className="p-3">{r.source}</td>
                  <td className="p-3">{r.medium}</td>
                  <td className="p-3 text-right tabular-nums">{r.contacts}</td>
                  <td className="p-3 text-right tabular-nums">{r.accounts}</td>
                  <td className="p-3 text-right tabular-nums">{r.clients}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(bySlug.get(r.campaign) ?? []).map((p) => (
                        <Badge key={p.network} variant="outline">
                          {p.network}: {p.status}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {rows && rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-border font-semibold">
                <td className="p-3" colSpan={3}>
                  Total
                </td>
                <td className="p-3 text-right tabular-nums">{total}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
