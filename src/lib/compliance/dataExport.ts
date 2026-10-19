/**
 * "Download my data": everything the signed-in user may read about
 * themselves, gathered through their own session, so row-level security
 * decides what is included exactly as it does everywhere else in the app.
 *
 * Each source names a table and the column that points at the user. A table
 * the user cannot read (or that does not exist in this environment) is
 * reported in `unavailable` rather than failing the whole export.
 */
import { supabase } from "@/integrations/supabase/client";

export const EXPORT_SOURCES: ReadonlyArray<{ table: string; column: string }> =
  [
    // Account and preferences
    { table: "profiles", column: "id" },
    { table: "user_roles", column: "user_id" },
    { table: "notification_preferences", column: "user_id" },
    { table: "privacy_preferences", column: "user_id" },
    { table: "legal_acceptances", column: "user_id" },
    { table: "certificates", column: "user_id" },
    { table: "documents", column: "user_id" },
    // Health and wellbeing
    { table: "assessment_results", column: "user_id" },
    { table: "assessment_premium_reports", column: "user_id" },
    { table: "mood_entries", column: "user_id" },
    { table: "journal_entries", column: "user_id" },
    { table: "readiness_checkins", column: "user_id" },
    { table: "client_anamneses", column: "client_id" },
    { table: "treatment_plans", column: "client_id" },
    { table: "homework_assignments", column: "client_id" },
    { table: "discharge_summaries", column: "client_id" },
    { table: "ai_conversations", column: "user_id" },
    { table: "ai_chat_history", column: "user_id" },
    { table: "athlete_profiles", column: "id" },
    { table: "athlete_training_sessions", column: "athlete_id" },
    // Sessions, bookings and payments
    { table: "sessions", column: "client_id" },
    { table: "bookings", column: "patient_id" },
    { table: "reviews", column: "client_id" },
    { table: "payment_transactions", column: "patient_id" },
    { table: "session_credits_ledger", column: "user_id" },
    { table: "coupon_redemptions", column: "user_id" },
    { table: "referral_credits", column: "user_id" },
    { table: "referrals", column: "referrer_id" },
    { table: "ai_subscriptions", column: "user_id" },
    { table: "all_access_subscriptions", column: "user_id" },
    { table: "athlete_subscriptions", column: "user_id" },
    { table: "user_memberships", column: "user_id" },
    { table: "course_purchases", column: "user_id" },
    { table: "course_enrollments", column: "user_id" },
    // Community and progress
    { table: "notifications", column: "user_id" },
    { table: "xp_events", column: "user_id" },
    { table: "user_progress", column: "user_id" },
    { table: "user_badges", column: "user_id" },
    { table: "user_streaks", column: "user_id" },
    { table: "resource_completions", column: "user_id" },
    { table: "protocol_completions", column: "user_id" },
    { table: "community_posts", column: "author_id" },
    { table: "post_comments", column: "author_id" },
    { table: "post_reactions", column: "user_id" },
    { table: "space_members", column: "user_id" },
    // Support and privacy requests
    { table: "support_tickets", column: "user_id" },
    { table: "support_ticket_messages", column: "author_id" },
    { table: "data_subject_requests", column: "user_id" },
    // Specialists: their professional profile and their own work
    { table: "psychologist_profiles", column: "id" },
    { table: "psychologist_applications", column: "user_id" },
    { table: "availability_slots", column: "psychologist_id" },
    { table: "session_notes", column: "psychologist_id" },
    { table: "subscriptions", column: "psychologist_id" },
  ];

type Rows = Record<string, unknown>[];
// The export walks tables by name, which the generated client types cannot
// express; this is the slice of the client API it uses.
type UntypedClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => PromiseLike<{
        data: Rows | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export interface MyDataExport {
  format: "upsy-data-export/v1";
  exported_at: string;
  user: { id: string; email: string | null };
  data: Record<string, Rows>;
  files: string[];
  unavailable: Record<string, string>;
}

export async function collectMyData(user: {
  id: string;
  email?: string | null;
}): Promise<MyDataExport> {
  const db = supabase as unknown as UntypedClient;
  const data: Record<string, Rows> = {};
  const unavailable: Record<string, string> = {};

  const results = await Promise.all(
    EXPORT_SOURCES.map(async ({ table, column }) => {
      const { data: rows, error } = await db
        .from(table)
        .select("*")
        .eq(column, user.id);
      return { table, rows, error };
    }),
  );
  for (const { table, rows, error } of results) {
    if (error) unavailable[table] = error.message;
    else if (rows && rows.length > 0) data[table] = rows;
  }

  // AI messages hang off conversations rather than the user.
  const conversationIds = (data.ai_conversations ?? []).map((c) =>
    String(c.id),
  );
  if (conversationIds.length > 0) {
    const { data: messages, error } = await supabase
      .from("ai_messages")
      .select("*")
      .in("conversation_id", conversationIds);
    if (error) unavailable.ai_messages = error.message;
    else if (messages?.length) data.ai_messages = messages as Rows;
  }

  // Uploaded files: their names (download them from the Documents tab).
  const files: string[] = [];
  const { data: listed } = await supabase.storage
    .from("user-documents")
    .list(user.id, { limit: 1000 });
  for (const f of listed ?? [])
    files.push(`user-documents/${user.id}/${f.name}`);

  return {
    format: "upsy-data-export/v1",
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email ?? null },
    data,
    files,
    unavailable,
  };
}

export function downloadJson(payload: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
