// CRM data access for the internal /admin/crm surface.
// All reads go through admin-only RLS policies on the crm_* tables — an
// authenticated non-admin gets zero rows, never a partial view.
//
// ANONYMITY WALL: nothing here touches `survey_responses`. Observatoire
// numbers shown in the overview come from the aggregate RPCs only.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CrmContact = {
  id: string;
  user_id: string | null;
  organisation_id: string | null;
  email: string;
  full_name: string | null;
  phone: string | null;
  locale: string | null;
  country: string | null;
  city: string | null;
  contact_type: string;
  lifecycle: string;
  source: string | null;
  first_touch: Record<string, unknown> | null;
  owner_id: string | null;
  last_activity_at: string | null;
  created_at: string;
};

export type CrmActivity = {
  id: string;
  contact_id: string;
  deal_id: string | null;
  kind: string;
  subject: string | null;
  body: string | null;
  occurred_at: string;
  metadata: Record<string, unknown> | null;
};

export type CrmConsent = {
  id: string;
  purpose: string;
  granted: boolean;
  basis: string;
  evidence: Record<string, unknown> | null;
  recorded_at: string;
  withdrawn_at: string | null;
};

export type CrmDeal = {
  id: string;
  contact_id: string | null;
  organisation_id: string | null;
  pipeline: string;
  stage: string;
  title: string | null;
  value_mad: number;
  currency: string;
  expected_close: string | null;
  lost_reason: string | null;
  created_at: string;
};

export type CrmStage = {
  id: string;
  pipeline: string;
  key: string;
  label: string;
  position: number;
  is_won: boolean;
  is_lost: boolean;
};

export interface ContactFilters {
  search?: string;
  contactType?: string;
  lifecycle?: string;
  source?: string;
  consent?: "any" | "granted" | "none";
}

const KEY = ["admin", "crm"] as const;

/** Headline acquisition numbers for the landing view. */
export const useCrmOverview = () =>
  useQuery({
    queryKey: [...KEY, "overview"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 864e5).toISOString();
      const since30 = new Date(Date.now() - 30 * 864e5).toISOString();

      const [contacts, deals, consents, activities] = await Promise.all([
        supabase
          .from("crm_contacts")
          .select("id, contact_type, lifecycle, source, created_at")
          .order("created_at", { ascending: false })
          .limit(5000),
        supabase.from("crm_deals").select("id, pipeline, stage, value_mad"),
        supabase.from("crm_consents").select("contact_id, purpose, granted, withdrawn_at"),
        supabase
          .from("crm_activities")
          .select("id, contact_id, kind, subject, occurred_at")
          .order("occurred_at", { ascending: false })
          .limit(40),
      ]);

      if (contacts.error) throw contacts.error;

      const rows = contacts.data ?? [];
      const count = (pred: (r: (typeof rows)[number]) => boolean) => rows.filter(pred).length;

      const bySource: Record<string, number> = {};
      rows.forEach((r) => {
        const s = r.source || "unknown";
        bySource[s] = (bySource[s] ?? 0) + 1;
      });

      const byLifecycle: Record<string, number> = {};
      rows.forEach((r) => {
        byLifecycle[r.lifecycle] = (byLifecycle[r.lifecycle] ?? 0) + 1;
      });

      const grantedContacts = new Set(
        (consents.data ?? [])
          .filter((c) => c.granted && !c.withdrawn_at)
          .map((c) => c.contact_id as string)
      );

      const observatoire = rows.filter((r) => (r.source ?? "").startsWith("observatoire"));

      return {
        total: rows.length,
        newThisWeek: count((r) => r.created_at >= since),
        newThisMonth: count((r) => r.created_at >= since30),
        clients: count((r) => r.contact_type === "client"),
        specialists: count((r) => r.contact_type === "specialist"),
        orgContacts: count((r) => r.contact_type === "org_contact"),
        observatoireTotal: observatoire.length,
        observatoireWeek: observatoire.filter((r) => r.created_at >= since).length,
        consentCoverage: rows.length ? Math.round((grantedContacts.size / rows.length) * 100) : 0,
        pipelineValue: (deals.data ?? []).reduce((sum, d) => sum + Number(d.value_mad ?? 0), 0),
        openDeals: (deals.data ?? []).length,
        bySource,
        byLifecycle,
        stream: (activities.data ?? []) as Pick<
          CrmActivity,
          "id" | "contact_id" | "kind" | "subject" | "occurred_at"
        >[],
      };
    },
  });

export const useCrmContacts = (filters: ContactFilters) =>
  useQuery({
    queryKey: [...KEY, "contacts", filters],
    queryFn: async () => {
      let q = supabase
        .from("crm_contacts")
        .select("*")
        .order("last_activity_at", { ascending: false, nullsFirst: false })
        .limit(1000);

      if (filters.contactType && filters.contactType !== "all") q = q.eq("contact_type", filters.contactType);
      if (filters.lifecycle && filters.lifecycle !== "all") q = q.eq("lifecycle", filters.lifecycle);
      if (filters.source && filters.source !== "all") q = q.eq("source", filters.source);
      if (filters.search?.trim()) {
        const s = `%${filters.search.trim()}%`;
        q = q.or(`email.ilike.${s},full_name.ilike.${s},phone.ilike.${s}`);
      }

      const { data, error } = await q;
      if (error) throw error;
      let rows = (data ?? []) as unknown as CrmContact[];

      if (filters.consent && filters.consent !== "any") {
        const { data: consents } = await supabase
          .from("crm_consents")
          .select("contact_id, granted, withdrawn_at");
        const granted = new Set(
          (consents ?? []).filter((c) => c.granted && !c.withdrawn_at).map((c) => c.contact_id as string)
        );
        rows = rows.filter((r) => (filters.consent === "granted" ? granted.has(r.id) : !granted.has(r.id)));
      }
      return rows;
    },
  });

export const useCrmContact = (contactId: string | null) =>
  useQuery({
    queryKey: [...KEY, "contact", contactId],
    enabled: !!contactId,
    queryFn: async () => {
      const [contact, activities, consents, deals] = await Promise.all([
        supabase.from("crm_contacts").select("*").eq("id", contactId!).maybeSingle(),
        supabase
          .from("crm_activities")
          .select("*")
          .eq("contact_id", contactId!)
          .order("occurred_at", { ascending: false })
          .limit(200),
        supabase
          .from("crm_consents")
          .select("*")
          .eq("contact_id", contactId!)
          .order("recorded_at", { ascending: false }),
        supabase.from("crm_deals").select("*").eq("contact_id", contactId!),
      ]);
      if (contact.error) throw contact.error;
      return {
        contact: contact.data as unknown as CrmContact | null,
        activities: (activities.data ?? []) as unknown as CrmActivity[],
        consents: (consents.data ?? []) as unknown as CrmConsent[],
        deals: (deals.data ?? []) as unknown as CrmDeal[],
      };
    },
  });

export const useCrmStages = () =>
  useQuery({
    queryKey: [...KEY, "stages"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_stages")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CrmStage[];
    },
  });

export const useCrmDeals = (pipeline: string) =>
  useQuery({
    queryKey: [...KEY, "deals", pipeline],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_deals")
        .select("*, crm_contacts(full_name, email)")
        .eq("pipeline", pipeline)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (CrmDeal & {
        crm_contacts: { full_name: string | null; email: string } | null;
      })[];
    },
  });

export const useCrmMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const addNote = useMutation({
    mutationFn: async ({ contactId, body }: { contactId: string; body: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("crm_activities").insert({
        contact_id: contactId,
        kind: "note",
        subject: "Internal note",
        body,
        actor_id: auth.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setLifecycle = useMutation({
    mutationFn: async ({ contactId, lifecycle }: { contactId: string; lifecycle: string }) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update({ lifecycle })
        .eq("id", contactId);
      if (error) throw error;
      await supabase.from("crm_activities").insert({
        contact_id: contactId,
        kind: "note",
        subject: `Lifecycle → ${lifecycle}`,
      });
    },
    onSuccess: invalidate,
  });

  const moveDeal = useMutation({
    mutationFn: async ({ dealId, stage, contactId }: { dealId: string; stage: string; contactId: string | null }) => {
      const { error } = await supabase.from("crm_deals").update({ stage }).eq("id", dealId);
      if (error) throw error;
      if (contactId) {
        await supabase.from("crm_activities").insert({
          contact_id: contactId,
          deal_id: dealId,
          kind: "note",
          subject: `Deal moved to ${stage}`,
        });
      }
    },
    onSuccess: invalidate,
  });

  const createDeal = useMutation({
    mutationFn: async (input: {
      contactId: string;
      pipeline: string;
      stage: string;
      title: string;
      value: number;
    }) => {
      const { error } = await supabase.from("crm_deals").insert({
        contact_id: input.contactId,
        pipeline: input.pipeline,
        stage: input.stage,
        title: input.title,
        value_mad: input.value,
      });
      if (error) throw error;
      await supabase.from("crm_activities").insert({
        contact_id: input.contactId,
        kind: "note",
        subject: `Deal opened — ${input.title}`,
      });
    },
    onSuccess: invalidate,
  });

  return { addNote, setLifecycle, moveDeal, createDeal, invalidate };
};
