import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Resource {
  id: string;
  slug: string;
  title: string;
  title_fr: string | null;
  summary: string | null;
  summary_fr: string | null;
  format: "article" | "guide" | "worksheet" | "video" | "audio" | "toolkit";
  category: string | null;
  topic_slug: string | null;
  content_url: string | null;
  download_url: string | null;
  image_url: string | null;
  read_minutes: number | null;
  rating: number | null;
  view_count: number;
  is_premium: boolean;
  is_featured: boolean;
}

export interface Topic {
  id: string;
  slug: string;
  name: string;
  name_fr: string | null;
  icon: string | null;
}

export const useResources = (filters?: { topic?: string | null; format?: string | null; search?: string | null }) =>
  useQuery({
    queryKey: ["resources", filters],
    queryFn: async () => {
      let q = supabase
        .from("resources")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (filters?.topic) q = q.eq("topic_slug", filters.topic);
      if (filters?.format) q = q.eq("format", filters.format);
      if (filters?.search) q = q.ilike("title", `%${filters.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Resource[];
    },
  });

export const useTopics = () =>
  useQuery({
    queryKey: ["resource-topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_topics")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Topic[];
    },
    staleTime: 60_000 * 30,
  });

export const useTrackResource = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { resource_id: string; action: "view" | "download" | "complete" }) => {
      if (!user) return;
      await supabase
        .from("resource_completions")
        .insert({ user_id: user.id, resource_id: params.resource_id, action: params.action });
      // Award XP for engaging with content (only on first interaction per type)
      if (params.action === "view" || params.action === "complete") {
        await supabase.rpc("award_xp", { p_action: `resource_${params.action}`, p_xp: params.action === "complete" ? 15 : 5, p_metadata: { resource_id: params.resource_id } as any });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-progress"] });
    },
  });
};