import { useState, lazy, Suspense, Component, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPreviewProvider } from "./AdminPreviewProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SpecialistDashboard = lazy(() => import("@/pages/SpecialistDashboard"));
const PatientDashboard = lazy(() => import("@/pages/PatientDashboard"));
const OrganizationDashboard = lazy(
  () => import("@/pages/OrganizationDashboard"),
);
const AthleteHub = lazy(() => import("@/pages/AthleteHub"));

type Role = "psychologist" | "user" | "organization" | "athlete";

class PreviewErrorBoundary extends Component<
  { children: ReactNode; label: string; resetKey: string | number },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("[RolePreviewFrame]", error);
  }
  componentDidUpdate(prev: { resetKey: string | number }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">
              Failed to render {this.props.label} view
            </h3>
          </div>
          <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap break-words">
            {this.state.error.message}
            {this.state.error.stack
              ? "\n\n" +
                this.state.error.stack.split("\n").slice(0, 6).join("\n")
              : ""}
          </pre>
          <Button
            size="sm"
            variant="outline"
            onClick={() => this.setState({ error: null })}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const VIEWS: Array<{ value: Role; label: string; Component: any }> = [
  {
    value: "psychologist",
    label: "Specialist",
    Component: SpecialistDashboard,
  },
  { value: "user", label: "Client", Component: PatientDashboard },
  {
    value: "organization",
    label: "Organization",
    Component: OrganizationDashboard,
  },
  { value: "athlete", label: "Athlete", Component: AthleteHub },
];

type Person = {
  id: string;
  full_name: string | null;
  email: string | null;
  roles: string[] | null;
};

// Which accounts a tab lists: "user" means clients, i.e. no other role.
const OTHER_ROLES = [
  "admin",
  "psychologist",
  "organization",
  "athlete",
  "coach",
];
const matchesRole = (p: Person, role: Role) => {
  const roles = p.roles ?? [];
  if (role === "user") return !roles.some((r) => OTHER_ROLES.includes(r));
  if (role === "athlete")
    return roles.includes("athlete") || roles.includes("coach");
  return roles.includes(role);
};

function PersonPicker({
  role,
  value,
  onChange,
}: {
  role: Role;
  value: Person | null;
  onChange: (p: Person | null) => void;
}) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-view-as", search],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users_rich", {
        _search: search.trim() || undefined,
        _limit: 500,
      });
      if (error) throw error;
      return (data ?? []) as Person[];
    },
  });
  const people = (data ?? []).filter((p) => matchesRole(p, role));

  return (
    <div className="flex flex-wrap items-end gap-3 px-4 py-3 border-b border-amber-500/30">
      <div className="space-y-1">
        <Label htmlFor={`view-as-search-${role}`} className="text-xs">
          Find an account
        </Label>
        <Input
          id={`view-as-search-${role}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or email"
          className="h-9 w-56"
        />
      </div>
      <div className="space-y-1 min-w-0 flex-1">
        <Label htmlFor={`view-as-pick-${role}`} className="text-xs">
          View as
        </Label>
        <Select
          value={value?.id ?? ""}
          onValueChange={(id) =>
            onChange(people.find((p) => p.id === id) ?? null)
          }
        >
          <SelectTrigger id={`view-as-pick-${role}`} className="h-9">
            <SelectValue
              placeholder={
                isLoading
                  ? "Loading accounts…"
                  : `${people.length} account${people.length === 1 ? "" : "s"}`
              }
            />
          </SelectTrigger>
          <SelectContent>
            {people.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name || "(no name)"} · {p.email ?? p.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {value && (
        <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
          Back to my account
        </Button>
      )}
    </div>
  );
}

export default function RolePreviewFrame() {
  const [active, setActive] = useState<Role>("psychologist");
  const [viewing, setViewing] = useState<Partial<Record<Role, Person | null>>>(
    {},
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Live role views
          </h2>
          <p className="text-xs text-muted-foreground">
            Open any dashboard, as yourself or as a chosen account. Clinical
            records stay behind break-glass (Users → Clinical).
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Admin view
        </Badge>
      </div>

      <Tabs value={active} onValueChange={(v) => setActive(v as Role)}>
        <TabsList>
          {VIEWS.map((v) => (
            <TabsTrigger key={v.value} value={v.value}>
              {v.label} view
            </TabsTrigger>
          ))}
        </TabsList>

        {VIEWS.map(({ value, label, Component }) => {
          const person = viewing[value] ?? null;
          return (
            <TabsContent key={value} value={value} className="mt-4">
              <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 overflow-hidden">
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    {person
                      ? `Viewing ${label} dashboard as ${person.full_name || person.email}`
                      : `${label} dashboard (your own account)`}
                  </span>
                  <span className="text-muted-foreground">
                    Changes you make here are real and use your admin rights
                  </span>
                </div>
                <PersonPicker
                  role={value}
                  value={person}
                  onChange={(p) => setViewing((v) => ({ ...v, [value]: p }))}
                />
                <div className="bg-background">
                  <AdminPreviewProvider
                    role={value}
                    userId={person?.id ?? null}
                    email={person?.email ?? null}
                  >
                    <PreviewErrorBoundary
                      label={label}
                      resetKey={`${value}:${person?.id ?? "self"}`}
                    >
                      <Suspense
                        fallback={
                          <div className="flex flex-col items-center gap-3 py-20">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Loading {label} view…
                            </p>
                          </div>
                        }
                      >
                        {/* key: remount so every query refetches for the
                            newly chosen account. */}
                        <Component key={person?.id ?? "self"} />
                      </Suspense>
                    </PreviewErrorBoundary>
                  </AdminPreviewProvider>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
