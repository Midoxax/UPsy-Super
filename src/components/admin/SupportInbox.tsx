import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LifeBuoy, Loader2, MessageSquare, Search, Send, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import {
  useAllTickets, useTicketMessages, usePostTicketMessage, useUpdateTicketStatus,
  type SupportTicket,
} from "@/hooks/useSupportTickets";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  pending_admin: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  pending_user: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  closed: "bg-muted text-muted-foreground",
};

const STATUSES = ["all", "open", "pending_admin", "pending_user", "resolved", "closed"];

const SupportInbox = () => {
  const { data: tickets = [], isLoading } = useAllTickets();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (search && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tickets, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    tickets.forEach((t) => { c[t.status] = (c[t.status] ?? 0) + 1; });
    return c;
  }, [tickets]);

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Support inbox
            </CardTitle>
            <CardDescription>
              All user and specialist tickets. Reply, resolve, or close.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subject…"
                className="pl-8 w-56"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? `All (${tickets.length})` : `${s.replace("_", " ")} (${counts[s] ?? 0})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No tickets match.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setOpenId(t.id)}
                className="w-full text-left rounded-lg border border-border bg-background px-4 py-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{t.subject}</p>
                      {t.priority !== "normal" && (
                        <Badge variant="outline" className="text-[10px] uppercase">{t.priority}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.category} · user {t.user_id.slice(0, 8)} · updated {format(new Date(t.last_message_at), "PPp")}
                    </p>
                  </div>
                  <Badge variant="secondary" className={STATUS_COLORS[t.status] ?? ""}>
                    {t.status.replace("_", " ")}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>

      {openId && (
        <AdminTicketDialog
          ticketId={openId}
          ticket={tickets.find((t) => t.id === openId)}
          onClose={() => setOpenId(null)}
        />
      )}
    </Card>
  );
};

const AdminTicketDialog = ({
  ticketId, ticket, onClose,
}: { ticketId: string; ticket?: SupportTicket; onClose: () => void }) => {
  const { data: messages = [], isLoading } = useTicketMessages(ticketId);
  const post = usePostTicketMessage();
  const updateStatus = useUpdateTicketStatus();
  const [reply, setReply] = useState("");
  const { toast } = useToast();

  const send = async () => {
    if (!reply.trim()) return;
    try {
      await post.mutateAsync({ ticketId, body: reply.trim(), isAdmin: true });
      setReply("");
    } catch (e: any) {
      toast({ title: "Send failed", description: e.message, variant: "destructive" });
    }
  };

  const setStatus = async (status: "resolved" | "closed" | "open") => {
    try {
      await updateStatus.mutateAsync({ ticketId, status });
      toast({ title: "Ticket updated", description: `Status: ${status}` });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  const isClosed = ticket?.status === "closed" || ticket?.status === "resolved";

  return (
    <Dialog open={!!ticketId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-surface border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {ticket?.subject ?? "Ticket"}
          </DialogTitle>
          <DialogDescription>
            {ticket?.category} · status: {ticket?.status.replace("_", " ")}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto space-y-3 py-2">
          {isLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg p-3 text-sm ${
                  m.author_role === "admin"
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-background border border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                  <span className="font-medium capitalize">{m.author_role === "admin" ? "Support team" : "User"}</span>
                  <span>·</span>
                  <span>{format(new Date(m.created_at), "PPp")}</span>
                </div>
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            ))
          )}
        </div>

        {!isClosed && (
          <div className="space-y-2 pt-2 border-t border-border">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply as support team…"
              rows={3}
              maxLength={10000}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setStatus("resolved")} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark resolved
                </Button>
                <Button variant="outline" size="sm" onClick={() => setStatus("closed")} className="gap-1.5">
                  <XCircle className="h-4 w-4" /> Close
                </Button>
              </div>
              <Button onClick={send} disabled={post.isPending || !reply.trim()} className="gap-1.5">
                {post.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Reply
              </Button>
            </div>
          </div>
        )}

        {isClosed && (
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setStatus("open")}>Reopen</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupportInbox;