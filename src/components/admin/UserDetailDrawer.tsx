import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignRole, useRevokeRole, useSuspendUser } from "@/hooks/admin/useAdminMutations";
import { useForceSignout, useSendPasswordReset, useDeleteProfile, useAdminUserActivity } from "@/hooks/admin/useAdminAccount";
import { Loader2, Shield, ShieldOff, UserX, UserCheck, X, Plus, Mail, LogOut, KeyRound, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
const ROLES: AppRole[] = ["admin", "psychologist", "user", "athlete", "coach", "organization"];

interface Props {
  userId: string | null;
  onClose: () => void;
}

export default function UserDetailDrawer({ userId, onClose }: Props) {
  const qc = useQueryClient();
  const open = !!userId;

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: async () => {
      if (!userId) return null;
      const [profile, roles, bookings] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("bookings").select("id, scheduled_at, status, amount_mad").eq("patient_id", userId).order("scheduled_at", { ascending: false }).limit(5),
      ]);
      if (profile.error) throw profile.error;
      return {
        profile: profile.data,
        roles: (roles.data ?? []).map((r) => r.role as AppRole),
        bookings: bookings.data ?? [],
      };
    },
    enabled: open,
  });

  // Fetch email + last sign in via the rich list
  const { data: richList } = useQuery({
    queryKey: ["admin-user-rich-single", userId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users_rich" as any, { _search: null, _limit: 200 });
      if (error) return null;
      return (data as any[])?.find((u) => u.id === userId) ?? null;
    },
  });

  const activity = useAdminUserActivity(userId);
  const forceSignout = useForceSignout();
  const sendReset = useSendPasswordReset();
  const deleteProfile = useDeleteProfile();

  const [form, setForm] = useState({ full_name: "", city: "", phone: "", bio: "" });
  const [newRole, setNewRole] = useState<AppRole>("user");
  const [suspendReason, setSuspendReason] = useState("");

  useEffect(() => {
    if (user?.profile) {
      setForm({
        full_name: user.profile.full_name ?? "",
        city: user.profile.city ?? "",
        phone: user.profile.phone ?? "",
        bio: user.profile.bio ?? "",
      });
    }
  }, [user?.profile?.id]);

  const assignRole = useAssignRole();
  const revokeRole = useRevokeRole();
  const suspend = useSuspendUser();
  const saveProfile = async () => {
    if (!userId) return;
    const { error } = await supabase.from("profiles").update(form).eq("id", userId);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["admin-users-rich"] });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>User details</SheetTitle>
          <SheetDescription className="flex items-center gap-2 flex-wrap">
            {richList?.email && (
              <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {richList.email}</span>
            )}
            {richList?.last_sign_in_at && (
              <span className="text-xs">· last seen {format(new Date(richList.last_sign_in_at), "PP")}</span>
            )}
            {!richList?.email_confirmed_at && richList && (
              <Badge variant="outline" className="text-[10px]">Unverified</Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        {isLoading || !user ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <Tabs defaultValue="profile" className="mt-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Bio</Label><Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
              <div className="text-xs text-muted-foreground">Created {user.profile?.created_at && format(new Date(user.profile.created_at), "PPp")}</div>
              <Button onClick={saveProfile}>Save profile</Button>
            </TabsContent>

            <TabsContent value="roles" className="space-y-4 mt-4">
              <div className="flex flex-wrap gap-2">
                {user.roles.length === 0 && <span className="text-sm text-muted-foreground">No roles assigned.</span>}
                {user.roles.map((r) => (
                  <Badge key={r} variant="secondary" className="gap-1.5 pr-1">
                    {r}
                    <button
                      onClick={() => revokeRole.mutate({ userId: userId!, role: r }, {
                        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-user-detail", userId] }),
                      })}
                      className="hover:bg-destructive/20 rounded-sm p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.filter((r) => !user.roles.includes(r)).map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => assignRole.mutate({ userId: userId!, role: newRole }, {
                    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-user-detail", userId] }),
                  })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Assign
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-3 mt-4">
              <h4 className="text-sm font-semibold">Recent bookings</h4>
              {user.bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings.</p>
              ) : user.bookings.map((b: any) => (
                <div key={b.id} className="flex justify-between text-sm border rounded-lg p-2">
                  <span>{format(new Date(b.scheduled_at), "PP p")}</span>
                  <span className="text-muted-foreground">{b.status} · {b.amount_mad ?? 0} MAD</span>
                </div>
              ))}
              {activity.data && (
                <div className="grid grid-cols-2 gap-2 pt-3 text-xs text-muted-foreground">
                  <div className="rounded-lg border p-2"><div className="text-foreground font-semibold">{activity.data.journals_30d}</div>journals (30d)</div>
                  <div className="rounded-lg border p-2"><div className="text-foreground font-semibold">{activity.data.moods_30d}</div>moods (30d)</div>
                </div>
              )}
              {activity.data?.audit_tail && activity.data.audit_tail.length > 0 && (
                <div className="pt-3">
                  <h4 className="text-sm font-semibold mb-2">Recent audit events</h4>
                  <div className="space-y-1">
                    {activity.data.audit_tail.slice(0, 10).map((a: any) => (
                      <div key={a.id} className="text-xs flex justify-between border rounded-sm px-2 py-1">
                        <span>{a.action} · {a.resource_type}</span>
                        <span className="text-muted-foreground">{format(new Date(a.created_at), "PP p")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="moderation" className="space-y-4 mt-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Account status</p>
                    <p className="text-xs text-muted-foreground">
                      {user.profile?.is_suspended
                        ? `Suspended${user.profile.suspended_reason ? `: ${user.profile.suspended_reason}` : ""}`
                        : "Active"}
                    </p>
                  </div>
                  <Badge variant={user.profile?.is_suspended ? "destructive" : "secondary"}>
                    {user.profile?.is_suspended ? "Suspended" : "Active"}
                  </Badge>
                </div>
                {!user.profile?.is_suspended && (
                  <div className="space-y-2">
                    <Label className="text-xs">Reason (optional)</Label>
                    <Input value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Spam, abuse…" />
                  </div>
                )}
                <Button
                  variant={user.profile?.is_suspended ? "secondary" : "destructive"}
                  size="sm"
                  onClick={() => suspend.mutate({
                    userId: userId!,
                    suspended: !user.profile?.is_suspended,
                    reason: suspendReason || undefined,
                  }, {
                    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-user-detail", userId] }),
                  })}
                >
                  {user.profile?.is_suspended
                    ? <><UserCheck className="h-4 w-4 mr-1" /> Reactivate</>
                    : <><UserX className="h-4 w-4 mr-1" /> Suspend account</>}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-3 mt-4">
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold">Account actions</h4>
                <div className="grid gap-2">
                  <Button
                    variant="outline" size="sm" className="justify-start"
                    disabled={!richList?.email || sendReset.isPending}
                    onClick={() => sendReset.mutate({ userId: userId!, email: richList!.email! })}
                  >
                    <KeyRound className="h-4 w-4 mr-2" /> Send password reset email
                  </Button>
                  <Button
                    variant="outline" size="sm" className="justify-start"
                    disabled={forceSignout.isPending}
                    onClick={() => forceSignout.mutate(userId!)}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Force sign-out (all sessions)
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-destructive/40 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-destructive">Danger zone</h4>
                <p className="text-xs text-muted-foreground">Permanently delete this user's profile and revoke all roles. The auth account remains and can re-onboard.</p>
                <Button
                  variant="destructive" size="sm"
                  disabled={deleteProfile.isPending}
                  onClick={() => {
                    if (confirm("Delete this profile? This cannot be undone.")) {
                      deleteProfile.mutate(userId!, { onSuccess: () => onClose() });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete profile
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
