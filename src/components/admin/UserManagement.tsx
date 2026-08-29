import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, ShieldCheck, ShieldOff, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RoleType = "admin" | "psychologist" | "user" | "athlete" | "coach" | "organization";

const ROLE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  admin: "destructive",
  psychologist: "default",
  user: "secondary",
  athlete: "outline",
  coach: "outline",
  organization: "outline",
};

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType>("admin");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, city, created_at")
        .order("created_at", { ascending: false });

      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rErr) throw rErr;

      const roleMap = new Map<string, string[]>();
      for (const r of roles || []) {
        const arr = roleMap.get(r.user_id) || [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      }

      return (profiles || []).map(p => ({
        ...p,
        roles: roleMap.get(p.id) || ["user"],
      }));
    },
  });

  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: RoleType }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role assigned", description: `Role successfully assigned.` });
      setShowRoleModal(false);
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role removed", description: "Role removed successfully." });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const filteredUsers = (users || []).filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View users, assign roles, and manage admin access</CardDescription>
            </div>
            <Button onClick={() => setShowInviteModal(true)} size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Users Found"
              description={search ? "No users match your search." : "No users registered yet."}
            />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                      <TableCell>{user.city || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} variant={ROLE_COLORS[role] || "outline"} className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!user.roles.includes("admin") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setSelectedRole("admin");
                                setShowRoleModal(true);
                              }}
                            >
                              <ShieldCheck className="mr-1 h-3 w-3" />
                              Promote
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => removeRole.mutate({ userId: user.id, role: "admin" })}
                            >
                              <ShieldOff className="mr-1 h-3 w-3" />
                              Demote
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Role Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>Select a role to assign to this user.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="psychologist">Psychologist</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="athlete">Athlete</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
            <Button onClick={() => selectedUserId && assignRole.mutate({ userId: selectedUserId, role: selectedRole })}>
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Admin Modal */}
      <InviteAdminModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </>
  );
};

const InviteAdminModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email) return;
    setSending(true);
    try {
      // Use edge function to send invite
      const { error } = await supabase.functions.invoke("send-proposal-notification", {
        body: {
          type: "admin-invite",
          email,
          subject: "You're invited to become a U.Psy Admin",
          message: `You've been invited to join U.Psy as an administrator. Please sign up at ${window.location.origin}/auth and an admin will assign your role.`,
        },
      });
      if (error) throw error;
      toast({ title: "Invitation sent", description: `Invite email sent to ${email}` });
      setEmail("");
      onClose();
    } catch (e: any) {
      toast({ title: "Note", description: "Please ask the user to sign up, then promote them from this panel." });
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Admin</DialogTitle>
          <DialogDescription>
            Send an invitation email. Once they sign up, return here to promote them.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInvite} disabled={!email || sending}>
            {sending ? "Sending..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserManagement;
