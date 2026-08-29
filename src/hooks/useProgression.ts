import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { MembershipTier } from "@/hooks/useMembership";

export interface SkillNode {
  id: string;
  label: string;
  xp: number;
  requires: string[];
}

export interface SkillTree {
  slug: string;
  name: string;
  domain: string;
  description: string | null;
  tree: { nodes: SkillNode[] };
  is_active: boolean;
}

export interface QuestStep {
  id: string;
  label: string;
  kind: "lesson" | "protocol" | "journal" | "checkin" | "booking";
  target: number;
}

export interface Quest {
  slug: string;
  title: string;
  description: string | null;
  category: string;
  steps: QuestStep[];
  xp_reward: number;
  tier_required: MembershipTier;
  is_active: boolean;
}

export interface UserQuestProgress {
  id: string;
  quest_slug: string;
  step_idx: number;
  state: { counts?: Record<string, number> };
  started_at: string;
  completed_at: string | null;
}

export const useSkillTrees = () =>
  useQuery({
    queryKey: ["skill-trees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skill_trees")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as SkillTree[];
    },
    staleTime: 5 * 60_000,
  });

export const useMyUnlockedNodes = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-skill-nodes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skill_nodes")
        .select("tree_slug, node_id, unlocked_at");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
};

export const useMyXpTotal = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-xp-total", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xp_events")
        .select("xp");
      if (error) throw error;
      return (data ?? []).reduce((acc, r: any) => acc + (r.xp ?? 0), 0);
    },
    staleTime: 60_000,
  });
};

export const useUnlockSkillNode = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (vars: { tree_slug: string; node_id: string }) => {
      const { data, error } = await supabase.rpc("skill_unlock" as any, {
        _tree_slug: vars.tree_slug,
        _node_id: vars.node_id,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-skill-nodes"] });
      toast({ title: "Skill unlocked", description: "New node added to your tree." });
    },
    onError: (e: any) => {
      toast({
        title: "Cannot unlock yet",
        description: e?.message ?? "Earn more XP or unlock prerequisites first.",
        variant: "destructive",
      });
    },
  });
};

export const useQuests = () =>
  useQuery({
    queryKey: ["quests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quests")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []) as unknown as Quest[];
    },
    staleTime: 5 * 60_000,
  });

export const useMyQuestProgress = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-quest-progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_quest_progress").select("*");
      if (error) throw error;
      return (data ?? []) as unknown as UserQuestProgress[];
    },
    staleTime: 60_000,
  });
};

export const useStartQuest = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (quest_slug: string) => {
      if (!user) throw new Error("not authenticated");
      const { error } = await supabase.rpc("quest_start" as any, {
        _quest_slug: quest_slug,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-quest-progress"] });
      toast({ title: "Quest started", description: "Your progress will track automatically." });
    },
    onError: (e: any) =>
      toast({ title: "Could not start", description: e?.message, variant: "destructive" }),
  });
};

/** Count of completed targets / total targets for a quest. */
export const questCompletionPct = (quest: Quest, progress?: UserQuestProgress | null) => {
  if (!progress) return 0;
  const counts = progress.state?.counts ?? {};
  const done = quest.steps.reduce(
    (acc, s) => acc + Math.min(counts[s.id] ?? 0, s.target),
    0,
  );
  const total = quest.steps.reduce((acc, s) => acc + s.target, 0);
  return total === 0 ? 0 : Math.round((done / total) * 100);
};