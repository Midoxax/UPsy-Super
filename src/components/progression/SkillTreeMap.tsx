import { useMemo } from "react";
import { Lock, Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  type SkillTree,
  type SkillNode,
  useMyUnlockedNodes,
  useMyXpTotal,
  useUnlockSkillNode,
} from "@/hooks/useProgression";

interface Props {
  tree: SkillTree;
}

/**
 * Renders the nodes of a skill tree grouped in tiers based on dependency depth.
 * Lines are drawn implicitly by the column layout (no SVG, keeps it lightweight).
 */
export const SkillTreeMap = ({ tree }: Props) => {
  const { data: unlocked } = useMyUnlockedNodes();
  const { data: xpTotal = 0 } = useMyXpTotal();
  const unlock = useUnlockSkillNode();

  const ownedSet = useMemo(
    () =>
      new Set(
        (unlocked ?? [])
          .filter((u) => u.tree_slug === tree.slug)
          .map((u) => u.node_id),
      ),
    [unlocked, tree.slug],
  );

  const tiers = useMemo(() => buildTiers(tree.tree.nodes), [tree.tree.nodes]);

  return (
    <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-border/50">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-lg">{tree.name}</h3>
        </div>
        {tree.description && (
          <p className="text-sm text-muted-foreground">{tree.description}</p>
        )}
      </header>

      <div className="space-y-6">
        {tiers.map((row, i) => (
          <div key={i} className="grid gap-3" style={{
            gridTemplateColumns: `repeat(${Math.max(row.length, 1)}, minmax(0,1fr))`,
          }}>
            {row.map((node) => {
              const isOwned = ownedSet.has(node.id);
              const prereqMet = node.requires.every((r) => ownedSet.has(r));
              const xpMet = xpTotal >= node.xp;
              const canUnlock = !isOwned && prereqMet && xpMet;

              return (
                <div
                  key={node.id}
                  className={`relative rounded-u-md border p-3 text-center transition-all
                    ${isOwned
                      ? "border-primary/40 bg-primary/10"
                      : canUnlock
                        ? "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20"
                        : "border-border/40 bg-muted/20 opacity-70"
                    }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {isOwned ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-xs font-semibold mb-1 line-clamp-2">
                    {node.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {node.xp} XP
                  </div>
                  {canUnlock && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 h-6 w-full text-[10px]"
                      disabled={unlock.isPending}
                      onClick={() =>
                        unlock.mutate({ tree_slug: tree.slug, node_id: node.id })
                      }
                    >
                      Unlock
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
};

/** Topologically group nodes into tier rows based on requirement depth. */
function buildTiers(nodes: SkillNode[]): SkillNode[][] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const depth = new Map<string, number>();

  const compute = (id: string): number => {
    if (depth.has(id)) return depth.get(id)!;
    const node = byId.get(id);
    if (!node || node.requires.length === 0) {
      depth.set(id, 0);
      return 0;
    }
    const d = 1 + Math.max(...node.requires.map(compute));
    depth.set(id, d);
    return d;
  };

  nodes.forEach((n) => compute(n.id));
  const tiers: SkillNode[][] = [];
  for (const n of nodes) {
    const d = depth.get(n.id) ?? 0;
    if (!tiers[d]) tiers[d] = [];
    tiers[d].push(n);
  }
  return tiers;
}