import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { MembershipTier } from "./useMembership";

export interface CommunitySpace {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type: "topic" | "cohort" | "region" | "ama" | "private";
  tier_required: MembershipTier;
  icon: string | null;
  cover_url: string | null;
  member_count: number;
  post_count: number;
}

export interface CommunityPost {
  id: string;
  space_id: string;
  author_id: string;
  title: string | null;
  body: string;
  attachments: unknown[];
  reaction_count: number;
  comment_count: number;
  created_at: string;
}

export const useSpaces = () =>
  useQuery({
    queryKey: ["community-spaces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_spaces")
        .select("*")
        .eq("is_published", true)
        .order("member_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CommunitySpace[];
    },
    staleTime: 60_000,
  });

export const useSpace = (slug: string | undefined) =>
  useQuery({
    queryKey: ["community-space", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_spaces")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as CommunitySpace | null;
    },
  });

export const useSpacePosts = (spaceId: string | undefined) =>
  useQuery({
    queryKey: ["space-posts", spaceId],
    enabled: !!spaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("space_id", spaceId!)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as CommunityPost[];
    },
  });

export const useMyMemberSpaces = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-spaces", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("space_members")
        .select("space_id");
      if (error) throw error;
      return new Set((data ?? []).map((r: { space_id: string }) => r.space_id));
    },
  });
};

export const useJoinSpace = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (spaceId: string) => {
      if (!user) throw new Error("not_authenticated");
      const { error } = await supabase
        .from("space_members")
        .insert({ space_id: spaceId, user_id: user.id });
      if (error && !error.message.includes("duplicate")) throw error;
      return spaceId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-spaces"] });
      qc.invalidateQueries({ queryKey: ["community-spaces"] });
    },
  });
};

export const useCreatePost = (spaceId: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      if (!user) throw new Error("not_authenticated");
      const trimmed = body.trim();
      if (!trimmed) throw new Error("empty_body");
      const { error } = await supabase.from("community_posts").insert({
        space_id: spaceId,
        author_id: user.id,
        body: trimmed,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["space-posts", spaceId] });
    },
  });
};

export const useReactToPost = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, kind = "heart" }: { postId: string; kind?: string }) => {
      if (!user) throw new Error("not_authenticated");
      const { error } = await supabase
        .from("post_reactions")
        .insert({ post_id: postId, user_id: user.id, kind });
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["space-posts"] });
    },
  });
};