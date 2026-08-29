import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import NotificationPreferencesCard from "@/components/dashboard/NotificationPreferencesCard";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data } = useNotifications(100);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const items = (data?.items ?? []).filter((n) =>
    filter === "unread" ? !n.read_at : true
  );

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete", variant: "destructive" });
    } else {
      qc.invalidateQueries({ queryKey: ["notifications", user?.id] });
    }
  };

  return (
    <>
      <SEOHead
        title="Notifications | U.Psy"
        description="Your activity, payments, and gamification updates."
        path="/notifications"
      />
      <section className="section-spacing">
        <div className="container-custom max-w-3xl space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold font-[Outfit]">Notifications</h1>
            </div>
            {(data?.unread ?? 0) > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="gap-1.5"
              >
                <Check className="h-3.5 w-3.5" /> Mark all read
              </Button>
            )}
          </header>

          {/* Preferences */}
          <NotificationPreferencesCard />

          {/* Filters */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {data?.unread ? `(${data.unread})` : ""}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* List */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <Card className="p-10 text-center text-sm text-muted-foreground bg-surface border-border">
                {filter === "unread"
                  ? "Nothing unread."
                  : "No notifications yet."}
              </Card>
            ) : (
              items.map((n) => (
                <Card
                  key={n.id}
                  className={cn(
                    "p-4 bg-surface border-border transition-colors",
                    !n.read_at && "border-primary/30 bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.read_at && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                        <p className="font-medium text-sm">{n.title}</p>
                      </div>
                      {n.body && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {n.body}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(n.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {n.action_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!n.read_at) markRead.mutate(n.id);
                            navigate(n.action_url!);
                          }}
                        >
                          Open
                        </Button>
                      )}
                      {!n.read_at && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Mark read"
                          onClick={() => markRead.mutate(n.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => handleDelete(n.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}