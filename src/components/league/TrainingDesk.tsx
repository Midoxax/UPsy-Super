import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useTrainingCopy } from "@/lib/league/trainingCopy";
import { formatWhen } from "@/lib/live/liveCopy";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";

/**
 * The League's view of its training platform (20261127090000_league_webinars):
 * every League webinar with registrations, attendance, certificates, replay,
 * and the paid seats split between the League and U.Psy under the licence.
 */
export default function TrainingDesk() {
  const { t, locale } = useTrainingCopy();
  const { isAdmin } = useUserRole();
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);

  const { data: rows = [] } = useQuery({
    queryKey: ["league-training", year],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("league_training_report", {
        _from: `${year}-01-01`,
        _to: `${year}-12-31`,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: settings } = useQuery({
    queryKey: ["training-settings"],
    queryFn: async () =>
      (
        await supabase
          .from("training_settings")
          .select("licence_annual_mad, upsy_share_pct")
          .maybeSingle()
      ).data,
  });

  const sum = (k: "registered" | "attended" | "certificates") =>
    rows.reduce((n, r) => n + Number(r[k] ?? 0), 0);
  const money = (k: "revenue_mad" | "upsy_share_mad" | "league_share_mad") =>
    rows.reduce((n, r) => n + Number(r[k] ?? 0), 0);
  const hours = rows.reduce(
    (n, r) => n + Number(r.training_hours ?? 0) * Number(r.certificates ?? 0),
    0,
  );
  const mad = (n: number) =>
    `${new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA").format(n)} ${t.mad}`;
  const accessLabel: Record<string, string> = {
    open: t.accessOpen,
    members: t.accessMembers,
    paid: t.accessPaid,
  };

  const tiles: [string, string][] = [
    [t.webinars, String(rows.length)],
    [t.registered, String(sum("registered"))],
    [t.attended, String(sum("attended"))],
    [t.certificates, String(sum("certificates"))],
    [t.hours, String(hours)],
    [t.revenue, mad(money("revenue_mad"))],
    [t.leagueShare, mad(money("league_share_mad"))],
    [
      `${t.upsyShare} (${Number(settings?.upsy_share_pct ?? 0)} %)`,
      mad(money("upsy_share_mad")),
    ],
    [t.licence, mad(Number(settings?.licence_annual_mad ?? 0))],
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{t.title}</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">{t.intro}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm" htmlFor="training-year">
            {t.period}
          </label>
          <select
            id="training-year"
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[thisYear + 1, thisYear, thisYear - 1, thisYear - 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ExportCsvButton
            filename={`lsspm-webinaires-${year}`}
            rows={rows as unknown as Record<string, unknown>[]}
            label={t.export}
          />
          {isAdmin && (
            <Button size="sm" asChild>
              <a href={addLocalePrefix("/learn/live/manage", locale)}>
                {t.manage}
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map(([label, value]) => (
          <div key={label} className="glass-card p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.none}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="p-2 text-start">{t.date}</th>
                <th className="p-2 text-start">{t.webinar}</th>
                <th className="p-2 text-start">{t.access}</th>
                <th className="p-2 text-end">{t.registered}</th>
                <th className="p-2 text-end">{t.attended}</th>
                <th className="p-2 text-end">{t.certificates}</th>
                <th className="p-2 text-end">{t.revenue}</th>
                <th className="p-2 text-end">{t.leagueShare}</th>
                <th className="p-2 text-center">{t.replay}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.class_id} className="border-t border-border">
                  <td className="p-2 whitespace-nowrap">
                    {formatWhen(r.starts_at, locale)}
                  </td>
                  <td className="p-2">
                    <span className="font-medium">{r.title}</span>
                    {r.speaker_name && (
                      <span className="block text-xs text-muted-foreground">
                        {r.speaker_name}
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <Badge variant="outline">
                      {accessLabel[r.access] ?? r.access}
                    </Badge>
                  </td>
                  <td className="p-2 text-end tabular-nums">{r.registered}</td>
                  <td className="p-2 text-end tabular-nums">{r.attended}</td>
                  <td className="p-2 text-end tabular-nums">
                    {r.certificates}
                  </td>
                  <td className="p-2 text-end tabular-nums">
                    {r.paid_seats ? mad(Number(r.revenue_mad)) : t.no}
                  </td>
                  <td className="p-2 text-end tabular-nums">
                    {r.paid_seats ? mad(Number(r.league_share_mad)) : t.no}
                  </td>
                  <td className="p-2 text-center">
                    {r.recording_published ? t.yes : t.no}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
