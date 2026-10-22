import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Share2,
  Play,
  Eye,
  Send,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Linkedin,
  Facebook,
  Instagram,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Issue = Database["public"]["Tables"]["newsletter_issues"]["Row"];
type Post = Database["public"]["Tables"]["social_posts"]["Row"];
type Settings = Database["public"]["Tables"]["automation_settings"]["Row"];

const ICON = { linkedin: Linkedin, facebook: Facebook, instagram: Instagram };
const fmt = (d: string | null) =>
  d
    ? new Date(d).toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

async function invoke(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(
    "content-automation",
    { body },
  );
  if (error) throw error;
  return data;
}

const statusTone: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  sent: "default",
  published: "default",
  scheduled: "secondary",
  sending: "secondary",
  approved: "secondary",
  pending: "outline",
  skipped: "outline",
  cancelled: "outline",
  needs_setup: "destructive",
  failed: "destructive",
};

/** Newsletter and social posting: settings, queue, and manual controls. */
export default function ContentAutomationPanel() {
  const qc = useQueryClient();
  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["content-automation"] });

  const { data } = useQuery({
    queryKey: ["content-automation"],
    queryFn: async () => {
      const [s, issues, posts, subs, setup] = await Promise.all([
        supabase.from("automation_settings").select("*").maybeSingle(),
        supabase
          .from("newsletter_issues")
          .select("*")
          .order("period", { ascending: false })
          .limit(12),
        supabase
          .from("social_posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(60),
        supabase.from("newsletter_subscribers").select("status"),
        invoke({ action: "status" }).catch(() => ({ configured: {} })),
      ]);
      const counts: Record<string, number> = {};
      for (const r of subs.data ?? [])
        counts[r.status] = (counts[r.status] ?? 0) + 1;
      return {
        settings: s.data as Settings | null,
        issues: (issues.data ?? []) as Issue[],
        posts: (posts.data ?? []) as Post[],
        counts,
        configured: (setup.configured ?? {}) as Record<string, boolean>,
      };
    },
  });

  const [running, setRunning] = useState(false);
  const [preview, setPreview] = useState<{
    subject: string;
    html: string;
  } | null>(null);
  const [edit, setEdit] = useState<Post | null>(null);

  const saveSettings = async (patch: Partial<Settings>) => {
    const { error } = await supabase
      .from("automation_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", true);
    if (error) return toast.error(error.message);
    refresh();
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const r = await invoke({ action: "run" });
      toast.success("Automation run finished", {
        description: JSON.stringify(r.summary).slice(0, 200),
      });
    } catch (e) {
      toast.error(String(e));
    }
    setRunning(false);
    refresh();
  };

  if (!data)
    return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />;
  const s = data.settings;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Runs every hour. New blog posts are published to the company accounts
          and gathered into a monthly newsletter sent on the 1st; admins get a
          preview a few days before and can cancel.
        </p>
        <Button onClick={runNow} disabled={running} variant="outline">
          {running ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Run now
        </Button>
      </div>

      {/* Newsletter ------------------------------------------------------- */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Monthly newsletter
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Enabled</span>
            <Switch
              checked={!!s?.newsletter_enabled}
              onCheckedChange={(v) => saveSettings({ newsletter_enabled: v })}
              aria-label="Newsletter enabled"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="default">
            {data.counts.subscribed ?? 0} subscribed
          </Badge>
          <Badge variant="outline">
            {data.counts.pending ?? 0} awaiting confirmation
          </Badge>
          <Badge variant="outline">
            {data.counts.unsubscribed ?? 0} unsubscribed
          </Badge>
          <label className="flex items-center gap-2 text-muted-foreground">
            Preview
            <Input
              type="number"
              min={0}
              max={20}
              className="w-16 h-8"
              defaultValue={s?.newsletter_review_days ?? 5}
              onBlur={(e) =>
                saveSettings({
                  newsletter_review_days: Number(e.target.value) || 0,
                })
              }
            />
            days before the 1st
          </label>
        </div>
        {data.issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No issue yet. The next one is drafted automatically before the 1st
            of next month.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.issues.map((i) => (
              <IssueRow
                key={i.id}
                issue={i}
                onPreview={setPreview}
                onChange={refresh}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Social ----------------------------------------------------------- */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" /> Blog posts to social
            networks
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Publish automatically</span>
            <Switch
              checked={!!s?.social_auto_publish}
              onCheckedChange={(v) => saveSettings({ social_auto_publish: v })}
              aria-label="Publish automatically"
            />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["linkedin", "facebook", "instagram"] as const).map((n) => {
            const Icon = ICON[n];
            const on = s?.social_networks?.includes(n);
            const ok = data.configured[n];
            return (
              <div
                key={n}
                className="rounded-lg border border-border p-3 flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2 text-sm capitalize">
                  <Icon className="w-4 h-4" /> {n}
                  {ok ? (
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600"
                      aria-label="connected"
                    />
                  ) : (
                    <AlertTriangle
                      className="w-4 h-4 text-amber-500"
                      aria-label="not connected"
                    />
                  )}
                </span>
                <Switch
                  checked={!!on}
                  aria-label={`Post to ${n}`}
                  onCheckedChange={(v) =>
                    saveSettings({
                      social_networks: v
                        ? [...(s?.social_networks ?? []), n]
                        : (s?.social_networks ?? []).filter((x) => x !== n),
                    })
                  }
                />
              </div>
            );
          })}
        </div>
        {Object.values(data.configured).some((v) => !v) && (
          <p className="text-xs text-muted-foreground">
            Not connected: add the account credentials as Supabase function
            secrets (LinkedIn: LINKEDIN_ORG_ID, LINKEDIN_TOKEN; Facebook and
            Instagram: META_PAGE_ID, META_PAGE_TOKEN, META_IG_USER_ID). Posts
            wait as “needs setup” and go out on the next run once connected.
          </p>
        )}
        <div className="divide-y divide-border">
          {data.posts.map((p) => {
            const Icon = ICON[p.network as keyof typeof ICON];
            return (
              <div
                key={p.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Icon className="w-4 h-4 shrink-0" />
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm truncate hover:underline"
                  >
                    {p.slug}
                  </a>
                  <Badge
                    variant={statusTone[p.status] ?? "outline"}
                    className="shrink-0"
                  >
                    {p.status.replace("_", " ")}
                  </Badge>
                </div>
                <p
                  className="text-xs text-muted-foreground sm:w-48 truncate"
                  title={p.error ?? ""}
                >
                  {p.status === "published"
                    ? fmt(p.published_at)
                    : (p.error ?? fmt(p.scheduled_for))}
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEdit(p)}>
                    Edit
                  </Button>
                  {p.status !== "published" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const r = await invoke({
                            action: "publish_post",
                            id: p.id,
                          });
                          if (r.status === "published")
                            toast.success(`Published on ${p.network}`);
                          else toast.error(r.error ?? r.status);
                        } catch (e) {
                          toast.error(String(e));
                        }
                        refresh();
                      }}
                    >
                      <Send className="w-3.5 h-3.5" /> Post now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{preview?.subject}</DialogTitle>
          </DialogHeader>
          {preview && (
            <iframe
              title="Newsletter preview"
              srcDoc={preview.html}
              sandbox=""
              className="w-full h-[70vh] rounded border"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {edit?.network} · {edit?.slug}
            </DialogTitle>
          </DialogHeader>
          {edit && (
            <PostEditor post={edit} onDone={() => (setEdit(null), refresh())} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IssueRow({
  issue,
  onPreview,
  onChange,
}: {
  issue: Issue;
  onPreview: (p: { subject: string; html: string }) => void;
  onChange: () => void;
}) {
  const [testTo, setTestTo] = useState("");
  const items = (issue.items as Array<{ slug: string }>) ?? [];
  const open = issue.status === "scheduled";
  const update = async (patch: Partial<Issue>) => {
    const { error } = await supabase
      .from("newsletter_issues")
      .update(patch)
      .eq("id", issue.id);
    if (error) toast.error(error.message);
    onChange();
  };
  return (
    <div className="py-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{issue.period}</span>
        <Badge variant={statusTone[issue.status] ?? "outline"}>
          {issue.status}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {items.length} article{items.length === 1 ? "" : "s"} ·{" "}
          {issue.status === "sent"
            ? `${issue.sent}/${issue.recipients} sent ${fmt(issue.sent_at)}`
            : `send ${fmt(issue.scheduled_for)}`}
        </span>
        {issue.error && (
          <span className="text-xs text-muted-foreground">· {issue.error}</span>
        )}
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(["fr", "en", "ar"] as const).map((lang) => (
            <Button
              key={lang}
              size="sm"
              variant="ghost"
              onClick={async () => {
                try {
                  onPreview(
                    await invoke({
                      action: "preview",
                      issue_id: issue.id,
                      lang,
                    }),
                  );
                } catch (e) {
                  toast.error(String(e));
                }
              }}
            >
              <Eye className="w-3.5 h-3.5" /> {lang.toUpperCase()}
            </Button>
          ))}
          {open && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  update({ scheduled_for: new Date().toISOString() })
                }
              >
                <Send className="w-3.5 h-3.5" /> Send at next run
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => update({ status: "cancelled" })}
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </Button>
            </>
          )}
          {issue.status === "cancelled" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => update({ status: "scheduled" })}
            >
              Restore
            </Button>
          )}
          <form
            className="flex gap-1"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const r = await invoke({
                  action: "send_test",
                  issue_id: issue.id,
                  email: testTo,
                  lang: "fr",
                });
                toast.success(`Test ${r.status}`);
              } catch (err) {
                toast.error(String(err));
              }
            }}
          >
            <Input
              type="email"
              required
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="test@email"
              className="h-9 w-44"
              aria-label="Send a test to"
            />
            <Button size="sm" variant="outline" type="submit">
              Test
            </Button>
          </form>
        </div>
      )}
      {open && (
        <Textarea
          rows={2}
          defaultValue={issue.intro_fr ?? ""}
          placeholder="Optional intro (French; English and Arabic readers get the default intro unless set)"
          onBlur={(e) => update({ intro_fr: e.target.value.trim() || null })}
        />
      )}
    </div>
  );
}

function PostEditor({ post, onDone }: { post: Post; onDone: () => void }) {
  const [caption, setCaption] = useState(post.caption);
  const [image, setImage] = useState(post.image_url ?? "");
  const save = async (status?: string) => {
    const { error } = await supabase
      .from("social_posts")
      .update({
        caption,
        image_url: image || null,
        ...(status ? { status, attempts: 0, error: null } : {}),
      })
      .eq("id", post.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onDone();
  };
  return (
    <div className="space-y-3">
      <Textarea
        rows={8}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        aria-label="Caption"
      />
      <Input
        value={image}
        onChange={(e) => setImage(e.target.value)}
        placeholder="Image URL (required for Instagram)"
        aria-label="Image URL"
      />
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="ghost" onClick={() => save("skipped")}>
          Skip
        </Button>
        <Button variant="outline" onClick={() => save()}>
          Save
        </Button>
        <Button onClick={() => save("approved")}>Approve for next slot</Button>
      </div>
    </div>
  );
}
