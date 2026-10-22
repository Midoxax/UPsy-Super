import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Loader2, UserPlus, MailWarning } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import UserDetailDrawer from "@/components/admin/UserDetailDrawer";

type Row =
  Database["public"]["Functions"]["admin_list_users_rich"]["Returns"][number];

const FILTERS = [
  ["all", "All"],
  ["admin", "Admins"],
  ["psychologist", "Psychologists"],
  ["user", "Clients"],
  ["organization", "Organizations"],
  ["athlete", "Athletes"],
  ["league", "League"],
  ["unconfirmed", "Email not confirmed"],
] as const;

/** Every account with its email, roles and sign-in state, searched on the
 *  server (name or email), so the list is not capped at the first page. */
export default function UsersPanel() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data = [], isFetching } = useQuery({
    queryKey: ["admin-users-rich", q],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users_rich", {
        _search: q || undefined,
        _limit: 1000,
      });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const rows = useMemo(
    () =>
      data.filter((u) =>
        filter === "all"
          ? true
          : filter === "unconfirmed"
            ? !u.email_confirmed_at
            : (u.roles ?? []).includes(filter) ||
              (filter === "user" && (u.roles ?? []).length === 0),
      ),
    [data, filter],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative sm:max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Name or email"
            aria-label="Search users by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setInviting(true)}>
            <UserPlus className="h-4 w-4" /> Invite
          </Button>
          <ExportCsvButton
            filename="users.csv"
            rows={rows.map((u) => ({
              id: u.id,
              name: u.full_name,
              email: u.email,
              roles: (u.roles ?? []).join(" "),
              city: u.city,
              phone: u.phone,
              joined: u.created_at,
              email_confirmed: u.email_confirmed_at,
              last_sign_in: u.last_sign_in_at,
              suspended: u.is_suspended,
            }))}
          />
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map(([v, label]) => (
          <Button
            key={v}
            size="sm"
            variant={filter === v ? "default" : "outline"}
            className="shrink-0"
            onClick={() => setFilter(v)}
          >
            {label}
            {v !== "all" && filter === v && ` · ${rows.length}`}
          </Button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {isFetching
          ? "Loading…"
          : `${rows.length} of ${data.length} account${data.length === 1 ? "" : "s"}`}
        {data.length === 1000 && " (first 1,000; refine the search)"}
      </p>

      {isFetching && data.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-background">
          {rows.map((u) => (
            <li key={u.id}>
              <button
                onClick={() => setOpenId(u.id)}
                className="w-full text-start px-4 py-3 hover:bg-surface/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {u.full_name || "—"}
                    {u.is_suspended && (
                      <Badge variant="destructive" className="ml-2 text-[10px]">
                        Suspended
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    {!u.email_confirmed_at && (
                      <MailWarning
                        className="h-3.5 w-3.5 text-amber-500 shrink-0"
                        aria-label="email not confirmed"
                      />
                    )}
                    {u.email}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 sm:w-56">
                  {(u.roles?.length ? u.roles : ["user"]).map((r) => (
                    <Badge
                      key={r}
                      variant={r === "admin" ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {r}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground sm:w-44 sm:text-right">
                  Joined {format(new Date(u.created_at), "d MMM yyyy")}
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> · </span>
                  {u.last_sign_in_at
                    ? `Seen ${format(new Date(u.last_sign_in_at), "d MMM")}`
                    : "Never signed in"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <UserDetailDrawer userId={openId} onClose={() => setOpenId(null)} />
      <InviteDialog open={inviting} onClose={() => setInviting(false)} />
    </div>
  );
}

function InviteDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client");
  const [busy, setBusy] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.functions.invoke(
      "admin-invite-user",
      {
        body: { email, role },
      },
    );
    setBusy(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "Invitation failed");
      return;
    }
    toast.success(`Invitation sent to ${email}`);
    setEmail("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite someone</DialogTitle>
          <DialogDescription>
            They receive an email to set their password. Admin rights are never
            given by invitation: promote from the user's drawer once they have
            signed in.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={send} className="space-y-4">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            aria-label="Email"
          />
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Role"
          >
            {[
              ["client", "Client"],
              ["psychologist", "Psychologist"],
              ["organization", "Organization"],
              ["league", "League reviewer"],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={role === v}
                onClick={() => setRole(v)}
                className={`min-h-10 rounded-full border px-3 text-sm ${role === v ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <Button type="submit" disabled={busy || !email} className="w-full">
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send invitation"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
