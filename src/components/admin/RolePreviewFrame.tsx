import { useState, lazy, Suspense, Component, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPreviewProvider } from "./AdminPreviewProvider";

const SpecialistDashboard = lazy(() => import("@/pages/SpecialistDashboard"));
const PatientDashboard = lazy(() => import("@/pages/PatientDashboard"));
const OrganizationDashboard = lazy(() => import("@/pages/OrganizationDashboard"));
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
            <h3 className="font-semibold">Failed to render {this.props.label} view</h3>
          </div>
          <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap break-words">
            {this.state.error.message}
            {this.state.error.stack ? "\n\n" + this.state.error.stack.split("\n").slice(0, 6).join("\n") : ""}
          </pre>
          <Button size="sm" variant="outline" onClick={() => this.setState({ error: null })}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const VIEWS: Array<{ value: Role; label: string; Component: any }> = [
  { value: "psychologist", label: "Specialist", Component: SpecialistDashboard },
  { value: "user", label: "Client", Component: PatientDashboard },
  { value: "organization", label: "Organization", Component: OrganizationDashboard },
  { value: "athlete", label: "Athlete", Component: AthleteHub },
];

export default function RolePreviewFrame() {
  const [active, setActive] = useState<Role>("psychologist");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Live role views
          </h2>
          <p className="text-xs text-muted-foreground">
            Read-only preview of the actual dashboards each role sees. No data is written from this view.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">Preview mode</Badge>
      </div>

      <Tabs value={active} onValueChange={(v) => setActive(v as Role)}>
        <TabsList>
          {VIEWS.map((v) => (
            <TabsTrigger key={v.value} value={v.value}>{v.label} view</TabsTrigger>
          ))}
        </TabsList>

        {VIEWS.map(({ value, label, Component }) => (
          <TabsContent key={value} value={value} className="mt-4">
            <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 overflow-hidden">
              <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between text-xs">
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  Viewing as {label} — read-only
                </span>
                <span className="text-muted-foreground">Mutations are disabled</span>
              </div>
              <div className="bg-background">
                <AdminPreviewProvider role={value}>
                  <PreviewErrorBoundary label={label} resetKey={value}>
                    <Suspense
                      fallback={
                        <div className="flex flex-col items-center gap-3 py-20">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Loading {label} view…</p>
                        </div>
                      }
                    >
                      <Component />
                    </Suspense>
                  </PreviewErrorBoundary>
                </AdminPreviewProvider>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}