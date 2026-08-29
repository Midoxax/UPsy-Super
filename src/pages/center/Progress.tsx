import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Flame, Trophy, Map } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import {
  useSkillTrees,
  useQuests,
  useMyQuestProgress,
  useMyXpTotal,
  type UserQuestProgress,
} from "@/hooks/useProgression";
import { SkillTreeMap } from "@/components/progression/SkillTreeMap";
import { QuestCard } from "@/components/progression/QuestCard";

const ProgressPage = () => {
  const { data: trees, isLoading: treesLoading } = useSkillTrees();
  const { data: quests, isLoading: questsLoading } = useQuests();
  const { data: progress } = useMyQuestProgress();
  const { data: xpTotal = 0 } = useMyXpTotal();

  const progressByQuest = useMemo<Record<string, UserQuestProgress>>(() => {
    const map: Record<string, UserQuestProgress> = {};
    (progress ?? []).forEach((p) => {
      map[p.quest_slug] = p;
    });
    return map;
  }, [progress]);

  const activeQuests = (quests ?? []).filter((q) => {
    const p = progressByQuest[q.slug];
    return p && !p.completed_at;
  });
  const completedQuests = (quests ?? []).filter(
    (q) => progressByQuest[q.slug]?.completed_at,
  );
  const availableQuests = (quests ?? []).filter(
    (q) => !progressByQuest[q.slug],
  );

  return (
    <main className="min-h-screen">
      <SEOHead
        path="/center/progress"
        title="Your Progression — Skill Trees & Quests | U.Psy Training Center"
        description="Track your skill trees, complete quests, and unlock new domains of mastery across mindfulness, resilience, performance, and clinical foundations."
      />

      <section className="section-spacing">
        <div className="container-custom">
          <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <Badge variant="secondary" className="mb-3">
                <Sparkles className="h-3 w-3 mr-1.5" />
                Training Center · Progression
              </Badge>
              <h1 className="text-h1 font-bold">Your path</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Skill trees grow as you train. Quests turn lessons, journals, and
                check-ins into structured missions with XP rewards.
              </p>
            </div>
            <Card className="px-5 py-3 flex items-center gap-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Total XP
                </div>
                <div className="text-2xl font-bold tabular-nums">{xpTotal.toLocaleString()}</div>
              </div>
            </Card>
          </header>

          <Tabs defaultValue="trees">
            <TabsList>
              <TabsTrigger value="trees" className="gap-1.5">
                <Map className="h-4 w-4" />
                Skill Trees
              </TabsTrigger>
              <TabsTrigger value="quests" className="gap-1.5">
                <Flame className="h-4 w-4" />
                Quests
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-1.5">
                <Trophy className="h-4 w-4" />
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trees" className="mt-6">
              {treesLoading ? (
                <SkeletonGrid />
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  {(trees ?? []).map((t) => (
                    <SkillTreeMap key={t.slug} tree={t} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="quests" className="mt-6 space-y-8">
              {questsLoading ? (
                <SkeletonGrid />
              ) : (
                <>
                  {activeQuests.length > 0 && (
                    <Section title="Active">
                      <Grid>
                        {activeQuests.map((q) => (
                          <QuestCard
                            key={q.slug}
                            quest={q}
                            progress={progressByQuest[q.slug]}
                          />
                        ))}
                      </Grid>
                    </Section>
                  )}
                  <Section title="Available">
                    <Grid>
                      {availableQuests.map((q) => (
                        <QuestCard key={q.slug} quest={q} />
                      ))}
                    </Grid>
                  </Section>
                </>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedQuests.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">
                  No completed quests yet. Start one — they're how you build streaks of mastery.
                </Card>
              ) : (
                <Grid>
                  {completedQuests.map((q) => (
                    <QuestCard
                      key={q.slug}
                      quest={q}
                      progress={progressByQuest[q.slug]}
                    />
                  ))}
                </Grid>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
      {title}
    </h2>
    {children}
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{children}</div>
);

const SkeletonGrid = () => (
  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="h-56 animate-pulse bg-card/40" />
    ))}
  </div>
);

export default ProgressPage;