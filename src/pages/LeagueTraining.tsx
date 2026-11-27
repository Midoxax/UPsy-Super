import { motion } from "framer-motion";
import { Award, ListVideo, Radio, ShieldCheck, Users } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { useLeagueTrainingCopy } from "@/lib/league/leagueTrainingCopy";
import { LiveClassSections } from "@/pages/LiveClasses";
import TrainingDesk from "@/components/league/TrainingDesk";

const FACT_ICONS = [Award, Users, ListVideo];

/**
 * The League's training inside U.Psy's training center: its webinars with
 * registration (members only, paid or open, per webinar), past ones and
 * replays, and for the League's team and U.Psy the training dashboard.
 */
export default function LeagueTraining() {
  const { t, locale } = useLeagueTrainingCopy();
  const { isAdmin, isLeague } = useUserRole();
  const to = (p: string) => addLocalePrefix(p, locale);

  return (
    <>
      <SEOHead
        path="/learn/lsspm"
        title={t.seoTitle}
        description={t.seoDescription}
      />

      <section className="relative overflow-hidden bg-[#0b1220] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(46,91,140,0.45),transparent_55%),radial-gradient(circle_at_10%_90%,rgba(255,179,0,0.14),transparent_50%)]" />
        <div className="container-custom relative space-y-7 py-20 md:py-28">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-u-gold" />
            <span dir="ltr">{t.badge}</span>
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-3xl font-display text-4xl leading-[1.05] tracking-tight md:text-6xl"
          >
            {t.title}
          </motion.h1>
          <p className="max-w-2xl text-lg text-white/70">{t.sub}</p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="primary" asChild>
              <Link to={to("/lsspm")}>{t.join}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link to={to("/learn/live/series")}>
                <ListVideo className="me-2 h-4 w-4" />
                {t.replays}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link to={to("/learn/live")}>
                <Radio className="me-2 h-4 w-4" />
                {t.allLive}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface/40">
        <ul className="container-custom grid gap-6 py-10 md:grid-cols-3">
          {t.facts.map((f, i) => {
            const Icon = FACT_ICONS[i];
            return (
              <li key={f.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2E5B8C]/10 text-[#2E5B8C]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <main className="container-custom space-y-10 py-12 md:py-16">
        <h2 className="font-display text-3xl">{t.programme}</h2>
        <LiveClassSections organizer="lsspm" />

        {(isAdmin || isLeague) && (
          <section className="space-y-2 border-t border-border pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2E5B8C]">
              {t.desk}
            </p>
            <p className="text-sm text-muted-foreground">{t.deskSub}</p>
            <div className="pt-4">
              <TrainingDesk />
            </div>
          </section>
        )}
      </main>
    </>
  );
}
