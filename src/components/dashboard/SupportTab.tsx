import { useEffect, useState } from "react";
import { useSearchParams } from "@/lib/router-compat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { LifeBuoy, Plus, Loader2, MessageSquare, Send } from "lucide-react";
import { format } from "date-fns";
import {
  useMyTickets, useCreateTicket, useTicketMessages, usePostTicketMessage,
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

export const SupportTab = () => {
  const { data: tickets = [], isLoading } = useMyTickets();
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-open a ticket if ?ticket=<id> is present (deep link from notifications)
  useEffect(() => {
    const ticketId = searchParams.get("ticket");
    if (ticketId && tickets.some((t) => t.id === ticketId)) {
      setOpenId(ticketId);
    }
  }, [searchParams, tickets]);

  const handleClose = () => {
    setOpenId(null);
    if (searchParams.get("ticket")) {
      searchParams.delete("ticket");
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-surface border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <LifeBuoy className="h-4 w-4 text-primary" />
              Support
            </CardTitle>
            <CardDescription>Open a ticket and our team will reply in your language.</CardDescription>
          </div>
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                New ticket
              </Button>
            </DialogTrigger>
            <NewTicketDialog onClose={() => setNewOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No tickets yet. Click "New ticket" to get help.
            </p>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setOpenId(t.id)}
                  className="w-full text-left rounded-lg border border-border bg-background px-4 py-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.category} · updated {format(new Date(t.last_message_at), "PPp")}
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
      </Card>

      {openId && (
        <TicketDetailDialog
          ticketId={openId}
          ticket={tickets.find((t) => t.id === openId)}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

const NewTicketDialog = ({ onClose }: { onClose: () => void }) => {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("technical");
  const [body, setBody] = useState("");
  const create = useCreateTicket();
  const { toast } = useToast();

  const submit = async () => {
    if (!subject.trim() || !body.trim()) return;
    try {
      await create.mutateAsync({ subject: subject.trim(), category, body: body.trim() });
      toast({ title: "Ticket opened", description: "We'll reply as soon as possible." });
      setSubject(""); setBody(""); onClose();
    } catch (e: any) {
      toast({ title: "Could not open ticket", description: e.message, variant: "destructive" });
    }
  };

  return (
    <DialogContent className="bg-surface border-border">
      <DialogHeader>
        <DialogTitle>Open a support ticket</DialogTitle>
        <DialogDescription>
          Describe your issue. Replies arrive in this dashboard and by email.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Subject</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="clinical">Clinical</SelectItem>
              <SelectItem value="feature_request">Feature request</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Message</label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={10000} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={create.isPending || !subject.trim() || !body.trim()}>
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const TicketDetailDialog = ({
  ticketId, ticket, onClose,
}: { ticketId: string; ticket?: SupportTicket; onClose: () => void }) => {
  const { data: messages = [], isLoading } = useTicketMessages(ticketId);
  const [reply, setReply] = useState("");
  const post = usePostTicketMessage();
  const { toast } = useToast();

  const send = async () => {
    if (!reply.trim()) return;
    try {
      await post.mutateAsync({ ticketId, body: reply.trim() });
      setReply("");
    } catch (e: any) {
      toast({ title: "Send failed", description: e.message, variant: "destructive" });
    }
  };

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
                  <span className="font-medium capitalize">{m.author_role === "admin" ? "Support team" : "You"}</span>
                  <span>·</span>
                  <span>{format(new Date(m.created_at), "PPp")}</span>
                </div>
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            ))
          )}
        </div>

        {ticket && ticket.status !== "closed" && ticket.status !== "resolved" && (
          <div className="space-y-2 pt-2 border-t border-border">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply…"
              rows={3}
              maxLength={10000}
            />
            <div className="flex justify-end">
              <Button onClick={send} disabled={post.isPending || !reply.trim()} className="gap-1.5">
                {post.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send reply
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
