import { useNavigate } from "@/lib/router-compat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, Shield, Stethoscope, User, Building2, Check } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useActiveView, type ActiveView } from "@/hooks/useActiveView";

const LABELS: Record<Exclude<ActiveView, "auto">, { label: string; icon: any; path: string }> = {
  admin: { label: "Admin Console", icon: Shield, path: "/admin" },
  specialist: { label: "Specialist Dashboard", icon: Stethoscope, path: "/dashboard/specialist" },
  client: { label: "Client Dashboard", icon: User, path: "/dashboard/client" },
  organization: { label: "Organization", icon: Building2, path: "/dashboard/organization" },
};

const ViewAsSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { isAdmin, roles, loading } = useUserRole();
  const { activeView, setActiveView } = useActiveView();
  const navigate = useNavigate();

  if (loading) return null;
  // Only show for admins or users with multiple roles
  if (!isAdmin && roles.length < 2) return null;

  const choose = (v: Exclude<ActiveView, "auto">) => {
    setActiveView(v);
    navigate(LABELS[v].path);
  };

  const Current = activeView !== "auto" ? LABELS[activeView].icon : Eye;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5" aria-label="Switch view">
          <Current className="h-4 w-4" />
          {!compact && (
            <span className="hidden md:inline text-xs">
              {activeView === "auto" ? "View as" : LABELS[activeView].label}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-[60]">
        <DropdownMenuLabel>View as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(LABELS) as Array<Exclude<ActiveView, "auto">>).map((key) => {
          const Icon = LABELS[key].icon;
          return (
            <DropdownMenuItem key={key} onClick={() => choose(key)} className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="flex-1">{LABELS[key].label}</span>
              {activeView === key && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setActiveView("auto")} className="gap-2 text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="flex-1">Reset (auto)</span>
          {activeView === "auto" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ViewAsSwitcher;